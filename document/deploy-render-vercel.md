# Deploy Production — Render (Backend) + Vercel (Frontend)

## Kiến Trúc

```
User → Vercel (anime3d.vercel.app)
        ├── Static files (React SPA)
        └── API calls → Render (anime3d-server.onrender.com)
                          ├── MySQL (Render Managed / External)
                          └── Redis (Render / Upstash)
```

---

## A. Backend — Render

### Bước 1: Tạo Web Service trên Render

1. Vào [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connect repo GitHub: `nan-ntn36/anime3d-chill`
3. Cấu hình:

| Setting | Giá trị |
|---------|---------|
| **Name** | `anime3d-server` |
| **Region** | Singapore (gần VN nhất) |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install --omit=dev` |
| **Start Command** | `node src/index.js` |
| **Plan** | Free (hoặc Starter $7/tháng nếu muốn no-sleep) |

### Bước 2: Environment Variables trên Render

Vào **Environment** tab, thêm các biến:

```env
NODE_ENV=production
PORT=5000

# Database — dùng Render Managed MySQL hoặc external
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=anime3d_chill
DB_USER=anime3d_user
DB_PASSWORD=strong_password_here

# Redis — dùng Render Redis hoặc Upstash (miễn phí)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT — BẮT BUỘC random mạnh 32+ ký tự
JWT_ACCESS_SECRET=random_string_32_chars_or_more
JWT_REFRESH_SECRET=another_random_string_32_chars

# CORS — domain Vercel frontend
CLIENT_URL=https://your-app.vercel.app

# External API
KKPHIM_API_URL=https://phimapi.com

# Logging
LOG_LEVEL=warn
```

> **⚠️ Database trên Render:**
> - Render **không có MySQL** managed → dùng **externaal MySQL** free: [PlanetScale](https://planetscale.com), [TiDB Cloud](https://tidbcloud.com), hoặc [Aiven](https://aiven.io)
> - Redis: dùng [Upstash](https://upstash.com) (free tier: 10k commands/ngày) hoặc Render Redis ($7/tháng)

### Bước 3: Deploy

Render tự động deploy khi push lên `master`. Kiểm tra:

```
https://anime3d-server.onrender.com/api/v1/health
```

---

## B. Frontend — Vercel

### Bước 1: Import Project

1. Vào [vercel.com](https://vercel.com) → **New Project → Import Git Repository**
2. Chọn `nan-ntn36/anime3d-chill`
3. Cấu hình:

| Setting | Giá trị |
|---------|---------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install --legacy-peer-deps` |

### Bước 2: Environment Variables trên Vercel

Vào **Settings → Environment Variables**:

```env
VITE_API_BASE_URL=https://anime3d-server.onrender.com/api/v1
```

> **Quan trọng:** URL phải bao gồm `/api/v1` và **KHÔNG có dấu `/` cuối**

### Bước 3: Deploy

```bash
# Vercel tự detect Vite và build
# Hoặc deploy manual:
cd client
npx vercel --prod
```

### File `vercel.json` (đã tạo)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

→ Đảm bảo React Router hoạt động (SPA fallback).

---

## C. Database — Lựa Chọn Free

| Service | Free Tier | Ghi chú |
|---------|-----------|---------|
| [TiDB Cloud](https://tidbcloud.com) | 5GB, MySQL-compatible | ✅ Tốt nhất cho MySQL |
| [PlanetScale](https://planetscale.com) | 5GB, 1B row reads/tháng | MySQL serverless |
| [Aiven](https://aiven.io) | 1 DB, limited | MySQL managed |
| [Neon](https://neon.tech) | 512MB PostgreSQL | ❌ Cần đổi sang pg (không recommend) |

### Redis — Lựa Chọn Free

| Service | Free Tier |
|---------|-----------|
| [Upstash](https://upstash.com) | 10k commands/ngày, 256MB |
| [Redis Cloud](https://redis.com/try-free/) | 30MB |

---

## D. Kiểm Tra Sau Deploy

### 1. Health Check
```bash
curl https://anime3d-server.onrender.com/api/v1/health
# → { "success": true, "data": { "status": "ok", "services": { "database": "connected", "redis": "connected" } } }
```

### 2. Frontend
Mở `https://your-app.vercel.app`:
- Trang chủ load phim ✅
- Đăng nhập/đăng ký ✅
- Cookie gửi cross-origin ✅
- Xem phim + lịch sử ✅

### 3. CORS Check
Mở DevTools → Network → bất kỳ API call:
```
Access-Control-Allow-Origin: https://your-app.vercel.app
Access-Control-Allow-Credentials: true
```

---

## E. Lưu Ý Quan Trọng

### Render Free Tier
- Server **sleep sau 15 phút không có traffic** → request đầu tiên chậm ~30s (cold start)
- Giải pháp: dùng [cron-job.org](https://cron-job.org) ping health endpoint mỗi 14 phút

### Cookie Cross-Origin
- `sameSite: 'None'` + `secure: true` → **BẮT BUỘC HTTPS** cả frontend lẫn backend
- Vercel mặc định HTTPS ✅
- Render mặc định HTTPS ✅

### Environment Variables
- Thay `CLIENT_URL` trên Render mỗi khi đổi domain Vercel
- Thay `VITE_API_BASE_URL` trên Vercel mỗi khi đổi domain Render
- **Rebuild frontend sau khi đổi VITE_*** (biến bake vào build time)

---

## Tóm Tắt Các File Đã Thêm/Sửa

| File | Thay đổi |
|------|----------|
| `client/vercel.json` | SPA rewrite + static caching |
| `client/src/api/axiosConfig.js` | `baseURL: import.meta.env.VITE_API_BASE_URL \|\| '/api/v1'` |
| `client/nginx.conf` | Production nginx (cho Docker deploy, không dùng cho Vercel) |
| `docker-compose.production.yml` | Docker production (cho VPS deploy, không dùng cho Render) |
