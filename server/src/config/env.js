/**
 * Environment Configuration
 * Load + validate environment variables
 * Throw error nếu thiếu biến bắt buộc
 */

require('dotenv').config();

const requiredVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// Validate required variables
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `❌ Missing required environment variables: ${missing.join(', ')}\n` +
    'Please check your .env file or docker-compose environment.'
  );
}

const env = {
  // General
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // CORS — support comma-separated origins (e.g. "http://localhost:3000,http://localhost:3001")
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),

  // External API
  kkphimApiUrl: process.env.KKPHIM_API_URL || 'https://phimapi.com',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
