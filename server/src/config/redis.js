/**
 * Redis Configuration
 * ioredis client + fallback node-cache khi Redis không available
 */

const Redis = require('ioredis');
const NodeCache = require('node-cache');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;
let isRedisConnected = false;

// Fallback in-memory cache khi Redis down
const memoryCache = new NodeCache({
  stdTTL: 300,        // 5 phút default
  checkperiod: 60,    // check expired mỗi 60s
  maxKeys: 1000,
});

/**
 * Connect to Redis
 * @returns {Promise<boolean>}
 */
async function connectRedis() {
  return new Promise((resolve) => {
    try {
      redisClient = new Redis({
        host: env.redis.host,
        port: env.redis.port,
        password: env.redis.password,
        // TLS cho cloud Redis (Upstash, Redis Cloud, etc.)
        ...(process.env.REDIS_TLS === 'true' && { tls: {} }),
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 5) {
            logger.warn('⚠️ Redis max retries reached, using memory cache fallback');
            return null;   // stop retrying
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      redisClient.on('connect', () => {
        isRedisConnected = true;
        logger.info('✅ Redis connected successfully');
      });

      redisClient.on('error', (err) => {
        isRedisConnected = false;
        logger.error({ err }, '❌ Redis connection error');
      });

      redisClient.on('close', () => {
        isRedisConnected = false;
        logger.warn('⚠️ Redis connection closed');
      });

      redisClient.connect()
        .then(() => resolve(true))
        .catch((err) => {
          logger.warn({ err }, '⚠️ Redis connect failed, using memory cache fallback');
          isRedisConnected = false;
          resolve(false);
        });
    } catch (err) {
      logger.warn({ err }, '⚠️ Redis init failed, using memory cache fallback');
      isRedisConnected = false;
      resolve(false);
    }
  });
}

/**
 * Get Redis connection status
 */
function getRedisStatus() {
  return isRedisConnected;
}

/**
 * Get the active cache client (Redis or memory fallback)
 */
function getCacheClient() {
  return isRedisConnected ? redisClient : null;
}

/**
 * Get the memory cache (fallback)
 */
function getMemoryCache() {
  return memoryCache;
}

module.exports = {
  connectRedis,
  getRedisStatus,
  getCacheClient,
  getMemoryCache,
  get redisClient() { return redisClient; },
};
