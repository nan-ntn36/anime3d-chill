/**
 * Auth Validators
 * Validation rules cho register / login endpoints
 */

const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username là bắt buộc')
    .isLength({ min: 3, max: 30 }).withMessage('Username phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username chỉ chứa chữ cái, số và dấu gạch dưới'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ in hoa')
    .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất 1 số')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

module.exports = { registerValidation, loginValidation };
