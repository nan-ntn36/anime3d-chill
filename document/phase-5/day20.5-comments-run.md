# Ngày 20.5: Tính năng Bình luận (Comments) — Hướng Dẫn Chạy

> Hướng dẫn setup và test các tính năng comment, hiển thị reply trực tiếp trên phim.

---

## 1. Yêu Cầu & Cấu Hình Môi Trường
Tính năng Bình luận yêu cầu:
- **Database (MySQL)**: Backend sẽ tự động load Sequelize module `Comment.js` và cập nhật cấu trúc thông qua hàm `syncModels`. Các ràng buộc khoá ngoại giữa `users` và `comments` sẽ được tạo ra (Mặc định khi bạn chạy docker `anime3d-server`).
- Bắt buộc phải có token từ User đã **đăng nhập thành công** thì mới có quyền viết Comment (POST) trên Web. Nếu chưa đăng nhập, giao diện Client sẽ chuyển thành ô khoá Login.

---

## 2. Cách Test & Chạy Thử
**Khởi tạo Database (Nếu không dùng Docker Sync sẵn)**
```bash
docker compose up -d server
# Hoặc ở client bạn F5 để Vite nạp query react mới
```

**Thử nghiệm trên UI:**
1. Truy cập vào giao diện Web (http://localhost:5173).
2. Tìm một phim bất kỳ (Ví dụ `/phim/dau-pha-thuong-khung`). Cuộn xuống dưới, mục **Bình Luận** sẽ lộ diện.
3. Nếu bạn bấm test dưới dạng Khách chưa login, hãy để ý dòng "Vui lòng đăng nhập" nhé.
4. Đăng nhập với ID có sẵn (VD: `test@test.com` - `123456Aa@`).
5. Vào phim, gửi "Phim này đồ hoạ đỉnh thật!". Nhấn Gửi -> Nhận Toast Success, UI tự chèn bình luận xuống (Bình luận Root, màu chữ Trắng cho tên).
6. Khi thấy mục Phản hồi bên dưới bình luận -> Điền test "Review chuẩn đấy" -> Gửi -> Ra giao diện chắp nhánh con (Reply).

### Test Dữ Liệu API Trực Tiếp (Curl/Postman)

**Thêm bình luận (Cần Bearer token):**
```bash
curl -X POST http://localhost:8000/api/v1/comments \
-H "Authorization: Bearer <ACCESS_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"movieSlug": "dau-pha-thuong-khung", "content": "Review!"}'
```

---

## 3. Khắc Phục Gặp Lỗi (Troubleshooting)
1. **Lỗi báo `RATE_LIMIT_EXCEEDED`**: Server chặn quá nhiều request comment từ cùng 1 IP (5 bình luận/ 2 phút). Vui lòng chở ít phút rồi comment lại.
2. **Lỗi `Parent_id doesn't exist`**: Lúc Frontend gửi Reply truyền nhầm parentId đã bị xoá. Hoặc comment bị khoá.
3. **Màn hình Frontend Error ("Lỗi tải bình luận")**: Network bị chặn hoặc `commentRoutes` chưa gắn kĩ vào `v1/index.js`. Vui lòng restart server Docker.
