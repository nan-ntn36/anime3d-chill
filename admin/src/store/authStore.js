import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: ({ user, accessToken }) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoaded: () =>
    set({ isLoading: false }),
}));

export default useAuthStore;
