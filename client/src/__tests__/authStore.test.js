/**
 * AuthStore Unit Tests
 * Test Zustand store state transitions: setAuth, clearAuth, setAccessToken, setUser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from '../../store/authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  describe('initial state', () => {
    it('should start with user=null and isLoading=true', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setAuth', () => {
    it('should set user, token, and mark authenticated', () => {
      const mockUser = { id: 1, username: 'john', email: 'john@test.com' };
      useAuthStore.getState().setAuth({
        user: mockUser,
        accessToken: 'jwt-token-123',
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('jwt-token-123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setAccessToken', () => {
    it('should update only the accessToken', () => {
      // Set initial auth
      useAuthStore.getState().setAuth({
        user: { id: 1, username: 'john' },
        accessToken: 'old-token',
      });

      // Update token
      useAuthStore.getState().setAccessToken('new-token');

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-token');
      expect(state.user.username).toBe('john'); // unchanged
      expect(state.isAuthenticated).toBe(true); // unchanged
    });
  });

  describe('setUser', () => {
    it('should update user and isAuthenticated', () => {
      useAuthStore.getState().setUser({ id: 2, username: 'jane' });

      const state = useAuthStore.getState();
      expect(state.user.username).toBe('jane');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated=false when user is null', () => {
      useAuthStore.getState().setAuth({
        user: { id: 1 },
        accessToken: 'token',
      });

      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should reset all auth state', () => {
      // Set auth first
      useAuthStore.getState().setAuth({
        user: { id: 1, username: 'john' },
        accessToken: 'jwt-token',
      });

      // Clear
      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false); // still false after clear
    });
  });

  describe('setLoaded', () => {
    it('should set isLoading to false', () => {
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoaded();

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('state transition flow: login → refresh → logout', () => {
    it('should handle full auth lifecycle', () => {
      const store = useAuthStore.getState();

      // Step 1: Login
      store.setAuth({
        user: { id: 1, username: 'john', email: 'john@test.com' },
        accessToken: 'access-1',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Step 2: Token refresh
      useAuthStore.getState().setAccessToken('access-2');
      expect(useAuthStore.getState().accessToken).toBe('access-2');
      expect(useAuthStore.getState().user.username).toBe('john'); // unchanged

      // Step 3: Logout
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
