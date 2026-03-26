import useAuthStore from '../store/authStore';
import userApi from '../api/userApi';

const PROGRESS_KEY = 'anime3d_watch_progress';
const HISTORY_KEY = 'anime3d_watch_history';

// Helper: load from localStorage
const loadLocalProgress = () => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    return {};
  }
};

const saveLocalProgress = (data) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save watch progress to localStorage', err);
  }
};

/**
 * Lưu tiến độ xem vào localStorage (hoặc gọi API nếu đã login)
 */
export const saveProgress = async ({ movieSlug, movieName, movieThumb, episode, serverName, currentTime, duration }) => {
  if (currentTime <= 30 || duration <= 0) return; // Chỉ lưu khi xem > 30s
  
  const isAuthenticated = useAuthStore.getState().isAuthenticated;
  const progressData = {
    movieSlug,
    movieName,
    movieThumb,
    episode,
    serverName,
    currentTime: Math.floor(currentTime),
    duration: Math.floor(duration),
    updatedAt: Date.now()
  };

  // 1. Lưu local phục vụ xem tiếp nhanh
  const progressMap = loadLocalProgress();
  const key = `${movieSlug}:${episode}`;
  progressMap[key] = progressData;
  saveLocalProgress(progressMap);

  // 2. Nếu đã đăng nhập, gửi gọi API
  if (isAuthenticated) {
    try {
      await userApi.saveHistory({
        movieSlug,
        movieName,
        movieThumb,
        episode,
        serverName,
        duration: Math.floor(duration),
        lastPositionSeconds: Math.floor(currentTime)
      });
    } catch (error) {
      console.error('Lỗi khi lưu lịch sử lên server', error);
      // Fallback là local đã lưu được
    }
  }
};

/**
 * Láy tiến độ xem hiện tại của một phim (local)
 */
export const getProgress = (movieSlug, episode) => {
  const progressMap = loadLocalProgress();
  const key = `${movieSlug}:${episode}`;
  return progressMap[key] || null;
};

/**
 * Đồng bộ localStorage lên server sau khi đăng nhập thành công
 */
export const syncHistoryToServer = async () => {
  const progressMap = loadLocalProgress();
  const keys = Object.keys(progressMap);
  
  if (keys.length === 0) return;

  const historyBatch = keys.map(key => ({
    movieSlug: progressMap[key].movieSlug,
    movieName: progressMap[key].movieName,
    movieThumb: progressMap[key].movieThumb,
    episode: progressMap[key].episode,
    serverName: progressMap[key].serverName,
    duration: progressMap[key].duration,
    lastPositionSeconds: progressMap[key].currentTime,
    updatedAt: progressMap[key].updatedAt
  }));

  try {
    await userApi.syncHistory(historyBatch);
    // Sau khi sync thành công có thể xóa local hoặc giữ lại cũng được (ưu tiên server)
    localStorage.removeItem(PROGRESS_KEY);
  } catch (error) {
    console.error('Sync history failed', error);
  }
};

/**
 * Lưu lịch sử xem (visit) — dùng cho embed mode khi không track được progress
 * Khác saveProgress: không cần currentTime > 30s, chỉ ghi nhận user đã mở xem tập này
 */
export const saveWatchVisit = async ({ movieSlug, movieName, movieThumb, episode, serverName }) => {
  if (!movieSlug || !episode) return;

  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  // Lưu vào localStorage history
  const progressMap = loadLocalProgress();
  const key = `${movieSlug}:${episode}`;
  if (!progressMap[key]) {
    progressMap[key] = {
      movieSlug, movieName, movieThumb, episode, serverName,
      currentTime: 0, duration: 0, updatedAt: Date.now()
    };
    saveLocalProgress(progressMap);
  }

  // Nếu đã đăng nhập, gửi API
  if (isAuthenticated) {
    try {
      await userApi.saveHistory({
        movieSlug, movieName, movieThumb, episode, serverName,
        duration: 0,
        lastPositionSeconds: 0
      });
    } catch (error) {
      console.error('Lỗi khi lưu lịch sử visit lên server', error);
    }
  }
};

