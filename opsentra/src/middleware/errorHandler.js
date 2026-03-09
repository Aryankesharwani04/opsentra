'use strict';

const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Convert Mongoose-specific errors to AppErrors for uniform handling.
 * @param {Error} err
 * @returns {AppError}
 */
const handleMongooseErrors = (err) => {
  // Duplicate key (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return AppError.conflict(`${field} already exists`);
  }

  // Validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return AppError.validationError('Validation failed', details);
  }

  // Cast error (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`Invalid value for field '${err.path}'`);
  }

  return null;
};

/**
 * Convert JWT errors to AppErrors.
 * @param {Error} err
 * @returns {AppError | null}
 */
const handleJWTErrors = (err) => {
  if (err.name === 'JsonWebTokenError') return AppError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') return AppError.unauthorized('Token has expired');
  return null;
};

/**
 * Send error response in DEVELOPMENT (full stack trace).
 */
const sendDevError = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    code: err.code || 'UNKNOWN',
    message: err.message,
    stack: err.stack,
    ...(err.details && { details: err.details }),
  });
};

/**
 * Send error response in PRODUCTION (only operational errors expose details).
 */
const sendProdError = (err, res) => {
  if (err.isOperational) {
    // Trusted error: safe to send to client
    res.status(err.statusCode).json(err.toJSON());
  } else {
    // Programming or unknown error: do NOT leak details
    logger.error('UNHANDLED ERROR 💥', { message: err.message, stack: err.stack });
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * Global Express error handling middleware.
 * Must have 4 arguments for Express to recognize it as an error handler.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`[${req.method}] ${req.originalUrl} — ${err.statusCode}: ${err.message}`, {
    stack: config.isProduction ? undefined : err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.user?.id,
  });

  if (config.env === 'development') {
    return sendDevError(err, res);
  }

  // Production: transform known error types
  let error = err;

  const mongooseError = handleMongooseErrors(err);
  if (mongooseError) error = mongooseError;

  const jwtError = handleJWTErrors(err);
  if (jwtError) error = jwtError;

  sendProdError(error, res);
};

/**
 * 404 Not Found handler — Mount AFTER all routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'fail',
    code: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
