const { WatchHistory, MovieView } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Lịch sử xem phim (Watch History)
 */
exports.saveHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieSlug, movieName, movieThumb, episode, serverName, duration, lastPositionSeconds } = req.body;

    if (!movieSlug || !episode) {
      return next(new AppError('Vui lòng cung cấp movieSlug và episode', 400, 'VALIDATION_ERROR'));
    }

    // Upsert logic
    const [history, created] = await WatchHistory.findOrCreate({
      where: { userId, movieSlug, episode },
      defaults: {
        movieName,
        movieThumb,
        serverName,
        duration,
        lastPositionSeconds,
      }
    });

    if (!created) {
      // Cập nhật nếu đã tồn tại
      history.duration = duration || history.duration;
      history.lastPositionSeconds = lastPositionSeconds || history.lastPositionSeconds;
      history.watchedAt = new Date(); // Cập nhật thời gian xem
      await history.save();
    }

    // Ghi nhận lượt xem ẩn danh/analytics (chủ yếu là view count)
    // Để tránh spam view, ta có thể giới hạn 1 view / phim / ngày / user, nhưng skip tạm phần này cho Day 17 (Analytics).

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {
    logger.error(`[MeController.saveHistory] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Đồng bộ lịch sử xem từ LocalStorage lên Server
 * Lấy một mảng lịch sử từ client, so sánh và upsert
 */
exports.syncHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { historyBatch } = req.body; // Array of history objects

    if (!Array.isArray(historyBatch) || historyBatch.length === 0) {
      return res.status(200).json({ success: true, message: 'Không có dữ liệu để đồng bộ' });
    }

    let syncedCount = 0;

    // Process từng record
    // Mặc dù dùng Promise.all hoặc bulkCreate tốt hơn, nhưng upsert từng cái dễ kiểm soát hơn với MySQL
    for (const record of historyBatch) {
      const { movieSlug, movieName, movieThumb, episode, serverName, duration, lastPositionSeconds, updatedAt } = record;
      
      if (!movieSlug || !episode) continue;

      const [history, created] = await WatchHistory.findOrCreate({
        where: { userId, movieSlug, episode },
        defaults: {
          movieName,
          movieThumb,
          serverName,
          duration,
          lastPositionSeconds,
          watchedAt: updatedAt ? new Date(updatedAt) : new Date()
        }
      });

      if (!created) {
        // Chỉ cập nhật nếu bản local mới hơn bản trên server
        const clientDate = updatedAt ? new Date(updatedAt) : new Date();
        if (clientDate > history.watchedAt || history.lastPositionSeconds < lastPositionSeconds) {
          history.duration = duration || history.duration;
          history.lastPositionSeconds = lastPositionSeconds || history.lastPositionSeconds;
          history.watchedAt = clientDate;
          await history.save();
        }
      }
      
      syncedCount++;
    }

    res.status(200).json({
      success: true,
      data: { syncedCount }
    });

  } catch (error) {
    logger.error(`[MeController.syncHistory] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Lấy danh sách lịch sử xem cá nhân
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await WatchHistory.findAndCountAll({
      where: { userId },
      order: [['watchedAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error(`[MeController.getHistory] Error: ${error.message}`);
    next(error);
  }
};
