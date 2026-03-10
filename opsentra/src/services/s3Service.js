'use strict';

const { s3Client, S3Commands, getSignedUrl, config: awsConfig } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Upload a file to S3.
 * @param {object} options
 * @param {Buffer | ReadableStream} options.fileBuffer - File content
 * @param {string} options.originalName - Original file name
 * @param {string} options.mimeType - MIME type (e.g. 'image/png')
 * @param {string} [options.folder='uploads'] - S3 key prefix / folder
 * @returns {Promise<{ key: string, url: string }>}
 */
const uploadFile = async ({ fileBuffer, originalName, mimeType, folder = 'uploads' }) => {
  const ext = path.extname(originalName);
  const key = `${folder}/${uuidv4()}${ext}`;

  const command = new S3Commands.PutObjectCommand({
    Bucket: awsConfig.s3.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL removed — use bucket policies for access control (recommended for newer buckets)
  });

  try {
    await s3Client.send(command);
    const url = `https://${awsConfig.s3.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    logger.info(`[S3Service] File uploaded: ${key}`);
    return { key, url };
  } catch (err) {
    logger.error(`[S3Service] Upload failed: ${err.message}`);
    throw AppError.internal('File upload failed');
  }
};

/**
 * Delete a file from S3.
 * @param {string} key - S3 object key
 * @returns {Promise<void>}
 */
const deleteFile = async (key) => {
  const command = new S3Commands.DeleteObjectCommand({
    Bucket: awsConfig.s3.bucketName,
    Key: key,
  });

  try {
    await s3Client.send(command);
    logger.info(`[S3Service] File deleted: ${key}`);
  } catch (err) {
    logger.error(`[S3Service] Delete failed: ${err.message}`);
    throw AppError.internal('File deletion failed');
  }
};

/**
 * Generate a pre-signed URL for temporary S3 access.
 * @param {string} key - S3 object key
 * @param {number} [expiresIn] - Expiry in seconds
 * @returns {Promise<string>} Pre-signed URL
 */
const getPresignedUrl = async (key, expiresIn = awsConfig.s3.signedUrlExpires) => {
  const command = new S3Commands.GetObjectCommand({
    Bucket: awsConfig.s3.bucketName,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (err) {
    logger.error(`[S3Service] Presign failed: ${err.message}`);
    throw AppError.internal('Failed to generate file access URL');
  }
};

module.exports = { uploadFile, deleteFile, getPresignedUrl };
