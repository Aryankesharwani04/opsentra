'use strict';

const mongoose = require('mongoose');

/**
 * AlertLog — a record of every alert email that was attempted.
 * Saved by alertService after each fireAlerts() call regardless of
 * whether the email was queued or suppressed by cooldown.
 */
const alertLogSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    errorCount: {
      type: Number,
      required: true,
    },
    emailSentTo: {
      type: String,
      default: null,
    },
    emailQueued: {
      type: Boolean,
      default: false,
    },
    // First 3 raw log messages — for the history timeline
    sampleMessages: {
      type: [String],
      default: [],
    },
    // Populated when Gemini analysis succeeded
    aiCause: { type: String, default: null },
    aiFix: { type: String, default: null },
    aiSeverity: {
      type: String,
      enum: ['critical', 'high', 'medium', null],
      default: null,
    },
    aiSummary: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'firedAt', updatedAt: false },
    collection: 'alert_logs',
  },
);

alertLogSchema.index({ workspaceId: 1, firedAt: -1 });

const AlertLog = mongoose.model('AlertLog', alertLogSchema);

module.exports = AlertLog;
