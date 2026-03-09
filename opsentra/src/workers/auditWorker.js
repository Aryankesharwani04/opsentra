'use strict';

const Bull = require('bull');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Audit worker — writes audit log entries asynchronously to MongoDB.
 * Keeps the request/response cycle fast by deferring DB inserts.
 */
const auditQueue = new Bull('audit', {
  redis: {
    host: config.bull.redis.host,
    port: config.bull.redis.port,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
});

auditQueue.process(async (job) => {
  const { userId, tenantId, action, resource, resourceId, status, ipAddress, userAgent, metadata } = job.data;

  await AuditLog.create({
    userId: userId || null,
    tenantId: tenantId || null,
    action,
    resource,
    resourceId,
    status,
    ipAddress,
    userAgent,
    metadata: metadata || {},
  });

  logger.debug(`[AuditWorker] Audit log written: ${action} by ${userId}`);
});

auditQueue.on('failed', (job, err) => {
  logger.error(`[AuditWorker] Job ${job.id} failed: ${err.message}`, { jobData: job.data });
});

/**
 * Add an audit entry to the queue.
 * @param {object} auditData
 */
const queueAuditLog = (auditData) => auditQueue.add(auditData);

module.exports = { auditQueue, queueAuditLog };
