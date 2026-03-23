/**
 * Authorization Middleware
 * Phân quyền theo role (user, admin)
 */

const { AppError } = require('./errorHandler');

/**
 * Middleware factory: chỉ cho phép roles được chỉ định
 * @param {...string} roles - 'user', 'admin'
 * @returns {Function} Express middleware
 *
 * Cách dùng:
 * ```js
 * router.get('/admin/users', authenticate, authorize('admin'), controller.list);
 * ```
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTH_UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        'You do not have permission to access this resource',
        403,
        'AUTH_FORBIDDEN'
      ));
    }

    next();
  };
}

module.exports = { authorize };
