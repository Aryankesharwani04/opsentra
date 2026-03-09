'use strict';

/**
 * Standard API response helpers.
 * Ensures a consistent JSON envelope across every endpoint.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message='Success']
 * @param {*} [options.data]
 * @param {object} [options.meta] - Pagination metadata, counts, etc.
 */
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const body = {
    status: 'success',
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };
  return res.status(statusCode).json(body);
};

/**
 * Send a created (201) response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message='Created successfully']
 */
const sendCreated = (res, data, message = 'Created successfully') =>
  sendSuccess(res, { statusCode: 201, message, data });

/**
 * Send a no-content (204) response.
 * @param {import('express').Response} res
 */
const sendNoContent = (res) => res.status(204).send();

/**
 * Send a paginated list response.
 * @param {import('express').Response} res
 * @param {Array} items
 * @param {object} pagination - { page, limit, total, totalPages }
 * @param {string} [message='OK']
 */
const sendPaginated = (res, items, pagination, message = 'OK') =>
  sendSuccess(res, {
    statusCode: 200,
    message,
    data: items,
    meta: { pagination },
  });

module.exports = { sendSuccess, sendCreated, sendNoContent, sendPaginated };
