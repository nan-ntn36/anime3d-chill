/**
 * Validation Middleware
 * Wrapper cho express-validator
 * Chạy validation rules rồi kiểm tra errors
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware factory: nhận danh sách validation rules,
 * chạy tuần tự rồi kiểm tra kết quả.
 *
 * Cách dùng:
 * ```js
 * const { body } = require('express-validator');
 * const validate = require('../middleware/validate');
 *
 * router.post('/register',
 *   validate([
 *     body('email').isEmail().withMessage('Email không hợp lệ'),
 *     body('password').isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự'),
 *   ]),
 *   controller.register
 * );
 * ```
 *
 * @param {Array} validations - array of express-validator chains
 * @returns {Function} Express middleware
 */
function validate(validations) {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      // Nếu có lỗi, có thể dừng sớm (optional)
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return sendError(
      res,
      'Validation failed',
      'VALIDATION_ERROR',
      422,
      formattedErrors
    );
  };
}

module.exports = validate;
