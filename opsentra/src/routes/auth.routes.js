'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, sensitiveActionLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../utils/validators');
const {
  register, login, refresh, logout, logoutAll, getMe,
} = require('../controllers/authController');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', authLimiter, validate(registerSchema), register);

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), login);

// POST /api/v1/auth/refresh
router.post('/refresh', refresh);

// POST /api/v1/auth/logout (protected)
router.post('/logout', protect, logout);

// POST /api/v1/auth/logout-all (protected)
router.post('/logout-all', protect, logoutAll);

// GET /api/v1/auth/me (protected)
router.get('/me', protect, getMe);

module.exports = router;
