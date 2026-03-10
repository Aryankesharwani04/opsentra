'use strict';

/**
 * logStreamService — Redis-backed log streaming pipeline.
 *
 * Responsibilities:
 *  1. QUEUE  — Push raw log batches into a Redis List (RPUSH / BLPOP)
 *              Key: lq:logs:{workspaceId}
 *              Serialised as JSON strings
 *
 *  2. PUB/SUB — Publish processed log events on a Redis channel so
 *               dashboard WebSocket clients receive real-time updates.
 *               Channel: logs:{workspaceId}
 *
 * Design notes:
 *  - A dedicated subscriber client is created lazily because ioredis
 *    clients in subscribe mode cannot issue other commands.
 *  - The publisher uses the shared app-wide Redis client.
 *  - Queue keys use a separate namespace (lq:) from pub/sub (logs:)
 *    to avoid key collisions.
 */

const Redis = require('ioredis');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');
const config = require('../config/env');

// ── Key builders ──────────────────────────────────────────────────

/** Redis List key used as the ingest queue for a workspace. */
const queueKey = (workspaceId) => `lq:logs:${workspaceId}`;

/** Redis Pub/Sub channel for real-time dashboard streaming. */
const channelKey = (workspaceId) => `logs:${workspaceId}`;

/** Optional Redis String key for caching the latest N log lines. */
const cacheKey = (workspaceId) => `cache:logs:latest:${workspaceId}`;

const CACHE_TTL_SECONDS = 60;      // Latest-logs cache TTL
const QUEUE_MAX_LEN = 10_000;      // Safety cap: trim queue if it grows too large

// ── Dedicated subscriber client (lazy) ───────────────────────────
let _subscriberClient = null;

/**
 * Get (or lazily create) a dedicated ioredis client for subscriptions.
 * Must be separate from the main client — subscribe mode is read-only.
 */
const getSubscriberClient = () => {
  if (_subscriberClient) return _subscriberClient;

  const redisConfig = config.redis.url
    ? config.redis.url
    : {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      lazyConnect: true,
    };

  _subscriberClient = new Redis(redisConfig);
  _subscriberClient.on('error', (err) =>
    logger.error(`[LogStream] Subscriber Redis error: ${err.message}`),
  );

  return _subscriberClient;
};

// ── Queue (Redis List) ────────────────────────────────────────────

/**
 * Push a batch of log events onto the Redis queue for a workspace.
 * Each event is serialised as a JSON string.
 *
 * @param {string} workspaceId
 * @param {object[]} logs - Array of log event objects
 * @returns {Promise<void>}
 */
const pushToQueue = async (workspaceId, logs) => {
  if (!logs || logs.length === 0) return;

  try {
    const redis = getRedisClient();
    const key = queueKey(workspaceId);

    // Serialise each log as a JSON string
    const serialised = logs.map((log) => JSON.stringify(log));

    const pipeline = redis.pipeline();
    pipeline.rpush(key, ...serialised);
    // Trim to safety cap to prevent unbounded memory growth
    pipeline.ltrim(key, -QUEUE_MAX_LEN, -1);
    await pipeline.exec();

    logger.debug(`[LogStream] Queued ${logs.length} event(s) → ${key}`);
  } catch (err) {
    logger.error(`[LogStream] pushToQueue failed for workspace ${workspaceId}: ${err.message}`);
    throw err;
  }
};

/**
 * Pop a batch of events from the Redis queue.
 * Uses LRANGE + LTRIM for atomic batch pop (non-blocking).
 *
 * @param {string} workspaceId
 * @param {number} [batchSize=100]
 * @returns {Promise<object[]>} Deserialised log objects
 */
const popFromQueue = async (workspaceId, batchSize = 100) => {
  try {
    const redis = getRedisClient();
    const key = queueKey(workspaceId);

    // Atomically read and remove the first N items
    const pipeline = redis.pipeline();
    pipeline.lrange(key, 0, batchSize - 1);
    pipeline.ltrim(key, batchSize, -1);
    const [[, items]] = await pipeline.exec();

    if (!items || items.length === 0) return [];

    return items.map((item) => {
      try { return JSON.parse(item); } catch { return null; }
    }).filter(Boolean);
  } catch (err) {
    logger.error(`[LogStream] popFromQueue failed: ${err.message}`);
    return [];
  }
};

/**
 * Get the current queue depth for a workspace.
 * @param {string} workspaceId
 * @returns {Promise<number>}
 */
const getQueueDepth = async (workspaceId) => {
  try {
    return await getRedisClient().llen(queueKey(workspaceId));
  } catch {
    return 0;
  }
};

// ── Pub/Sub (Publisher side) ──────────────────────────────────────

/**
 * Publish a processed log event to the workspace channel.
 * Dashboard WebSocket subscribers will receive this immediately.
 *
 * @param {string} workspaceId
 * @param {object} logEvent  - Processed LogEntry document (or subset)
 * @returns {Promise<number>} Number of subscribers that received the message
 */
