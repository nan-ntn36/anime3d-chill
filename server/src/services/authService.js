/**
 * Auth Service
 * Business logic cho authentication — tách riêng khỏi controller
 */

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } = require('../utils/jwt');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ── Constants ─────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 phút

/**
 * Đăng ký tài khoản mới
 * @param {object} data - { username, email, password }
 * @param {object} meta - { userAgent, ipAddress }
 * @returns {{ user, accessToken, refreshTokenPlain }}
 */
async function registerUser({ username, email, password }, meta = {}) {
  // Kiểm tra email/username đã tồn tại
  const existing = await User.unscoped().findOne({
    where: { [Op.or]: [{ email }, { username }] },
  });

  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    throw new AppError(
      `${field === 'email' ? 'Email' : 'Username'} đã tồn tại`,
      409,
      'VALIDATION_ERROR',
      [{ field, message: `${field} đã được sử dụng` }]
    );
  }

  // Tạo user (password hash qua hook)
  const user = await User.create({ username, email, password });

  // Tạo tokens
  const { accessToken, refreshTokenPlain } = await createTokenPair(user, meta);

  logger.info({ userId: user.id, username }, 'User registered');

  return { user, accessToken, refreshTokenPlain };
}

/**
 * Đăng nhập
 * @param {object} data - { email, password }
 * @param {object} meta - { userAgent, ipAddress }
 * @returns {{ user, accessToken, refreshTokenPlain }}
 */
async function loginUser({ email, password }, meta = {}) {
  // Tìm user kèm password
  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user || user.deletedAt) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  // Kiểm tra tài khoản bị khóa
  if (user.isLocked()) {
    const remaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
    throw new AppError(
      `Tài khoản tạm khóa. Thử lại sau ${remaining} phút`,
      423,
      'AUTH_ACCOUNT_LOCKED'
    );
  }

  // Kiểm tra tài khoản active
  if (!user.isActive) {
    throw new AppError('Tài khoản đã bị vô hiệu hóa', 403, 'AUTH_FORBIDDEN');
  }

  // So sánh password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await handleFailedLogin(user);
    throw new AppError('Email hoặc mật khẩu không đúng', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  // Login thành công → reset login_attempts
  user.loginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  await user.save({ hooks: false });

  // Tạo tokens
  const { accessToken, refreshTokenPlain } = await createTokenPair(user, meta);

  logger.info({ userId: user.id, email }, 'User logged in');

  return { user, accessToken, refreshTokenPlain };
}

/**
 * Refresh token — token rotation
 * @param {string} refreshTokenPlain - token từ cookie
 * @param {object} meta - { userAgent, ipAddress }
 * @returns {{ accessToken, refreshTokenPlain }}
 */
async function refreshTokens(refreshTokenPlain, meta = {}) {
  if (!refreshTokenPlain) {
    throw new AppError('Refresh token is required', 401, 'AUTH_UNAUTHORIZED');
  }

  // Tìm tất cả active refresh tokens
  const tokens = await RefreshToken.findAll({
    where: {
      revokedAt: null,
      expiresAt: { [Op.gt]: new Date() },
    },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'deletedAt'],
    }],
  });

  // So sánh hash để tìm token đúng
  let matchedToken = null;
  for (const token of tokens) {
    const isMatch = await bcrypt.compare(refreshTokenPlain, token.tokenHash);
    if (isMatch) {
      matchedToken = token;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError('Invalid or expired refresh token', 401, 'AUTH_UNAUTHORIZED');
  }

  const user = matchedToken.user;
  if (!user || !user.isActive || user.deletedAt) {
    matchedToken.revokedAt = new Date();
    await matchedToken.save();
    throw new AppError('Account is not active', 403, 'AUTH_FORBIDDEN');
  }

  // Token rotation: vô hiệu token cũ, tạo mới
  matchedToken.revokedAt = new Date();
  await matchedToken.save();

  const result = await createTokenPair(user, meta);

  logger.debug({ userId: user.id }, 'Token refreshed');

  return result;
}

/**
 * Logout — vô hiệu refresh token hiện tại
 * @param {number} userId
 * @param {string} refreshTokenPlain
 */
async function logoutUser(userId, refreshTokenPlain) {
  if (refreshTokenPlain) {
    const tokens = await RefreshToken.findAll({
      where: { userId, revokedAt: null },
    });

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshTokenPlain, token.tokenHash);
      if (isMatch) {
        token.revokedAt = new Date();
        await token.save();
        break;
      }
    }
  }

  logger.info({ userId }, 'User logged out');
}

/**
 * Logout All — vô hiệu TẤT CẢ refresh tokens
 * @param {number} userId
 */
async function logoutAllDevices(userId) {
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { userId, revokedAt: null } }
  );

  logger.info({ userId }, 'User logged out from all devices');
}

// ── Private Helpers ──────────────────────────────────────

/**
 * Tạo cặp access + refresh token
 */
async function createTokenPair(user, { userAgent = null, ipAddress = null } = {}) {
  const accessToken = generateAccessToken(user);
  const refreshTokenPlain = generateRefreshToken();
  const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);

  await RefreshToken.create({
    userId: user.id,
    tokenHash: refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt: getRefreshTokenExpiry(),
  });

  return { accessToken, refreshTokenPlain };
}

/**
 * Xử lý login thất bại — tăng attempts, lock nếu cần
 */
async function handleFailedLogin(user) {
  user.loginAttempts += 1;

  if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    await user.save({ hooks: false });
    logger.warn({ userId: user.id, email: user.email }, 'Account locked after max attempts');
    throw new AppError(
      'Tài khoản tạm khóa do đăng nhập thất bại quá nhiều lần',
      423,
      'AUTH_ACCOUNT_LOCKED'
    );
  }

  await user.save({ hooks: false });
}

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  logoutAllDevices,
};
