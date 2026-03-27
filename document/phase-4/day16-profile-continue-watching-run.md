# Day 16 — Profile & Continue Watching: Hướng Dẫn Chạy

## Chức Năng Mới

| Feature | URL | Mô tả |
|---------|-----|-------|
| Profile Settings | /profile → tab "Quản lý tài khoản" | Cập nhật avatar URL + đổi mật khẩu |
| Đang Xem | Trang chủ (sau Genre Cards) | Section hiển thị phim đang xem dang dở |
| Xem Tiếp Prompt | /xem/:slug?tap=... | Banner "Xem tiếp từ X:XX?" khi quay lại phim |

## Cách Test

### 1. Profile Settings
1. Đăng nhập tài khoản
2. Vào `/profile` → Tab "Quản lý tài khoản"
3. Nhập URL avatar (ví dụ: link Imgur) → Lưu thay đổi
4. Đổi mật khẩu: nhập cũ + mới + xác nhận → Lưu

### 2. Đang Xem (Continue Watching)
1. Mở một tập phim bất kỳ tại `/xem/:slug`
2. Xem > 30 giây để hệ thống lưu tiến độ
3. Quay lại trang chủ → Xuất hiện section "Đang Xem" với thanh progress
4. Click vào card → Tiếp tục xem từ vị trí đã lưu

### 3. Resume Prompt
1. Xem một tập phim > 60 giây
2. Rời khỏi trang, quay lại phim đó
3. Banner hiện lên: "Bạn đã xem đến X:XX — Xem tiếp?"
4. Nút "Xem tiếp" → nhảy đến vị trí cũ
5. Nút "Xem từ đầu" → bắt đầu từ 0:00
