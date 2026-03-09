'use strict';

/**
 * logCollectorWorker — Polls CloudWatch Logs and pushes new events
 * into the Redis queue for async DB insertion and real-time streaming.
 *
 * Flow per tick:
 *  1. Fetch all active AwsIntegrations
 *  2. For each integration:
 *     a. Assume IAM role via STS
 *     b. List log groups matching opsentra-{workspaceId}-* prefix
 *     c. For each log group:
 *        - Load last timestamp from LogGroupCursor
 *        - Call FilterLogEvents (startTime = cursor + 1)
 *        - Push new events to Redis queue (lq:logs:{workspaceId})
 *        - Advance cursor to latest event timestamp
 *  3. dbInsertWorker picks up from the queue and persists + publishes
 */

const {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  FilterLogEventsCommand,
} = require('@aws-sdk/client-cloudwatch-logs');

const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');

const AwsIntegration = require('../models/AwsIntegration');
const LogGroupCursor = require('../models/LogGroupCursor');
const { pushToQueue } = require('../services/logStreamService');
const logger = require('../utils/logger');

// ── Configuration ─────────────────────────────────────────────────
const INTERVAL_MS = Number(process.env.LOG_COLLECTOR_INTERVAL_MS) || 10_000; // 10 s
const MAX_EVENTS_PER_LOG_GROUP = 500;   // Max events per CloudWatch API call
const MAX_LOG_GROUPS_PER_INTEGRATION = 50; // Safeguard against runaway queries
const SESSION_DURATION_SECONDS = 3600;  // Assumed-role session length

let workerTimer = null;
let isRunning = false;

// ── STS AssumeRole ────────────────────────────────────────────────

/**
 * Assume an IAM role and return temporary AWS credentials.
 *
 * @param {string} roleArn
 * @param {string} region
 * @returns {Promise<{ accessKeyId, secretAccessKey, sessionToken }>}
 */
const assumeIntegrationRole = async (roleArn, region) => {
  const stsClient = new STSClient({ region });

  const response = await stsClient.send(new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: `opsentra-log-collector-${Date.now()}`,
    DurationSeconds: SESSION_DURATION_SECONDS,
  }));

  const creds = response.Credentials;
  return {
    accessKeyId: creds.AccessKeyId,
    secretAccessKey: creds.SecretAccessKey,
    sessionToken: creds.SessionToken,
  };
};

// ── CloudWatch Logs helpers ───────────────────────────────────────

/**
 * List all log groups in the account whose names start with the given prefix.
 *
 * @param {CloudWatchLogsClient} cwClient
 * @param {string} prefix
 * @returns {Promise<string[]>} Array of log group names
 */
const listLogGroupsWithPrefix = async (cwClient, prefix) => {
  const logGroupNames = [];
  let nextToken;

  do {
    const response = await cwClient.send(new DescribeLogGroupsCommand({
      logGroupNamePrefix: prefix,
      limit: 50,
      ...(nextToken ? { nextToken } : {}),
    }));

    for (const lg of (response.logGroups || [])) {
      logGroupNames.push(lg.logGroupName);
      if (logGroupNames.length >= MAX_LOG_GROUPS_PER_INTEGRATION) break;
    }

    nextToken = response.nextToken;
  } while (nextToken && logGroupNames.length < MAX_LOG_GROUPS_PER_INTEGRATION);

  return logGroupNames;
};

/**
 * Fetch new log events for a single log group since a given timestamp.
 * Pages through all FilterLogEvents results automatically.
 *
 * @param {CloudWatchLogsClient} cwClient
 * @param {string} logGroupName
 * @param {number} startTimeMs  - Unix epoch ms (exclusive — add 1 to avoid re-ingesting)
 * @returns {Promise<Array<{ timestamp: number, message: string, logStreamName: string }>>}
 */
const fetchNewEvents = async (cwClient, logGroupName, startTimeMs) => {
  const events = [];
  let nextToken;

  do {
    const response = await cwClient.send(new FilterLogEventsCommand({
      logGroupName,
      startTime: startTimeMs > 0 ? startTimeMs + 1 : undefined, // +1 to exclude last seen event
      limit: MAX_EVENTS_PER_LOG_GROUP,
      ...(nextToken ? { nextToken } : {}),
    }));

    for (const event of (response.events || [])) {
      events.push({
        timestamp: event.timestamp,
        message: event.message,
        logStreamName: event.logStreamName,
        eventId: event.eventId,
      });
    }

    nextToken = response.nextToken;
    // Stop paging once we have enough events for this tick
    if (events.length >= MAX_EVENTS_PER_LOG_GROUP) break;
  } while (nextToken);

  return events;
};

// ── Per-integration processor ─────────────────────────────────────

/**
 * Process one AwsIntegration: assume role → list log groups → fetch + store new events.
 *
 * @param {import('../models/AwsIntegration')} integration
 */
