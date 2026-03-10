'use strict';

const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess, sendNoContent, sendPaginated } = require('../utils/apiResponse');

/**
 * @route  GET /api/v1/users
 * @access Admin
 */
const getAllUsers = catchAsync(async (req, res) => {
  const { users, pagination } = await userService.getAllUsers(req.query);
  sendPaginated(res, users, pagination);
});

/**
 * @route  GET /api/v1/users/:id
 * @access Protected
 */
const getUserById = catchAsync(async (req, res) => {
  // Users can only fetch their own profile unless they are admin
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    if (req.params.id !== req.user._id.toString()) {
      throw AppError.forbidden('You can only view your own profile');
    }
  }

  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, { data: user });
});

/**
 * @route  PATCH /api/v1/users/:id
 * @access Protected (own) | Admin
 */
const updateUser = catchAsync(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    if (req.params.id !== req.user._id.toString()) {
      throw AppError.forbidden('You can only update your own profile');
    }
  }

  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, { message: 'Profile updated', data: user });
});

/**
 * @route  PATCH /api/v1/users/:id/deactivate
 * @access Admin
 */
const deactivateUser = catchAsync(async (req, res) => {
  await userService.deactivateUser(req.params.id);
  sendSuccess(res, { message: 'User deactivated successfully' });
});

/**
 * @route  DELETE /api/v1/users/:id
 * @access Superadmin
 */
const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendNoContent(res);
});

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, deleteUser };
