'use strict';

const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Set a key-value pair in Redis with optional TTL.
 * @param {string} key
 * @param {*} value - Will be JSON-serialized
 * @param {number} [ttl=3600] - TTL in seconds
 * @returns {Promise<void>}
 */
const set = async (key, value, ttl = DEFAULT_TTL) => {
  const redis = getRedisClient();
  const serialized = JSON.stringify(value);
  if (ttl > 0) {
    await redis.setex(key, ttl, serialized);
  } else {
    await redis.set(key, serialized);
  }
};

/**
 * Get a value from Redis and parse it as JSON.
 * @param {string} key
 * @returns {Promise<*>} Parsed value or null if not found
 */
const get = async (key) => {
  const redis = getRedisClient();
  const value = await redis.get(key);
  if (value === null) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value; // Return raw string if not valid JSON
  }
};

/**
 * Delete a key from Redis.
 * @param {string} key
 * @returns {Promise<number>} Number of keys deleted
 */
const del = async (key) => {
  const redis = getRedisClient();
  return redis.del(key);
};

/**
 * Check if a key exists in Redis.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
const exists = async (key) => {
  const redis = getRedisClient();
  const result = await redis.exists(key);
  return result === 1;
};

/**
 * Get the remaining TTL of a key.
 * @param {string} key
 * @returns {Promise<number>} Seconds remaining, or -1 (no TTL), -2 (key not found)
 */
const ttl = async (key) => {
  const redis = getRedisClient();
  return redis.ttl(key);
};

/**
 * Blacklist a token: store with TTL matching the token's remaining lifetime.
 * @param {string} token - The raw JWT string
 * @param {number} expiryUnixSeconds - Token `exp` claim value
 * @returns {Promise<void>}
 */
const blacklistToken = async (token, expiryUnixSeconds) => {
  const remainingTtl = Math.max(expiryUnixSeconds - Math.floor(Date.now() / 1000), 1);
  await set(`bl:access:${token}`, '1', remainingTtl);
};

/**
 * Check if a token is blacklisted.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const isTokenBlacklisted = async (token) => exists(`bl:access:${token}`);

/**
 * Cache a value under a namespaced key.
 * @param {string} namespace - e.g. 'user', 'project'
 * @param {string} id
 * @param {*} data
 * @param {number} [ttlSeconds=3600]
 */
const cacheSet = (namespace, id, data, ttlSeconds = DEFAULT_TTL) =>
  set(`cache:${namespace}:${id}`, data, ttlSeconds);

/**
 * Retrieve a cached value.
 * @param {string} namespace
 * @param {string} id
 * @returns {Promise<*>}
 */
const cacheGet = (namespace, id) => get(`cache:${namespace}:${id}`);

/**
 * Invalidate a cached value.
 * @param {string} namespace
 * @param {string} id
 */
const cacheDel = (namespace, id) => del(`cache:${namespace}:${id}`);

module.exports = {
  set,
  get,
  del,
  exists,
  ttl,
  blacklistToken,
  isTokenBlacklisted,
  cacheSet,
  cacheGet,
  cacheDel,
};
