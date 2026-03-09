'use strict';

const express = require('express');
const { healthCheck } = require('../controllers/healthController');

const router = express.Router();

// GET /api/v1/health
router.get('/', healthCheck);

module.exports = router;
