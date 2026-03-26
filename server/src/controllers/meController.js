const { WatchHistory, Favorite, User } = require('../models');
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
    const { items: historyBatch } = req.body; // Frontend sends { items: [...] }

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

/**
 * Thêm phim vào danh sách Yêu Thích
 */
exports.addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieSlug, movieName, movieThumb } = req.body;

    if (!movieSlug) {
      return next(new AppError('Vui lòng cung cấp movieSlug', 400, 'VALIDATION_ERROR'));
    }

    const [favorite, created] = await Favorite.findOrCreate({
      where: { userId, movieSlug },
      defaults: { movieName, movieThumb }
    });

    if (!created) {
      return res.status(409).json({ success: false, message: 'Phim đã có trong danh sách yêu thích' });
    }

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      data: favorite
    });
  } catch (error) {
    logger.error(`[MeController.addFavorite] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Xóa phim khỏi danh sách Yêu Thích
 */
exports.removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieSlug } = req.params;

    const favorite = await Favorite.findOne({ where: { userId, movieSlug } });
    if (!favorite) {
      return next(new AppError('Không tìm thấy phim trong danh sách', 404, 'NOT_FOUND'));
    }

    await favorite.destroy();

    res.status(200).json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });
  } catch (error) {
    logger.error(`[MeController.removeFavorite] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Lấy danh sách phim Yêu Thích (Phân trang)
 */
exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
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
    logger.error(`[MeController.getFavorites] Error: ${error.message}`);
    next(error);
  }
};

/**
 * Cập nhật Profile (Avatar, Mật khẩu)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { avatar, oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);

    // Cập nhật Avatar
    if (avatar) {
      user.avatar = avatar;
    }

    // Cập nhật mật khẩu
    if (oldPassword && newPassword) {
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return next(new AppError('Mật khẩu cũ không chính xác', 400, 'VALIDATION_ERROR'));
      }
      user.password = newPassword; // Hook save() sẽ tự hash
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    logger.error(`[MeController.updateProfile] Error: ${error.message}`);
    next(error);
  }
};
