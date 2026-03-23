/**
 * Authentication Middleware
 * Xác thực JWT access token từ Authorization header
 */

const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { AppError } = require('./errorHandler');

/**
 * Middleware xác thực — yêu cầu Bearer token hợp lệ
 */
async function authenticate(req, res, next) {
  try {
    // Extract token từ Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token is required', 401, 'AUTH_UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Access token is required', 401, 'AUTH_UNAUTHORIZED');
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired', 401, 'AUTH_TOKEN_EXPIRED');
      }
      throw new AppError('Invalid access token', 401, 'AUTH_UNAUTHORIZED');
    }

    // Kiểm tra user vẫn tồn tại và active
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401, 'AUTH_UNAUTHORIZED');
    }

    if (!user.isActive) {
      throw new AppError('Account has been deactivated', 403, 'AUTH_FORBIDDEN');
    }

    if (user.deletedAt) {
      throw new AppError('Account has been deleted', 401, 'AUTH_UNAUTHORIZED');
    }

    // Attach user vào request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware xác thực tùy chọn — không throw error nếu không có token
 * Dùng cho routes public nhưng cần biết user nếu đã login
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Không có token → tiếp tục mà không có req.user
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findByPk(decoded.id);
      if (user && user.isActive && !user.deletedAt) {
        req.user = user;
      }
    } catch {
      // Token không hợp lệ → bỏ qua, tiếp tục như guest
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate, optionalAuth };
