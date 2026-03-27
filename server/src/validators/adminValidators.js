/**
 * Admin Validators
 * Validation rules cho admin operations
 */

const { body, query, param } = require('express-validator');

/**
 * Validate update user request
 */
exports.updateUserValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ'),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role phải là "user" hoặc "admin"'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive phải là true hoặc false'),
];

/**
 * Validate list users query params
 */
exports.listUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page phải là số nguyên >= 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit phải từ 1 đến 50'),

  query('search')
    .optional()
    .isLength({ max: 100 }).withMessage('Từ khóa tìm kiếm tối đa 100 ký tự')
    .trim()
    .escape(),

  query('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role filter phải là "user" hoặc "admin"'),

  query('isActive')
    .optional()
    .isIn(['true', 'false']).withMessage('isActive filter phải là "true" hoặc "false"'),
];

/**
 * Validate user ID param
 */
exports.userIdValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID người dùng không hợp lệ'),
];
