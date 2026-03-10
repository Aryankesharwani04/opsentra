'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./env');

/** @type {mongoose.Connection | null} */
let connection = null;

/**
 * Connect to MongoDB with retry logic.
 * @param {number} [retries=5] - Number of retry attempts.
 * @param {number} [delay=5000] - Delay between retries in ms.
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async (retries = 5, delay = 5000) => {
  const mongooseOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`[Database] Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      const conn = await mongoose.connect(config.db.uri, mongooseOptions);
      connection = conn.connection;

      logger.info(`[Database] ✅ MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
      return connection;
    } catch (err) {
      logger.error(`[Database] ❌ Connection failed (attempt ${attempt}/${retries}): ${err.message}`);

      if (attempt === retries) {
        logger.error('[Database] Max retries reached. Exiting process.');
        process.exit(1);
      }

      logger.info(`[Database] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Gracefully disconnect from MongoDB.
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('[Database] MongoDB disconnected.');
  }
};

/**
 * Check if the DB connection is alive.
 * @returns {boolean}
 */
const isConnected = () => mongoose.connection.readyState === 1;

// Connection event listeners
mongoose.connection.on('connected', () => logger.info('[Database] Mongoose connection established.'));
mongoose.connection.on('error', (err) => logger.error(`[Database] Mongoose error: ${err.message}`));
mongoose.connection.on('disconnected', () => logger.warn('[Database] Mongoose connection lost.'));

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = { connectDB, disconnectDB, isConnected };
