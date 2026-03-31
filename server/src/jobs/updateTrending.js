/**
 * Update Trending Job
 * Aggregate movie_views trong 7 ngày → lưu vào Redis cache
 * Chạy mỗi 15 phút
 */

const { Op, fn, col, literal } = require('sequelize');
const { MovieView } = require('../models');
const { cacheSet, cacheGet } = require('../utils/cache');
const logger = require('../utils/logger');

const TRENDING_CACHE_KEY = 'movies:trending';
const TRENDING_TTL = 15 * 60; // 15 phút
const TRENDING_LIMIT = 20;

/**
 * Aggregate movie_views trong 7 ngày gần nhất
 * Trả về top N phim theo lượt xem
 */
async function updateTrending() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await MovieView.findAll({
      attributes: [
        'movieSlug',
        [fn('COUNT', col('id')), 'viewCount'],
        [fn('MAX', col('viewed_at')), 'lastViewedAt'],
      ],
      where: {
        viewedAt: { [Op.gte]: sevenDaysAgo },
      },
      group: ['movieSlug'],
      order: [[literal('viewCount'), 'DESC']],
      limit: TRENDING_LIMIT,
      raw: true,
    });

    // Format kết quả
    const trendingData = trending.map((item, index) => ({
      rank: index + 1,
      movieSlug: item.movieSlug,
      viewCount: parseInt(item.viewCount, 10),
      lastViewedAt: item.lastViewedAt,
    }));

    // Lưu vào cache
    await cacheSet(TRENDING_CACHE_KEY, trendingData, TRENDING_TTL);

    logger.info(
      { count: trendingData.length },
      `🔥 Updated trending: ${trendingData.length} movies`
    );

    return trendingData;
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to update trending');
    return [];
  }
}

module.exports = { updateTrending, TRENDING_CACHE_KEY, TRENDING_TTL };
