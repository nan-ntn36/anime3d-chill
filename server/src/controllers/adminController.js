/**
 * Admin Controller
 * Thống kê tổng quan cho admin dashboard
 */

const { Op, fn, col, literal } = require('sequelize');
const { User, Favorite, WatchHistory, MovieView, sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * GET /api/v1/admin/stats
 * Trả về thống kê tổng quan
 */
exports.getStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Song song tất cả queries để tối ưu performance
    const [
      totalUsers,
      newUsersThisWeek,
      totalFavorites,
      totalViews,
      topMovies,
    ] = await Promise.all([
      // Tổng users (không tính soft-deleted)
      User.count({ where: { deletedAt: null } }),

      // Users mới trong 7 ngày gần nhất
      User.count({
        where: {
          deletedAt: null,
          createdAt: { [Op.gte]: sevenDaysAgo },
        },
      }),

      // Tổng lượt yêu thích
      Favorite.count(),

      // Tổng lượt xem phim
      MovieView.count(),

      // Top 5 phim xem nhiều nhất (30 ngày gần)
      MovieView.findAll({
        attributes: [
          'movieSlug',
          [fn('COUNT', col('id')), 'viewCount'],
        ],
        where: {
          viewedAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        group: ['movieSlug'],
        order: [[literal('viewCount'), 'DESC']],
        limit: 5,
        raw: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        newUsersThisWeek,
        totalFavorites,
        totalViews,
        topMovies,
      },
    });
  } catch (error) {
    logger.error(`[AdminController.getStats] Error: ${error.message}`);
    next(error);
  }
};
