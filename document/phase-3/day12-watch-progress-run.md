# Hướng dẫn chạy Ngày 12: Watch Progress & History

## Yêu cầu

- Docker đang chạy (`docker compose up --build`)
- MySQL + Redis đã khởi tạo, bảng `watch_history` đã migration sẵn từ Phase 1
- Frontend và Backend đang hoạt động tại `localhost:3000` và `localhost:5000`

## Kịch bản kiểm thử

### 1. Kịch bản Khách (Guest — Không đăng nhập)

1. Mở trình duyệt ẩn danh → `http://localhost:3000`
2. Chọn phim bất kỳ → Vào **Xem phim**
3. **Nếu m3u8 mode** (video custom controls): Xem trên 30s hoặc tua đến phút 10. Chờ ≥15s để auto-save kích hoạt.
4. **Nếu embed mode** (iframe player): Lịch sử "đã xem" được ghi ngay khi mở tập → kiểm tra localStorage.
5. Mở DevTools → Application → Local Storage → tìm key `anime3d_watch_progress`

**Kỳ vọng:**
- Thấy record có format: `{ movieSlug: "...", episode: "...", currentTime: X, duration: Y }`
- Với embed mode: `currentTime: 0, duration: 0` (chỉ ghi nhận visit)
- Với m3u8 mode: `currentTime > 30, duration > 0`

6. F5 tải lại trang (m3u8 mode):

**Kỳ vọng:** Video tự seek đến mốc đã lưu trừ 5 giây (VD: lưu ở 10:00 → seek đến 9:55)

### 2. Kịch bản Đăng Nhập (Member/User)

1. Đăng nhập tài khoản (VD: `admin@anime3d.com`)
2. Mở phim → xem hoặc chỉ cần mở tập (embed mode)
3. Mở DevTools → Network → lọc `history`

**Kỳ vọng:**
- Thấy request `POST /api/v1/me/history` trả `200 OK`
- Response body chứa `data.movieSlug`, `data.lastPositionSeconds`, `data.watchedAt`

4. Vào **Profile** → Tab **Lịch sử**

**Kỳ vọng:**
- Hiển thị phim vừa xem với poster thumbnail
- Sắp xếp theo `watchedAt` (mới nhất đầu tiên)

5. Đổi trình duyệt → Đăng nhập cùng tài khoản → Mở lại phim

**Kỳ vọng:** Xem tiếp từ mốc đã lưu trên server (đồng bộ đa thiết bị)

### 3. Kịch bản Đồng Bộ (Sync sau Login)

1. Xem phim ẩn danh → tạo nhiều lịch sử trong localStorage
2. Đăng ký / Đăng nhập tài khoản
3. Mở DevTools → Network → tìm `POST /api/v1/me/history/sync`

**Kỳ vọng:**
- Request gửi: `{ items: [{movieSlug, episode, lastPositionSeconds, ...}, ...] }`
- Response: `{ success: true, data: { syncedCount: N } }`
- localStorage key `anime3d_watch_progress` bị xóa sau sync thành công
- Vào Profile → Lịch sử → thấy toàn bộ phim đã xem khi ẩn danh

## API Endpoints

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/api/v1/me/history` | `{ movieSlug, movieName, movieThumb, episode, serverName, duration, lastPositionSeconds }` | Lưu/cập nhật 1 record |
| GET | `/api/v1/me/history?page=1` | — | Lấy lịch sử xem (phân trang, 20/page) |
| POST | `/api/v1/me/history/sync` | `{ items: [...] }` | Đồng bộ batch từ localStorage |

## Troubleshooting

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Lịch sử trống dù đã xem phim | Player dùng embed mode → `saveProgress()` bị skip vì `currentTime ≤ 30` | Đã fix: `saveWatchVisit()` ghi nhận visit ngay cả embed mode |
| `syncHistory` không đồng bộ dữ liệu | Frontend gửi `{ items }`, backend đọc `historyBatch` | Đã fix: backend đổi sang `const { items: historyBatch } = req.body` |
| Video không tự seek khi F5 | `MANIFEST_PARSED` event chưa gán startTime | Đã cấu hình tại `usePlayer.js` nhận `options.startTime` ở cả HLS.js và Safari native |
| Lỗi Upsert Duplicate Entry | Unique index `(userId, movieSlug, episode)` | Dùng `findOrCreate` + update nên an toàn |
| Profile tab lịch sử không hiện | Chưa đăng nhập hoặc API lỗi | Kiểm tra token + Network tab |

## Các file liên quan

| File | Vai trò |
|------|---------|
| `client/src/services/watchProgressService.js` | Core logic: saveProgress, saveWatchVisit, getProgress, syncHistory |
| `client/src/pages/MoviePlayerPage.jsx` | Tích hợp timer + gọi save functions |
| `client/src/api/userApi.js` | HTTP calls: saveHistory, getHistory, syncHistory |
| `client/src/hooks/useAuth.js` | Gọi syncHistoryToServer sau login thành công |
| `client/src/pages/Profile.jsx` | Hiển thị tab lịch sử xem + pagination |
| `server/src/controllers/meController.js` | API handlers: saveHistory, getHistory, syncHistory |
| `server/src/routes/v1/meRoutes.js` | Route definitions: /me/history |
| `server/src/models/WatchHistory.js` | Sequelize ORM model |
