const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Core Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Swagger API Docs ────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui { max-width: 1200px; margin: 0 auto; }
  `,
  customSiteTitle: 'Anime3D-Chill API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    tagsSorter: 'alpha',
  },
}));

// Serve raw swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Health Check ────────────────────────────────────────────

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Kiểm tra sức khỏe server
 *     description: Trả về trạng thái hoạt động, uptime và environment
 *     responses:
 *       200:
 *         description: Server hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     uptime:
 *                       type: number
 *                       example: 123.45
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     environment:
 *                       type: string
 *                       example: development
 */
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     tags: [Health]
 *     summary: Kiểm tra sẵn sàng phục vụ
 *     description: Kiểm tra kết nối tới Database và Redis
 *     responses:
 *       200:
 *         description: Trạng thái sẵn sàng của các services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ready
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: string
 *                           example: connected
 *                         redis:
 *                           type: string
 *                           example: connected
 */
app.get('/api/v1/ready', (req, res) => {
  // TODO: Check DB and Redis connections
  res.json({
    success: true,
    data: {
      status: 'ready',
      services: {
        database: 'not_configured',
        redis: 'not_configured',
      },
    },
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'RESOURCE_NOT_FOUND',
  });
});

// ── Error Handler ───────────────────────────────────────────
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  console.error(`[ERROR] ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
