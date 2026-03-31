/**
 * Jobs Registry
 * Đăng ký và khởi chạy tất cả cron jobs
 */

const cron = require('node-cron');
const { cleanExpiredTokens } = require('./cleanExpiredTokens');
const { updateTrending } = require('./updateTrending');
const { cleanOldHistory } = require('./cleanOldHistory');
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

  // Cập nhật trending — mỗi 15 phút
  cron.schedule('*/15 * * * *', async () => {
    logger.info('⏰ Running job: updateTrending');
    await updateTrending();
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  // Dọn dữ liệu cũ — Chủ Nhật 4:00 AM
  cron.schedule('0 4 * * 0', async () => {
    logger.info('⏰ Running job: cleanOldHistory');
    await cleanOldHistory();
  }, {
    timezone: 'Asia/Ho_Chi_Minh',
  });

  logger.info('📅 Cron jobs registered: cleanExpiredTokens (daily 3AM), updateTrending (every 15min), cleanOldHistory (weekly Sun 4AM)');

  // Chạy updateTrending ngay khi boot để có dữ liệu ban đầu
  updateTrending().catch((err) => {
    logger.warn({ err }, 'Initial trending update failed (non-fatal)');
  });
}

module.exports = { startJobs };
