'use strict';

const Redis = require('ioredis');
const logger = require('../utils/logger');
const config = require('./env');

/** @type {Redis | null} */
let client = null;

/**
 * Build ioredis options from config.
 * If REDIS_URL is provided, it takes priority.
 */
const getRedisConfig = () => {
  if (config.redis.url) {
    return config.redis.url;
  }

  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('[Redis] Max retry attempts reached. Giving up.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 200, 3000);
      logger.warn(`[Redis] Reconnecting... attempt ${times} (delay: ${delay}ms)`);
      return delay;
    },
  };
};

/**
 * Create and connect the Redis client.
 * @returns {Redis}
 */
const connectRedis = () => {
  if (client) {
    logger.warn('[Redis] Client already exists, reusing existing connection.');
    return client;
  }

  client = new Redis(getRedisConfig());

  client.on('connect', () => logger.info('[Redis] 🔄 Connecting to Redis...'));
  client.on('ready', () => logger.info('[Redis] ✅ Redis client ready.'));
  client.on('error', (err) => logger.error(`[Redis] ❌ Error: ${err.message}`));
  client.on('close', () => logger.warn('[Redis] Connection closed.'));
  client.on('reconnecting', () => logger.warn('[Redis] Reconnecting...'));
  client.on('end', () => logger.warn('[Redis] Connection ended.'));

  return client;
};

/**
 * Get the existing Redis client instance.
 * @returns {Redis}
 * @throws {Error} If client has not been initialized.
 */
const getRedisClient = () => {
  if (!client) {
    throw new Error('[Redis] Client not initialized. Call connectRedis() first.');
  }
  return client;
};

/**
 * Disconnect the Redis client.
 * @returns {Promise<void>}
 */
const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
    logger.info('[Redis] Disconnected.');
  }
};

/**
 * Check if the Redis client is connected.
 * @returns {boolean}
 */
const isConnected = () => client !== null && client.status === 'ready';

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectRedis();
});

module.exports = { connectRedis, getRedisClient, disconnectRedis, isConnected };
