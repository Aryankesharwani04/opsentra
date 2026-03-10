'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { connectAwsSchema, verifyRoleSchema } = require('../utils/validators');
const { connect, list, disconnect, verifyRole, getTemplate } = require('../controllers/awsController');

const router = express.Router();

// All AWS routes require authentication
router.use(protect);

/**
 * GET /api/v1/aws/template
 * Generate a CloudFormation template for creating the Opsentra IAM role.
 * Query params:
 *   ?region=us-east-1          (default)
 *   ?role_name=OpsentraCloudWatchAccess  (default)
 *   ?external_id=my-secret     (optional — adds trust policy ExternalId condition)
 */
router.get('/template', getTemplate);

/**
 * POST /api/v1/aws/connect
 * Connect an AWS account to a workspace via IAM role ARN.
 */
router.post('/connect', validate(connectAwsSchema), connect);

/**
 * POST /api/v1/aws/verify-role
 * Dry-run: verify a role ARN without storing anything.
 */
router.post('/verify-role', validate(verifyRoleSchema), verifyRole);

/**
 * GET /api/v1/aws/integrations
 * List all AWS integrations for a workspace.
 */
router.get('/integrations', list);

/**
 * DELETE /api/v1/aws/integrations/:id
 * Remove an AWS integration.
 */
router.delete('/integrations/:id', disconnect);

module.exports = router;

