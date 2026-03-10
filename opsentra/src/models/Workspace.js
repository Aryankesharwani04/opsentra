'use strict';

const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Workspace — A logical grouping owned by a User.
 * Contains AWS integrations and server instances.
 *
 * @typedef {Object} IWorkspace
 * @property {mongoose.Types.ObjectId} userId       - Owner reference
 * @property {string} workspaceName                 - Display name
 * @property {string} apiKey                        - Auto-generated secret key for API access
 * @property {string} [description]                 - Optional description
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const workspaceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace must belong to a user'],
      index: true,
    },
    workspaceName: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      minlength: [2, 'Workspace name must be at least 2 characters'],
      maxlength: [100, 'Workspace name must not exceed 100 characters'],
    },
    apiKey: {
      type: String,
      unique: true,
      select: false, // Never returned in queries by default — must be explicitly requested
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────
workspaceSchema.index({ userId: 1, workspaceName: 1 }, { unique: true }); // No duplicate names per user
workspaceSchema.index({ userId: 1, isActive: 1 });
workspaceSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────

/** Count of AWS integrations (populated via populate or aggregation) */
workspaceSchema.virtual('awsIntegrations', {
  ref: 'AwsIntegration',
  localField: '_id',
  foreignField: 'workspaceId',
  count: false, // Set to true to get only count
});

workspaceSchema.virtual('serverInstances', {
  ref: 'ServerInstance',
  localField: '_id',
  foreignField: 'workspaceId',
  count: false,
});

// ── Pre-save Hook: Generate API key on first save ─────────────────
workspaceSchema.pre('save', function (next) {
  if (this.isNew && !this.apiKey) {
    // Generate a cryptographically secure 32-byte hex key prefixed with 'ops_'
    this.apiKey = `ops_${crypto.randomBytes(32).toString('hex')}`;
  }
  next();
});

// ── Instance Methods ──────────────────────────────────────────────

/**
 * Rotate the API key (invalidates the old one immediately).
 * @returns {Promise<string>} New API key
 */
workspaceSchema.methods.rotateApiKey = async function () {
  this.apiKey = `ops_${crypto.randomBytes(32).toString('hex')}`;
  await this.save();
  return this.apiKey;
};

/**
 * Sanitize workspace for API response (excludes apiKey).
 * @returns {object}
 */
workspaceSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.apiKey;
  delete obj.__v;
  return obj;
};

// ── Static Methods ────────────────────────────────────────────────

/**
 * Find a workspace by its API key (for API-key authentication).
 * Must use .select('+apiKey') since apiKey is excluded by default.
 * @param {string} apiKey
 * @returns {Promise<IWorkspace | null>}
 */
workspaceSchema.statics.findByApiKey = function (apiKey) {
  return this.findOne({ apiKey, isActive: true }).select('+apiKey');
};

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
