'use strict';

const mongoose = require('mongoose');

/**
 * LogEntry — A single CloudWatch log record ingested for a server instance.
 *
 * Designed for high-volume write throughput. Indexes are optimized for the
 * most common query patterns: by workspace, by instance, by time range.
 *
 * ⚠️  For production scale, consider time-series collections (MongoDB 5.0+)
 *     or a dedicated log store (OpenSearch, Loki) with MongoDB as metadata store.
 *
 * @typedef {Object} ILogEntry
 * @property {mongoose.Types.ObjectId} workspaceId
 * @property {string} instanceId    - EC2 Instance ID (e.g. i-0abc1234)
 * @property {string} logGroup      - CloudWatch Log Group name
 * @property {string} [logStream]   - CloudWatch Log Stream name
 * @property {string} message       - Raw log message
 * @property {'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'UNKNOWN'} level - Parsed log level
 * @property {Date} timestamp       - Original log event timestamp from CloudWatch
 * @property {number} [sequenceToken] - CloudWatch sequence token
 * @property {object} [metadata]    - Parsed structured fields (JSON logs)
 */
const logEntrySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Log entry must belong to a workspace'],
      index: true,
    },
    instanceId: {
      type: String,
      required: [true, 'Instance ID is required'],
      trim: true,
      index: true,
    },
    logGroup: {
      type: String,
      required: [true, 'Log group is required'],
      trim: true,
      index: true,
    },
    logStream: {
      type: String,
      trim: true,
      default: null,
    },
    message: {
      type: String,
      required: [true, 'Log message is required'],
      maxlength: [65535, 'Log message exceeds maximum length of 65535 characters'],
    },
    level: {
      type: String,
      enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'UNKNOWN'],
      default: 'UNKNOWN',
      index: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'Log timestamp is required'],
      index: true,
    },
    sequenceToken: {
      type: String,
      default: null,
    },
    metadata: {
      // Stores parsed JSON fields from structured log messages
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'ingestedAt', updatedAt: false }, // Track when WE ingested the log
    collection: 'log_entries',
  },
);

// ── Indexes ───────────────────────────────────────────────────────
// Primary query pattern: logs for a workspace within a time range
logEntrySchema.index({ workspaceId: 1, timestamp: -1 });

// Query logs for a specific instance within a time range
logEntrySchema.index({ workspaceId: 1, instanceId: 1, timestamp: -1 });

// Query logs for a specific log group
logEntrySchema.index({ workspaceId: 1, logGroup: 1, timestamp: -1 });

// Filter by log level across a workspace
logEntrySchema.index({ workspaceId: 1, level: 1, timestamp: -1 });

// TTL: Automatically delete logs older than 90 days (adjust as needed)
// Set expireAfterSeconds: 0 and use a Date field with the target expiry for custom TTL
logEntrySchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 90, // 90 days
    name: 'log_ttl_90d',
  },
);

// ── Static Methods ───────────────────────────────────────────────

/**
 * Get paginated logs for a workspace with optional filters.
 *
 * @param {object} filter
 * @param {string} filter.workspaceId
 * @param {string} [filter.instanceId]
 * @param {string} [filter.logGroup]
 * @param {string} [filter.level]
 * @param {Date} [filter.from]
 * @param {Date} [filter.to]
 * @param {object} [pagination]
 * @param {number} [pagination.page=1]
 * @param {number} [pagination.limit=50]
 * @returns {Promise<{ logs: ILogEntry[], total: number }>}
 */
logEntrySchema.statics.queryLogs = async function (filter, { page = 1, limit = 50 } = {}) {
  const query = { workspaceId: filter.workspaceId };

  if (filter.instanceId) query.instanceId = filter.instanceId;
  if (filter.logGroup) query.logGroup = filter.logGroup;
  if (filter.level) query.level = filter.level.toUpperCase();
  if (filter.from || filter.to) {
    query.timestamp = {};
    if (filter.from) query.timestamp.$gte = new Date(filter.from);
    if (filter.to) query.timestamp.$lte = new Date(filter.to);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    this.countDocuments(query),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Get log counts grouped by level for a workspace (for dashboard stats).
 * @param {string} workspaceId
 * @param {Date} [from] - Start of time range
 * @returns {Promise<Array<{ _id: string, count: number }>>}
 */
logEntrySchema.statics.levelStats = function (workspaceId, from) {
  const match = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };
  if (from) match.timestamp = { $gte: from };

  return this.aggregate([
    { $match: match },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

const LogEntry = mongoose.model('LogEntry', logEntrySchema);

module.exports = LogEntry;
