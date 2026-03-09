'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const { getRedisClient } = require('../config/redis');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Parse a JWT duration string to milliseconds.
 * Supports: 's' (seconds), 'm' (minutes), 'h' (hours), 'd' (days)
 * @param {string} duration - e.g. '15m', '7d'
 * @returns {number} milliseconds
 */
const parseDuration = (duration) => {
  const unit = duration.slice(-1);
  const amount = parseInt(duration.slice(0, -1), 10);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return amount * (multipliers[unit] || 1000);
};

/**
 * Generate a signed JWT access token.
 * @param {object} payload - Claims to embed (should contain `sub`, `role`, etc.)
 * @returns {string}
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'opsentra-api',
    audience: 'opsentra-client',
  });

/**
 * Generate a signed JWT refresh token.
 * @param {object} payload
 * @returns {string}
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'opsentra-api',
    audience: 'opsentra-client',
  });

/**
 * Verify a JWT access token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'opsentra-api',
    audience: 'opsentra-client',
  });

/**
 * Verify a JWT refresh token.
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'opsentra-api',
    audience: 'opsentra-client',
  });

/**
 * Store a refresh token in MongoDB.
 * @param {string} userId
 * @param {string} token
 * @param {{ userAgent?: string, ipAddress?: string }} [meta]
 * @returns {Promise<import('../models/RefreshToken')>}
 */
const storeRefreshToken = async (userId, token, meta = {}) => {
  const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiresIn));
  return RefreshToken.create({
    token,
    userId,
    expiresAt,
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null,
  });
};

/**
 * Blacklist an access token in Redis until its natural expiry.
 * @param {string} token - Raw JWT string
 * @param {number} expiresAt - Unix timestamp (seconds) of token expiry
 * @returns {Promise<void>}
 */
const blacklistAccessToken = async (token, expiresAt) => {
  try {
    const redis = getRedisClient();
    const ttl = Math.max(expiresAt - Math.floor(Date.now() / 1000), 1);
    await redis.setex(`bl:access:${token}`, ttl, '1');
  } catch (err) {
    logger.error('[TokenService] Failed to blacklist token in Redis:', err.message);
  }
};

/**
 * Build the standard token pair response object.
 * @param {import('../models/User')} user
 * @param {{ userAgent?: string, ipAddress?: string }} [meta]
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
const createTokenPair = async (user, meta = {}) => {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(user._id, refreshToken, meta);

  return { accessToken, refreshToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  blacklistAccessToken,
  createTokenPair,
  parseDuration,
};
