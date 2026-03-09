'use strict';

const express = require('express');
const config = require('../config/env');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const healthRoutes = require('./health.routes');
const awsRoutes = require('./aws.routes');

const router = express.Router();
const API_PREFIX = `/api/${config.server.apiVersion}`;

/**
 * Mount all route modules under the versioned API prefix.
 * Add new feature routes here as the platform grows.
 */
router.use(`${API_PREFIX}/health`, healthRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/aws`, awsRoutes);

// ── API Root Info ─────────────────────────────────────────
router.get(API_PREFIX, (req, res) => {
  res.json({
    name: 'Opsentra API',
    version: config.server.apiVersion,
    status: 'running',
    docs: `${API_PREFIX}/docs`,
    health: `${API_PREFIX}/health`,
  });
});

module.exports = router;
