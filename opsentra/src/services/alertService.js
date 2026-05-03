'use strict';

/**
 * alertService — fires email alerts when ERROR or FATAL logs are ingested.
 *
 * Rate-limited per workspace via Redis: at most one alert email every
 * COOLDOWN_SECONDS (default 5 min) so the inbox is never flooded.
 *
 * If GEMINI_API_KEY is set, each alert email also includes an AI-generated
 * root-cause analysis and suggested fix command powered by Gemini 2.0 Flash.
 *
 * Called by dbInsertWorker after each successful batch insert — fully
 * non-blocking (caller wraps in .catch so failures never touch log flow).
 */

const Workspace = require('../models/Workspace');
const User = require('../models/User');
const AlertLog = require('../models/AlertLog');
const { getRedisClient } = require('../config/redis');
const { queueRawEmail } = require('../workers/emailWorker');
const { analyseErrors } = require('./aiAnalysisService');
const logger = require('../utils/logger');
const config = require('../config/env');

const ALERT_LEVELS = new Set(['ERROR', 'FATAL']);
const COOLDOWN_SECONDS = Number(process.env.ALERT_COOLDOWN_SECONDS) || 300; // 5 minutes

const cooldownKey = (workspaceId) => `alert:cooldown:${workspaceId}`;

const isOnCooldown = async (workspaceId) => {
  const redis = getRedisClient();
  const val = await redis.get(cooldownKey(workspaceId));
  return val !== null;
};

const setCooldown = async (workspaceId) => {
  const redis = getRedisClient();
  await redis.set(cooldownKey(workspaceId), '1', 'EX', COOLDOWN_SECONDS);
};

// ── Email HTML builders ───────────────────────────────────────────

const SEVERITY_COLOR = {
  critical: '#ff4d4f',
  high: '#fa8c16',
  medium: '#fadb14',
};

/**
 * Renders the AI analysis block — only included when Gemini returned a result.
 */
const buildAiSection = (analysis) => {
  if (!analysis) return '';

  const color = SEVERITY_COLOR[analysis.severity] || '#fa8c16';

  return `
    <div style="margin:24px 0;padding:20px;background:#111;border-left:4px solid ${color};border-radius:0 6px 6px 0">
      <h3 style="color:${color};margin:0 0 12px 0;font-size:15px">
        AI Analysis
        <span style="font-size:11px;color:#666;font-weight:normal;margin-left:8px">powered by Gemini 2.0 Flash</span>
      </h3>

      <p style="margin:0 0 6px 0;font-size:13px;color:#aaa;text-transform:uppercase;letter-spacing:0.05em">Root Cause</p>
      <p style="margin:0 0 16px 0;color:#e0e0e0">${analysis.cause}</p>

      <p style="margin:0 0 6px 0;font-size:13px;color:#aaa;text-transform:uppercase;letter-spacing:0.05em">What's Happening</p>
      <p style="margin:0 0 16px 0;color:#e0e0e0">${analysis.summary}</p>

      <p style="margin:0 0 6px 0;font-size:13px;color:#aaa;text-transform:uppercase;letter-spacing:0.05em">Suggested Fix</p>
      <code style="display:block;background:#1a1a1a;color:#4ade80;padding:10px 14px;border-radius:4px;font-size:13px;word-break:break-all">${analysis.fix}</code>

      <p style="margin:12px 0 0 0;font-size:12px;color:#555">
        Severity: <strong style="color:${color}">${analysis.severity?.toUpperCase()}</strong>
        &nbsp;·&nbsp; AI suggestions may not always be correct — verify before running commands in production.
      </p>
    </div>
  `;
};

/**
 * Build the full HTML body for the alert email.
 */
const buildAlertHtml = ({ firstName, workspaceName, errorLogs, analysis }) => {
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

      ${buildAiSection(analysis)}

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

// ── Main export ───────────────────────────────────────────────────

/**
 * Evaluate a batch of newly-inserted log docs and send an alert email
 * (with optional AI analysis) if any are ERROR/FATAL and the workspace
 * is not in cooldown.
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

  // 4. Run AI analysis in parallel — null if key missing or API fails (never blocks)
  const analysis = await analyseErrors(errorLogs.map((l) => l.message).filter(Boolean));

  // 5. Build plain-text fallback (includes AI cause if available)
  const aiLine = analysis
    ? `\nAI Analysis:\n  Cause: ${analysis.cause}\n  Fix: ${analysis.fix}\n`
    : '';

  // 6. Queue the alert email
  await queueRawEmail({
    to: user.email,
    subject: `[Opsentra] ${errorLogs.length} Error(s) detected in "${workspace.workspaceName}"`,
    htmlBody: buildAlertHtml({
      firstName: user.firstName,
      workspaceName: workspace.workspaceName,
      errorLogs,
      analysis,
    }),
    textBody:
      `${errorLogs.length} ERROR/FATAL log(s) detected in workspace "${workspace.workspaceName}".\n` +
      `First error: ${errorLogs[0]?.message?.slice(0, 200)}\n` +
      aiLine +
      `\nView logs: ${config.frontend.url}/logs`,
  });

  // 7. Set cooldown so inbox is not flooded
  await setCooldown(workspaceId);

  // 8. Persist alert record for history page (fire-and-forget — never blocks email)
  AlertLog.create({
    workspaceId,
    errorCount: errorLogs.length,
    emailSentTo: user.email,
    emailQueued: true,
    sampleMessages: errorLogs.slice(0, 3).map((l) => l.message?.slice(0, 300) ?? ''),
    aiCause:    analysis?.cause    ?? null,
    aiFix:      analysis?.fix      ?? null,
    aiSeverity: analysis?.severity ?? null,
    aiSummary:  analysis?.summary  ?? null,
  }).catch((err) =>
    logger.error(`[AlertService] Failed to save AlertLog: ${err.message}`),
  );

  logger.info(
    `[AlertService] Alert email queued for ${user.email} ` +
      `(workspace: ${workspaceId}, errors: ${errorLogs.length}, ai: ${!!analysis})`,
  );
};

module.exports = { fireAlerts };
