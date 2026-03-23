/**
 * Anime3D-Chill Backend Server
 * Express application entry point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// ── Config ──────────────────────────────────────────────────
const env = require('./config/env');
const { sequelize, connectDatabase } = require('./config/database');
const { connectRedis, getRedisStatus } = require('./config/redis');

// ── Utils ───────────────────────────────────────────────────
const logger = require('./utils/logger');
const { sendSuccess } = require('./utils/response');

// ── Middleware ───────────────────────────────────────────────
const requestId = require('./middleware/requestId');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Core Middleware ─────────────────────────────────────────
app.use(requestId);                   // UUID per request
app.use(helmet());
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);              // Rate limit: 100 req / 15min

// ── Request Logging (Pino) ──────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      logger.warn(logData, `${req.method} ${req.originalUrl} ${res.statusCode}`);
    } else {
      logger.info(logData, `${req.method} ${req.originalUrl} ${res.statusCode}`);
    }
  });
  next();
});

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

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Health Check ────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Kiểm tra sức khỏe server
 *     description: Trả về trạng thái hoạt động, uptime, DB và Redis connection
 *     responses:
 *       200:
 *         description: Server hoạt động bình thường
 */
app.get('/api/v1/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const redisStatus = getRedisStatus() ? 'connected' : 'disconnected';

  sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

/**
 * @swagger
 * /api/v1/ready:
 *   get:
 *     tags: [Health]
 *     summary: Kiểm tra sẵn sàng phục vụ
 *     description: Kiểm tra kết nối tới Database và Redis
 *     responses:
 *       200:
 *         description: Tất cả services sẵn sàng
 *       503:
 *         description: Một hoặc nhiều services chưa sẵn sàng
 */
app.get('/api/v1/ready', async (req, res) => {
  let dbReady = false;
  try {
    await sequelize.authenticate();
    dbReady = true;
  } catch {
    dbReady = false;
  }

  const redisReady = getRedisStatus();
  const allReady = dbReady && redisReady;

  const statusCode = allReady ? 200 : 503;
  const data = {
    status: allReady ? 'ready' : 'not_ready',
    services: {
      database: dbReady ? 'connected' : 'disconnected',
      redis: redisReady ? 'connected' : 'disconnected',
    },
  };

  return res.status(statusCode).json({ success: allReady, data });
});

// ── 404 + Error Handler ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────
async function startServer() {
  // Connect to Database
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    logger.warn('⚠️ Server starting without database connection');
  }

  // Connect to Redis
  const redisConnected = await connectRedis();
  if (!redisConnected) {
    logger.warn('⚠️ Server starting without Redis (using memory cache fallback)');
  }

  // Start listening
  app.listen(env.port, () => {
    logger.info(`🚀 Server running on http://localhost:${env.port}`);
    logger.info(`📋 Health: http://localhost:${env.port}/api/v1/health`);
    logger.info(`📚 API Docs: http://localhost:${env.port}/api-docs`);
    logger.info(`🌍 Environment: ${env.nodeEnv}`);
  });
}

startServer().catch((err) => {
  logger.fatal({ err }, '💀 Failed to start server');
  process.exit(1);
});

module.exports = app;
