'use strict';

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const Workspace = require('../models/Workspace');
const tokenService = require('./tokenService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Register a new user.
 * Creates a User + default Workspace atomically via a compensating transaction:
 * if workspace creation fails, the user is deleted to maintain consistency.
 * Works with both standalone MongoDB and replica sets.
 *
 * @param {object} data - { firstName, lastName, email, password, role?, tenantId? }
 * @param {object} [meta] - { ipAddress, userAgent }
 * @returns {Promise<{ user: object, workspace: object, accessToken: string, refreshToken: string }>}
 */
const register = async (data, meta = {}) => {
  const { firstName, lastName, email, password, role, tenantId } = data;

  // 1. Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) throw AppError.conflict('An account with this email already exists');

  // 2. Create user (password hashed by pre-save hook)
  const user = await User.create({ firstName, lastName, email, password, role, tenantId });

  // 3. Create default workspace — if this fails, compensate by deleting the user
  let workspace;
  try {
    workspace = await Workspace.create({
      userId: user._id,
      workspaceName: `${firstName}'s Workspace`,
      description: 'Default workspace created on registration',
    });
  } catch (wsErr) {
    // Compensating action: roll back the user creation
    await User.findByIdAndDelete(user._id).catch((delErr) =>
      logger.error('[AuthService] Compensating user deletion failed:', delErr.message),
    );
    logger.error('[AuthService] Workspace creation failed during register, user rolled back:', wsErr.message);
    throw AppError.internal('Account creation failed. Please try again.');
  }

  // 4. Fetch workspace with apiKey (select: false by default)
  const workspaceWithKey = await Workspace.findById(workspace._id).select('+apiKey').lean();

  // 5. Issue token pair
  const { accessToken, refreshToken } = await tokenService.createTokenPair(user, meta);

  // 6. Audit log (fire-and-forget)
  AuditLog.create({
    userId: user._id,
    tenantId: user.tenantId,
    action: 'AUTH_REGISTER',
    resource: 'User',
    resourceId: user._id.toString(),
    status: 'SUCCESS',
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    metadata: { workspaceId: workspace._id },
  }).catch((err) => logger.error('[AuthService] Audit log failed:', err.message));

  logger.info(`[AuthService] New user registered: ${email} | workspaceId: ${workspace._id}`);

  return {
    user: user.toPublic(),
    workspace: workspaceWithKey,
    accessToken,
    refreshToken,
  };
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
