'use strict';

/**
 * Models barrel export.
 * Import all Mongoose models from a single entry point.
 *
 * @example
 * const { User, Workspace, LogEntry } = require('../models');
 */
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const AuditLog = require('./AuditLog');
const Workspace = require('./Workspace');
const AwsIntegration = require('./AwsIntegration');
const ServerInstance = require('./ServerInstance');
const LogEntry = require('./LogEntry');
const AlertLog = require('./AlertLog');

module.exports = {
  User,
  RefreshToken,
  AuditLog,
  Workspace,
  AwsIntegration,
  ServerInstance,
  LogEntry,
  AlertLog,
};
