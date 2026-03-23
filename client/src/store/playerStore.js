/**
 * Player Store (Zustand)
 * Quản lý trạng thái video player
 */

import { create } from 'zustand';

const usePlayerStore = create((set) => ({
  // ── State ──────────────────────────────────────────────
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isTheaterMode: false,
  isFullscreen: false,
  isBuffering: false,
  error: null,

  // Thông tin tập / server đang xem
  currentEpisode: null,     // { slug, name, ... }
  currentServer: null,      // { name, link_m3u8 | link_embed }

  // ── Actions ────────────────────────────────────────────
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => {
    localStorage.setItem('anime3d_volume', String(volume));
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () =>
    set((state) => ({ isMuted: !state.isMuted })),

  toggleTheaterMode: () =>
    set((state) => ({ isTheaterMode: !state.isTheaterMode })),

  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setError: (error) => set({ error }),

  setEpisode: (currentEpisode) => set({ currentEpisode }),
  setServer: (currentServer) => set({ currentServer }),

  /**
   * Reset player state (khi rời trang phim)
   */
  resetPlayer: () =>
    set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      isFullscreen: false,
      error: null,
      currentEpisode: null,
      currentServer: null,
    }),

  /**
   * Load volume từ localStorage
   */
  loadSavedVolume: () => {
    const saved = localStorage.getItem('anime3d_volume');
    if (saved !== null) {
      set({ volume: parseFloat(saved) });
    }
  },
}));

export default usePlayerStore;
