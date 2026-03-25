/**
 * Guest Session ID Generator
 * Dùng để phân biệt guest user (phục vụ analytics & lịch sử nếu cần mở rộng)
 */

import { v4 as uuidv4 } from 'uuid';

const GUEST_ID_KEY = 'anime3d_session_id';

export const getGuestId = () => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = uuidv4();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
};

export const clearGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
};
