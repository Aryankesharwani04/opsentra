'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { connectAwsSchema, verifyRoleSchema } = require('../utils/validators');
const { connect, list, disconnect, verifyRole } = require('../controllers/awsController');

const router = express.Router();

// All AWS routes require authentication
router.use(protect);

/**
 * POST /api/v1/aws/connect
 * Connect an AWS account to a workspace via IAM role ARN.
 * Validates the role via STS AssumeRole before storing.
 */
router.post('/connect', validate(connectAwsSchema), connect);

/**
 * POST /api/v1/aws/verify-role
 * Dry-run: verify a role ARN without storing anything.
 * Used by the frontend "Test Connection" button.
 */
router.post('/verify-role', validate(verifyRoleSchema), verifyRole);

/**
 * GET /api/v1/aws/integrations
 * List all AWS integrations for a workspace.
 * ?workspace_id=<id>  (optional — defaults to user's primary workspace)
 */
router.get('/integrations', list);

/**
 * DELETE /api/v1/aws/integrations/:id
 * Remove an AWS integration.
 * ?workspace_id=<id>  (optional)
 */
router.delete('/integrations/:id', disconnect);

module.exports = router;
