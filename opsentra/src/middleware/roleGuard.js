'use strict';

const AppError = require('../utils/AppError');

/**
 * RBAC Role Guard middleware factory.
 *
 * Restricts access to routes based on user roles.
 * Must be used AFTER the `protect` middleware (requires req.user).
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'superadmin')
 * @returns {import('express').RequestHandler}
 *
 * @example
 * // Only admins and superadmins can access
 * router.delete('/users/:id', protect, roleGuard('admin', 'superadmin'), userController.deleteUser);
 */
const roleGuard = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }

  if (!roles.includes(req.user.role)) {
    throw AppError.forbidden(
      `Your role '${req.user.role}' does not have permission to perform this action`,
    );
  }

  next();
};

/**
 * Tenant guard — ensures the authenticated user belongs to the requested tenantId.
 * Superadmins bypass this check.
 *
 * @param {string} [paramName='tenantId'] - The request param that holds the tenantId
 * @returns {import('express').RequestHandler}
 */
const tenantGuard = (paramName = 'tenantId') => (req, res, next) => {
  if (!req.user) throw AppError.unauthorized('Authentication required');

  // Superadmins can access any tenant
  if (req.user.role === 'superadmin') return next();

  const requestedTenantId = req.params[paramName] || req.body[paramName] || req.query[paramName];

  if (requestedTenantId && req.user.tenantId !== requestedTenantId) {
    throw AppError.forbidden('Access to this tenant is not allowed');
  }

  next();
};

module.exports = { roleGuard, tenantGuard };
