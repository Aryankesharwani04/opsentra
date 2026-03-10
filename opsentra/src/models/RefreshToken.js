'use strict';

const mongoose = require('mongoose');

/**
 * RefreshToken — Stores issued refresh tokens.
 * Expired tokens are automatically removed via MongoDB TTL index.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index: MongoDB automatically deletes documents when expiresAt passes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── Instance Methods ──────────────────────────────────────────────

/**
 * Revoke this refresh token.
 * @returns {Promise<void>}
 */
refreshTokenSchema.methods.revoke = async function () {
  this.isRevoked = true;
  await this.save();
};

/**
 * Check if token is valid (not revoked and not expired).
 * @returns {boolean}
 */
refreshTokenSchema.methods.isValid = function () {
  return !this.isRevoked && this.expiresAt > new Date();
};

// ── Static Methods ────────────────────────────────────────────────

/**
 * Revoke all tokens for a specific user (logout from all devices).
 * @param {string} userId
 * @returns {Promise<import('mongoose').UpdateWriteOpResult>}
 */
refreshTokenSchema.statics.revokeAllForUser = function (userId) {
  return this.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true } });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
