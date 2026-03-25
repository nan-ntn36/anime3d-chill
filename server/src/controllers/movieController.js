/**
 * Movie Controller
 * Thin layer: validate input → gọi kkphimService → sendSuccess
 * Router → Middleware(validate) → Controller → Service → Cache/API
 */

const kkphimService = require('../services/kkphimService');
const { sendSuccess } = require('../utils/response');
const { validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');

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

module.exports = {
  getNewMovies,
  getMoviesByList,
  getMovieDetail,
  getByGenre,
  getByCountry,
  getByYear,
  searchMovies,
};
