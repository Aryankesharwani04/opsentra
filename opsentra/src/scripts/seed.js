'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/helpers');
const logger = require('../utils/logger');

// Models
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opsentra';

const seedData = {
  users: [
    {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@opsentra.io',
      password: 'Admin@1234!',
      role: 'superadmin',
      isEmailVerified: true,
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@opsentra.io',
      password: 'Admin@1234!',
      role: 'admin',
      isEmailVerified: true,
    },
  ],
};

const seedUsers = async () => {
  logger.info('[Seed] Seeding users...');

  for (const userData of seedData.users) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      logger.info(`[Seed] User already exists: ${userData.email}`);
      continue;
    }

    // Password will be hashed by pre-save hook
    const user = await User.create(userData);
    logger.info(`[Seed] Created user: ${user.email} (${user.role})`);
  }
};

const seed = async () => {
  try {
    logger.info('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    logger.info('[Seed] Connected.');

    await seedUsers();

    logger.info('[Seed] ✅ Database seeded successfully.');
  } catch (err) {
    logger.error(`[Seed] ❌ Seed failed: ${err.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('[Seed] Disconnected from MongoDB.');
  }
};

seed();