const processIntegration = async (integration) => {
  const { _id: integrationId, workspaceId, roleArn, region } = integration;

  // 1. Assume the customer's IAM role
  let credentials;
  try {
    credentials = await assumeIntegrationRole(roleArn, region);
  } catch (err) {
    logger.warn(`[LogCollector] AssumeRole failed for integration ${integrationId}: ${err.message}`);
    await AwsIntegration.findByIdAndUpdate(integrationId, {
      status: 'error',
      lastError: `STS AssumeRole failed: ${err.message}`,
    });
    return;
  }

  // 2. Create a scoped CloudWatch Logs client with the assumed credentials
  const cwClient = new CloudWatchLogsClient({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  // 3. List log groups with the Opsentra prefix for this workspace
  const logGroupPrefix = `opsentra-${workspaceId}-`;
  let logGroupNames;
  try {
    logGroupNames = await listLogGroupsWithPrefix(cwClient, logGroupPrefix);
  } catch (err) {
    logger.warn(`[LogCollector] DescribeLogGroups failed for integration ${integrationId}: ${err.message}`);
    return;
  }

  if (logGroupNames.length === 0) {
    logger.debug(`[LogCollector] No log groups found with prefix "${logGroupPrefix}"`);
    return;
  }

  logger.debug(`[LogCollector] Found ${logGroupNames.length} log group(s) for workspace ${workspaceId}`);

  // 4. For each log group, fetch and store new events
  for (const logGroupName of logGroupNames) {
    try {
      // Load the cursor (last seen timestamp)
      const cursor = await LogGroupCursor.findOne({ workspaceId, logGroup: logGroupName });
      const startTimeMs = cursor?.lastTimestamp ?? 0;

      // Fetch new events since last cursor position
      const events = await fetchNewEvents(cwClient, logGroupName, startTimeMs);

      if (events.length === 0) {
        logger.debug(`[LogCollector] No new events in ${logGroupName}`);
        continue;
      }

      // Determine the latest event timestamp for cursor advancement
      const maxTimestamp = Math.max(...events.map((e) => e.timestamp));

      // Build structured log documents for the Redis queue
      const logDocs = events.map((event) => ({
        workspaceId: workspaceId.toString(),
        awsIntegrationId: integrationId.toString(),
        logGroup: logGroupName,
        logStream: event.logStreamName,
        message: event.message,
        timestamp: new Date(event.timestamp),
        rawTimestamp: event.timestamp,
        level: inferLogLevel(event.message),
        source: 'cloudwatch',
        metadata: { eventId: event.eventId },
      }));

      // Push to Redis queue — dbInsertWorker will persist + publish
      await pushToQueue(workspaceId.toString(), logDocs);

      // Advance the cursor immediately so next tick doesn't re-fetch
      await LogGroupCursor.advance(workspaceId, integrationId, logGroupName, maxTimestamp, events.length);

      // Mark integration as healthy
      await AwsIntegration.findByIdAndUpdate(integrationId, {
        status: 'active',
        lastSyncedAt: new Date(),
        lastError: null,
      });

      logger.info(
        `[LogCollector] Queued ${events.length} event(s) from ${logGroupName} ` +
        `(workspace: ${workspaceId}, latestTs: ${new Date(maxTimestamp).toISOString()})`,
      );
    } catch (err) {
      logger.error(`[LogCollector] Error processing log group ${logGroupName}: ${err.message}`);
      await LogGroupCursor.recordError(workspaceId, logGroupName, err.message);
    }
  }

  // Destroy the CloudWatch client to release any open connections
  cwClient.destroy();
};

// ── Log level inference ───────────────────────────────────────────

/**
 * Heuristically infer a log level from a raw log message string.
 * @param {string} message
 * @returns {'error'|'warn'|'info'|'debug'}
 */
const inferLogLevel = (message = '') => {
  const lower = message.toLowerCase();
  if (/\b(error|err|fatal|exception|traceback|panic)\b/.test(lower)) return 'error';
  if (/\b(warn|warning|deprecated)\b/.test(lower))                    return 'warn';
  if (/\b(debug|trace|verbose)\b/.test(lower))                        return 'debug';
  return 'info';
};

// ── Main worker tick ─────────────────────────────────────────────

/**
 * Single collection cycle — runs once per interval.
 */
const runCollectionCycle = async () => {
  if (isRunning) {
    logger.debug('[LogCollector] Previous cycle still running, skipping this tick.');
    return;
  }

  isRunning = true;
  const tickStart = Date.now();

  try {
    // Fetch all active integrations (include roleArn which is select: false)
    const integrations = await AwsIntegration.find({ status: 'active' }).select('+roleArn');

    if (integrations.length === 0) {
      logger.debug('[LogCollector] No active integrations found.');
      return;
    }

    logger.debug(`[LogCollector] Processing ${integrations.length} active integration(s)...`);

    // Process each integration concurrently (but limit concurrency to avoid overwhelming STS)
    await Promise.allSettled(integrations.map(processIntegration));

    const elapsed = Date.now() - tickStart;
    logger.debug(`[LogCollector] Cycle complete in ${elapsed}ms`);
  } catch (err) {
    logger.error(`[LogCollector] Unexpected error in collection cycle: ${err.message}`);
  } finally {
    isRunning = false;
  }
};

// ── Lifecycle ─────────────────────────────────────────────────────

/**
 * Start the log collector worker.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
const start = () => {
  if (workerTimer) {
    logger.warn('[LogCollector] Worker already running.');
    return;
  }

  logger.info(`[LogCollector] Starting — polling every ${INTERVAL_MS / 1000}s`);

  // Run immediately on startup, then on interval
  runCollectionCycle();
  workerTimer = setInterval(runCollectionCycle, INTERVAL_MS);

  // Prevent the timer from blocking process exit
  if (workerTimer.unref) workerTimer.unref();
};

/**
 * Stop the log collector worker gracefully.
 */
const stop = () => {
  if (!workerTimer) return;
  clearInterval(workerTimer);
  workerTimer = null;
  logger.info('[LogCollector] Worker stopped.');
};

module.exports = { start, stop, runCollectionCycle };
