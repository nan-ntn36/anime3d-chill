# Hướng dẫn chạy Ngày 13 (Phần 2): Yêu Thích & Hồ Sơ Cá Nhân

## Chức Năng Đạt Được
- Bộ API Backend quản lý Danh sách Yêu Thích (CRUD).
- API Backend quản lý Cập nhật Profile.
- Trang Cá Nhân (Profile Dashboard) móc nối data thật từ Server.

## Hướng Dẫn Kịch Bản Test (Test Case)

### 1. Thêm Phim Yêu Thích ngay trên Trang Chủ
1. Đăng nhập vào một tài khoản.
2. Tại nút `LƯU LẠI` khổng lồ ở HeroBanner (Trang chủ) -> Cứ việc bấm nút LƯU LẠI. 
3. Xem nút chuyển trạng thái thành `[X] ĐÃ LƯU` và icon trái tim nổi màu vàng.
4. Mở Tab Network trong trình duyệt, bạn sẽ thấy React Query kích hoạt lệnh `POST /api/v1/me/favorites`.

### 2. Kiểm Trả Thùng Phim Cá Nhân (Trang Profile)
1. Bấm vào Avatar góc trên bên phải → Bảng điều hướng sang `/ca-nhan`.
2. Theo mặc định, Sidebar trái đang ở mục **Lịch Sử Xem Phim**, màn hình giữa lúc này Render ra một lưới `MovieGrid` các phim bạn vừa xem (Ở day 12).
3. Bấm sang mục Sidebar **Phim Yêu Thích** (có chữ trái tim).
4. Phim mà bạn vừa bấm "Lưu Lại" ngoài trang chủ chắc chắn sẽ nằm chình ình trong cái bảng Grid này.
5. Nếu bạn có hơn `20` phim xem/yêu thích, phía dưới Web tự động bung bộ `Pagination` phân trang hoàn hảo nhờ thuộc tính `meta.totalPages` của API trả về.

### 3. Cập nhật Profile
Chức năng `PATCH /api/v1/me/profile` đã viết Controller, Validators và map vào Routes. Cắm Postman test nếu cần thiết. 
*(UI form Update Password sẽ nằm ở các ngày Maintenance tùy chọn)*.

## Troubleshooting

| Sự cố | Mô tả do Bug | Giải pháp mình đã code vào Source |
|---|---|---|
| Lấy Data Rỗng | `userApi.js` trả về Object nằm trong `data.data` thay vì mảng trơn | Code sử dụng cú pháp map dữ liệu an toàn `historyData?.data?.map()` |
| React Hook Rules Lỗi | API Favorite gọi Hook trong Loop map() ở `HeroBanner` sẽ giết Server | Mình đã thông minh trỏ Hook `useFavoriteToggle` cố định 1 chỗ dùng `activeMovie` chỉ point tới item đang hoạt động hiện tại trên Cờ. Đảm bảo UI Clean mà không bao giờ vỡ Render. |
