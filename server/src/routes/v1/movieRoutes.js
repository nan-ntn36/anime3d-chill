/**
 * Movie Routes
 * 7 endpoints công khai (không cần auth)
 * Router → Validator → Controller → Service → Cache/API
 */

const { Router } = require('express');
const movieController = require('../../controllers/movieController');
const {
  validatePage,
  validateSlug,
  validateYear,
  validateSearch,
} = require('../../validators/movieValidators');

const router = Router();

// ── Swagger Tags ────────────────────────────────────────────
/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: API phim — proxy từ NguonC với cache
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MovieListItem:
 *       type: object
 *       properties:
 *         slug:
 *           type: string
 *           example: "tai-sinh-thanh-meo"
 *         title:
 *           type: string
 *           example: "Tái Sinh Thành Mèo"
 *         originalTitle:
 *           type: string
 *         poster:
 *           type: string
 *         thumb:
 *           type: string
 *         year:
 *           type: integer
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         country:
 *           type: array
 *           items:
 *             type: string
 *         quality:
 *           type: string
 *         language:
 *           type: string
 *         currentEpisode:
 *           type: string
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         totalItems:
 *           type: integer
 *         itemsPerPage:
 *           type: integer
 */

// ── Routes ──────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/movies/new:
 *   get:
 *     summary: Phim mới cập nhật
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Danh sách phim mới
 */
router.get('/new', validatePage, movieController.getNewMovies);

/**
 * @swagger
 * /api/v1/movies/list/{slug}:
 *   get:
 *     summary: Danh sách phim theo loại (phim-bo, phim-le, hoat-hinh, tv-shows)
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Danh sách phim
 */
router.get('/list/:slug', [...validateSlug, ...validatePage], movieController.getMoviesByList);

/**
 * @swagger
 * /api/v1/movies/detail/{slug}:
 *   get:
 *     summary: Chi tiết phim (bao gồm danh sách tập)
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phim
 *       404:
 *         description: Không tìm thấy phim
 */
router.get('/detail/:slug', validateSlug, movieController.getMovieDetail);

/**
 * @swagger
 * /api/v1/movies/genre/{slug}:
 *   get:
 *     summary: Phim theo thể loại
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "hanh-dong"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Phim theo thể loại
 */
router.get('/genre/:slug', [...validateSlug, ...validatePage], movieController.getByGenre);

/**
 * @swagger
 * /api/v1/movies/country/{slug}:
 *   get:
 *     summary: Phim theo quốc gia
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "nhat-ban"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Phim theo quốc gia
 */
router.get('/country/:slug', [...validateSlug, ...validatePage], movieController.getByCountry);

/**
 * @swagger
 * /api/v1/movies/year/{year}:
 *   get:
 *     summary: Phim theo năm phát hành
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2025
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Phim theo năm
 */
router.get('/year/:year', [...validateYear, ...validatePage], movieController.getByYear);

/**
 * @swagger
 * /api/v1/movies/search:
 *   get:
 *     summary: Tìm kiếm phim
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *           example: "naruto"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Kết quả tìm kiếm
 */
router.get('/search', validateSearch, movieController.searchMovies);

module.exports = router;
