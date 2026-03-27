/**
 * useAuth — Admin simplified auth hook
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '@api/authApi';
import useAuthStore from '@store/authStore';

export default function useAuth() {
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useAuthStore();

  const hasSession = typeof window !== 'undefined' && localStorage.getItem('adminSession') === '1';

  const { isLoading: isCheckingAuth } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) {
          try {
            const { data: refreshData } = await authApi.refresh();
            useAuthStore.getState().setAccessToken(refreshData.data.accessToken);
          } catch {
            localStorage.removeItem('adminSession');
            useAuthStore.getState().clearAuth();
            useAuthStore.getState().setLoaded();
            throw new Error('Not authenticated');
          }
        }

        const { data } = await authApi.getMe();
        const userData = data.data.user ?? data.data;
        useAuthStore.getState().setAuth({
          user: userData,
          accessToken: useAuthStore.getState().accessToken,
        });
        return userData;
      } catch (error) {
        localStorage.removeItem('adminSession');
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().setLoaded();
        throw error;
      }
    },
    enabled: hasSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data;
      if (user.role !== 'admin') {
        clearAuth();
        throw new Error('Tài khoản không có quyền admin');
      }
      setAuth({ user, accessToken });
      localStorage.setItem('adminSession', '1');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem('adminSession');
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      localStorage.removeItem('adminSession');
      clearAuth();
      queryClient.clear();
    },
  });

  return {
    isCheckingAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
