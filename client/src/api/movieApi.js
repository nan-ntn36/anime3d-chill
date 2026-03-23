/**
 * Movie API
 * Tất cả endpoints liên quan đến phim
 * (Sẽ triển khai đầy đủ ở Day 6 khi có backend movie routes)
 */

import api from './axiosConfig';

const movieApi = {
  /**
   * Phim mới cập nhật
   * @param {number} page
   */
  getNew: (page = 1) => api.get('/movies/new', { params: { page } }),

  /**
   * Chi tiết phim theo slug
   * @param {string} slug
   */
  getDetail: (slug) => api.get(`/movies/${slug}`),

  /**
   * Tìm kiếm phim
   * @param {string} keyword
   * @param {number} page
   */
  search: (keyword, page = 1) => api.get('/movies/search', { params: { keyword, page } }),

  /**
   * Phim theo thể loại
   * @param {string} genreSlug
   * @param {number} page
   */
  getByGenre: (genreSlug, page = 1) => api.get(`/movies/the-loai/${genreSlug}`, { params: { page } }),

  /**
   * Phim theo quốc gia
   * @param {string} countrySlug
   * @param {number} page
   */
  getByCountry: (countrySlug, page = 1) => api.get(`/movies/quoc-gia/${countrySlug}`, { params: { page } }),

  /**
   * Phim theo năm
   * @param {number} year
   * @param {number} page
   */
  getByYear: (year, page = 1) => api.get(`/movies/nam/${year}`, { params: { page } }),

  /**
   * Phim theo loại (series, single, ...)
   * @param {string} type
   * @param {number} page
   */
  getByType: (type, page = 1) => api.get(`/movies/danh-sach/${type}`, { params: { page } }),
};

export default movieApi;
