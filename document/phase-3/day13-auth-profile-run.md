# Hướng dẫn chạy Ngày 13: Giao diện Auth & Cá Nhân (Day 13)

## Yêu cầu phần mềm
- Backend chạy MySQL, Node.js (`npm run dev:server`).
- Frontend Vite (`npm run dev:client`).

## Từng bước chạy & Kiểm tra kết quả

### 1. Đăng ký & Đăng nhập
1. Mở trang chủ: `http://localhost:3000`.
2. Kích vào nút **Đăng Nhập** trên thanh tiêu đề `Header`.
3. Nhập một email và password chưa từng tạo. Chọn tab **Đăng ký ngay** để mở Form Đăng ký.
4. Bấm đăng ký, hệ thống gọi API `authApi.register`, hiển thị màu xanh lá: "Đăng ký thành công! Đang chuyển sang..." 
5. Sau 1.5s, tự động đổi qua UI Đăng nhập. Nhập thông tin để Đăng nhập.
6. Khi đăng nhập thành công, URL sẽ quay ngược về trang trước đó nhờ tính năng `location.state.from`, hoặc về Trang chủ nếu vào trực tiếp. Màn hình tự tải Header có Avatar thay vì nút đăng nhập.
7. **Lưu ý Cực Kỳ Quan Trọng:** Ngay khoảnh khắc login, `watchProgressService.js` sẽ kích hoạt hàm `syncHistoryToServer()` tải toàn bộ bộ nhớ tạm (localStorage `anime3d_watch_progress`) lên Server. Giúp user ẩn danh ko bị mất lịch sử! 

### 2. Trang Cá Nhân (Profile Page) & Bảo Mật Route
1. Trỏ vào Avatar trên Header, Web đưa bạn vào URL `/ca-nhan` (`Profile.jsx`).
2. Tab Sidebar Mặc định hiển thị tab lịch sử, danh sách phim yêu thích.
3. Nếu mở Tab ẩn danh/Logout rồi cố tình nhập `/ca-nhan` trên URL:
   - Component `<ProtectedRoute>` sẽ phân tích `useAuthStore` hoặc call Query `getMe`.
   - Lập tức bắt Redirect `<Navigate to="/dang-nhap" replace />`. Tính năng bảo mật route Client-Side hoàn tất.

## Troubleshooting

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| F5 bị chớp giao diện Đăng nhập | Trạng thái React mặc định là `{ isAuthenticated: false }` | Đã config dùng `isCheckingAuth` kết hợp Zustand `isLoading = true` để render còi xoay Spinner thay vì chớp màn hình. |
| Register Form báo Error | Regex, độ dài chưa chuẩn hoặc trùng lặp Email MySQL | Giao diện đã móc `react-hook-form`, API Backend config trả chi tiết Message text -> Đẩy thẳng vào Alert UI của người dùng. |
