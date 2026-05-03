'use strict';

const AlertLog = require('../models/AlertLog');
const Workspace = require('../models/Workspace');
const { generateIncidentReport } = require('../services/aiAnalysisService');
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

/**
 * @route  POST /api/v1/alerts/:id/report
 * @access Protected
 *
 * Generates a full AI incident post-mortem report for a specific alert.
 * Verifies the alert belongs to the caller's workspace before generating.
 */
const generateReport = catchAsync(async (req, res) => {
  const workspaceId = await resolveWorkspaceId(req);

  const alert = await AlertLog.findOne({
    _id: req.params.id,
    workspaceId,
  }).lean();

  if (!alert) throw AppError.notFound('Alert not found');

  if (!process.env.GEMINI_API_KEY) {
    throw AppError.badRequest('AI features require GEMINI_API_KEY to be configured');
  }

  const report = await generateIncidentReport(alert);

  if (!report) {
    throw AppError.internal('AI report generation failed — please try again');
  }

  sendSuccess(res, { data: report });
});

module.exports = { getAlertHistory, generateReport };
