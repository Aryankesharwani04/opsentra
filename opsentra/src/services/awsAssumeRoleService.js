'use strict';

const { STSClient, AssumeRoleCommand, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const AwsIntegration = require('../models/AwsIntegration');
const Workspace = require('../models/Workspace');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { createStsClient } = require('../config/aws');

/**
 * Attempt to assume an IAM role via AWS STS and extract the AWS account ID.
 * This validates the role ARN is real and that our platform has permission to assume it.
 *
 * @param {string} roleArn   - Full IAM role ARN (e.g. arn:aws:iam::123456789012:role/OpsentraRole)
 * @param {string} region    - AWS region to perform the AssumeRole call in
 * @returns {Promise<{ accountId: string, assumedRoleArn: string, expiration: Date }>}
 */
const assumeRole = async (roleArn, region) => {
  const stsClient = createStsClient(region);

  const sessionName = `opsentra-verify-${Date.now()}`;

  let response;
  try {
    response = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        DurationSeconds: 900, // Minimum session: 15 minutes
      }),
    );
  } catch (err) {
    logger.warn(`[AwsAssumeRoleService] AssumeRole failed for ${roleArn}: ${err.message}`);

    // Map known STS errors to user-friendly messages
    if (err.name === 'AccessDenied') {
      throw AppError.forbidden(
        'AWS denied the AssumeRole request. Ensure the trust policy on the IAM role allows the Opsentra principal to assume it.',
      );
    }
    if (err.name === 'NoSuchEntityException' || err.name === 'InvalidInput') {
      throw AppError.badRequest(`Invalid IAM role ARN: ${roleArn}`);
    }
    if (err.Code === 'MalformedPolicyDocument') {
      throw AppError.badRequest('The IAM role trust policy is malformed.');
    }

    throw AppError.badRequest(
      `AWS STS verification failed: ${err.message}. Check that the role ARN is correct and the trust policy grants Opsentra access.`,
    );
  }

  if (!response?.Credentials || !response?.AssumedRoleUser) {
    throw AppError.internal('STS returned an unexpected empty response');
  }

  // Extract the 12-digit AWS account ID from the AssumedRoleUser ARN
  // ARN format: arn:aws:sts::<account-id>:assumed-role/<role-name>/<session>
  const arnParts = response.AssumedRoleUser.Arn.split(':');
  const accountId = arnParts[4];

  if (!accountId || !/^\d{12}$/.test(accountId)) {
    throw AppError.internal('Could not extract a valid AWS account ID from STS response');
  }

  logger.info(`[AwsAssumeRoleService] ✅ Role assumed successfully — account: ${accountId} | role: ${roleArn}`);

  return {
    accountId,
    assumedRoleArn: response.AssumedRoleUser.Arn,
    expiration: response.Credentials.Expiration,
    accessKeyId: response.Credentials.AccessKeyId,     // Temporary credentials (not stored)
    secretAccessKey: response.Credentials.SecretAccessKey,
    sessionToken: response.Credentials.SessionToken,
  };
};

/**
 * Connect an AWS account to a workspace.
 *
 * Workflow:
 *  1. Validate the role ARN by attempting STS AssumeRole
 *  2. Extract the AWS account ID from the STS response
 *  3. Check for duplicate integration (same account + workspace)
 *  4. Store the integration in MongoDB
 *
 * @param {string} workspaceId  - MongoDB ObjectId of the workspace
 * @param {string} roleArn      - IAM role ARN
 * @param {string} region       - Primary AWS region
 * @param {string} [alias]      - Optional human-readable label
 * @returns {Promise<import('../models/AwsIntegration')>}
 */
const connectAwsAccount = async (workspaceId, roleArn, region, alias = null) => {
  // 1. Verify the workspace exists
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace || !workspace.isActive) {
    throw AppError.notFound('Workspace');
  }

  // 2. Attempt role assumption — this is the verification step
  const { accountId } = await assumeRole(roleArn, region);

  // 3. Prevent duplicate connections for the same AWS account + workspace
  const existing = await AwsIntegration.findOne({ workspaceId, awsAccountId: accountId });
  if (existing) {
    if (existing.status === 'error') {
      // Re-activate a previously errored integration
      existing.status = 'active';
      existing.roleArn = roleArn;
      existing.region = region;
      existing.lastError = null;
      existing.lastSyncedAt = new Date();
      await existing.save();
      logger.info(`[AwsAssumeRoleService] Re-activated integration for account: ${accountId}`);
      return existing;
    }
    throw AppError.conflict(
      `AWS account ${accountId} is already connected to this workspace`,
    );
  }

  // 4. Store the integration
  const integration = await AwsIntegration.create({
    workspaceId,
    awsAccountId: accountId,
    roleArn,
    region,
    alias,
    status: 'active',
    connectedAt: new Date(),
    lastSyncedAt: new Date(),
  });

  logger.info(`[AwsAssumeRoleService] AWS account ${accountId} connected to workspace ${workspaceId}`);

  return integration;
};

/**
 * List all AWS integrations for a workspace.
 * @param {string} workspaceId
 * @returns {Promise<import('../models/AwsIntegration')[]>}
 */
const listIntegrations = async (workspaceId) => {
  return AwsIntegration.find({ workspaceId }).sort({ connectedAt: -1 }).lean();
};

/**
 * Disconnect (delete) an AWS integration.
 * @param {string} integrationId - MongoDB ObjectId
 * @param {string} workspaceId   - Used to scope the deletion to the workspace
 * @returns {Promise<void>}
 */
const disconnectAwsAccount = async (integrationId, workspaceId) => {
  const result = await AwsIntegration.findOneAndDelete({ _id: integrationId, workspaceId });
  if (!result) throw AppError.notFound('AWS Integration');
  logger.info(`[AwsAssumeRoleService] Integration ${integrationId} removed from workspace ${workspaceId}`);
};

module.exports = { assumeRole, connectAwsAccount, listIntegrations, disconnectAwsAccount };
