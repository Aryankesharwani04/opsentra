'use strict';

const awsAssumeRoleService = require('../services/awsAssumeRoleService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');

/**
 * @route  POST /api/v1/aws/connect
 * @access Protected
 * @body   { role_arn, region, alias? }
 *
 * Connects an AWS account to the user's workspace by verifying an IAM role.
 * The workspaceId is resolved from the authenticated user's default workspace.
 */
const connect = catchAsync(async (req, res) => {
  const { role_arn, region, alias, workspace_id } = req.body;

  // Determine target workspace:
  // If workspace_id is provided in the body use it (multi-workspace users).
  // Otherwise resolve the user's default workspace.
  let workspaceId = workspace_id;

  if (!workspaceId) {
    const Workspace = require('../models/Workspace');
    const defaultWorkspace = await Workspace.findOne({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: 1 }); // Oldest = default workspace

    if (!defaultWorkspace) {
      throw AppError.notFound('Workspace — please create a workspace before connecting AWS');
    }
    workspaceId = defaultWorkspace._id;
  }

  const integration = await awsAssumeRoleService.connectAwsAccount(
    workspaceId,
    role_arn,
    region,
    alias || null,
  );

  sendCreated(res, {
    integration: {
      id: integration._id,
      workspaceId: integration.workspaceId,
      awsAccountId: integration.awsAccountId,
      region: integration.region,
      alias: integration.alias,
      status: integration.status,
      connectedAt: integration.connectedAt,
      // NOTE: roleArn is select:false — not returned to avoid leaking ARNs
    },
  }, 'AWS account connected successfully');
});

/**
 * @route  GET /api/v1/aws/integrations
 * @access Protected
 *
 * Lists all AWS integrations for a workspace.
 * workspaceId can be passed as a query param or falls back to default workspace.
 */
const list = catchAsync(async (req, res) => {
  let { workspace_id } = req.query;

  if (!workspace_id) {
    const Workspace = require('../models/Workspace');
    const defaultWorkspace = await Workspace.findOne({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    if (!defaultWorkspace) throw AppError.notFound('Workspace');
    workspace_id = defaultWorkspace._id;
  }

  const integrations = await awsAssumeRoleService.listIntegrations(workspace_id);

  sendSuccess(res, {
    data: integrations,
    meta: { total: integrations.length },
  });
});

/**
 * @route  DELETE /api/v1/aws/integrations/:id
 * @access Protected
 *
 * Removes an AWS integration from a workspace.
 */
const disconnect = catchAsync(async (req, res) => {
  let { workspace_id } = req.query;

  if (!workspace_id) {
    const Workspace = require('../models/Workspace');
    const defaultWorkspace = await Workspace.findOne({
      userId: req.user._id,
      isActive: true,
    }).sort({ createdAt: 1 });

    if (!defaultWorkspace) throw AppError.notFound('Workspace');
    workspace_id = defaultWorkspace._id;
  }

  await awsAssumeRoleService.disconnectAwsAccount(req.params.id, workspace_id);
  sendNoContent(res);
});

/**
 * @route  POST /api/v1/aws/verify-role
 * @access Protected
 *
 * Dry-run: verify a role ARN is assumable WITHOUT storing anything.
 * Useful for the UI's "Test connection" button.
 */
const verifyRole = catchAsync(async (req, res) => {
  const { role_arn, region } = req.body;
  const result = await awsAssumeRoleService.assumeRole(role_arn, region);

  sendSuccess(res, {
    message: 'Role verified successfully',
    data: {
      awsAccountId: result.accountId,
      assumedRoleArn: result.assumedRoleArn,
      credentialsExpire: result.expiration,
    },
  });
});

module.exports = { connect, list, disconnect, verifyRole };
