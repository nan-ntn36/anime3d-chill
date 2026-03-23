# Ngày 2 — Backend Foundation · Hướng Dẫn Chạy

> Hướng dẫn chạy và kiểm tra backend foundation: config, middleware stack, logging.

---

## Yêu Cầu Phần Mềm (Prerequisites)

| Phần mềm | Phiên bản | Ghi chú |
|:---|:---|:---|
| **Node.js** | ≥ 20.x | Dùng trong Docker |
| **Docker Desktop** | Mới nhất | Bắt buộc |
| **Git** | ≥ 2.x | Clone repo |

---

## Chạy Bằng Docker (Khuyến Nghị)

### 1. Clone + Cấu hình

```bash
git clone <repo-url>
cd anime3d-chill
cp .env.example .env
# ✏️ Sửa .env nếu cần (DB_PORT=3307 để tránh xung đột MySQL local)
```

### 2. Start tất cả services

```bash
docker compose up --build
# Hoặc chạy nền:
docker compose up --build -d
```

### 3. Kiểm tra kết quả

```bash
# Health check — kiểm tra server + DB + Redis
curl http://localhost:5000/api/v1/health
# Expected: {"success":true,"data":{"status":"ok","services":{"database":"connected","redis":"connected"},...}}

# Ready check — kiểm tra sẵn sàng phục vụ
curl http://localhost:5000/api/v1/ready
# Expected: {"success":true,"data":{"status":"ready","services":{"database":"connected","redis":"connected"}}}

# 404 check
curl http://localhost:5000/api/v1/nonexistent
# Expected: {"success":false,"message":"Route GET /api/v1/nonexistent not found","code":"RESOURCE_NOT_FOUND"}

# Swagger API Docs
# Mở trình duyệt: http://localhost:5000/api-docs
```

### 4. Kiểm tra X-Request-Id header

```bash
curl -I http://localhost:5000/api/v1/health
# Response header phải có: X-Request-Id: <uuid>
```

### 5. Kiểm tra logs

```bash
docker logs anime3d-server --tail 20
# Expected: Pino structured logs với timestamp + level
# ✅ Database connected successfully
# ✅ Redis connected successfully
# 🚀 Server running on http://localhost:5000
```

---

## Chạy Local (Không Docker)

### Yêu cầu thêm
- MySQL 8.0 chạy local
- Redis 7 chạy local

### Các bước

```bash
cd server
cp .env.example .env
# ✏️ Cập nhật .env: DB_HOST=localhost, REDIS_HOST=localhost

npm install --legacy-peer-deps
npm run dev
```

---

## Biến Môi Trường

| Biến | Bắt buộc | Giá trị mặc định | Mô tả |
|:---|:---|:---|:---|
| `NODE_ENV` | ❌ | `development` | Môi trường chạy |
| `PORT` | ❌ | `5000` | Port server |
| `DB_HOST` | ✅ | — | MySQL host |
| `DB_PORT` | ❌ | `3306` | MySQL port |
| `DB_NAME` | ✅ | — | Tên database |
| `DB_USER` | ✅ | — | MySQL user |
| `DB_PASSWORD` | ✅ | — | MySQL password |
| `REDIS_HOST` | ❌ | `localhost` | Redis host |
| `REDIS_PORT` | ❌ | `6379` | Redis port |
| `JWT_ACCESS_SECRET` | ✅ | — | Secret cho access token |
| `JWT_REFRESH_SECRET` | ✅ | — | Secret cho refresh token |
| `CLIENT_URL` | ❌ | `http://localhost:3000` | URL frontend (CORS) |
| `LOG_LEVEL` | ❌ | `info` | Pino log level |

---

## Troubleshooting

### ❌ Port 3306 bị chiếm
```bash
# Tắt MySQL local trước, hoặc đổi DB_PORT=3307 trong .env
```

### ❌ Server logs "Database connection failed"
- Kiểm tra MySQL container đã healthy: `docker ps`
- Kiểm tra biến `DB_HOST`, `DB_USER`, `DB_PASSWORD` trong `.env`
- Trong Docker, `DB_HOST=mysql` (tên service), không phải `localhost`

### ❌ Server logs "Redis connect failed"
- Kiểm tra Redis container: `docker ps`
- Server vẫn chạy được với fallback `node-cache` (in-memory)
