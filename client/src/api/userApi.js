/**
 * User API
 * Profile, favorites, watch history
 */

import api from './axiosConfig';

const userApi = {
  /**
   * Cập nhật profile
   * @param {{ username?: string, avatar?: string }} data
   */
  updateProfile: (data) => api.patch('/me/profile', data),

  /**
   * Lấy danh sách phim yêu thích
   * @param {number} page
   */
  getFavorites: (page = 1) => api.get('/me/favorites', { params: { page } }),

  /**
   * Thêm phim yêu thích
   * @param {{ movieSlug: string, movieName: string, movieThumb?: string }} data
   */
  addFavorite: (data) => api.post('/me/favorites', data),

  /**
   * Xóa phim yêu thích
   * @param {string} movieSlug
   */
  removeFavorite: (movieSlug) => api.delete(`/me/favorites/${movieSlug}`),

  /**
   * Lấy lịch sử xem
   * @param {number} page
   */
  getHistory: (page = 1) => api.get('/me/history', { params: { page } }),

  /**
   * Lưu tiến trình xem
   * @param {object} data
   */
  saveHistory: (data) => api.post('/me/history', data),

  /**
   * Đồng bộ batch lịch sử (merge localStorage)
   * @param {Array} items
   */
  syncHistory: (items) => api.post('/me/history/sync', { items }),
};

export default userApi;
