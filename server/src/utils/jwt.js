/**
 * JWT Utilities
 * Tạo / xác minh access token (JWT) và refresh token (UUID)
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

/**
 * Tạo access token (JWT HS256)
 * @param {object} user - { id, username, email, role }
 * @returns {string} JWT token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

/**
 * Tạo refresh token (UUID v4)
 * @returns {string} Plain text UUID token
 */
function generateRefreshToken() {
  return uuidv4();
}

/**
 * Xác minh access token
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

/**
 * Tính thời gian hết hạn refresh token
 * @returns {Date}
 */
function getRefreshTokenExpiry() {
  const match = env.jwt.refreshExpiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default 30 days
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
};
