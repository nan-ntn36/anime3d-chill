# Day 09  ETrang Chi Tiết Phim · Hướng Dẫn Chạy

## Yêu Cầu Phần Mềm

| Phần mềm | Phiên bản |
|:----------|:----------|
| Node.js | ≥ 18.x |
| Docker & Docker Compose | Latest |
| npm | ≥ 9.x |

## Chạy với Docker (Khuyến nghềE

```bash
# Clone repo (nếu chưa có)
git clone <repo-url> && cd anime3d-chill

# Copy env
cp .env.example .env

# Build & chạy tất cả services
docker compose up --build
```

Truy cập: **http://localhost:3000**

## Chạy Local (Dev mode)

```bash
# Install dependencies
npm install

# Start dev server (Turborepo  Echạy cả client & server)
npm run dev
```

- Client: **http://localhost:5173**
- Server API: **http://localhost:3001**

## Kiểm Tra Kết Quả

### 1. MềEtrang chi tiết phim

Từ trang chủ, click vào bất kỳ phim nào ↁEtrang chi tiết sẽ mềEtại URL `/phim/<slug>`.

Hoặc truy cập trực tiếp:
```
http://localhost:3000/phim/ke-thu-dich
```

### 2. Verify API

```bash
# Chi tiết phim
curl http://localhost:3001/api/v1/movies/detail/ke-thu-dich | jq .
```

Response mong đợi:
```json
{
  "status": "success",
  "data": {
    "slug": "ke-thu-dich",
    "title": "Kẻ Thù Địch",
    "originalTitle": "Hostiles",
    "poster": "https://phimimg.com/...",
    "description": "...",
    "episodes": [
      {
        "serverName": "...",
        "items": [{ "name": "Full", "slug": "full", "m3u8Url": "..." }]
      }
    ]
  }
}
```

### 3. Kiểm tra các tính năng

| Tính năng | Cách test | Kết quả mong đợi |
|:----------|:----------|:------------------|
| Hero backdrop | MềEtrang chi tiết | Ảnh mềEphía sau, poster bên trái |
| Badges | Xem khu vực badges | HD, VIETSUB, năm hiển thềE|
| Mô tả | Scroll xuống "Nội Dung Phim" | Text mô tả + nút "Xem thêm" |
| Danh sách tập | Xem panel bên phải | Grid các tập + toggle Grid/List |
| Server selector | Click dropdown server | Đổi server ↁEđổi danh sách tập |
| Yêu thích | Click nút "Yêu thích" | Toast "Vui lòng đăng nhập" (nếu chưa login) |
| SEO | Inspect `<head>` | Title + meta description thay đổi theo phim |
| Responsive | Thu nhềEbrowser ≤ 768px | Layout stack dọc |

## Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|:----|:------------|:----------|
| Trang trắng / loading mãi | API server chưa chạy | Kiểm tra Docker, `docker compose logs server` |
| Ảnh poster không hiển thềE| CDN phimimg.com bềEchặn | Kiểm tra network, thử VPN |
| "Không thềEtải phim" | Slug không tồn tại hoặc API lỗi | Thử slug khác, kiểm tra logs |
| Favourite không hoạt động | Chưa đăng nhập | Đăng nhập trước khi thêm yêu thích |

## Biến Môi Trường

Không có biến mới cho Day 9. Sử dụng các biến đã cấu hình từ Phase 1-2:

| Biến | Mô tả |
|:-----|:------|
| `VITE_API_URL` | URL API server (client-side) |
| `CLIENT_URL` | URL frontend (CORS whitelist) |
| `KKPhim_API_URL` | URL nguồn phim API |