const publishLog = async (workspaceId, logEvent) => {
  try {
    const redis = getRedisClient();
    const channel = channelKey(workspaceId);
    const payload = JSON.stringify(logEvent);

    const subscribers = await redis.publish(channel, payload);
    logger.debug(`[LogStream] Published to ${channel} → ${subscribers} subscriber(s)`);
    return subscribers;
  } catch (err) {
    logger.error(`[LogStream] publishLog failed: ${err.message}`);
    return 0;
  }
};

/**
 * Publish multiple log events at once (pipeline for efficiency).
 *
 * @param {string} workspaceId
 * @param {object[]} logEvents
 */
const publishBatch = async (workspaceId, logEvents) => {
  if (!logEvents || logEvents.length === 0) return;

  try {
    const redis = getRedisClient();
    const channel = channelKey(workspaceId);

    const pipeline = redis.pipeline();
    for (const event of logEvents) {
      pipeline.publish(channel, JSON.stringify(event));
    }
    await pipeline.exec();

    logger.debug(`[LogStream] Published batch of ${logEvents.length} to ${channel}`);
  } catch (err) {
    logger.error(`[LogStream] publishBatch failed: ${err.message}`);
  }
};

// ── Pub/Sub (Subscriber side) ─────────────────────────────────────

/** Map of channel → Set of callback functions */
const _subscriptions = new Map();

/**
 * Subscribe to log events for a workspace.
 * The callback receives a parsed log event object.
 *
 * @param {string} workspaceId
 * @param {function(object): void} callback
 * @returns {function} unsubscribe function
 */
const subscribeToWorkspace = (workspaceId, callback) => {
  const channel = channelKey(workspaceId);
  const sub = getSubscriberClient();

  if (!_subscriptions.has(channel)) {
    _subscriptions.set(channel, new Set());
    sub.subscribe(channel, (err) => {
      if (err) logger.error(`[LogStream] subscribe error on ${channel}: ${err.message}`);
      else logger.info(`[LogStream] Subscribed to channel: ${channel}`);
    });
  }

  _subscriptions.get(channel).add(callback);

  // Wire up the message handler once
  if (!sub.listenerCount('message')) {
    sub.on('message', (chan, message) => {
      const callbacks = _subscriptions.get(chan);
      if (!callbacks?.size) return;

      let parsed;
      try { parsed = JSON.parse(message); } catch { return; }

      for (const cb of callbacks) {
        try { cb(parsed); } catch (err) {
          logger.error(`[LogStream] Subscriber callback error: ${err.message}`);
        }
      }
    });
  }

  // Return unsubscribe function
  return () => unsubscribeFromWorkspace(workspaceId, callback);
};

/**
 * Remove a specific callback subscription for a workspace.
 *
 * @param {string} workspaceId
 * @param {function} callback
 */
const unsubscribeFromWorkspace = (workspaceId, callback) => {
  const channel = channelKey(workspaceId);
  const callbacks = _subscriptions.get(channel);
  if (!callbacks) return;

  callbacks.delete(callback);

  if (callbacks.size === 0) {
    _subscriptions.delete(channel);
    const sub = getSubscriberClient();
    sub.unsubscribe(channel).catch(() => {});
    logger.info(`[LogStream] Unsubscribed from channel: ${channel}`);
  }
};

// ── Latest-log cache (Redis String / sorted set) ─────────────────

/**
 * Cache the latest log entries for a workspace.
 * Stores as a JSON array in a Redis key with a short TTL.
 * Used for initial dashboard load ("load last 50 logs on connect").
 *
 * @param {string} workspaceId
 * @param {object[]} logs - Latest log entries (most recent first)
 * @param {number} [limit=50]
 */
const cacheLatestLogs = async (workspaceId, logs, limit = 50) => {
  try {
    const redis = getRedisClient();
    const key = cacheKey(workspaceId);
    const payload = JSON.stringify(logs.slice(0, limit));
    await redis.setex(key, CACHE_TTL_SECONDS, payload);
  } catch (err) {
    logger.debug(`[LogStream] cacheLatestLogs failed (non-fatal): ${err.message}`);
  }
};

/**
 * Read cached latest logs for a workspace.
 * @param {string} workspaceId
 * @returns {Promise<object[]>} Empty array if cache miss.
 */
const getCachedLatestLogs = async (workspaceId) => {
  try {
    const redis = getRedisClient();
    const raw = await redis.get(cacheKey(workspaceId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// ── Cleanup ───────────────────────────────────────────────────────

const disconnect = async () => {
  if (_subscriberClient) {
    await _subscriberClient.quit().catch(() => {});
    _subscriberClient = null;
  }
  _subscriptions.clear();
};

module.exports = {
  // Keys
  queueKey,
  channelKey,
  // Queue
  pushToQueue,
  popFromQueue,
  getQueueDepth,
  // Pub/Sub
  publishLog,
  publishBatch,
  subscribeToWorkspace,
  unsubscribeFromWorkspace,
  // Cache
  cacheLatestLogs,
  getCachedLatestLogs,
  // Lifecycle
  disconnect,
};
