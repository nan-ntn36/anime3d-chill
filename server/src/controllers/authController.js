/**
 * Auth Controller
 * Thin controller — chỉ xử lý req/res, delegate logic cho authService
 */

const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');

// ── Cookie Helpers ────────────────────────────────────────
function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.isProd, // true khi ở server thật (https)
    sameSite: env.isProd ? 'None' : 'Lax', 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/', // Mở rộng path ra root để trình duyệt luôn gửi
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'None' : 'Lax',
    path: '/', // Phải match với path lúc set
  });
}

/**
 * POST /api/v1/auth/register
 */
async function register(req, res, next) {
  try {
    const { user, accessToken, refreshTokenPlain } = await authService.registerUser(
      req.body,
      { userAgent: req.headers['user-agent'], ipAddress: req.ip }
    );

    setRefreshCookie(res, refreshTokenPlain);

    return sendSuccess(res, {
      user: user.toSafeJSON(),
      accessToken,
    }, null, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const { user, accessToken, refreshTokenPlain } = await authService.loginUser(
      req.body,
      { userAgent: req.headers['user-agent'], ipAddress: req.ip }
    );

    setRefreshCookie(res, refreshTokenPlain);

    return sendSuccess(res, {
      user: user.toSafeJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Làm mới access token (dùng refreshToken từ cookie)
 */
async function refresh(req, res, next) {
  try {
    const { accessToken, refreshTokenPlain } = await authService.refreshTokens(
      req.cookies?.refreshToken,
      { userAgent: req.headers['user-agent'], ipAddress: req.ip }
    );

    setRefreshCookie(res, refreshTokenPlain);

    return sendSuccess(res, { accessToken });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
async function logout(req, res, next) {
  try {
    await authService.logoutUser(req.user.id, req.cookies?.refreshToken);
    clearRefreshCookie(res);

    return sendSuccess(res, { message: 'Đăng xuất thành công' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout-all
 */
async function logoutAll(req, res, next) {
  try {
    await authService.logoutAllDevices(req.user.id);
    clearRefreshCookie(res);

    return sendSuccess(res, { message: 'Đã đăng xuất khỏi tất cả thiết bị' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 */
async function me(req, res, next) {
  try {
    return sendSuccess(res, { user: req.user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
};
