/**
 * User Controller (Admin)
 * CRUD users — chỉ admin mới truy cập được
 */

const { Op } = require('sequelize');
const { User, Favorite, WatchHistory } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * GET /api/v1/admin/users
 * Danh sách users phân trang + search + filter
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const offset = (page - 1) * limit;
    const { search, role, isActive } = req.query;

    // Build where clause
    const where = { deletedAt: null };

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role && ['user', 'admin'].includes(role)) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows } = await User.scope('withAll').findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error(`[UserController.getUsers] Error: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:id
 * Chi tiết user theo ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.scope('withAll').findOne({
      where: { id, deletedAt: null },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Đếm thêm thông tin liên quan
    const [favoritesCount, historyCount] = await Promise.all([
      Favorite.count({ where: { userId: id } }),
      WatchHistory.count({ where: { userId: id } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        _counts: {
          favorites: favoritesCount,
          watchHistory: historyCount,
        },
      },
    });
  } catch (error) {
    logger.error(`[UserController.getUserById] Error: ${error.message}`);
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:id
 * Cập nhật role, isActive
 */
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Không cho phép admin tự sửa chính mình
    if (parseInt(id, 10) === req.user.id) {
      return next(new AppError('Không thể tự cập nhật tài khoản admin của mình', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.scope('withAll').findOne({
      where: { id, deletedAt: null },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Cập nhật các trường được phép
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    logger.info(`[Admin] User ${req.user.id} updated user ${id}: role=${role}, isActive=${isActive}`);

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: user,
    });
  } catch (error) {
    logger.error(`[UserController.updateUser] Error: ${error.message}`);
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Soft delete (set deletedAt)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Không cho phép admin tự xóa chính mình
    if (parseInt(id, 10) === req.user.id) {
      return next(new AppError('Không thể xóa tài khoản admin của chính mình', 400, 'VALIDATION_ERROR'));
    }

    const user = await User.scope('withAll').findOne({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return next(new AppError('Không tìm thấy người dùng', 404, 'RESOURCE_NOT_FOUND'));
    }

    // Soft delete
    user.deletedAt = new Date();
    user.isActive = false;
    await user.save();

    logger.info(`[Admin] User ${req.user.id} soft-deleted user ${id}`);

    res.status(200).json({
      success: true,
      message: 'Đã xóa người dùng thành công',
    });
  } catch (error) {
    logger.error(`[UserController.deleteUser] Error: ${error.message}`);
    next(error);
  }
};
