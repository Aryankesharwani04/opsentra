'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ------------------------------------------------------------------
// Custom log format for console output (human-readable)
// ------------------------------------------------------------------
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stackStr = stack ? `\n${stack}` : '';
  return `${ts} [${level}]: ${message}${metaStr}${stackStr}`;
});

// ------------------------------------------------------------------
// Log directory
// ------------------------------------------------------------------
const logDir = path.resolve(process.cwd(), config.logging.dir || 'logs');

// ------------------------------------------------------------------
// Transports
// ------------------------------------------------------------------
const transports = [];

// Console transport (always on)
transports.push(
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      consoleFormat,
    ),
  }),
);

// File transports (skip in test env to keep test output clean)
if (config.env !== 'test') {
  // Combined log
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  );

  // Error-only log
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
  );
}

// ------------------------------------------------------------------
// Logger instance
// ------------------------------------------------------------------
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: combine(timestamp(), errors({ stack: true })),
  transports,
  exitOnError: false,
  silent: false,
});

// Stream interface for Morgan middleware
logger.stream = {
  write: (message) => logger.http(message.trimEnd()),
};

module.exports = logger;
