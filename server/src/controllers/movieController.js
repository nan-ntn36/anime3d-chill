/**
 * Movie Controller
 * Thin layer: validate input → gọi kkphimService → sendSuccess
 * Router → Middleware(validate) → Controller → Service → Cache/API
 */

const kkphimService = require('../services/kkphimService');
const { sendSuccess } = require('../utils/response');
const { validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const { MovieView } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Helper: kiểm tra validation errors
 */
function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new AppError('Dữ liệu không hợp lệ', 400, 'VALIDATION_ERROR');
    err.errors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }));
    throw err;
  }
}

/**
 * GET /movies/new?page=
 * Phim mới cập nhật
 */
async function getNewMovies(req, res, next) {
  try {
    checkValidation(req);
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.getNewMovies(page);
    sendSuccess(res, data, { page });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/all?page=
 * Tất cả phim mới cập nhật (Không lọc)
 */
async function getAllMovies(req, res, next) {
  try {
    checkValidation(req);
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.getAllMovies(page);
    sendSuccess(res, data, { page });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/list/:slug?page=
 * Danh sách phim theo loại (phim-bo, phim-le, hoat-hinh, ...)
 */
async function getMoviesByList(req, res, next) {
  try {
    checkValidation(req);
    const { slug } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.getMoviesByList(slug, page);
    sendSuccess(res, data, { page, slug });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/detail/:slug
 * Chi tiết phim
 */
async function getMovieDetail(req, res, next) {
  try {
    checkValidation(req);
    const { slug } = req.params;
    const data = await kkphimService.getMovieDetail(slug);
    if (!data) {
      throw new AppError('Không tìm thấy phim', 404, 'RESOURCE_NOT_FOUND');
    }
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/genre/:slug?page=
 * Phim theo thể loại
 */
async function getByGenre(req, res, next) {
  try {
    checkValidation(req);
    const { slug } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.getByGenre(slug, page);
    sendSuccess(res, data, { page, slug });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/country/:slug?page=
 * Phim theo quốc gia
 */
async function getByCountry(req, res, next) {
  try {
    checkValidation(req);
    const { slug } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.getByCountry(slug, page);
    sendSuccess(res, data, { page, slug });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/year/:year?page=
 * Phim theo năm
 */
async function getByYear(req, res, next) {
  try {
    checkValidation(req);
    const { year } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.getByYear(year, page);
    sendSuccess(res, data, { page, year });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/search?keyword=&page=
 * Tìm kiếm phim
 */
async function searchMovies(req, res, next) {
  try {
    checkValidation(req);
    const { keyword } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await kkphimService.searchMovies(keyword, page);
    sendSuccess(res, data, { page, keyword });

  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/genres
 * Danh sách thể loại + thumbnail
 */
async function getGenres(req, res, next) {
  try {
    const data = await kkphimService.getGenres();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /movies/countries
 * Danh sách quốc gia + thumbnail
 */
async function getCountries(req, res, next) {
  try {
    const data = await kkphimService.getCountries();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /movies/view
 * Ghi nhận lượt xem phim (analytics)
 * Endpoint công khai — không cần auth, dùng sessionId cho guest
 * Deduplicate: 1 view / phim / session / ngày
 */
async function recordView(req, res, next) {
  try {
    const { movieSlug, sessionId } = req.body;

    if (!movieSlug) {
      return next(new AppError('movieSlug là bắt buộc', 400, 'VALIDATION_ERROR'));
    }

    // userId từ JWT nếu có (optional auth middleware đã parse)
    const userId = req.user?.id || null;
    const sid = sessionId || null;

    // Deduplicate: chỉ ghi 1 view / phim / session (hoặc user) / ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      movieSlug,
      viewedAt: { [Op.gte]: today },
    };

    if (userId) {
      where.userId = userId;
    } else if (sid) {
      where.sessionId = sid;
    } else {
      // Không có cách phân biệt → skip deduplicate, luôn ghi
    }

    // Kiểm tra đã view hôm nay chưa
    if (userId || sid) {
      const existing = await MovieView.findOne({ where });
      if (existing) {
        return res.status(200).json({ success: true, message: 'Đã ghi nhận' });
      }
    }

    await MovieView.create({
      movieSlug,
      userId,
      sessionId: sid,
    });

    res.status(201).json({ success: true, message: 'Đã ghi nhận lượt xem' });
  } catch (error) {
    logger.error(`[MovieController.recordView] Error: ${error.message}`);
    next(error);
  }
}

module.exports = {
  getNewMovies,
  getAllMovies,
  getMoviesByList,
  getMovieDetail,
  getByGenre,
  getByCountry,
  getByYear,
  searchMovies,
  getGenres,
  getCountries,
  recordView,
};
