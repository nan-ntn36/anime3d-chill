/**
 * Rate Limiter Middleware
 * Giới hạn request theo IP sử dụng express-rate-limit
 */

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

/**
 * General API rate limiter
 * 100 requests / 15 phút per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 phút
  max: 100,
  standardHeaders: true,         // RateLimit-* headers
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Too many requests, please try again later',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
  keyGenerator: (req) => req.ip,
});

/**
 * Auth rate limiter (stricter)
 * 5 requests / 15 phút per IP — cho login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Too many authentication attempts, please try again later',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  },
  keyGenerator: (req) => req.ip,
});

module.exports = { generalLimiter, authLimiter };
