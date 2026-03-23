# Ngày 6 — Movie Routes Backend + Validators · Hướng Dẫn Chạy

> Expose 7 movie API endpoints (public, không cần auth). Proxy tới NguonC API qua service layer.

---

## Chạy

```bash
docker compose up --build -d
docker logs anime3d-server --tail 5
```

---

## Danh Sách Endpoints

| # | Method | Endpoint | Mô tả | NguonC API tương ứng |
|:---|:---|:---|:---|:---|
| 1 | GET | `/api/v1/movies/new?page=1` | Phim mới cập nhật | `/films/phim-moi-cap-nhat` |
| 2 | GET | `/api/v1/movies/list/phim-bo?page=1` | Danh sách loại (phim-bo, phim-le, hoat-hinh, tv-shows) | `/films/danh-sach/{slug}` |
| 3 | GET | `/api/v1/movies/detail/ten-phim-slug` | Chi tiết + tập phim | `/film/{slug}` |
| 4 | GET | `/api/v1/movies/genre/hanh-dong?page=1` | Theo thể loại | `/films/the-loai/{slug}` |
| 5 | GET | `/api/v1/movies/country/nhat-ban?page=1` | Theo quốc gia | `/films/quoc-gia/{slug}` |
| 6 | GET | `/api/v1/movies/year/2025?page=1` | Theo năm | `/films/nam-phat-hanh/{year}` |
| 7 | GET | `/api/v1/movies/search?keyword=naruto&page=1` | Tìm kiếm | `/films/search?keyword=` |

> ⚠️ **Lưu ý**: `/movies/list/{slug}` dùng cho **category** (phim-bo, phim-le, hoat-hinh, tv-shows), KHÔNG phải movie slug. Để xem chi tiết phim, dùng `/movies/detail/{slug}`.

---

## Test Bằng curl

```bash
# 1. Phim mới
curl.exe -s http://localhost:5000/api/v1/movies/new | python -m json.tool

# 2. Danh sách phim bộ
curl.exe -s http://localhost:5000/api/v1/movies/list/phim-bo | python -m json.tool

# 3. Chi tiết phim
curl.exe -s http://localhost:5000/api/v1/movies/detail/uruwashi-no-yoi-no-tsuki | python -m json.tool

# 4. Thể loại hành động
curl.exe -s http://localhost:5000/api/v1/movies/genre/hanh-dong | python -m json.tool

# 5. Quốc gia Nhật Bản
curl.exe -s http://localhost:5000/api/v1/movies/country/nhat-ban | python -m json.tool

# 6. Năm 2025
curl.exe -s http://localhost:5000/api/v1/movies/year/2025 | python -m json.tool

# 7. Tìm kiếm
curl.exe -s "http://localhost:5000/api/v1/movies/search?keyword=naruto" | python -m json.tool
```

---

## Response Format

### Thành công (danh sách)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "...",
        "slug": "tai-sinh-thanh-meo",
        "title": "Tái Sinh Thành Mèo",
        "originalTitle": "Neko ni Tensei shita Oji-san",
        "poster": "https://phimimg.com/...",
        "thumb": "https://phimimg.com/...",
        "year": 2025,
        "genres": ["Hài Hước"],
        "country": ["Nhật Bản"],
        "quality": "FHD",
        "language": "Vietsub",
        "currentEpisode": "Tập 12",
        "totalEpisodes": 12
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3224,
      "totalItems": 32239,
      "itemsPerPage": 10
    }
  },
  "meta": { "page": 1 }
}
```

### Thành công (chi tiết)
```json
{
  "success": true,
  "data": {
    "slug": "uruwashi-no-yoi-no-tsuki",
    "title": "Uruawashi no Yoi no Tsuki",
    "description": "Nội dung phim...",
    "directors": [...],
    "actors": [...],
    "episodes": [
      {
        "serverName": "Vietsub #1",
        "items": [
          { "name": "Tập 1", "slug": "tap-1", "m3u8Url": "...", "embedUrl": "..." }
        ]
      }
    ]
  }
}
```

### Lỗi
```json
{
  "success": false,
  "message": "Không tìm thấy nội dung",
  "code": "RESOURCE_NOT_FOUND"
}
```

---

## Swagger

Truy cập http://localhost:5000/api-docs → section **Movies** để test trực tiếp.

---

## Validation Rules

| Param | Rule | Error |
|:---|:---|:---|
| `?page=` | int, 1–500, optional, default 1 | 400 VALIDATION_ERROR |
| `:slug` | lowercase + hyphens only | 400 VALIDATION_ERROR |
| `:year` | 1900 → currentYear+2 | 400 VALIDATION_ERROR |
| `?keyword=` | required, max 100 chars, escaped | 400 VALIDATION_ERROR |

---

## Error Codes

| Status | Code | Khi nào |
|:---|:---|:---|
| 400 | `VALIDATION_ERROR` | Invalid slug/page/keyword |
| 404 | `RESOURCE_NOT_FOUND` | Phim không tồn tại trên NguonC |
| 502 | `UPSTREAM_ERROR` | NguonC API lỗi 5xx hoặc timeout |
| 503 | `UPSTREAM_ERROR` | Circuit breaker đang mở |
