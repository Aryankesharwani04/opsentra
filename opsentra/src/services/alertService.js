'use strict';

/**
 * alertService — fires email alerts when ERROR or FATAL logs are ingested.
 *
 * Rate-limited per workspace via Redis: at most one alert email every
 * COOLDOWN_SECONDS (default 5 min) so the inbox is never flooded.
 *
 * Called by dbInsertWorker after each successful batch insert — fully
 * non-blocking (caller wraps in .catch so failures never touch log flow).
 */

const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');
const { queueRawEmail } = require('../workers/emailWorker');
const logger = require('../utils/logger');
const config = require('../config/env');

const ALERT_LEVELS = new Set(['ERROR', 'FATAL']);
// One alert email per workspace per N seconds
const COOLDOWN_SECONDS = Number(process.env.ALERT_COOLDOWN_SECONDS) || 300; // 5 minutes

const cooldownKey = (workspaceId) => `alert:cooldown:${workspaceId}`;

/**
 * Check whether the workspace is in cooldown.
 * @param {string} workspaceId
 * @returns {Promise<boolean>}
 */
const isOnCooldown = async (workspaceId) => {
  const redis = getRedisClient();
  const val = await redis.get(cooldownKey(workspaceId));
  return val !== null;
};

/**
 * Set cooldown for a workspace so the next alert is suppressed.
 * @param {string} workspaceId
 */
const setCooldown = async (workspaceId) => {
  const redis = getRedisClient();
  await redis.set(cooldownKey(workspaceId), '1', 'EX', COOLDOWN_SECONDS);
};

/**
 * Build the HTML body for an alert email.
 */
const buildAlertHtml = ({ firstName, workspaceName, errorLogs }) => {
  const rows = errorLogs
    .slice(0, 5)
    .map(
      (log) => `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #2d2d2d;color:#ff4d4f;font-weight:bold;white-space:nowrap">${log.level}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #2d2d2d;color:#a0a0a0;white-space:nowrap">${new Date(log.timestamp).toUTCString()}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #2d2d2d;color:#e0e0e0;font-family:monospace;word-break:break-all">${log.message?.slice(0, 200) ?? '—'}</td>
        </tr>`,
    )
    .join('');

  return `
    <div style="background:#0f0f0f;color:#e0e0e0;font-family:sans-serif;padding:32px;border-radius:8px;max-width:700px">
      <h2 style="color:#ff4d4f;margin-top:0">&#9888;&#65039; Opsentra Alert — Errors Detected</h2>
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>
        New <strong style="color:#ff4d4f">ERROR / FATAL</strong> logs were detected in workspace
        <strong>${workspaceName}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#1a1a1a;border-radius:6px;overflow:hidden">
        <thead>
          <tr style="background:#222">
            <th style="padding:8px 10px;text-align:left;color:#888;font-size:12px">LEVEL</th>
            <th style="padding:8px 10px;text-align:left;color:#888;font-size:12px">TIME (UTC)</th>
            <th style="padding:8px 10px;text-align:left;color:#888;font-size:12px">MESSAGE</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="color:#888;font-size:13px">
        Showing up to 5 of ${errorLogs.length} error(s) detected in this batch.
      </p>

      <a href="${config.frontend.url}/logs"
         style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;
                border-radius:6px;text-decoration:none;font-weight:bold;margin-top:8px">
        View Full Logs
      </a>

      <p style="color:#555;font-size:12px;margin-top:24px">
        You are receiving this because you own workspace <em>${workspaceName}</em> on Opsentra.<br>
        Alerts are rate-limited — next alert fires after ${COOLDOWN_SECONDS / 60} minute(s).
      </p>
    </div>
  `;
};

/**
 * Evaluate a batch of newly-inserted log docs and send an alert email
 * if any are ERROR/FATAL and the workspace is not in cooldown.
 *
 * @param {string} workspaceId
 * @param {object[]} logDocs - plain objects with at least { level, message, timestamp }
 * @returns {Promise<void>}
 */
const fireAlerts = async (workspaceId, logDocs) => {
  // 1. Filter to only critical-level logs
  const errorLogs = logDocs.filter((d) => ALERT_LEVELS.has(d.level));
  if (errorLogs.length === 0) return;

  // 2. Skip if workspace already notified recently
  if (await isOnCooldown(workspaceId)) {
    logger.debug(`[AlertService] Workspace ${workspaceId} is on cooldown — alert suppressed`);
    return;
  }

  // 3. Resolve workspace -> owner -> email
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    logger.warn(`[AlertService] Workspace ${workspaceId} not found — skipping alert`);
    return;
  }

  const user = await User.findById(workspace.userId).lean();
  if (!user?.email) {
    logger.warn(`[AlertService] Owner of workspace ${workspaceId} has no email — skipping alert`);
    return;
  }

  // 4. Queue the alert email
  await queueRawEmail({
    to: user.email,
    subject: `[Opsentra] ${errorLogs.length} Error(s) detected in "${workspace.workspaceName}"`,
    htmlBody: buildAlertHtml({
      firstName: user.firstName,
      workspaceName: workspace.workspaceName,
      errorLogs,
    }),
    textBody:
      `${errorLogs.length} ERROR/FATAL log(s) detected in workspace "${workspace.workspaceName}".\n` +
      `First error: ${errorLogs[0]?.message?.slice(0, 200)}\n\n` +
      `View logs: ${config.frontend.url}/logs`,
  });

  // 5. Set cooldown so inbox is not flooded
  await setCooldown(workspaceId);

  logger.info(
    `[AlertService] Alert email queued for ${user.email} ` +
      `(workspace: ${workspaceId}, errors: ${errorLogs.length})`,
  );
};

module.exports = { fireAlerts };
