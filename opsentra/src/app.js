'use strict';

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const requestLogger = require('./middleware/requestLogger');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes/index');
const logger = require('./utils/logger');

/**
 * Create and configure the Express application.
 * Separated from server.js so this can be imported cleanly in tests.
 */
const createApp = () => {
  const app = express();

  // Disable ETag so polling endpoints never return stale 304 responses
  app.set('etag', false);

  // ── 1. Security Headers ───────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: config.isProduction,
    }),
  );

  // ── 2. CORS ───────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (config.cors.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        logger.warn(`[CORS] Blocked request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true, // Required for HttpOnly cookies
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // ── 3. Request Parsing ────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));        // Body too large = rejected
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ── 4. Security Middleware ────────────────────────────────────
  app.use(mongoSanitize());   // Prevent MongoDB operator injection ($, .)
  app.use(hpp());             // Prevent HTTP Parameter Pollution

  // ── 5. Request Logger ─────────────────────────────────────────
  app.use(requestLogger);

  // ── 6. Global Rate Limiter ────────────────────────────────────
  app.use(globalLimiter);

  // ── 7. Trust Proxy (for correct IP behind load balancers) ─────
  if (config.isProduction) {
    app.set('trust proxy', 1);
  }

  // ── 8. Mount API Routes ───────────────────────────────────────
  app.use(routes);

  // ── 9. 404 Handler (must be after all routes) ─────────────────
  app.use(notFoundHandler);

  // ── 10. Global Error Handler (must be last) ───────────────────
  app.use(errorHandler);

  // Attach logger to app.locals for use in middleware
  app.locals.logger = logger;

  return app;
};

module.exports = { createApp };
