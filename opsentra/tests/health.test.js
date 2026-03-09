'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../src/app');

let app;
let mongoServer;

jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn(),
  getRedisClient: jest.fn(() => { throw new Error('Redis unavailable in test env'); }),
  disconnectRedis: jest.fn(),
  isConnected: jest.fn().mockReturnValue(true),
}));

// Mock AWS config — prevents real SDK HTTP connections keeping Jest alive.
jest.mock('../src/config/aws', () => ({
  s3Client:  { send: jest.fn(), destroy: jest.fn() },
  sesClient: { send: jest.fn(), destroy: jest.fn() },
  stsClient: { send: jest.fn(), destroy: jest.fn() },
  createStsClient: jest.fn(() => ({ send: jest.fn(), destroy: jest.fn() })),
  S3Commands:  { PutObjectCommand: jest.fn(), DeleteObjectCommand: jest.fn(), GetObjectCommand: jest.fn() },
  SESCommands: { SendEmailCommand: jest.fn() },
  STSCommands: { AssumeRoleCommand: jest.fn(), GetCallerIdentityCommand: jest.fn() },
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-s3.example.com/file'),
  config: { region: 'us-east-1', bucketName: 'test-bucket' },
}));

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_min_32_characters_long';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_min_32_characters_long';
  process.env.NODE_ENV = 'test';
  await mongoose.connect(uri);
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/v1/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.services.database.status).toBe('connected');
  });
});

describe('GET /api/v1 (root)', () => {
  it('should return API info', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Opsentra API');
  });
});

describe('GET /nonexistent', () => {
  it('should return 404', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
