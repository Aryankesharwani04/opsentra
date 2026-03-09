'use strict';

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');
const AppError = require('../utils/AppError');
const config = require('../config/env');

/**
 * Create a rate limiter middleware backed by Redis (or in-memory fallback).
 *
 * @param {object} [options]
 * @param {number} [options.windowMs] - Time window in milliseconds
 * @param {number} [options.max] - Max requests per window
 * @param {string} [options.keyPrefix] - Redis key prefix for this limiter
 * @returns {import('express-rate-limit').RateLimitRequestHandler}
 */
const createRateLimiter = ({ windowMs, max, keyPrefix = 'rl:global' } = {}) => {
  let store;

  // Use Redis store when Redis is available
  try {
    const redisClient = getRedisClient();
    store = new RedisStore.default({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: keyPrefix,
    });
  } catch {
    // Redis not ready — fall back to in-memory store (not suitable for multi-instance prod)
    store = undefined;
  }

  return rateLimit({
    windowMs: windowMs ?? config.rateLimit.windowMs,
    max: max ?? config.rateLimit.max,
    standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
    store,
    keyGenerator: (req) => {
      // Use IP address; consider X-Forwarded-For in production behind a proxy
      return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    },
    handler: (req, res) => {
      const error = AppError.tooManyRequests('Too many requests, please try again later.');
      res.status(429).json(error.toJSON());
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/v1/health';
    },
  });
};

// ── Pre-configured limiters ───────────────────────────────────────

/**
 * Global API rate limiter: 100 requests per 15 minutes.
 */
const globalLimiter = createRateLimiter({
  keyPrefix: 'rl:global',
});

/**
 * Strict auth rate limiter: 10 requests per 15 minutes (prevent brute force).
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: 'rl:auth',
});

/**
 * Sensitive action limiter (e.g., password reset): 5 per hour.
 */
const sensitiveActionLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: 'rl:sensitive',
});

module.exports = { createRateLimiter, globalLimiter, authLimiter, sensitiveActionLimiter };
