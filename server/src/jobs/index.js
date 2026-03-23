/**
 * Jobs Registry
 * Đăng ký và khởi chạy tất cả cron jobs
 */

const cron = require('node-cron');
const { cleanExpiredTokens } = require('./cleanExpiredTokens');
const logger = require('../utils/logger');

/**
 * Start tất cả scheduled jobs
 */
function startJobs() {
  // Xóa expired tokens — daily lúc 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('⏰ Running job: cleanExpiredTokens');
    await cleanExpiredTokens();
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  logger.info('📅 Cron jobs registered: cleanExpiredTokens (daily 3:00 AM)');
}

module.exports = { startJobs };
