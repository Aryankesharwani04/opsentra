'use strict';

const express = require('express');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerServerSchema,
  updateInstanceStatusSchema,
  paginationSchema,
} = require('../utils/validators');
const { register, list, getOne, deregister, updateStatus } = require('../controllers/serverController');

const router = express.Router();

// All server routes require authentication
router.use(protect);

/**
 * POST /api/v1/servers/register
 * Register an EC2 instance to a workspace.
 * Auto-generates: logGroup = opsentra-{workspaceId}-{instanceId}
 */
router.post('/register', validate(registerServerSchema), register);

/**
 * GET /api/v1/servers
 * List all registered server instances for a workspace.
 * Query: ?workspace_id=, ?status=, ?page=, ?limit=
 */
router.get('/', list);

/**
 * GET /api/v1/servers/:id
 * Get a single server instance by MongoDB _id.
 */
router.get('/:id', getOne);

/**
 * PATCH /api/v1/servers/:instanceId/status
 * Update instance status (heartbeat / agent callback).
 * Body: { status: 'running' | 'stopped' | 'terminated' | 'unknown' }
 */
router.patch('/:instanceId/status', validate(updateInstanceStatusSchema), updateStatus);

/**
 * DELETE /api/v1/servers/:id
 * Deregister a server instance. Logs are preserved.
 */
router.delete('/:id', deregister);

module.exports = router;
