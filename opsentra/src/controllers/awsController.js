'use strict';

const awsAssumeRoleService = require('../services/awsAssumeRoleService');
const { generateIamRoleTemplate, generateLaunchUrl, OPSENTRA_ACCOUNT_ID } = require('../services/cloudFormationService');
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

/**
 * @route  GET /api/v1/aws/template
 * @access Protected
 * @query  region       - Target AWS region (default: us-east-1)
 * @query  role_name    - Custom IAM role name (default: OpsentraCloudWatchAccess)
 * @query  external_id  - Optional ExternalId condition for extra trust-policy security
 *
 * Returns a ready-to-deploy CloudFormation template plus a console quick-launch URL.
 * Frontend should display a "Launch CloudFormation Stack" button using the launch_url.
 */
const getTemplate = catchAsync(async (req, res) => {
  const {
    region = 'us-east-1',
    role_name: roleName = 'OpsentraCloudWatchAccess',
    external_id: externalId = null,
  } = req.query;

  const template = generateIamRoleTemplate({ roleName, externalId, region });

  // Build a CloudFormation console quick-launch URL.
  // In production, you would upload the template to a public S3 bucket and use that URL.
  // For now we return null and instruct users to deploy via AWS CLI or manual upload.
  const launchUrl = generateLaunchUrl(null, region);

  sendSuccess(res, {
    message: 'CloudFormation template generated successfully',
    data: {
      template,
      meta: {
        roleName,
        region,
        externalIdRequired: Boolean(externalId),
        opsentraTrustAccountId: OPSENTRA_ACCOUNT_ID,
        launch_url: launchUrl,
        permissions: template.Resources.OpsentraCloudWatchRole.Properties.Policies[0].PolicyDocument.Statement[0].Action,
        instructions: [
          '1. Download the CloudFormation template JSON below.',
          '2. Open the AWS Console → CloudFormation → Create Stack → Upload a template file.',
          '3. Upload the template and click through the wizard.',
          '4. After the stack is created, copy the RoleArn from the Outputs tab.',
          '5. Paste the RoleArn into Opsentra under AWS Integrations → Connect Account.',
        ],
        cliCommand: `aws cloudformation deploy \\
  --template-file opsentra-role.json \\
  --stack-name OpsentraIntegration \\
  --capabilities CAPABILITY_NAMED_IAM \\
  --region ${region}`,
      },
    },
  });
});

module.exports = { connect, list, disconnect, verifyRole, getTemplate };
