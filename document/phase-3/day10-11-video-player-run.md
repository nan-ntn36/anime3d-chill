# Day 10–11 — Video Player (HLS.js) · Hướng Dẫn Chạy

## Yêu Cầu Phần Mềm

| Phần mềm | Phiên bản |
|:----------|:----------|
| Node.js | ≥ 18.x |
| Docker & Docker Compose | Latest |
| **hls.js** | ≥ 1.6.2 (đã có trong `package.json`) |

## Chạy với Docker

```bash
# Nếu đang chạy, restart client để pick up file changes
docker compose restart client

# Hoặc rebuild tất cả
docker compose up --build
```

Truy cập: **http://localhost:3000**

## Chạy Local

```bash
npm run dev
```

- Client: **http://localhost:5173**
- Server API: **http://localhost:3001**

## Kiểm Tra Kết Quả

### Luồng xem phim

1. Mở trang chủ → click bất kỳ phim nào
2. Trên trang chi tiết, click **"Xem Phim"** → đến trang player
3. URL dạng: `http://localhost:3000/phim/<slug>/xem?tap=<episode>&sv=0`

### Verify các tính năng

| Tính năng | Cách test | Kết quả mong đợi |
|:----------|:----------|:------------------|
| Video Player | Mở player page | Container 16:9 đen + controls ở dưới |
| Play/Pause | Click center/bottom play button hoặc Space | Toggle video |
| Volume | Click icon volume hoặc kéo slider | Thay đổi âm lượng |
| Mute | Phím M hoặc click volume icon | Toggle mute |
| Fullscreen | Phím F hoặc click icon fullscreen | Video toàn màn hình |
| Theater Mode | Phím T hoặc click "Chế độ rạp" | Player chiếm full width |
| Tua | Phím ← (-10s) / → (+10s) | Tua video |
| Volume keys | Phím ↑ (+5%) / ↓ (-5%) | Thay đổi âm lượng |
| Progress bar | Click vào thanh progress | Seek đến vị trí |
| Breadcrumb | Xem phía dưới player | Trang chủ > Tên phim > Tập |
| Episode list | Sidebar bên phải | Grid các tập, active highlight |
| Error state | Stream m3u8 lỗi | "Nguồn phim lỗi" + nút Thử lại/Đổi server |
| Volume nhớ | Thay đổi volume → reload page | Volume được restore |
| Auto next | Xem hết video | Tự chuyển tập tiếp theo |

### Phím tắt

| Phím | Chức năng |
|:-----|:----------|
| `Space` / `K` | Play/Pause |
| `M` | Mute/Unmute |
| `F` | Fullscreen |
| `T` | Theater mode |
| `←` | Tua lùi 10s |
| `→` | Tua tới 10s |
| `↑` | Tăng volume 5% |
| `↓` | Giảm volume 5% |

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|:----|:------------|:----------|
| 404 trên player page | Docker chưa restart | `docker compose restart client` |
| "Nguồn phim lỗi" | URL m3u8 không truy cập được | Thử đổi server, hoặc nguồn phim bị chặn |
| Không phát được | HLS.js không hỗ trợ browser | Dùng Chrome/Firefox mới nhất |
| Controls không hiện | Mouse chưa hover vào player | Di chuột vào player area |
| Volume reset | localStorage bị xóa | Volume sẽ tự lưu khi thay đổi |

## Biến Môi Trường

Không có biến mới cho Day 10-11. Sử dụng các biến đã cấu hình từ Phase 1-2.
