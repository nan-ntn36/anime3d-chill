# Other Layout Updates Documentation

## Mục tiêu
Redesign giao diện và luồng hoạt động phần Frontend để giống với giao diện mẫu (`webfilm-swart.vercel.app`), bao gồm cải thiện Hero Banner, Card Effect, Layer Phim, Hệ thống API, Leaderboard, và tính năng Bình luận thành viên.

## Các thay đổi chính đã thực hiện

### 1. Hero Banner Size
- **File:** `client/src/components/home/HeroBanner.css`, `HeroBanner.jsx`
- **Chi tiết:** Đã xóa bỏ các hiệu ứng `blur` và scale background không cần thiết. Banner hiện tại đã fit toàn bộ container (`100% width/height`) và dùng chung `object-fit: cover` giúp hình nền sắc nét, chuẩn xác với kích thước màn hình cinematic 80vh-100vh của template mẫu.

### 2. Card Hover & Card Tĩnh
- **File:** `client/src/components/movie/MovieCard.jsx`, `MovieCard.css`
- **Chi tiết:** 
  - **Card Tĩnh:** Bỏ thuộc tính `display: none` của metadata, giúp thẻ hiển thị tiêu đề tĩnh.
  - **Card Hover:** Đã sử dụng hệ thống `movie-card__hover-panel` trượt ngang từ bên phải thẻ tĩnh. Cung cấp các thông tin nâng cao và nút `XEM NGAY`, `LƯU LẠI`. Logic thông minh tự đổi hướng pop-out sang trái `(translateX(10px))` nếu nằm sát viền phải khung hình.

### 3. Movie Fetching (Chỉ ghép hoạt hình / 3D Trung)
- **File:** `server/src/services/kkphimService.js`, `server/src/routes/v1/movieRoutes.js`, `movieController.js`
- **Chi tiết:** 
  - Đã đổi mặc định của API trang chủ `getNewMovies` sang endpoint `/v1/api/danh-sach/hoat-hinh` để hoàn toàn loại trừ các bộ phim người đóng.

### 4. Bổ sung Menu "AllPhim"
- **File:** `client/src/components/layout/Header.jsx`, `App.jsx`, Routes
- **Chi tiết:** Cung cấp endpoint mới `getAllMovies` để gọi `/danh-sach/phim-moi-cap-nhat`. Bổ sung một menu item "AllPhim" vào Top Navbar của Header, trỏ router đến `/all-phim` nhằm phục vụ việc gọi toàn bộ dataset phim cũ.

### 5. Movie Layer (Chi tiết Phim & Xem Phim)
- **File:** `MovieDetail.jsx`, `MoviePlayerPage.jsx`
- **Chi tiết:** Bố cục cập nhật thêm một cột (Sidebar) ở bên phải. Tạo không gian cho `RankingSidebar` vào phần `aside`, giúp layout tạo cảm giác giống mẫu khi xem phim hay duyệt review.

### 6. Leaderboard (Bảng Xếp Hạng)
- **File:** `RankingSidebar.jsx`, `RankingSidebar.css`
- **Chi tiết:** Cung cấp sidebar vinh danh các phim Top Ranking. Hiển thị index số hạng cỡ lớn (Vàng, Bạc, Đồng) và thẻ ảnh thumb. Module đã được nhúng vào MovieDetail và MoviePlayerPage.

### 7. User Member & Comments (Bình Luận)
- **File:** `CommentSection.jsx`, `CommentSection.css`
- **Chi tiết:** Đã xây dựng Module Component `CommentSection` nằm phía dưới Player và Detail Layer. Hỗ trợ bắt buộc kiểm tra `isAuthenticated` để viết Comment. Giao diện hiển thị avatar người dùng đăng nhập hiện tại. Đã nhúng vào thành công dưới luồng Player.

## Ghi chú sử dụng
Những thay đổi trên được thiết kế linh hoạt cho component và CSS Module. Bất kì việc cập nhật API hay data endpoint nào sắp tới đều có thể dễ dàng map thẳng vào `kkphimService.js` dựa trên standard struct hiện hành.
