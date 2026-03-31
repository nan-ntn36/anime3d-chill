# Ngày 17 — Analytics & Trending — Hướng Dẫn Chạy

> Hướng dẫn chi tiết để chạy và kiểm tra module Analytics & Trending.

---

## Yêu Cầu Phần Mềm

| Phần mềm | Phiên bản | Mục đích |
|:---|:---|:---|
| **Node.js** | ≥ 18.x | Runtime |
| **MySQL** | 8.0+ | Database |
| **Redis** | 7.x | Cache trending data |
| **npm** | ≥ 9.x | Package manager |

---

## Từng Bước Chạy

### 1. Install dependencies (nếu chưa có)

```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd client && npm install
```

### 2. Cấu hình biến môi trường

Đảm bảo file `server/.env` có đầy đủ các biến:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=anime3d_chill
DB_USER=root
DB_PASSWORD=your_password

# Redis (required for trending cache)
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Feature Flags
FEATURE_ANALYTICS=true
```

### 3. Chạy Local

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev
```

### 4. Chạy Docker

```bash
docker-compose up -d
```

---

## Kiểm Tra Kết Quả

### Test Trending API

```bash
# Lấy danh sách phim trending
curl http://localhost:5000/api/v1/movies/trending

# Expected response:
# {
#   "success": true,
#   "data": {
#     "items": [
#       {
#         "rank": 1,
#         "movieSlug": "ten-phim",
#         "viewCount": 42,
#         "title": "Tên Phim",
#         "poster": "https://...",
#         ...
#       }
#     ],
#     "total": 20
#   }
# }
```

### Test Record View

```bash
# Ghi nhận lượt xem
curl -X POST http://localhost:5000/api/v1/movies/view \
  -H "Content-Type: application/json" \
  -d '{"movieSlug": "test-movie", "sessionId": "abc-123"}'

# Expected: 201 Created
# {"success": true, "message": "Đã ghi nhận lượt xem"}

# Gọi lại lần 2 trong cùng ngày:
# Expected: 200 OK (deduplicated)
# {"success": true, "message": "Đã ghi nhận"}
```

### Test Admin Stats

```bash
# Cần Bearer token admin
curl http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer <admin_access_token>"

# Expected response bao gồm:
# totalUsers, newUsersThisWeek, totalFavorites, totalViews,
# totalWatchHistory, topMovies, viewsPerDay
```

### Kiểm tra trên Frontend

1. **Trang chủ**: Mở `http://localhost:5173` → thấy section "PHIM THỊNH HÀNH" với top 10 ranked movies
2. **Chi tiết phim**: Click vào bất kỳ phim → lượt xem tự động ghi nhận
3. **Sidebar**: "BXH PHIM HOT" hiển thị trending data + view counts
4. **Cron jobs**: Xem server logs mỗi 15 phút có message "🔥 Updated trending"

---

## Troubleshooting

### Trending trả về rỗng

**Nguyên nhân**: Chưa có dữ liệu trong bảng `movie_views`.

**Fix**: Mở vài trang chi tiết phim để tạo view data, đợi 15 phút hoặc restart server (sẽ chạy updateTrending khi boot).

### Redis không khả dụng

**Nguyên nhân**: Redis chưa chạy.

**Fix**: Trending vẫn hoạt động với fallback aggregate trực tiếp từ DB. Tuy nhiên sẽ chậm hơn.

```bash
# Kiểm tra Redis
redis-cli ping
# Expected: PONG
```

### View không được ghi nhận

**Nguyên nhân**: Deduplicate — mỗi session chỉ ghi 1 view/phim/ngày.

**Fix**: Xóa localStorage key `anime3d_session_id` để tạo session mới, hoặc chờ qua ngày mới.

### Cron job không chạy

**Nguyên nhân**: Server chưa gọi `startJobs()`.

**Fix**: Kiểm tra `server/src/index.js` có gọi `require('./jobs').startJobs()` không.

---

## Biến Môi Trường Liên Quan

| Biến | Mô tả | Mặc định |
|:---|:---|:---|
| `FEATURE_ANALYTICS` | Bật/tắt analytics tracking | `true` |
| `REDIS_URL` | Redis connection cho trending cache | `redis://localhost:6379` |
| `DEBUG_MODE` | Log chi tiết cho trending aggregate | `false` |
