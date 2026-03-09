'use strict';

/**
 * migrate.js — Database migration runner placeholder.
 *
 * In a production setup, use a library like `migrate-mongo` or `umzug`
 * to manage schema migrations. This file is a placeholder that demonstrates
 * the expected pattern.
 *
 * Usage: node src/scripts/migrate.js [up|down|status]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opsentra';

/**
 * Example migration: add indexes to users collection.
 */
const migrations = [
  {
    version: '001',
    name: 'add_user_indexes',
    up: async (db) => {
      logger.info('[Migrate] Running migration 001: add_user_indexes');
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ tenantId: 1, role: 1 });
      logger.info('[Migrate] ✅ Migration 001 complete.');
    },
    down: async (db) => {
      logger.info('[Migrate] Rolling back migration 001');
      await db.collection('users').dropIndex('email_1');
    },
  },
];

const run = async (direction = 'up') => {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    for (const migration of migrations) {
      if (direction === 'up') {
        await migration.up(db);
      } else if (direction === 'down') {
        await migration.down(db);
      }
    }

    logger.info(`[Migrate] All migrations (${direction}) completed.`);
  } catch (err) {
    logger.error(`[Migrate] Failed: ${err.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

const direction = process.argv[2] || 'up';
run(direction);
