'use strict';

const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getPagination } = require('../utils/helpers');
const { cacheSet, cacheGet, cacheDel } = require('./redisService');
const logger = require('../utils/logger');

const CACHE_NS = 'user';
const CACHE_TTL = 300; // 5 min

/**
 * Get a single user by ID.
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getUserById = async (userId) => {
  // Try cache first
  const cached = await cacheGet(CACHE_NS, userId);
  if (cached) return cached;

  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User');

  const publicUser = user.toPublic();
  await cacheSet(CACHE_NS, userId, publicUser, CACHE_TTL);

  return publicUser;
};

/**
 * Get all users with pagination and optional filters.
 * @param {object} queryParams - { page, limit, sort, order, tenantId, role }
 * @returns {Promise<{ users: object[], pagination: object }>}
 */
const getAllUsers = async (queryParams = {}) => {
  const { page, limit, skip } = getPagination(queryParams);
  const { sort = 'createdAt', order = 'desc', tenantId, role, isActive } = queryParams;

  const filter = {};
  if (tenantId) filter.tenantId = tenantId;
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update a user's profile.
 * @param {string} userId
 * @param {object} updateData - { firstName?, lastName?, avatar? }
 * @returns {Promise<object>}
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!user) throw AppError.notFound('User');

  // Invalidate cache
  await cacheDel(CACHE_NS, userId);

  logger.info(`[UserService] User updated: ${userId}`);
  return user.toPublic();
};

/**
 * Soft-delete a user (set isActive = false).
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { $set: { isActive: false } }, { new: true });
  if (!user) throw AppError.notFound('User');

  await cacheDel(CACHE_NS, userId);
  logger.info(`[UserService] User deactivated: ${userId}`);
};

/**
 * Hard-delete a user (permanent).
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  const result = await User.findByIdAndDelete(userId);
  if (!result) throw AppError.notFound('User');

  await cacheDel(CACHE_NS, userId);
  logger.info(`[UserService] User permanently deleted: ${userId}`);
};

module.exports = { getUserById, getAllUsers, updateUser, deactivateUser, deleteUser };
