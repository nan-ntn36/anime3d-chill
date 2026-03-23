/**
 * Auth API
 * register, login, refresh, logout, getMe
 */

import api from './axiosConfig';

const authApi = {
  /**
   * Đăng ký tài khoản mới
   * @param {{ username: string, email: string, password: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Đăng nhập
   * @param {{ email: string, password: string }} data
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Làm mới access token (dùng cookie refreshToken)
   */
  refresh: () => api.post('/auth/refresh'),

  /**
   * Đăng xuất
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Đăng xuất tất cả thiết bị
   */
  logoutAll: () => api.post('/auth/logout-all'),

  /**
   * Lấy thông tin user hiện tại
   */
  getMe: () => api.get('/auth/me'),
};

export default authApi;
