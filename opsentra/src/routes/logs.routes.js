'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { getLogs, getInstanceLogs, getRecentLogs, getLogStats } = require('../controllers/logController');

const router = express.Router();

router.use(protect);

/**
 * GET /api/v1/logs/recent
 * Most recent logs for a workspace — Redis cached (60s TTL), DB fallback.
 * ?workspace_id= ?limit=50
 * Must be defined BEFORE /:id routes to avoid route shadowing.
 */
router.get('/recent', getRecentLogs);

/**
 * GET /api/v1/logs/stats
 * Log level aggregation for dashboard stat cards.
 * ?workspace_id= ?time_range=24h
 */
router.get('/stats', getLogStats);

/**
 * GET /api/v1/logs
 * Paginated log query with optional filters.
 * ?workspace_id= &instance_id= &log_group= &level= &time_range= &from= &to= &page= &limit=
 */
router.get('/', getLogs);

/**
 * GET /api/v1/logs/instance/:id
 * Logs scoped to a specific ServerInstance (by MongoDB _id).
 * ?time_range= &level= &page= &limit=
 */
router.get('/instance/:id', getInstanceLogs);

module.exports = router;
