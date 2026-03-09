'use strict';

const mongoose = require('mongoose');

/**
 * AwsIntegration — Links an AWS account to a Workspace.
 *
 * One Workspace can connect multiple AWS accounts.
 * Credentials (role_arn) are assumed role-based — no static keys stored.
 *
 * @typedef {Object} IAwsIntegration
 * @property {mongoose.Types.ObjectId} workspaceId
 * @property {string} awsAccountId   - 12-digit AWS account ID
 * @property {string} roleArn         - IAM Role ARN for cross-account assume-role
 * @property {string} region          - Primary AWS region
 * @property {string[]} [regions]     - Additional monitored regions
 * @property {string} [alias]         - Human-readable label for this account
 * @property {'active' | 'inactive' | 'error'} status
 * @property {string} [lastError]     - Last connection/sync error message
 * @property {Date} connectedAt
 * @property {Date} [lastSyncedAt]
 */
const awsIntegrationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'AWS integration must belong to a workspace'],
      index: true,
    },
    awsAccountId: {
      type: String,
      required: [true, 'AWS account ID is required'],
      trim: true,
      match: [/^\d{12}$/, 'AWS account ID must be exactly 12 digits'],
    },
    roleArn: {
      type: String,
      required: [true, 'IAM Role ARN is required'],
      trim: true,
      match: [
        /^arn:aws:iam::\d{12}:role\/.+$/,
        'Invalid IAM Role ARN format. Expected: arn:aws:iam::<account-id>:role/<role-name>',
      ],
      select: false, // Sensitive — exclude from query results by default
    },
    region: {
      type: String,
      required: [true, 'Primary AWS region is required'],
      trim: true,
      enum: {
        values: [
          'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
          'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
          'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
          'ap-south-1', 'ca-central-1', 'sa-east-1', 'me-south-1', 'af-south-1',
        ],
        message: 'Invalid AWS region: {VALUE}',
      },
    },
    regions: {
      type: [String],
      default: [],
    },
    alias: {
      type: String,
      trim: true,
      maxlength: [100, 'Alias must not exceed 100 characters'],
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'error'],
      default: 'active',
      index: true,
    },
    lastError: {
      type: String,
      default: null,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────
// One AWS account ID per workspace (prevents duplicate connections)
awsIntegrationSchema.index({ workspaceId: 1, awsAccountId: 1 }, { unique: true });
awsIntegrationSchema.index({ workspaceId: 1, status: 1 });
awsIntegrationSchema.index({ connectedAt: -1 });

// ── Instance Methods ──────────────────────────────────────────────

/**
 * Mark integration as errored with an error message.
 * @param {string} errorMessage
 * @returns {Promise<void>}
 */
awsIntegrationSchema.methods.markError = async function (errorMessage) {
  this.status = 'error';
  this.lastError = errorMessage;
  await this.save();
};

/**
 * Mark integration as active after a successful sync.
 * @returns {Promise<void>}
 */
awsIntegrationSchema.methods.markSynced = async function () {
  this.status = 'active';
  this.lastError = null;
  this.lastSyncedAt = new Date();
  await this.save();
};

const AwsIntegration = mongoose.model('AwsIntegration', awsIntegrationSchema);

module.exports = AwsIntegration;
