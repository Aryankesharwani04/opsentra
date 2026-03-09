'use strict';

const mongoose = require('mongoose');

/**
 * LogGroupCursor — tracks the last successfully fetched timestamp
 * for each (workspace, log group) pair to avoid re-ingesting events.
 *
 * lastTimestamp is stored as Unix epoch milliseconds (same unit as CloudWatch).
 */
const logGroupCursorSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    awsIntegrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AwsIntegration',
      required: true,
    },
    logGroup: {
      type: String,
      required: true,
      trim: true,
    },
    // Unix epoch ms — CloudWatch timestamps are in ms
    lastTimestamp: {
      type: Number,
      default: 0,
    },
    // Total events ingested for this log group
    totalIngested: {
      type: Number,
      default: 0,
    },
    lastFetchedAt: {
      type: Date,
      default: null,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index — one cursor per workspace + log group
logGroupCursorSchema.index({ workspaceId: 1, logGroup: 1 }, { unique: true });

/**
 * Upsert the cursor for a log group after a successful fetch.
 *
 * @param {string} workspaceId
 * @param {string} awsIntegrationId
 * @param {string} logGroup
 * @param {number} newTimestamp - Latest event timestamp in ms
 * @param {number} eventsCount  - Number of events ingested this batch
 */
logGroupCursorSchema.statics.advance = async function (
  workspaceId,
  awsIntegrationId,
  logGroup,
  newTimestamp,
  eventsCount,
) {
  return this.findOneAndUpdate(
    { workspaceId, logGroup },
    {
      $set: {
        awsIntegrationId,
        lastTimestamp: newTimestamp,
        lastFetchedAt: new Date(),
        lastError: null,
      },
      $inc: { totalIngested: eventsCount },
    },
    { upsert: true, new: true },
  );
};

/**
 * Record an error for this log group cursor (for observability).
 */
logGroupCursorSchema.statics.recordError = async function (workspaceId, logGroup, errorMessage) {
  return this.findOneAndUpdate(
    { workspaceId, logGroup },
    {
      $inc: { errorCount: 1 },
      $set: { lastError: errorMessage, lastFetchedAt: new Date() },
    },
    { upsert: true, new: true },
  );
};

const LogGroupCursor = mongoose.model('LogGroupCursor', logGroupCursorSchema);

module.exports = LogGroupCursor;
