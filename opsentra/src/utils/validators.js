'use strict';

const Joi = require('joi');

/**
 * Centralized Joi validation schemas.
 * Import individual schemas in validators middleware or services.
 */

// ── Auth Schemas ─────────────────────────────────────────────────

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
  tenantId: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .min(8)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match.',
  }),
});

// ── User Schemas ─────────────────────────────────────────────────

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  avatar: Joi.string().uri().optional(),
}).min(1); // At least one field required

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(72)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match.',
  }),
});

// ── Pagination Schema ─────────────────────────────────────────────

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// ── AWS Schemas ───────────────────────────────────────────────────

const AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'ap-south-1', 'ca-central-1', 'sa-east-1', 'me-south-1', 'af-south-1',
];

const connectAwsSchema = Joi.object({
  role_arn: Joi.string()
    .pattern(/^arn:aws:iam::\d{12}:role\/.+$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid IAM Role ARN. Format: arn:aws:iam::<account-id>:role/<role-name>',
    }),
  region: Joi.string().valid(...AWS_REGIONS).required().messages({
    'any.only': 'Invalid AWS region. Must be a valid AWS region identifier.',
  }),
  alias: Joi.string().trim().max(100).optional(),
  workspace_id: Joi.string().hex().length(24).optional(), // MongoDB ObjectId
});

const verifyRoleSchema = Joi.object({
  role_arn: Joi.string()
    .pattern(/^arn:aws:iam::\d{12}:role\/.+$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid IAM Role ARN. Format: arn:aws:iam::<account-id>:role/<role-name>',
    }),
  region: Joi.string().valid(...AWS_REGIONS).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
  changePasswordSchema,
  paginationSchema,
  connectAwsSchema,
  verifyRoleSchema,
};
