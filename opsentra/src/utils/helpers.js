'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');

/**
 * Generate a UUID v4 identifier.
 * @returns {string}
 */
const generateId = () => uuidv4();

/**
 * Hash a plain-text password using bcrypt.
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain-text password against a bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Omit keys from an object (non-mutating).
 * @param {object} obj
 * @param {string[]} keys
 * @returns {object}
 */
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Pick keys from an object (non-mutating).
 * @param {object} obj
 * @param {string[]} keys
 * @returns {object}
 */
const pick = (obj, keys) => keys.reduce((acc, key) => {
  if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
  return acc;
}, {});

/**
 * Convert a value to a boolean.
 * @param {*} value
 * @returns {boolean}
 */
const toBoolean = (value) => ['true', '1', 'yes'].includes(String(value).toLowerCase());

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Build a MongoDB pagination object from query params.
 * @param {{ page?: number, limit?: number }} query
 * @returns {{ skip: number, limit: number, page: number }}
 */
const getPagination = ({ page = 1, limit = 10 } = {}) => ({
  skip: (page - 1) * limit,
  limit: Number(limit),
  page: Number(page),
});

module.exports = {
  generateId,
  hashPassword,
  comparePassword,
  sleep,
  omit,
  pick,
  toBoolean,
  capitalize,
  getPagination,
};
