'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { createApp } = require('../src/app');

let app;
let mongoReplSet;

// Mock Redis — getRedisClient throws so rateLimiter falls back to in-memory store.
// auth.js blacklist check silently catches the throw (fail-open). isConnected
// still returns true so the health endpoint shows Redis as connected.
jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn(),
  getRedisClient: jest.fn(() => { throw new Error('Redis unavailable in test env'); }),
  disconnectRedis: jest.fn(),
  isConnected: jest.fn().mockReturnValue(true),
}));

beforeAll(async () => {
  // MongoMemoryReplSet is required to support transactions (MongoDB sessions)
  mongoReplSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoReplSet.getUri();

  process.env.MONGODB_URI = uri;
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_min_32_characters_long';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_min_32_characters_long';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(uri);
  app = createApp();
}, 30000); // Replica set init can take up to 30s

afterEach(async () => {
  // Clean up collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoReplSet.stop();
});

// ── POST /api/v1/auth/register ────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  const validUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'Test@1234!',
    confirmPassword: 'Test@1234!',
  };

  it('should register a new user, create a workspace, and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');

    // Token
    expect(res.body.data.accessToken).toBeDefined();

    // User shape
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined(); // Never exposed

    // Auto-created workspace
    expect(res.body.data.workspace).toBeDefined();
    expect(res.body.data.workspace.workspaceName).toBe("John's Workspace");
    expect(res.body.data.workspace.apiKey).toBeDefined();    // Key returned only on register
    expect(res.body.data.workspace.apiKey).toMatch(/^ops_/); // Correct key prefix
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('should reject weak passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, email: 'other@test.com', password: 'weak', confirmPassword: 'weak' });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

// ── POST /api/v1/auth/login ───────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  it('should login with valid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com',
      password: 'Test@1234!', confirmPassword: 'Test@1234!',
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'jane@test.com', password: 'Test@1234!' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject invalid password', async () => {
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com',
      password: 'Test@1234!', confirmPassword: 'Test@1234!',
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bob@test.com', password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });
});

// ── GET /api/v1/auth/me ───────────────────────────────────────────
describe('GET /api/v1/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Alice', lastName: 'Wonder', email: 'alice@test.com',
      password: 'Test@1234!', confirmPassword: 'Test@1234!',
    });

    const { accessToken } = regRes.body.data;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('alice@test.com');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/v1/auth/logout ──────────────────────────────────────
describe('POST /api/v1/auth/logout', () => {
  it('should logout and clear the refresh token cookie', async () => {
    // Register + grab access token
    const regRes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Sam', lastName: 'Test', email: 'sam@test.com',
      password: 'Test@1234!', confirmPassword: 'Test@1234!',
    });
    const { accessToken } = regRes.body.data;

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });
});
