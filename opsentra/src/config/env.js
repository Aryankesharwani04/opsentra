'use strict';

const Joi = require('joi');

/**
 * Environment variable schema validation using Joi.
 * Throws on startup if any required variables are missing or malformed.
 */
const envSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),

  // MongoDB
  MONGODB_URI: Joi.string().required(),
  MONGODB_TEST_URI: Joi.string().optional(),

  // Redis
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_URL: Joi.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // CORS
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // AWS
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_S3_BUCKET_NAME: Joi.string().optional(),
  AWS_S3_SIGNED_URL_EXPIRES: Joi.number().default(3600),
  AWS_SES_FROM_EMAIL: Joi.string().email().optional(),
  AWS_SES_FROM_NAME: Joi.string().default('Opsentra'),
  // Opsentra's own AWS account ID — embedded in CloudFormation trust policies
  OPSENTRA_AWS_ACCOUNT_ID: Joi.string().pattern(/^\d{12}$/).optional().default('123456789012'),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('debug'),
  LOG_DIR: Joi.string().default('logs'),

  // Bull
  BULL_REDIS_HOST: Joi.string().default('127.0.0.1'),
  BULL_REDIS_PORT: Joi.number().default(6379),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),

  // Frontend
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),

  // AI — Gemini 2.0 Flash (optional: alerts work without it, just no AI analysis)
  GEMINI_API_KEY: Joi.string().optional(),
  ALERT_COOLDOWN_SECONDS: Joi.number().default(300),
})
  .unknown(true) // allow extra env vars (e.g. PATH, HOME)
  .options({ abortEarly: false });

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  const missing = error.details.map((d) => `  • ${d.message}`).join('\n');
  throw new Error(`\n[Config] Environment validation failed:\n${missing}\n`);
}

const config = {
  env: envVars.NODE_ENV,
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',

  server: {
    port: envVars.PORT,
    apiVersion: envVars.API_VERSION,
  },

  db: {
    uri: envVars.NODE_ENV === 'test' ? envVars.MONGODB_TEST_URI || envVars.MONGODB_URI : envVars.MONGODB_URI,
  },

  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD || undefined,
    db: envVars.REDIS_DB,
    url: envVars.REDIS_URL || undefined,
  },

  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpiresIn: envVars.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    allowedOrigins: envVars.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },

  aws: {
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    opsentraAccountId: envVars.OPSENTRA_AWS_ACCOUNT_ID,
    s3: {
      bucketName: envVars.AWS_S3_BUCKET_NAME,
      signedUrlExpires: envVars.AWS_S3_SIGNED_URL_EXPIRES,
    },
    ses: {
      fromEmail: envVars.AWS_SES_FROM_EMAIL,
      fromName: envVars.AWS_SES_FROM_NAME,
    },
  },

  logging: {
    level: envVars.LOG_LEVEL,
    dir: envVars.LOG_DIR,
  },

  bull: {
    redis: {
      host: envVars.BULL_REDIS_HOST,
      port: envVars.BULL_REDIS_PORT,
    },
  },

  bcrypt: {
    saltRounds: envVars.BCRYPT_SALT_ROUNDS,
  },

  frontend: {
    url: envVars.FRONTEND_URL,
  },
};

module.exports = config;
