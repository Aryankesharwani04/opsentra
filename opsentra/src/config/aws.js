'use strict';

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('./env');
const logger = require('../utils/logger');

/**
 * AWS credential configuration object.
 * Credentials are optional — if running on AWS (EC2/Lambda/ECS),
 * the SDK will automatically pick up IAM role credentials.
 */
const awsCredentials = config.aws.accessKeyId && config.aws.secretAccessKey
  ? {
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  }
  : {};

/**
 * AWS S3 Client (SDK v3)
 * @type {S3Client}
 */
const s3Client = new S3Client({
  region: config.aws.region,
  ...awsCredentials,
});

/**
 * AWS SES Client (SDK v3)
 * @type {SESClient}
 */
const sesClient = new SESClient({
  region: config.aws.region,
  ...awsCredentials,
});

logger.info(`[AWS] SDK initialized — Region: ${config.aws.region}`);

module.exports = {
  s3Client,
  sesClient,
  S3Commands: { PutObjectCommand, DeleteObjectCommand, GetObjectCommand },
  SESCommands: { SendEmailCommand },
  getSignedUrl,
  config: config.aws,
};
