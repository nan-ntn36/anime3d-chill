/**
 * Auth Routes
 * Mount tất cả authentication endpoints
 */

const { Router } = require('express');
const authController = require('../../controllers/authController');
const { authenticate } = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const { registerValidation, loginValidation } = require('../../validators/authValidators');

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: "Pass@1234"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       409:
 *         description: Email/Username đã tồn tại
 *       422:
 *         description: Validation error
 */
router.post('/register',
  authLimiter,
  validate(registerValidation),
  authController.register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@anime3d.local
 *               password:
 *                 type: string
 *                 example: "Admin@123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công → accessToken + cookie
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *       423:
 *         description: Tài khoản bị khóa
 */
router.post('/login',
  authLimiter,
  validate(loginValidation),
  authController.login
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Làm mới access token (dùng cookie)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token mới
 *       401:
 *         description: Refresh token không hợp lệ
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất (vô hiệu refresh token hiện tại)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất khỏi TẤT CẢ thiết bị
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã đăng xuất khỏi tất cả thiết bị
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy thông tin user hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
