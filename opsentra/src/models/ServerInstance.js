'use strict';

const mongoose = require('mongoose');

/**
 * ServerInstance — An EC2 (or ECS/EKS) instance monitored within a Workspace.
 * Connected to a CloudWatch log group for log ingestion.
 *
 * @typedef {Object} IServerInstance
 * @property {mongoose.Types.ObjectId} workspaceId
 * @property {mongoose.Types.ObjectId} [awsIntegrationId] - Which AWS account this instance belongs to
 * @property {string} instanceId        - EC2 instance ID (e.g. i-0abc1234def56789)
 * @property {string} instanceName      - Human-readable name or tag:Name value
 * @property {string} logGroup          - CloudWatch Log Group name
 * @property {string} [logStream]       - Optional specific log stream within the group
 * @property {string} region            - AWS region where instance is running
 * @property {'running' | 'stopped' | 'terminated' | 'unknown'} status
 * @property {string} [instanceType]    - e.g. t3.medium
 * @property {string} [publicIp]        - Public IPv4 address (if any)
 * @property {string} [privateIp]       - Private IPv4 address
 * @property {object} [tags]            - AWS tags as key-value pairs
 * @property {Date} [lastSeenAt]        - Last heartbeat / log activity
 * @property {Date} createdAt
 */
const serverInstanceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Server instance must belong to a workspace'],
      index: true,
    },
    awsIntegrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AwsIntegration',
      default: null,
      index: true,
    },
    instanceId: {
      type: String,
      required: [true, 'EC2 instance ID is required'],
      trim: true,
      match: [/^i-[0-9a-f]{8,17}$/, 'Invalid EC2 instance ID format (expected i-xxxxxxxxxx)'],
    },
    instanceName: {
      type: String,
      required: [true, 'Instance name is required'],
      trim: true,
      maxlength: [255, 'Instance name must not exceed 255 characters'],
    },
    logGroup: {
      type: String,
      required: [true, 'CloudWatch log group is required'],
      trim: true,
    },
    logStream: {
      type: String,
      trim: true,
      default: null,
    },
    region: {
      type: String,
      required: [true, 'AWS region is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'terminated', 'unknown'],
      default: 'unknown',
      index: true,
    },
    instanceType: {
      type: String,
      default: null, // e.g. t3.medium, m5.large
    },
    publicIp: {
      type: String,
      default: null,
    },
    privateIp: {
      type: String,
      default: null,
    },
    tags: {
      type: mongoose.Schema.Types.Mixed, // Flexible key-value map from AWS tags
      default: {},
    },
    lastSeenAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────
serverInstanceSchema.index({ workspaceId: 1, instanceId: 1 }, { unique: true }); // No duplicate instances per workspace
serverInstanceSchema.index({ workspaceId: 1, status: 1 });
serverInstanceSchema.index({ instanceId: 1 });
serverInstanceSchema.index({ logGroup: 1 });
serverInstanceSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────
serverInstanceSchema.virtual('logs', {
  ref: 'LogEntry',
  localField: '_id',
  foreignField: 'instanceId', // Note: matched on the string instanceId in LogEntry
  justOne: false,
});

// ── Instance Methods ──────────────────────────────────────────────

/**
 * Update instance status and last-seen timestamp.
 * @param {'running' | 'stopped' | 'terminated' | 'unknown'} status
 * @returns {Promise<void>}
 */
serverInstanceSchema.methods.updateStatus = async function (status) {
  this.status = status;
  if (status === 'running') this.lastSeenAt = new Date();
  await this.save();
};

const ServerInstance = mongoose.model('ServerInstance', serverInstanceSchema);

module.exports = ServerInstance;
