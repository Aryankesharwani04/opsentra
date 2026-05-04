'use strict';

const AlertLog = require('../models/AlertLog');
const Workspace = require('../models/Workspace');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Resolve the caller's workspace (same helper pattern as logController).
 */
const resolveWorkspaceId = async (req) => {
  const wsId = req.query.workspace_id;
  if (wsId) return wsId;

  const ws = await Workspace.findOne({ userId: req.user._id, isActive: true })
    .sort({ createdAt: 1 })
    .lean();
  if (!ws) throw AppError.notFound('No active workspace found');
  return ws._id.toString();
};

/**
 * @route  GET /api/v1/alerts
 * @access Protected
 * @query  workspace_id?, page?, limit?
 *
 * Returns paginated alert history for a workspace, newest first.
 */
const getAlertHistory = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip  = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    AlertLog.find({ workspaceId })
      .sort({ firedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AlertLog.countDocuments({ workspaceId }),
  ]);

  sendSuccess(res, {
    data: alerts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      workspaceId,
    },
  });
});

module.exports = { getAlertHistory };
