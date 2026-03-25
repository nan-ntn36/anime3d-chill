# Hướng dẫn chạy Ngày 08: Banner Cao Cấp (CSS High-Fidelity)

## Hệ Thống & Yêu Cầu
- **Frontend Framework**: React 18
- **Tooling**: Vite, Turborepo (Node >= 18)
- **Data Source**: Backend proxy (`http://localhost:5000/api/v1`) lấy từ KKPhim.

## Cách Khởi Chạy Môi Trường

### 🐳 Cách 1: Chạy Bằng Docker (Khuyên Dùng)
1. Đảm bảo Docker desktop đang bật.
2. Build và start lại container sau những thay đổi:
```bash
docker compose down -v
docker compose up --build -d
```
3. Chờ log báo frontend chạy ở cổng 3000 (khoảng 30 giây-1 phút).

### 💻 Cách 2: Chạy Local trực tiếp
1. Mở terminal, vào thư mục gốc `anime3d-chill`:
```bash
npm install
npm run dev
```

## Kiểm Tra Kết Quả (Verification)
1. Mở trình duyệt: `http://localhost:3000`
2. **Kỳ vọng hiển thị Hero Banner**:
   - Banner rộng full màn hình (100vw).
   - Nội dung nằm bên trong Container, cùng trục với danh sách phim (`MovieGrid`) bên dưới.
   - Dải `ANIME TRENDING` màu vàng nổi bật, đi kèm thông tin năm và tập phim.
   - Nút "XEM NGAY" có viền chuyển màu sáng. Nút "LƯU LẠI" là kính làm mờ (`backdrop-filter`) theo chuẩn Glassmorphism.
   - Ảnh nền phía sau hiển thị ảnh ngang của phim (`thumb`), góc dưới bên phải là danh sách ảnh dọc (`poster`) để chọn trượt slide.
   - Thanh tiến trình nằm theo chiều dọc chuyển sang ngang dưới cụm ảnh nhỏ.

## Troubleshooting (Xử Lý Sự Cố)

| Vấn Đề | Nguyên Nhân | Giải Pháp |
|---|---|---|
| Hình nền bị phóng to, vỡ hạt | CSS `object-fit: cover` kéo dãn ảnh dọc (poster) trên màn 16:9 ngang | Đã xử lý ở code bằng cách gọi ưu tiên `movie.thumb` thay vì `movie.poster`. Đảm bảo API trả về phim có `thumb_url`. |
| Text giới thiệu bị lỗi không hiển thị | Phim lấy ra từ mảng `items` ban đầu không có trường `content` | Đã thêm fallback giới thiệu chung về chất lượng "Trải nghiệm thế giới anime..." tự động gắn tên phim vào. |
| Hiệu ứng mờ không hoạt động trên nút | Browser cũ chưa hỗ trợ `-webkit-backdrop-filter` | Update trình duyệt hoặc check xem cấu hình tiết kiệm tài nguyên trên máy có chặn CSS effects. |

## Thao Tác Môi Trường
- Bật/tắt ảnh hưởng: Tính năng 3D trước đó (WebGL) đã được loại bỏ và thay bằng CSS để tăng tốc độ phản hồi. Không cần cấu hình đặc thù ngoài `.env` cũ.
