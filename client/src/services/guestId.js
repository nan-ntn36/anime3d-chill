/**
 * Guest Session ID Generator
 * Dùng để phân biệt guest user (phục vụ analytics & lịch sử)
 * Sử dụng crypto.randomUUID() (native browser API, không cần thư viện)
 */

const GUEST_ID_KEY = 'anime3d_session_id';

export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};
