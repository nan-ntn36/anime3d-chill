/**
 * Error Handler Middleware
 * Xử lý lỗi tập trung + custom AppError class
 */

const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

/**
 * Custom error class cho application errors
 */
class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {string} code - error code (e.g. 'AUTH_INVALID_CREDENTIALS')
   * @param {Array} [errors] - validation errors
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;   // distinguish from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found handler — 404 cho routes không tồn tại
 */
function notFoundHandler(req, res) {
  sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    'RESOURCE_NOT_FOUND',
    404
  );
}

/**
 * Global error handler middleware
 * Phải có 4 params để Express nhận diện là error handler
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Default values
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error
  if (statusCode >= 500) {
    logger.error({
      err,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    }, `[${code}] ${err.message}`);
  } else {
    logger.warn({
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      code,
    }, err.message);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors?.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation error', 'VALIDATION_ERROR', 422, errors);
  }

  // Sequelize connection error
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return sendError(res, 'Service temporarily unavailable', 'INTERNAL_ERROR', 503);
  }

  // Message: ẩn chi tiết lỗi ở production cho 500 errors
  const message = (isProduction && statusCode >= 500)
    ? 'Internal server error'
    : err.message;

  // Build response
  const response = {
    success: false,
    message,
    code,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  // Include stack trace in development
  if (!isProduction && statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = { AppError, notFoundHandler, errorHandler };
