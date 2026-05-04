'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { getAlertHistory, generateReport } = require('../controllers/alertController');

const router = express.Router();

router.use(protect);

/**
 * GET /api/v1/alerts
 * Paginated alert history for a workspace.
 * ?workspace_id= &page= &limit=
 */
router.get('/', getAlertHistory);

/**
 * POST /api/v1/alerts/:id/report
 * Generate a full AI incident post-mortem for a specific alert.
 */
router.post('/:id/report', generateReport);

module.exports = router;
