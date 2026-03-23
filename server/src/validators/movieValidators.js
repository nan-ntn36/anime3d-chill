/**
 * Movie Validators
 * Validate slug, page, keyword cho movie API
 */

const { query, param } = require('express-validator');

/**
 * Validate ?page= query param
 * - Số nguyên dương, mặc định 1, max 500
 */
const validatePage = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Page phải là số nguyên từ 1 đến 500')
    .toInt(),
];

/**
 * Validate :slug path param
 * - Chữ cái, số, dấu gạch ngang
 */
const validateSlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug không được trống')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
];

/**
 * Validate :year path param
 * - Năm hợp lệ: 1900 → năm hiện tại + 2
 */
const validateYear = [
  param('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Năm không hợp lệ')
    .toInt(),
];

/**
 * Validate ?keyword= query param
 * - Tối đa 100 ký tự, sanitize
 */
const validateSearch = [
  query('keyword')
    .trim()
    .notEmpty()
    .withMessage('Từ khóa tìm kiếm không được trống')
    .isLength({ max: 100 })
    .withMessage('Từ khóa tối đa 100 ký tự')
    .escape(),
  ...validatePage,
];

module.exports = {
  validatePage,
  validateSlug,
  validateYear,
  validateSearch,
};
