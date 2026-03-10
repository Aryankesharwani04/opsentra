'use strict';

/**
 * dbInsertWorker — reads log batches from the Redis queue and
 * bulk-inserts them into MongoDB, then publishes to the pub/sub
 * channel for real-time WebSocket delivery.
 *
 * Flow per tick:
 *  1. For each known workspace queue (scanned via KEYS lq:logs:*)
 *     pop a batch of up to BATCH_SIZE items
 *  2. Bulk insert into MongoDB LogEntry (ordered: false — ignore duplicates)
 *  3. Publish the inserted batch to Redis pub/sub → logs:{workspaceId}
 *  4. Update the latest-log cache
 *
 * Interval: configurable via DB_INSERT_WORKER_INTERVAL_MS (default: 3s).
 * Runs independently of logCollectorWorker so each can be scaled separately.
 */

const LogEntry = require('../models/LogEntry');
const {
  popFromQueue,
  publishBatch,
  cacheLatestLogs,
  queueKey,
} = require('../services/logStreamService');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const INTERVAL_MS = Number(process.env.DB_INSERT_WORKER_INTERVAL_MS) || 3_000;
const BATCH_SIZE = Number(process.env.DB_INSERT_BATCH_SIZE) || 100;
const QUEUE_KEY_PATTERN = 'lq:logs:*';

let workerTimer = null;
let isRunning = false;

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Scan Redis for all active workspace queue keys.
 * @returns {Promise<string[]>} e.g. ['lq:logs:abc123', ...]
 */
const getActiveQueueKeys = async () => {
  try {
    const redis = getRedisClient();
    return await redis.keys(QUEUE_KEY_PATTERN);
  } catch (err) {
    logger.error(`[DbInsertWorker] Failed to scan queue keys: ${err.message}`);
    return [];
  }
};

/**
 * Extract workspaceId from a queue key.
 * 'lq:logs:abc123' → 'abc123'
 */
const workspaceIdFromKey = (key) => key.replace('lq:logs:', '');

// ── Core processor ────────────────────────────────────────────────

/**
 * Process one workspace queue: pop → insert → publish.
 * @param {string} workspaceId
 */
const processWorkspaceQueue = async (workspaceId) => {
  // 1. Pop batch from Redis queue
  const logs = await popFromQueue(workspaceId, BATCH_SIZE);
  if (logs.length === 0) return;

  logger.debug(`[DbInsertWorker] Processing ${logs.length} log(s) for workspace ${workspaceId}`);

  // 2. Bulk-insert into MongoDB — skip duplicates silently
  let insertedDocs = [];
  try {
    const result = await LogEntry.insertMany(logs, { ordered: false, rawResult: true });
    const inserted = result.insertedCount ?? logs.length;
    logger.debug(`[DbInsertWorker] insertMany result: insertedCount=${inserted}`);
    insertedDocs = logs.slice(0, inserted);
  } catch (err) {
    if (err.code === 11000 || err?.writeErrors?.every((e) => e.code === 11000)) {
      // All duplicates — still publish whatever we have
      const inserted = logs.length - (err.writeErrors?.length ?? 0);
      logger.debug(`[DbInsertWorker] ${inserted} inserted, ${err.writeErrors?.length ?? 0} duplicates skipped`);
      insertedDocs = logs.slice(0, inserted);
    } else {
      // Surface ALL errors, not just 11000
      logger.error(`[DbInsertWorker] insertMany error (code=${err.code}): ${err.message}`);
      if (err.writeErrors?.length) {
        err.writeErrors.slice(0, 3).forEach((we) =>
          logger.error(`[DbInsertWorker]   writeError[${we.index}] code=${we.code}: ${we.errmsg}`)
        );
      }
      // Re-queue the failed batch so it isn't lost
      const { pushToQueue } = require('../services/logStreamService');
      await pushToQueue(workspaceId, logs).catch(() => {});
      return;
    }
  }

  if (insertedDocs.length === 0) return;

  // 3. Publish to Redis pub/sub so WebSocket clients receive real-time updates
  const publishPayloads = insertedDocs.map((doc) => ({
    _id: doc._id,
    workspaceId,
    logGroup: doc.logGroup,
    logStream: doc.logStream,
    message: doc.message,
    timestamp: doc.timestamp,
    rawTimestamp: doc.rawTimestamp,
    level: doc.level,
    source: doc.source,
  }));

  await publishBatch(workspaceId, publishPayloads);

  // 4. Update the latest-log cache (most recent first)
  await cacheLatestLogs(workspaceId, [...publishPayloads].reverse());

  logger.info(
    `[DbInsertWorker] ✅ Workspace ${workspaceId}: inserted ${insertedDocs.length}, published ${publishPayloads.length}`,
  );
};

// ── Worker tick ───────────────────────────────────────────────────

const runInsertCycle = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const queueKeys = await getActiveQueueKeys();
    if (queueKeys.length === 0) return;

    await Promise.allSettled(
      queueKeys.map((key) => processWorkspaceQueue(workspaceIdFromKey(key))),
    );
  } catch (err) {
    logger.error(`[DbInsertWorker] Unexpected error: ${err.message}`);
  } finally {
    isRunning = false;
  }
};

// ── Lifecycle ─────────────────────────────────────────────────────

const start = () => {
  if (workerTimer) return;
  logger.info(`[DbInsertWorker] Starting — flushing every ${INTERVAL_MS / 1000}s in batches of ${BATCH_SIZE}`);
  runInsertCycle(); // Run immediately
  workerTimer = setInterval(runInsertCycle, INTERVAL_MS);
  if (workerTimer.unref) workerTimer.unref();
};

const stop = () => {
  if (!workerTimer) return;
  clearInterval(workerTimer);
  workerTimer = null;
  logger.info('[DbInsertWorker] Stopped.');
};

module.exports = { start, stop, runInsertCycle };
