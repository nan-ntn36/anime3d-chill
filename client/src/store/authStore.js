/**
 * Auth Store (Zustand)
 * Quản lý user, accessToken, trạng thái đăng nhập
 */

import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,   // true khi app đang check auth lần đầu

  // ── Actions ────────────────────────────────────────────

  /**
   * Set auth sau login/register thành công
   * @param {{ user: object, accessToken: string }} data
   */
  setAuth: ({ user, accessToken }) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  /**
   * Chỉ cập nhật accessToken (sau refresh)
   */
  setAccessToken: (accessToken) =>
    set({ accessToken }),

  /**
   * Cập nhật thông tin user
   */
  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  /**
   * Clear auth (logout / token expired)
   */
  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  /**
   * Tắt loading sau khi kiểm tra auth xong
   */
  setLoaded: () =>
    set({ isLoading: false }),
}));

export default useAuthStore;
