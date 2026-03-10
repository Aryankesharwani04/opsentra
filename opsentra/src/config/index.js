'use strict';

/**
 * Barrel export for all config modules.
 * Usage: const { config, connectDB, connectRedis } = require('./config');
 */
const config = require('./env');
const { connectDB, disconnectDB, isConnected: isDBConnected } = require('./database');
const { connectRedis, getRedisClient, disconnectRedis, isConnected: isRedisConnected } = require('./redis');
const aws = require('./aws');

module.exports = {
  config,
  connectDB,
  disconnectDB,
  isDBConnected,
  connectRedis,
  getRedisClient,
  disconnectRedis,
  isRedisConnected,
  aws,
};
