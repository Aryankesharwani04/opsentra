'use strict';

const morgan = require('morgan');
const logger = require('../utils/logger');

/**
 * HTTP request logger using Morgan piped through Winston.
 *
 * Format used depends on environment:
 * - development: 'dev' (colourized, concise)
 * - production: 'combined' (Apache-style, for log aggregators)
 */
const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  {
    stream: logger.stream,
    skip: (req) => {
      // Skip health check logging to reduce noise
      return req.url === '/api/v1/health';
    },
  },
);

module.exports = requestLogger;
