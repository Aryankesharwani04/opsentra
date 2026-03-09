'use strict';

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const tokenService = require('./tokenService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Register a new user.
 * @param {object} data - { firstName, lastName, email, password, role?, tenantId? }
 * @param {object} [meta] - { ipAddress, userAgent }
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
const register = async (data, meta = {}) => {
  const { firstName, lastName, email, password, role, tenantId } = data;

  // Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) throw AppError.conflict('An account with this email already exists');

  // Create user (password hashed in pre-save hook)
  const user = await User.create({ firstName, lastName, email, password, role, tenantId });

  // Issue token pair
  const { accessToken, refreshToken } = await tokenService.createTokenPair(user, meta);

  // Audit log
  await AuditLog.create({
    userId: user._id,
    tenantId: user.tenantId,
    action: 'AUTH_REGISTER',
    resource: 'User',
    resourceId: user._id.toString(),
    status: 'SUCCESS',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  logger.info(`[AuthService] New user registered: ${email}`);

  return { user: user.toPublic(), accessToken, refreshToken };
};

/**
 * Log in an existing user.
 * @param {object} credentials - { email, password }
 * @param {object} [meta]
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
const login = async ({ email, password }, meta = {}) => {
  // Include password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    // Audit failed attempt
    await AuditLog.create({
      userId: user?._id || null,
      action: 'AUTH_LOGIN',
      status: 'FAILURE',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      metadata: { email },
    });
    throw AppError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) throw AppError.unauthorized('Your account has been deactivated');

  // Update last login
  user.lastLoginAt = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  // Issue token pair
  const { accessToken, refreshToken } = await tokenService.createTokenPair(user, meta);

  // Audit success
  await AuditLog.create({
    userId: user._id,
    tenantId: user.tenantId,
    action: 'AUTH_LOGIN',
    status: 'SUCCESS',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  logger.info(`[AuthService] User logged in: ${email}`);

  return { user: user.toPublic(), accessToken, refreshToken };
};

/**
 * Refresh an access token using a valid refresh token.
 * @param {string} incomingRefreshToken
 * @param {object} [meta]
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const refreshTokens = async (incomingRefreshToken, meta = {}) => {
  // Verify refresh token signature
  let decoded;
  try {
    decoded = tokenService.verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  // Find token record in DB
  const tokenRecord = await RefreshToken.findOne({
    token: incomingRefreshToken,
    userId: decoded.sub,
  });

  if (!tokenRecord || !tokenRecord.isValid()) {
    throw AppError.unauthorized('Refresh token has been revoked or expired');
  }

  // Revoke old refresh token (token rotation)
  await tokenRecord.revoke();

  // Get user
  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw AppError.unauthorized('User account not found or deactivated');

  // Issue new token pair
  const tokens = await tokenService.createTokenPair(user, meta);

  logger.info(`[AuthService] Tokens refreshed for user: ${user.email}`);

  return tokens;
};

/**
 * Logout: blacklist the access token and revoke the refresh token.
 * @param {string} accessToken - Raw JWT string
 * @param {number} accessTokenExp - Unix timestamp expiry of access token
 * @param {string} refreshToken - Raw refresh token string
 * @returns {Promise<void>}
 */
const logout = async (accessToken, accessTokenExp, refreshToken) => {
  // Blacklist access token in Redis
  await tokenService.blacklistAccessToken(accessToken, accessTokenExp);

  // Revoke refresh token in DB
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { $set: { isRevoked: true } });
  }

  logger.info('[AuthService] User logged out successfully');
};

/**
 * Logout from all devices: revoke all refresh tokens for a user.
 * @param {string} userId
 * @param {string} currentAccessToken
 * @param {number} currentAccessTokenExp
 * @returns {Promise<void>}
 */
const logoutAll = async (userId, currentAccessToken, currentAccessTokenExp) => {
  await tokenService.blacklistAccessToken(currentAccessToken, currentAccessTokenExp);
  await RefreshToken.revokeAllForUser(userId);
  logger.info(`[AuthService] All sessions revoked for user: ${userId}`);
};

module.exports = { register, login, refreshTokens, logout, logoutAll };
