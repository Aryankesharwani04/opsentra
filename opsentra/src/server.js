'use strict';

/**
 * server.js — Application entry point.
 *
 * Boot order:
 *  1. Load environment variables
 *  2. Connect to MongoDB
 *  3. Connect to Redis
 *  4. Start Bull workers
 *  5. Create Express app
 *  6. Start HTTP server
 *  7. Register graceful shutdown handlers
 */

require('dotenv').config();

const { createApp } = require('./app');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const config = require('./config/env');
const logger = require('./utils/logger');

// Workers (initialized on import — starts processing queues)
require('./workers/emailWorker');
require('./workers/auditWorker');

// Background workers started after DB is ready
const logCollectorWorker = require('./workers/logCollectorWorker');
const dbInsertWorker = require('./workers/dbInsertWorker');

// Real-time WebSocket streaming service
const websocketService = require('./services/websocketService');

let server;

/**
 * Gracefully shut down the HTTP server and all connections.
 * @param {string} signal - Signal name (e.g. 'SIGTERM')
 */
const gracefulShutdown = (signal) => {
  logger.info(`\n[Server] ${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('[Server] HTTP server closed. Cleaning up connections...');

      try {
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        logger.info('[Server] MongoDB disconnected.');

        const { disconnectRedis } = require('./config/redis');
        await disconnectRedis();
        logger.info('[Server] Redis disconnected.');

        // Stop background workers
        logCollectorWorker.stop();
        dbInsertWorker.stop();
        websocketService.detach();
        logger.info('[Server] Background workers stopped.');

        logger.info('[Server] ✅ Graceful shutdown complete.');
        process.exit(0);
      } catch (err) {
        logger.error(`[Server] Error during shutdown: ${err.message}`);
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('[Server] Could not close connections in time. Forcing exit.');
      process.exit(1);
    }, 10_000);
  } else {
    process.exit(0);
  }
};

/**
 * Bootstrap and start the application.
 */
const start = async () => {
  try {
    logger.info('╔══════════════════════════════════════════╗');
    logger.info('║        Opsentra Backend Starting...       ║');
    logger.info('╚══════════════════════════════════════════╝');
    logger.info(`[Server] Environment: ${config.env}`);
    logger.info(`[Server] Node.js: ${process.version}`);

    // 1. Connect to MongoDB
    await connectDB();

    // 2. Connect to Redis
    connectRedis();

    // 3. Create Express app
    const app = createApp();

    // 4. Start HTTP server
    const PORT = config.server.port;
    server = app.listen(PORT, () => {
      logger.info(`[Server] ✅ HTTP server running on port ${PORT}`);
      logger.info(`[Server] 📡 API: http://localhost:${PORT}/api/${config.server.apiVersion}`);
      logger.info(`[Server] 🏥 Health: http://localhost:${PORT}/api/${config.server.apiVersion}/health`);

      // 5. Start background workers (after DB+server are ready)
      if (config.env !== 'test') {
        logCollectorWorker.start();
        dbInsertWorker.start();
        websocketService.attach(server);
        logger.info(`[Server] 📡 WebSocket live at ws://localhost:${PORT}/ws`);
      }
    });

    // Handle server errors (e.g. port already in use)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`[Server] ❌ Port ${PORT} is already in use.`);
      } else {
        logger.error(`[Server] ❌ Server error: ${err.message}`);
      }
      process.exit(1);
    });

    // 5. Graceful shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 6. Catch unhandled rejections and exceptions
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('[Process] Unhandled Promise Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (err) => {
      logger.error('[Process] Uncaught Exception:', err.message, err.stack);
      gracefulShutdown('uncaughtException');
    });
  } catch (err) {
    logger.error(`[Server] ❌ Failed to start: ${err.message}`);
    process.exit(1);
  }
};

start();
