'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { getAlertHistory } = require('../controllers/alertController');

const router = express.Router();

router.use(protect);

/**
 * GET /api/v1/alerts
 * Paginated alert history for a workspace.
 * ?workspace_id= &page= &limit=
 */
router.get('/', getAlertHistory);

module.exports = router;
