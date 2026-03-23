/**
 * Cache Helper
 * Redis wrapper với fallback sang node-cache in-memory
 * Cung cấp API thống nhất: get, set, del, flush
 */

const { getCacheClient, getMemoryCache, getRedisStatus } = require('../config/redis');
const logger = require('./logger');

/**
 * Lấy dữ liệu từ cache
 * @param {string} key
 * @returns {*|null} parsed data hoặc null
 */
async function cacheGet(key) {
  try {
    if (getRedisStatus()) {
      const redis = getCacheClient();
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }

    // Fallback: node-cache
    const memCache = getMemoryCache();
    return memCache.get(key) || null;
  } catch (error) {
    logger.debug({ key, err: error.message }, 'Cache GET error');
    return null;
  }
}

/**
 * Lưu dữ liệu vào cache
 * @param {string} key
 * @param {*} data - sẽ JSON.stringify
 * @param {number} ttlSeconds - thời gian sống (giây)
 */
async function cacheSet(key, data, ttlSeconds = 300) {
  try {
    if (getRedisStatus()) {
      const redis = getCacheClient();
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      return;
    }

    // Fallback: node-cache
    const memCache = getMemoryCache();
    memCache.set(key, data, ttlSeconds);
  } catch (error) {
    logger.debug({ key, err: error.message }, 'Cache SET error');
  }
}

/**
 * Xóa một key khỏi cache
 * @param {string} key
 */
async function cacheDel(key) {
  try {
    if (getRedisStatus()) {
      const redis = getCacheClient();
      await redis.del(key);
      return;
    }

    const memCache = getMemoryCache();
    memCache.del(key);
  } catch (error) {
    logger.debug({ key, err: error.message }, 'Cache DEL error');
  }
}

/**
 * Xóa tất cả keys matching pattern
 * @param {string} pattern - e.g. 'movies:new:*'
 */
async function cacheFlush(pattern) {
  try {
    if (getRedisStatus()) {
      const redis = getCacheClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug({ pattern, count: keys.length }, 'Cache FLUSH');
      }
      return;
    }

    // Fallback: xóa tất cả (node-cache không hỗ trợ pattern)
    const memCache = getMemoryCache();
    const allKeys = memCache.keys();
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matched = allKeys.filter((k) => regex.test(k));
    if (matched.length > 0) {
      memCache.del(matched);
    }
  } catch (error) {
    logger.debug({ pattern, err: error.message }, 'Cache FLUSH error');
  }
}

module.exports = { cacheGet, cacheSet, cacheDel, cacheFlush };
