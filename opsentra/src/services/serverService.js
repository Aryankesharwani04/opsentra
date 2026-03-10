'use strict';

const ServerInstance = require('../models/ServerInstance');
const Workspace = require('../models/Workspace');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Generate the CloudWatch log group name for an instance.
 * Format: opsentra-{workspaceId}-{instanceId}
 *
 * @param {string} workspaceId  - MongoDB ObjectId of the workspace
 * @param {string} instanceId   - EC2 instance ID (e.g. i-0abc1234def56789)
 * @returns {string}
 */
const buildLogGroupName = (workspaceId, instanceId) =>
  `opsentra-${workspaceId}-${instanceId}`;

/**
 * Register an EC2 instance to a workspace.
 *
 * Steps:
 *  1. Resolve + validate the workspace
 *  2. Check for duplicate (same workspaceId + instanceId)
 *  3. Generate the CloudWatch log group name
 *  4. Create and return the ServerInstance record
 *
 * @param {object} data
 * @param {string} data.instanceId      - EC2 instance ID
 * @param {string} data.instanceName    - Human-readable name / tag:Name
 * @param {string} data.workspaceId     - MongoDB ObjectId of target workspace
 * @param {string} [data.region]        - AWS region (defaults to 'us-east-1')
 * @param {string} [data.awsIntegrationId] - Optional AwsIntegration reference
 * @returns {Promise<import('../models/ServerInstance')>}
 */
const registerInstance = async ({
  instanceId,
  instanceName,
  workspaceId,
  region = 'us-east-1',
  awsIntegrationId = null,
}) => {
  // 1. Validate workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace || !workspace.isActive) {
    throw AppError.notFound('Workspace not found or inactive');
  }

  // 2. Prevent duplicate registration for the same instance in the same workspace
  const existing = await ServerInstance.findOne({ workspaceId, instanceId });
  if (existing) {
    throw AppError.conflict(
      `EC2 instance ${instanceId} is already registered in this workspace`,
    );
  }

  // 3. Generate the CloudWatch log group name
  const logGroup = buildLogGroupName(workspaceId.toString(), instanceId);

  // 4. Create the ServerInstance record
  const instance = await ServerInstance.create({
    workspaceId,
    instanceId,
    instanceName,
    logGroup,
    region,
    awsIntegrationId,
    status: 'unknown', // Status updated when first heartbeat / log arrives
  });

  logger.info(
    `[ServerService] Registered instance ${instanceId} (${instanceName}) → workspace ${workspaceId} | logGroup: ${logGroup}`,
  );

  return instance;
};

/**
 * List all server instances for a workspace.
 *
 * @param {string} workspaceId
 * @param {object} [filters]
 * @param {string} [filters.status]   - Filter by status (running, stopped, etc.)
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=20]
 * @returns {Promise<{ instances: object[], total: number, page: number, limit: number }>}
 */
const listInstances = async (workspaceId, { status, page = 1, limit = 20 } = {}) => {
  const query = { workspaceId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [instances, total] = await Promise.all([
    ServerInstance.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ServerInstance.countDocuments(query),
  ]);

  return { instances, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Get a single server instance by its MongoDB _id, scoped to a workspace.
 *
 * @param {string} instanceDocId  - MongoDB _id
 * @param {string} workspaceId
 * @returns {Promise<import('../models/ServerInstance')>}
 */
const getInstance = async (instanceDocId, workspaceId) => {
  const instance = await ServerInstance.findOne({ _id: instanceDocId, workspaceId }).lean();
  if (!instance) throw AppError.notFound('Server instance');
  return instance;
};

/**
 * Deregister (delete) a server instance from a workspace.
 *
 * @param {string} instanceDocId
 * @param {string} workspaceId
 * @returns {Promise<void>}
 */
const deregisterInstance = async (instanceDocId, workspaceId) => {
  const result = await ServerInstance.findOneAndDelete({ _id: instanceDocId, workspaceId });
  if (!result) throw AppError.notFound('Server instance');
  logger.info(`[ServerService] Deregistered instance ${result.instanceId} from workspace ${workspaceId}`);
};

/**
 * Update instance status (called when a heartbeat or log event is received).
 *
 * @param {string} instanceId   - EC2 instance ID string
 * @param {string} workspaceId
 * @param {'running'|'stopped'|'terminated'|'unknown'} status
 * @returns {Promise<void>}
 */
const updateInstanceStatus = async (instanceId, workspaceId, status) => {
  await ServerInstance.findOneAndUpdate(
    { instanceId, workspaceId },
    { $set: { status, lastSeenAt: new Date() } },
  );
};

module.exports = {
  buildLogGroupName,
  registerInstance,
  listInstances,
  getInstance,
  deregisterInstance,
  updateInstanceStatus,
};
