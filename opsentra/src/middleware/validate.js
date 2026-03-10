'use strict';

const AppError = require('../utils/AppError');

/**
 * Joi validation middleware factory.
 *
 * Validates request body, query params, or URL params against a Joi schema.
 * Strips unknown keys by default (whitelist approach).
 *
 * @param {import('joi').Schema} schema - Joi schema to validate against.
 * @param {'body' | 'query' | 'params'} [target='body'] - Which part of req to validate.
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/register', validate(registerSchema), authController.register);
 * router.get('/users', validate(paginationSchema, 'query'), userController.getAll);
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,    // Collect all errors, not just first
    stripUnknown: true,   // Remove unknown keys (whitelist)
    convert: true,        // Convert strings to appropriate types
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.context?.key || d.path.join('.'),
      message: d.message.replace(/['"]/g, ''), // Remove Joi's quotes from messages
    }));

    throw AppError.validationError('Validation failed', details);
  }

  // Replace req[target] with the sanitized/coerced value
  req[target] = value;
  next();
};

module.exports = validate;
