/**
 * Comment Validators
 * Validate dữ liệu đầu vào cho các request liên quan đến bình luận
 */

const { body } = require('express-validator');

const createCommentValidation = [
  body('movieSlug')
    .notEmpty().withMessage('Movie slug là bắt buộc')
    .isString().withMessage('Movie slug phải là chuỗi'),

  body('content')
    .trim()
    .notEmpty().withMessage('Nội dung bình luận không được để trống')
    .isLength({ min: 1, max: 1000 }).withMessage('Nội dung quá dài (tối đa 1000 ký tự)')
    // Chống XSS cơ bản (React cũng escape default, nhưng backend nên chặn HTML tags)
    .escape(),

  // Optional: nếu là reply
  body('parentId')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('ID bình luận gốc không hợp lệ'),
];

const updateCommentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Nội dung bình luận không được để trống')
    .isLength({ min: 1, max: 1000 }).withMessage('Nội dung quá dài (tối đa 1000 ký tự)')
    .escape(),
];

module.exports = {
  createCommentValidation,
  updateCommentValidation,
};
