'use strict';

const mongoose = require('mongoose');

/**
 * AuditLog — Immutable audit trail for security-sensitive actions.
 * Documents are never updated; only inserted.
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null, // Null for unauthenticated actions (e.g. failed login)
    },
    tenantId: {
      type: String,
      index: true,
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      // e.g. 'AUTH_LOGIN', 'AUTH_LOGOUT', 'USER_UPDATE', 'USER_DELETE'
    },
    resource: {
      type: String,
      default: null,
      // e.g. 'User', 'Project', 'Invoice'
    },
    resourceId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable — no updatedAt
    collection: 'audit_logs',
  },
);

// ── Indexes for efficient querying ────────────────────────────────
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
