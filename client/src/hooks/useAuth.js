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
  // Chỉ chạy khi user đã từng login (có flag trong localStorage)
  const hasSession = typeof window !== 'undefined' && localStorage.getItem('hasSession') === '1';

  const { data: user, isLoading: isCheckingAuth, refetch: checkAuth } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        // Nếu chưa có accessToken (vd: sau reload), refresh trước
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) {
          try {
            const { data: refreshData } = await authApi.refresh();
            useAuthStore.getState().setAccessToken(refreshData.data.accessToken);
          } catch {
            // Refresh fail → xóa flag, chưa đăng nhập
            localStorage.removeItem('hasSession');
            useAuthStore.getState().clearAuth();
            useAuthStore.getState().setLoaded();
            throw new Error('Chưa đăng nhập');
          }
        }

        const { data } = await authApi.getMe();
        const userData = data.data;
        useAuthStore.getState().setAuth({
          user: userData,
          accessToken: useAuthStore.getState().accessToken,
        });
        return userData;
      } catch (error) {
        localStorage.removeItem('hasSession');
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().setLoaded();
        throw new Error('Chưa đăng nhập');
      }
    },
    enabled: hasSession, // ← Không gọi nếu chưa từng login
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // ── 2. Login ───────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: async (response) => {
      const { user, accessToken } = response.data.data;
      setAuth({ user, accessToken });
      localStorage.setItem('hasSession', '1'); // ← Đánh dấu đã login
      
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
      localStorage.removeItem('hasSession'); // ← Xóa flag
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      localStorage.removeItem('hasSession');
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
