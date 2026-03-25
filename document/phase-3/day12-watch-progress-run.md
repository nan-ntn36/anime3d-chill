# Hướng dẫn chạy Ngày 12: Watch Progress (Đồng bộ thời gian xem phim)

## Yêu cầu phần mềm
- Backend chạy MySQL, Node.js (`npm run dev:server`).
- Frontend Vite `npm run dev:client`.
- Đã config đúng đường dẫn API KKPhim và database.

## Từng bước chạy & Kiểm tra kết quả

### 1. Kịch bản Khách (Guest)
1. Mở trình duyệt ẩn danh vào localhost.
2. Mở vào một phim bất kỳ, bấm **Phát**.
3. Xem trên 30s, hoặc tua nhanh thanh thời gian (progress bar) đến phút thứ 10. Chờ 15s để hệ thống kích hoạt tự động lưu (auto-save).
4. F5 tải lại trang.
5. **Kỳ vọng:** Video player sẽ tự động `seek` đến phút thứ 10 (thực tế lùi lại 5s là `09:55` để khán giả dễ định hình bối cảnh).
6. Khách đóng trình duyệt mở lại, localStorage giữ mốc thời gian đó cho tập phim đã xem. Dữ liệu lưu trong biến localStorage: `anime3d_watch_progress`.

### 2. Kịch bản Đăng Nhập (Member/User)
1. Đăng nhập một tài khoản (vd: `admin@anime3d.com`).
2. Mở `/phim/slug-phim` và bật tập 1.
3. Tua lên phút 20. Chờ 15 giây hoặc bấm tạm dừng để API `POST /api/v1/me/history` được kích hoạt.
4. Mở Tab Network trong DevTools xác nhận API trả về `200 OK` với body chứa `lastPositionSeconds`.
5. Đổi trình duyệt (Sang Edge/Firefox hoặc Mobile) → Đăng nhập cùng tài khoản. 
6. Mở lại phim → Xem trực tiếp từ phút 20 trên mọi thiết bị.

### 3. Kịch bản Đồng bộ (Sync)
- Khi một khách hàng xem ẩn danh tạo ra rất nhiều lịch sử ở LocalStorage, và sau đó họ đăng ký/đăng nhập.
- Sau khi Login thành công, Web gọi hook `syncHistoryToServer()` đẩy cục mảng localStorage gọi lên `POST /api/v1/me/history/sync`.
- Máy chủ sẽ upsert mảng lịch sử này vào DB (chỉ ghi đè nếu thời gian ở Local > thời gian đã có trong DB).
- Kết quả: Không bị mất lịch sử khi tạo tài khoản mới.

## Troubleshooting

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| Lỗi Upsert Duplicate Entry API `/history` | Bảng `watch_history` có index unique `(userId, movieSlug, episode)` nên nếu logic findAll rớt có thể bị `SQL_ERROR`. | Trong hàm `saveHistory`, ta đã sử dụng `findOrCreate` kèm `defaults` cập nhật biến đổi sau khối promise nên tuyệt đối an toàn. |
| Video không tự lùi thời gian khi F5 | `MANIFEST_PARSED` event chưa gán startTime. | Đã cấu hình tại `usePlayer.js` nhận tham số `options.startTime` ở cả luồng HLS Native (Safari) và HLS.js. |

## Môi trường & Database
Bảng `watch_history` đã migration sãn từ Phase 1. Không cần chạy gì thêm.
