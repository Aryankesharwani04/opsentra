'use strict';

/**
 * catchAsync — Wraps async route handlers to forward errors to Express
 * next() without needing try/catch in every controller.
 *
 * @param {Function} fn - Async Express route handler.
 * @returns {Function} - Express middleware that catches and forwards errors.
 *
 * @example
 * router.get('/users', catchAsync(async (req, res) => {
 *   const users = await UserService.getAll();
 *   res.json(users);
 * }));
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
