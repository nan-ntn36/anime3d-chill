/**
 * Database Configuration
 * Sequelize → MySQL connection
 */

const { Sequelize } = require('sequelize');
const env = require('./env');
const logger = require('../utils/logger');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.isDev ? (msg) => logger.debug(msg) : false,
  timezone: '+07:00',
  define: {
    timestamps: true,
    underscored: true,        // snake_case columns
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,           // 30s to get connection
    idle: 10000,              // 10s before releasing idle
  },
  dialectOptions: {
    charset: 'utf8mb4',
    connectTimeout: 10000,
  },
});

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');
    return true;
  } catch (error) {
    logger.error({ err: error }, '❌ Database connection failed');
    return false;
  }
}

module.exports = { sequelize, connectDatabase };
