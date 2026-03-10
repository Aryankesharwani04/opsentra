'use strict';

const LogEntry = require('../models/LogEntry');
const ServerInstance = require('../models/ServerInstance');
const Workspace = require('../models/Workspace');
const { getCachedLatestLogs, cacheLatestLogs } = require('../services/logStreamService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

// ── Shared helpers ────────────────────────────────────────────────

/**
 * Resolve workspaceId from query param or user's default workspace.
 * @param {import('express').Request} req
 * @returns {Promise<string>}
 */
const resolveWorkspaceId = async (req) => {
  const wsId = req.query.workspace_id;
  if (wsId) return wsId;

  const ws = await Workspace.findOne({ userId: req.user._id, isActive: true })
    .sort({ createdAt: 1 }).lean();
  if (!ws) throw AppError.notFound('No active workspace found');
  return ws._id.toString();
};

/**
 * Parse a time_range string (e.g. "1h", "24h", "7d") into a { from, to } object.
 * Also accepts ISO strings via from / to query params directly.
 *
 * @param {object} query - req.query
 * @returns {{ from: Date|null, to: Date|null }}
 */
const parseTimeRange = (query) => {
  // Explicit ISO dates take priority
  if (query.from || query.to) {
    return {
      from: query.from ? new Date(query.from) : null,
      to:   query.to   ? new Date(query.to)   : null,
    };
  }

  if (!query.time_range) return { from: null, to: null };

  const presets = {
    '15m': 15 * 60_000,
    '1h':  60 * 60_000,
    '6h':  6 * 60 * 60_000,
    '12h': 12 * 60 * 60_000,
    '24h': 24 * 60 * 60_000,
    '3d':  3 * 24 * 60 * 60_000,
    '7d':  7 * 24 * 60 * 60_000,
    '30d': 30 * 24 * 60 * 60_000,
  };

  const ms = presets[query.time_range];
  if (!ms) throw AppError.badRequest(`Invalid time_range. Valid: ${Object.keys(presets).join(', ')}`);

  return { from: new Date(Date.now() - ms), to: null };
};

/**
 * Parse and validate pagination params.
 */
const parsePagination = (query) => ({
  page:  Math.max(1, Number(query.page)  || 1),
  limit: Math.min(500, Math.max(1, Number(query.limit) || 50)),
});

// ── Handlers ──────────────────────────────────────────────────────

/**
 * @route  GET /api/v1/logs
 * @access Protected
 * @query  workspace_id?, instance_id?, log_group?, level?, time_range?,
 *         from?, to?, page?, limit?
 *
 * Returns paginated log entries for a workspace with optional filters.
 */
const getLogs = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const { from, to } = parseTimeRange(req.query);
  const { page, limit } = parsePagination(req.query);

  const filter = {
    workspaceId,
    ...(req.query.instance_id && { instanceId: req.query.instance_id }),
    ...(req.query.log_group   && { logGroup: req.query.log_group }),
    ...(req.query.level       && { level: req.query.level }),
    ...(from && { from }),
    ...(to   && { to }),
  };

  const result = await LogEntry.queryLogs(filter, { page, limit });

  sendSuccess(res, {
    data: result.logs,
    meta: {
      total:      result.total,
      page:       result.page,
      limit:      result.limit,
      totalPages: result.totalPages,
      filter: {
        workspaceId,
        from: from?.toISOString() ?? null,
        to:   to?.toISOString()   ?? null,
      },
    },
  });
});

/**
 * @route  GET /api/v1/logs/instance/:id
 * @access Protected
 * @param  id  - MongoDB _id of the ServerInstance record
 * @query  time_range?, from?, to?, level?, page?, limit?
 *
 * Returns logs scoped to a specific registered server instance.
 * Looks up the instance's logGroup and filters by it.
 */
const getInstanceLogs = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const { from, to } = parseTimeRange(req.query);
  const { page, limit } = parsePagination(req.query);

  // Lookup the ServerInstance to get its logGroup
  const instance = await ServerInstance.findOne({
    _id: req.params.id,
    workspaceId,
  }).lean();

  if (!instance) throw AppError.notFound('Server instance');

  const filter = {
    workspaceId,
    logGroup: instance.logGroup,
    ...(req.query.level && { level: req.query.level }),
    ...(from && { from }),
    ...(to   && { to }),
  };

  const result = await LogEntry.queryLogs(filter, { page, limit });

  sendSuccess(res, {
    data: result.logs,
    meta: {
      total:        result.total,
      page:         result.page,
      limit:        result.limit,
      totalPages:   result.totalPages,
      instance: {
        id:           instance._id,
        instanceId:   instance.instanceId,
        instanceName: instance.instanceName,
        logGroup:     instance.logGroup,
        region:       instance.region,
      },
      filter: {
        from: from?.toISOString() ?? null,
        to:   to?.toISOString()   ?? null,
      },
    },
  });
});

/**
 * @route  GET /api/v1/logs/recent
 * @access Protected
 * @query  workspace_id?, limit? (default 50, max 100)
 *
 * Returns the most recent logs for a workspace.
 * Served from Redis cache (TTL 60s) to avoid hitting MongoDB on every
 * dashboard refresh. Falls back to MongoDB on cache miss.
 */
const getRecentLogs = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

  // 1. Try Redis cache first
  const cached = await getCachedLatestLogs(workspaceId);
  if (cached.length > 0) {
    return sendSuccess(res, {
      data: cached.slice(0, limit),
      meta: { total: cached.length, limit, source: 'cache', workspaceId },
    });
  }

  // 2. Cache miss — query MongoDB and backfill
  const result = await LogEntry.queryLogs({ workspaceId }, { page: 1, limit });

  // Backfill the Redis cache for subsequent requests
  if (result.logs.length > 0) {
    await cacheLatestLogs(workspaceId, result.logs, 100).catch(() => {});
  }

  sendSuccess(res, {
    data: result.logs,
    meta: {
      total:  result.total,
      limit,
      source: 'db',
      workspaceId,
    },
  });
});

/**
 * @route  GET /api/v1/logs/stats
 * @access Protected
 * @query  workspace_id?, time_range?
 *
 * Returns log counts grouped by level for the workspace dashboard.
 */
const getLogStats = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const { from } = parseTimeRange(req.query);

  const stats = await LogEntry.levelStats(workspaceId, from);

  // Normalise to a map: { info: 123, error: 45, ... }
  const totals = Object.fromEntries(stats.map((s) => [s._id.toLowerCase(), s.count]));
  const grandTotal = stats.reduce((sum, s) => sum + s.count, 0);

  sendSuccess(res, {
    data: {
      byLevel: totals,
      total:   grandTotal,
      from:    from?.toISOString() ?? null,
    },
  });
});

module.exports = { getLogs, getInstanceLogs, getRecentLogs, getLogStats };
