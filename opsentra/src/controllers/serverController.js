'use strict';

const serverService = require('../services/serverService');
const Workspace = require('../models/Workspace');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess, sendCreated, sendNoContent } = require('../utils/apiResponse');

// ── Workspace resolution helper ───────────────────────────────────

/**
 * Resolve the target workspace from query param or fall back to user's default.
 * Extracted as a helper to avoid repetition across handlers.
 *
 * @param {import('express').Request} req
 * @returns {Promise<string>} workspaceId (MongoDB ObjectId string)
 */
const resolveWorkspaceId = async (req) => {
  const wsId = req.query.workspace_id || req.body.workspace_id;
  if (wsId) return wsId;

  const defaultWs = await Workspace.findOne({ userId: req.user._id, isActive: true })
    .sort({ createdAt: 1 })
    .lean();

  if (!defaultWs) throw AppError.notFound('No active workspace found. Please create a workspace first.');
  return defaultWs._id;
};

// ── Handlers ──────────────────────────────────────────────────────

/**
 * @route  POST /api/v1/servers/register
 * @access Protected
 * @body   { instance_id, instance_name, region?, aws_integration_id?, workspace_id? }
 *
 * Registers an EC2 instance with the workspace and generates its
 * CloudWatch log group name in the format:
 *   opsentra-{workspaceId}-{instanceId}
 */
const register = catchAsync(async (req, res) => {
  const {
    instance_id,
    instance_name,
    region = 'us-east-1',
    aws_integration_id = null,
  } = req.body;

  const workspaceId = await resolveWorkspaceId(req);

  const instance = await serverService.registerInstance({
    instanceId: instance_id,
    instanceName: instance_name,
    workspaceId,
    region,
    awsIntegrationId: aws_integration_id,
  });

  sendCreated(res, {
    instance: {
      id: instance._id,
      instanceId: instance.instanceId,
      instanceName: instance.instanceName,
      workspaceId: instance.workspaceId,
      logGroup: instance.logGroup,   // e.g. opsentra-<wsId>-<instanceId>
      region: instance.region,
      status: instance.status,
      createdAt: instance.createdAt,
    },
  }, 'Server instance registered successfully');
});

/**
 * @route  GET /api/v1/servers
 * @access Protected
 * @query  workspace_id?, status?, page?, limit?
 *
 * Returns all registered server instances for a workspace.
 */
const list = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const { status, page = 1, limit = 20 } = req.query;

  const result = await serverService.listInstances(workspaceId, {
    status,
    page: Number(page),
    limit: Number(limit),
  });

  sendSuccess(res, {
    data: result.instances,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
});

/**
 * @route  GET /api/v1/servers/:id
 * @access Protected
 *
 * Get a single registered server instance by its MongoDB _id.
 */
const getOne = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const instance = await serverService.getInstance(req.params.id, workspaceId);
  sendSuccess(res, { data: instance });
});

/**
 * @route  DELETE /api/v1/servers/:id
 * @access Protected
 *
 * Deregister a server instance. Logs associated with it are NOT deleted.
 */
const deregister = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  await serverService.deregisterInstance(req.params.id, workspaceId);
  sendNoContent(res);
});

/**
 * @route  PATCH /api/v1/servers/:instanceId/status
 * @access Protected
 * @body   { status: 'running' | 'stopped' | 'terminated' | 'unknown' }
 *
 * Update the status of a registered instance (e.g. from an agent heartbeat).
 */
const updateStatus = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  await serverService.updateInstanceStatus(req.params.instanceId, workspaceId, req.body.status);
  sendSuccess(res, { message: 'Instance status updated' });
});

module.exports = { register, list, getOne, deregister, updateStatus };
