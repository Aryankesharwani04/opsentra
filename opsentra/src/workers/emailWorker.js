'use strict';

const Bull = require('bull');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const config = require('../config/env');

// Create the email queue backed by Redis
const emailQueue = new Bull('email', {
  redis: {
    host: config.bull.redis.host,
    port: config.bull.redis.port,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,
  },
});

// ── Process jobs ──────────────────────────────────────────────────

/**
 * Job types:
 *  - 'welcome'        : { user: { firstName, email } }
 *  - 'password-reset' : { user: { firstName, email }, resetUrl }
 *  - 'raw'            : { to, subject, htmlBody, textBody }
 */
emailQueue.process('welcome', async (job) => {
  const { user } = job.data;
  logger.info(`[EmailWorker] Processing welcome email for: ${user.email}`);
  await emailService.sendWelcomeEmail(user);
});

emailQueue.process('password-reset', async (job) => {
  const { user, resetUrl } = job.data;
  logger.info(`[EmailWorker] Processing password-reset email for: ${user.email}`);
  await emailService.sendPasswordResetEmail(user, resetUrl);
});

emailQueue.process('raw', async (job) => {
  const { to, subject, htmlBody, textBody } = job.data;
  logger.info(`[EmailWorker] Processing raw email to: ${to}`);
  await emailService.sendEmail({ to, subject, htmlBody, textBody });
});

// ── Queue event listeners ─────────────────────────────────────────

emailQueue.on('completed', (job) => {
  logger.info(`[EmailWorker] Job ${job.id} (${job.name}) completed.`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`[EmailWorker] Job ${job.id} (${job.name}) failed: ${err.message}`);
});

emailQueue.on('stalled', (job) => {
  logger.warn(`[EmailWorker] Job ${job.id} stalled.`);
});

// ── Helper to add jobs ────────────────────────────────────────────

/**
 * Queue a welcome email.
 * @param {object} user - { firstName, email }
 */
const queueWelcomeEmail = (user) => emailQueue.add('welcome', { user });

/**
 * Queue a password reset email.
 * @param {object} user
 * @param {string} resetUrl
 */
const queuePasswordResetEmail = (user, resetUrl) =>
  emailQueue.add('password-reset', { user, resetUrl });

/**
 * Queue a raw email.
 * @param {object} emailData
 */
const queueRawEmail = (emailData) => emailQueue.add('raw', emailData);

module.exports = { emailQueue, queueWelcomeEmail, queuePasswordResetEmail, queueRawEmail };
