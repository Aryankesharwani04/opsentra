'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { updateUserSchema, paginationSchema } = require('../utils/validators');
const {
  getAllUsers, getUserById, updateUser, deactivateUser, deleteUser,
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/v1/users  (Admin only)
router.get('/', roleGuard('admin', 'superadmin'), validate(paginationSchema, 'query'), getAllUsers);

// GET /api/v1/users/:id
router.get('/:id', getUserById);

// PATCH /api/v1/users/:id
router.patch('/:id', validate(updateUserSchema), updateUser);

// PATCH /api/v1/users/:id/deactivate (Admin only)
router.patch('/:id/deactivate', roleGuard('admin', 'superadmin'), deactivateUser);

// DELETE /api/v1/users/:id (Superadmin only)
router.delete('/:id', roleGuard('superadmin'), deleteUser);

module.exports = router;
