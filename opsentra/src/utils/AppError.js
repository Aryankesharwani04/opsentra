'use strict';

/**
 * AppError — Operational error class for Express error handling.
 *
 * Distinguish between "operational" errors (expected, user-facing)
 * and programmer errors (bugs). The global error handler only
 * sends full details for operational errors.
 *
 * @extends {Error}
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code.
   * @param {string} [code] - Machine-readable error code (e.g. 'VALIDATION_ERROR').
   * @param {object} [details] - Additional error context / field errors.
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.code = code;
    this.details = details;

    /**
     * Flag to distinguish operational errors (safe to expose)
     * from programming errors (should not be exposed to client).
     */
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call itself.
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * @returns {object} Serialized form for API responses.
   */
  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }

  // ── Convenience static factories ────────────────────────────────

  /** 400 Bad Request */
  static badRequest(message, details = null) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  /** 403 Forbidden */
  static forbidden(message = 'Access denied') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  /** 404 Not Found */
  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
  }

  /** 409 Conflict */
  static conflict(message) {
    return new AppError(message, 409, 'CONFLICT');
  }

  /** 422 Unprocessable Entity */
  static validationError(message, details = null) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  /** 500 Internal Server Error */
  static internal(message = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}

module.exports = AppError;
