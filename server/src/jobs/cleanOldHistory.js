/**
 * Clean Old History Job
 * Dọn dẹp dữ liệu cũ để giữ database gọn
 * - watch_history > 1 năm
 * - movie_views > 90 ngày
 * Chạy mỗi tuần Chủ Nhật lúc 4:00 AM
 */

const { Op } = require('sequelize');
const { WatchHistory, MovieView } = require('../models');
const logger = require('../utils/logger');

/**
 * Dọn dữ liệu cũ
 * @returns {{ deletedHistory: number, deletedViews: number }}
 */
async function cleanOldHistory() {
  try {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Xóa watch_history cũ > 1 năm
    const deletedHistory = await WatchHistory.destroy({
      where: {
        watchedAt: { [Op.lt]: oneYearAgo },
      },
    });

    // Xóa movie_views cũ > 90 ngày (giữ 3 tháng gần nhất cho analytics)
    const deletedViews = await MovieView.destroy({
      where: {
        viewedAt: { [Op.lt]: ninetyDaysAgo },
      },
    });

    logger.info(
      { deletedHistory, deletedViews },
      `🧹 Cleaned old data: ${deletedHistory} history records, ${deletedViews} view records`
    );

    return { deletedHistory, deletedViews };
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to clean old history');
    return { deletedHistory: 0, deletedViews: 0 };
  }
}

module.exports = { cleanOldHistory };
