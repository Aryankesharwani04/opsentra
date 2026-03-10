'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { getInstallCommand } = require('../controllers/agentController');

const router = express.Router();

// All agent routes require authentication
router.use(protect);

/**
 * GET /api/v1/agent/install-command
 * Generate a personalised CloudWatch agent install command for the user's EC2 instance.
 *
 * Query params:
 *   ?workspace_id=<mongoId>   (optional — defaults to user's primary workspace)
 *   ?instance_name=<string>   (optional — hints a name for the instance being set up)
 */
router.get('/install-command', getInstallCommand);

module.exports = router;
