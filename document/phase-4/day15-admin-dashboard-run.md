# Day 15 — Admin Dashboard: Hướng Dẫn Chạy

## Kiến Trúc

```
anime3d-chill/
├── client/  → User-facing site      (port 3000)
├── admin/   → Admin CMS (standalone) (port 3001)
└── server/  → Backend API            (port 5000)
```

Admin CMS là một ứng dụng Vite + React độc lập, **tách biệt hoàn toàn** khỏi client.

## Khởi Chạy

### Docker (khuyến nghị)

```bash
docker compose up --build
```

3 container sẽ chạy:
| Service | URL | Mô tả |
|---------|-----|-------|
| `anime3d-client` | http://localhost:3000 | Trang xem phim |
| **`anime3d-admin`** | **http://localhost:3001** | **Admin CMS** |
| `anime3d-server` | http://localhost:5000 | Backend API |

### Local (không Docker)

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev

# Terminal 3 — Admin CMS
cd admin && npm run dev
```

Hoặc dùng Turbo:
```bash
npm run admin:dev    # chỉ chạy admin
npm run dev          # chạy cả 3
```

## Tài Khoản Admin

| Field | Value |
|-------|-------|
| Email | `admin@anime3d.local` |
| Password | `Admin@123` |
| Role | `admin` |

> Seeder tự tạo khi DB trống (dev mode).

## Kiểm Tra

1. Mở **http://localhost:3001** → Hiển thị form login
2. Đăng nhập admin → Redirect Dashboard (thống kê + top phim)
3. Click "Quản Lý Users" → Bảng users (search, filter, CRUD)
4. Đăng nhập user thường → Bị từ chối ("không có quyền admin")

### API Test (PowerShell)

```powershell
# Login lấy token
$body = '{"email":"admin@anime3d.local","password":"Admin@123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
  -Method POST -Body $body -ContentType "application/json"
$token = $resp.data.accessToken

# Stats
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/stats" `
  -Headers @{Authorization="Bearer $token"}

# Users
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/users?page=1" `
  -Headers @{Authorization="Bearer $token"}
```

## Troubleshooting

| Lỗi | Giải pháp |
|-----|-----------|
| Admin CMS trắng/không load | Kiểm tra container `anime3d-admin` đã chạy chưa |
| 401 Unauthorized | Token hết hạn → Đăng nhập lại |
| 403 Forbidden | Tài khoản không phải admin |
| CORS error | Kiểm tra `CLIENT_URL` trong docker-compose chứa cả `http://localhost:3001` |
| "Tài khoản không có quyền admin" | Dùng đúng tài khoản admin |
