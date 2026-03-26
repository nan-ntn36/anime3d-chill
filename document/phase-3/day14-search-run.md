# Ngày 14 — Tìm Kiếm & Danh Sách Phim · Hướng Dẫn Chạy

## Yêu Cầu Phần Mềm

| Phần mềm | Phiên bản tối thiểu |
|-----------|---------------------|
| Docker Desktop | ≥ 24.x |
| Docker Compose | ≥ 2.x (tích hợp sẵn) |
| Node.js (nếu chạy local) | ≥ 18.x |
| npm | ≥ 9.x |

---

## Chạy Docker (Recommended)

```bash
# 1. Di chuyển vào root project
cd anime3d-chill

# 2. Build và khởi chạy tất cả services
docker compose up --build

# 3. Chờ logs hiển thị:
#    - "MySQL connected successfully"
#    - "Server running on port 5000"
#    - "Vite dev server running"
```

### Kiểm tra services

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Ready check (đảm bảo DB + Redis connected)
curl http://localhost:5000/api/v1/ready
```

---

## Chạy Local (Không Docker)

```bash
# 1. Cài dependencies
npm install

# 2. Chạy server + client song song (qua Turborepo)
npm run dev
```

> [!NOTE]
> Chạy local yêu cầu MySQL 8.0 và Redis 7 đang chạy trên máy. Cấu hình connection trong `server/.env`.

---

## Danh Sách URL Mới (Day 14)

| URL | Mô tả | API Backend |
|-----|-------|-------------|
| `http://localhost:3000/tim-kiem` | Trang tìm kiếm phim | `GET /api/v1/movies/search?keyword=&page=` |
| `http://localhost:3000/tim-kiem?keyword=naruto` | Tìm kiếm với keyword | (tự động từ URL) |
| `http://localhost:3000/the-loai` | Grid tất cả thể loại + thumbnail | `GET /api/v1/movies/genres` |
| `http://localhost:3000/the-loai/hanh-dong` | Phim hành động (filtered) | `GET /api/v1/movies/genre/hanh-dong?page=` |
| `http://localhost:3000/quoc-gia` | Grid tất cả quốc gia + thumbnail | `GET /api/v1/movies/countries` |
| `http://localhost:3000/quoc-gia/nhat-ban` | Phim Nhật Bản (filtered) | `GET /api/v1/movies/country/nhat-ban?page=` |

---

## Kiểm Tra Kết Quả

### 1. API Backend — Genres + Thumbnails

```bash
# Lấy danh sách thể loại (lần đầu chậm ~3-5s vì fetch thumbnail)
curl http://localhost:5000/api/v1/movies/genres | jq '.data[0]'

# Output mong đợi:
# {
#   "name": "Hành Động",
#   "slug": "hanh-dong",
#   "thumb": "https://phimimg.com/upload/vod/20250320-1/..."
# }
```

```bash
# Lấy danh sách quốc gia
curl http://localhost:5000/api/v1/movies/countries | jq '.data[0]'

# Output mong đợi:
# {
#   "name": "Việt Nam",
#   "slug": "viet-nam",
#   "thumb": "https://phimimg.com/upload/vod/20250318-1/..."
# }
```

### 2. Trang Tìm Kiếm (`/tim-kiem`)

1. Mở `http://localhost:3000/tim-kiem`
2. **Khi chưa nhập keyword** → Hiển thị:
   - Ô tìm kiếm lớn (hero style) với placeholder
   - Phần "Duyệt theo thể loại" với TopicCard + thumbnail ảnh
3. **Gõ "naruto"** → Chờ 500ms debounce → Kết quả hiển thị:
   - Dòng "Tìm thấy X kết quả cho naruto"
   - Grid MovieCard
   - URL tự cập nhật: `?keyword=naruto`
4. **Bấm nút X** trên ô tìm kiếm → Xóa keyword → Hiện lại gợi ý thể loại
5. **Phân trang** → Nếu > 1 trang, bấm Sau/Trước

### 3. Trang Thể Loại (`/the-loai`)

1. Mở `http://localhost:3000/the-loai`
2. **Khi không có slug** → Grid TopicCard toàn bộ 26 thể loại từ KKPhim API
   - Mỗi card có ảnh thumbnail phim đại diện
   - Text tên thể loại đọc được rõ nhờ dark overlay
3. **Click "Hành Động"** → Navigate `/the-loai/hanh-dong`
   - Hiển thị MovieCard grid phim hành động
   - Phân trang hoạt động

### 4. Trang Quốc Gia (`/quoc-gia`)

1. Mở `http://localhost:3000/quoc-gia`
2. Grid 36 quốc gia từ KKPhim API
3. Click "Nhật Bản" → Navigate `/quoc-gia/nhat-ban` → Grid phim Nhật

### 5. Homepage GenreCards

1. Mở `http://localhost:3000`
2. Scroll xuống phần "Bạn đang quan tâm gì?"
3. 5 thể loại đầu tiên + card "+N chủ đề" → mỗi card có thumbnail

---

## Troubleshooting

| Lỗi | Nguyên nhân | Cách Fix |
|-----|------------|----------|
| Trang trắng / spinner chạy mãi | Vite chưa hot-reload | `docker compose restart client` |
| 404 khi gọi `/api/v1/movies/genres` | Server chưa restart sau code change | `docker compose up --build` (rebuild server) |
| TopicCard không có ảnh (nền trống) | KKPhim API không trả thumb cho thể loại đó | Bình thường — card vẫn hiển thị tên, nền là `surface-elevated` |
| Lần đầu load `/the-loai` chậm ~5s | Backend phải fetch thumbnail cho 26 categories | Lần sau nhanh nhờ cache Redis (TTL: 1 giờ) |
| Search không trả kết quả | KKPhim search API lỗi | Check server logs: `docker logs anime3d-server` |
| Console: 401 Unauthorized | Auth token hết hạn (không liên quan search) | Xem fix Session Day 13 |

---

## Biến Môi Trường

Không có biến mới cho Day 14. Các biến liên quan đã có từ trước:

| Biến | File | Mô tả |
|------|------|-------|
| `KKPHIM_API_URL` | `server/.env` | URL API nguồn phim: `https://phimapi.com` |
| `REDIS_URL` | `server/.env` | Redis connection string (cho caching genres/countries) |
| `VITE_API_BASE_URL` | `client/.env` | Base URL cho frontend API calls: `/api/v1` |

---

## Luồng Dữ Liệu Tổng Quan

```
User mở /the-loai
    → Frontend gọi useGenres() hook
        → movieApi.getGenres()
            → GET /api/v1/movies/genres
                → Backend kiểm tra Redis cache (key: "categories:genres")
                    → Cache HIT: trả về ngay
                    → Cache MISS:
                        1. Fetch https://phimapi.com/the-loai (danh sách 26 genres)
                        2. Cho mỗi genre, fetch /v1/api/the-loai/{slug}?page=1
                        3. Lấy thumb_url của phim đầu tiên
                        4. Trả về: [{name, slug, thumb}, ...]
                        5. Lưu cache Redis (TTL: 1 giờ)
    → TopicCard render với <img src={thumb}>
```
