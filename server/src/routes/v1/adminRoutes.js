/**
 * Admin Routes
 * Tất cả routes yêu cầu authenticate + authorize('admin')
 */

const express = require('express');
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const userController = require('../../controllers/userController');
const adminController = require('../../controllers/adminController');
const {
  updateUserValidation,
  listUsersValidation,
  userIdValidation,
} = require('../../validators/adminValidators');

const router = express.Router();

// Tất cả admin routes đều yêu cầu đăng nhập + admin role
router.use(authenticate, authorize('admin'));

/**
 * GET /api/v1/admin/stats — Thống kê tổng quan
 */
router.get('/stats', adminController.getStats);

/**
 * GET /api/v1/admin/users — Danh sách users (phân trang + search)
 */
router.get('/users', validate(listUsersValidation), userController.getUsers);

/**
 * GET /api/v1/admin/users/:id — Chi tiết user
 */
router.get('/users/:id', validate(userIdValidation), userController.getUserById);

/**
 * PATCH /api/v1/admin/users/:id — Cập nhật user (role, isActive)
 */
router.patch('/users/:id', validate(updateUserValidation), userController.updateUser);

/**
 * DELETE /api/v1/admin/users/:id — Soft delete user
 */
router.delete('/users/:id', validate(userIdValidation), userController.deleteUser);

module.exports = router;
