'use strict';

/**
 * jest.setup.js — Global Jest setup file.
 *
 * Mocks all AWS SDK clients so no real network connections are established
 * during tests. This prevents the Jest "Force exiting" warning caused by
 * SDK HTTP agents keeping the event loop alive.
 */

jest.mock('@aws-sdk/client-sts', () => ({
  STSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    destroy: jest.fn(),
  })),
  AssumeRoleCommand: jest.fn(),
  GetCallerIdentityCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    destroy: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    destroy: jest.fn(),
  })),
  SendEmailCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mocked-presigned-url.s3.amazonaws.com/test'),
}));

jest.mock('@aws-sdk/client-cloudwatch-logs', () => ({
  CloudWatchLogsClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ logGroups: [], events: [], nextToken: undefined }),
    destroy: jest.fn(),
  })),
  DescribeLogGroupsCommand: jest.fn(),
  FilterLogEventsCommand: jest.fn(),
}));

jest.mock('ws', () => ({
  WebSocketServer: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
    clients: new Set(),
  })),
  OPEN: 1,
}));
