'use strict';

const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { getRedisClient } = require('../config/redis');
const User = require('../models/User');
const config = require('../config/env');

/**
 * protect — Verifies the JWT access token from the Authorization header.
 * Attaches the authenticated user to req.user.
 *
 * Checks Redis blacklist to ensure the token hasn't been revoked.
 */
const protect = catchAsync(async (req, res, next) => {
  // 1) Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('No authentication token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) throw AppError.unauthorized('Invalid authorization header format');

  // 2) Verify token signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw AppError.unauthorized('Access token has expired');
    if (err.name === 'JsonWebTokenError') throw AppError.unauthorized('Invalid access token');
    throw AppError.unauthorized('Token verification failed');
  }

  // 3) Check Redis blacklist (handles logout/token rotation)
  try {
    const redis = getRedisClient();
    const isBlacklisted = await redis.get(`bl:access:${token}`);
    if (isBlacklisted) throw AppError.unauthorized('Token has been revoked');
  } catch (err) {
    // If it's our AppError, rethrow it
    if (err.isOperational) throw err;
    // Redis connection failure: log and continue (fail-open for availability)
    // In high-security contexts, change this to fail-closed (throw error)
    req.app.locals.logger?.warn('[Auth] Redis check failed, proceeding without blacklist check');
  }

  // 4) Check user still exists and is active
  const user = await User.findById(decoded.sub).select('-password');
  if (!user) throw AppError.unauthorized('User no longer exists');
  if (!user.isActive) throw AppError.unauthorized('Account has been deactivated');

  // 5) Attach user and token metadata to request
  req.user = user;
  req.token = token;
  req.tokenPayload = decoded;

  next();
});

/**
 * optionalAuth — Same as protect but does NOT reject unauthenticated requests.
 * Sets req.user = null if no valid token is provided.
 * Useful for public routes that render differently for logged-in users.
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(decoded.sub).select('-password');
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
});

module.exports = { protect, optionalAuth };
