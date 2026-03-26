/**
 * Movie API
 * Tất cả endpoints liên quan đến phim
 * URLs khớp với backend routes (Day 6)
 */

import api from './axiosConfig';

const movieApi = {
  /**
   * Phim mới cập nhật
   */
  getNew: (page = 1) => api.get('/movies/new', { params: { page } }),

  /**
   * Danh sách theo loại (phim-bo, phim-le, hoat-hinh, tv-shows)
   */
  getByList: (slug, page = 1) => api.get(`/movies/list/${slug}`, { params: { page } }),

  /**
   * Chi tiết phim theo slug
   */
  getDetail: (slug) => api.get(`/movies/detail/${slug}`),

  /**
   * Tìm kiếm phim
   */
  search: (keyword, page = 1) => api.get('/movies/search', { params: { keyword, page } }),

  /**
   * Phim theo thể loại
   */
  getByGenre: (slug, page = 1) => api.get(`/movies/genre/${slug}`, { params: { page } }),

  /**
   * Phim theo quốc gia
   */
  getByCountry: (slug, page = 1) => api.get(`/movies/country/${slug}`, { params: { page } }),

  /**
   * Phim theo năm
   */
  getByYear: (year, page = 1) => api.get(`/movies/year/${year}`, { params: { page } }),

  /**
   * Tất cả phim (AllPhim / ThungPhim)
   */
  getAll: (page = 1) => api.get('/movies/all', { params: { page } }),

  /**
   * Danh sách thể loại + thumbnail
   */
  getGenres: () => api.get('/movies/genres'),

  /**
   * Danh sách quốc gia + thumbnail
   */
  getCountries: () => api.get('/movies/countries'),

  /**
   * Ghi nhận lượt xem phim (analytics)
   * @param {{ movieSlug: string, sessionId: string }} data
   */
  recordView: (data) => api.post('/movies/view', data),
};

export default movieApi;
