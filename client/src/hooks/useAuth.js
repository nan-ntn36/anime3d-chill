/**
 * useAuth Hook
 * Cung cấp các hàm mutation (login, register, logout) tích hợp với Zustand
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '../api/authApi';
import useAuthStore from '../store/authStore';
import { syncHistoryToServer } from '../services/watchProgressService';

export default function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  // ── 1. Get Me (Check auth lần đầu) ──────────────────────────
  const { data: user, isLoading: isCheckingAuth, refetch: checkAuth } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { data } = await authApi.getMe();
        const userData = data.data;
        useAuthStore.getState().setUser(userData);
        useAuthStore.getState().setLoaded();
        return userData;
      } catch (error) {
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().setLoaded();
        throw new Error('Chưa đăng nhập');
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // ── 2. Login ───────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: async (response) => {
      const { user, accessToken } = response.data.data;
      setAuth({ user, accessToken });
      
      // Đồng bộ lịch sử xem ẩn danh (nếu có) lên server
      await syncHistoryToServer();
    },
  });

  // ── 3. Register ────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (credentials) => authApi.register(credentials),
    onSuccess: () => {
      // Thành công => Chuyển sang form Login hoặc tự động login tùy UX
    },
  });

  // ── 4. Logout ──────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Xóa tất cả cache
    },
    onError: () => {
      // Dù API fail cũng clear auth dưới client
      clearAuth();
      queryClient.clear();
    }
  });

  return {
    user,
    isCheckingAuth,
    checkAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
