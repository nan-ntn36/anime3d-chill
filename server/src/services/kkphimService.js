/**
 * KKPhim Service
 * Proxy tới phimapi.com với:
 * - Cache-first strategy (Redis → API → save cache)
 * - Retry (2 lần, exponential backoff)
 * - Circuit breaker (5 fails → ngắt 60s)
 * - Data transformation
 */

const axios = require('axios');
const env = require('../config/env');
const { cacheGet, cacheSet } = require('../utils/cache');
const { transformMovieList, transformMovieDetail } = require('./kkphimTransformer');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// ── Config ──────────────────────────────────────────────────
const API_BASE = env.kkphimApiUrl;
const TIMEOUT = 10000;        // 10s
const MAX_RETRIES = 2;

// ── Cache TTL (giây) ────────────────────────────────────────
const TTL = {
  NEW:      5 * 60,      // 5 phút
  LIST:     15 * 60,     // 15 phút
  DETAIL:   30 * 60,     // 30 phút
  GENRE:    15 * 60,
  COUNTRY:  15 * 60,
  YEAR:     15 * 60,
  SEARCH:   3 * 60,      // 3 phút
};

// ── Circuit Breaker ─────────────────────────────────────────
let failCount = 0;
let circuitOpenUntil = null;
const CB_THRESHOLD = 5;       // ngắt sau 5 fails
const CB_RESET_MS = 60000;    // mở lại sau 60s

function isCircuitOpen() {
  if (!circuitOpenUntil) return false;
  if (Date.now() > circuitOpenUntil) {
    // Half-open: cho phép thử 1 request
    circuitOpenUntil = null;
    failCount = 0;
    logger.info('🔄 Circuit breaker: half-open, allowing requests');
    return false;
  }
  return true;
}

function recordSuccess() {
  failCount = 0;
  circuitOpenUntil = null;
}

function recordFailure() {
  failCount++;
  if (failCount >= CB_THRESHOLD) {
    circuitOpenUntil = Date.now() + CB_RESET_MS;
    logger.warn(`🔴 Circuit breaker OPEN: ${failCount} consecutive failures, blocking for ${CB_RESET_MS / 1000}s`);
  }
}

// ── HTTP Client with Retry ──────────────────────────────────
async function fetchFromKKPhim(path, retries = MAX_RETRIES) {
  if (isCircuitOpen()) {
    throw new AppError(
      'Dịch vụ nguồn phim tạm thời không khả dụng',
      503,
      'UPSTREAM_ERROR'
    );
  }

  const url = `${API_BASE}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      const response = await axios.get(url, {
        timeout: TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Anime3D-Chill/1.0',
        },
      });
      const duration = Date.now() - start;

      logger.debug({ url, duration: `${duration}ms`, attempt }, 'KKPhim API response');
      recordSuccess();

      return response.data;
    } catch (error) {
      const status = error.response?.status;

      // 4xx → lỗi client, không retry, không circuit breaker
      if (status && status >= 400 && status < 500) {
        logger.warn({ url, status }, 'KKPhim API client error');
        if (status === 404) {
          throw new AppError('Không tìm thấy nội dung', 404, 'RESOURCE_NOT_FOUND');
        }
        throw new AppError('Yêu cầu không hợp lệ', 400, 'VALIDATION_ERROR');
      }

      // 5xx hoặc timeout → retry
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        recordFailure();
        logger.error({
          url,
          attempt,
          status,
          message: error.message,
        }, 'KKPhim API failed after retries');

        throw new AppError(
          'Không thể lấy dữ liệu phim từ nguồn',
          502,
          'UPSTREAM_ERROR'
        );
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 500; // 500ms, 1000ms
      logger.warn({ url, attempt, delay }, 'KKPhim API retry');
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ── Cache-First Strategy ────────────────────────────────────

/**
 * Wrapper: cache-first → fetch → transform → cache
 */
async function cachedFetch(cacheKey, apiPath, ttl, transformer) {
  // 1. Kiểm tra cache
  const cached = await cacheGet(cacheKey);
  if (cached) {
    logger.debug({ cacheKey }, 'Cache HIT');
    return cached;
  }

  // 2. Gọi API nguồn
  logger.debug({ cacheKey, apiPath }, 'Cache MISS, fetching from KKPhim');
  const rawData = await fetchFromKKPhim(apiPath);

  // 3. Transform
  const transformed = transformer(rawData);

  // 4. Lưu cache (fire-and-forget)
  cacheSet(cacheKey, transformed, ttl).catch(() => {});

  return transformed;
}

// ── Public Methods ──────────────────────────────────────────

/**
 * Phim mới cập nhật
 * KKPhim: GET /danh-sach/phim-moi-cap-nhat?page=
 */
async function getNewMovies(page = 1) {
  return cachedFetch(
    `movies:new:page:${page}`,
    `/danh-sach/phim-moi-cap-nhat?page=${page}`,
    TTL.NEW,
    transformMovieList
  );
}

/**
 * Danh sách phim theo slug (phim-bo, phim-le, hoat-hinh, ...)
 * KKPhim: GET /v1/api/danh-sach/{slug}?page=
 */
async function getMoviesByList(slug, page = 1) {
  return cachedFetch(
    `movies:list:${slug}:page:${page}`,
    `/v1/api/danh-sach/${slug}?page=${page}`,
    TTL.LIST,
    transformMovieList
  );
}

/**
 * Chi tiết phim
 * KKPhim: GET /phim/{slug}
 */
async function getMovieDetail(slug) {
  return cachedFetch(
    `movies:detail:${slug}`,
    `/phim/${slug}`,
    TTL.DETAIL,
    transformMovieDetail
  );
}

/**
 * Phim theo thể loại
 * KKPhim: GET /v1/api/the-loai/{slug}?page=
 */
async function getByGenre(slug, page = 1) {
  return cachedFetch(
    `movies:genre:${slug}:page:${page}`,
    `/v1/api/the-loai/${slug}?page=${page}`,
    TTL.GENRE,
    transformMovieList
  );
}

/**
 * Phim theo quốc gia
 * KKPhim: GET /v1/api/quoc-gia/{slug}?page=
 */
async function getByCountry(slug, page = 1) {
  return cachedFetch(
    `movies:country:${slug}:page:${page}`,
    `/v1/api/quoc-gia/${slug}?page=${page}`,
    TTL.COUNTRY,
    transformMovieList
  );
}

/**
 * Phim theo năm
 * KKPhim: GET /v1/api/nam/{year}?page=
 */
async function getByYear(year, page = 1) {
  return cachedFetch(
    `movies:year:${year}:page:${page}`,
    `/v1/api/nam/${year}?page=${page}`,
    TTL.YEAR,
    transformMovieList
  );
}

/**
 * Tìm kiếm phim
 * KKPhim: GET /v1/api/tim-kiem?keyword=&page=
 */
async function searchMovies(keyword, page = 1) {
  const safeKw = encodeURIComponent(keyword.trim().toLowerCase());
  return cachedFetch(
    `movies:search:${safeKw}:page:${page}`,
    `/v1/api/tim-kiem?keyword=${safeKw}&page=${page}`,
    TTL.SEARCH,
    transformMovieList
  );
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
