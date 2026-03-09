'use strict';

const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

/**
 * @route  POST /api/v1/auth/register
 * @access Public
 */
const register = catchAsync(async (req, res) => {
  const meta = {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };

  const { user, workspace, accessToken, refreshToken } = await authService.register(req.body, meta);

  // Set refresh token as HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // workspace.apiKey is returned ONLY here at registration — save it immediately
  sendCreated(res, { user, workspace, accessToken }, 'Account created successfully');
});

/**
 * @route  POST /api/v1/auth/login
 * @access Public
 */
const login = catchAsync(async (req, res) => {
  const meta = {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  };

  const { user, accessToken, refreshToken } = await authService.login(req.body, meta);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { message: 'Login successful', data: { user, accessToken } });
});

/**
 * @route  POST /api/v1/auth/refresh
 * @access Public (requires refresh token in cookie or body)
 */
const refresh = catchAsync(async (req, res) => {
  // Accept from HttpOnly cookie first, then body
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const tokens = await authService.refreshTokens(refreshToken, meta);

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { message: 'Tokens refreshed', data: { accessToken: tokens.accessToken } });
});

/**
 * @route  POST /api/v1/auth/logout
 * @access Protected
 */
const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  await authService.logout(req.token, req.tokenPayload.exp, refreshToken);

  res.clearCookie('refreshToken');
  sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * @route  POST /api/v1/auth/logout-all
 * @access Protected
 */
const logoutAll = catchAsync(async (req, res) => {
  await authService.logoutAll(req.user._id, req.token, req.tokenPayload.exp);
  res.clearCookie('refreshToken');
  sendSuccess(res, { message: 'Logged out from all devices' });
});

/**
 * @route  GET /api/v1/auth/me
 * @access Protected
 */
const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, { data: req.user.toPublic ? req.user.toPublic() : req.user });
});

module.exports = { register, login, refresh, logout, logoutAll, getMe };
