'use strict';

const mongoose = require('mongoose');
const { isConnected: isDBConnected } = require('../config/database');
const { isConnected: isRedisConnected } = require('../config/redis');
const catchAsync = require('../utils/catchAsync');

/**
 * @route  GET /api/v1/health
 * @access Public
 * @description Liveness and readiness probe for container orchestration (K8s, ECS).
 */
const healthCheck = catchAsync(async (req, res) => {
  const dbOk = isDBConnected();
  const redisOk = isRedisConnected();
  const allOk = dbOk && redisOk;

  const status = {
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      database: {
        status: dbOk ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
      },
      redis: {
        status: redisOk ? 'connected' : 'disconnected',
      },
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(allOk ? 200 : 503).json(status);
});

module.exports = { healthCheck };
