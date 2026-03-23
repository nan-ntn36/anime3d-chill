/**
 * UI Store (Zustand)
 * Quản lý trạng thái giao diện
 */

import { create } from 'zustand';

const useUiStore = create((set) => ({
  // ── State ──────────────────────────────────────────────
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  isModalOpen: false,
  modalContent: null,

  // ── Actions ────────────────────────────────────────────
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebar: (isOpen) =>
    set({ isSidebarOpen: isOpen }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setMobileMenu: (isOpen) =>
    set({ isMobileMenuOpen: isOpen }),

  /**
   * Mở modal với nội dung
   * @param {*} content - React component hoặc null
   */
  openModal: (content) =>
    set({ isModalOpen: true, modalContent: content }),

  closeModal: () =>
    set({ isModalOpen: false, modalContent: null }),
}));

export default useUiStore;
