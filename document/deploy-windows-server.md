# 🚀 Deploy Anime3D-Chill Trực Tiếp Trên Windows Server VPS

> Không dùng Docker. Cài trực tiếp Node.js, MySQL, Redis, Nginx trên Windows Server.
> Thời gian ước tính: **30-45 phút**.

---

## 📋 Checklist Nhanh

```
□  Bước 1  — Cài Node.js 20 LTS
□  Bước 2  — Cài MySQL 8.0
□  Bước 3  — Cài Redis
□  Bước 4  — Cài Git + Clone Project
□  Bước 5  — Cấu hình .env
□  Bước 6  — Cài dependencies + Build Frontend
□  Bước 7  — Cài Nginx (serve frontend + proxy API)
□  Bước 8  — Chạy Backend bằng PM2
□  Bước 9  — Mở Firewall + Test
□  Bước 10 — Tự động khởi động khi VPS reboot
```

---

## Bước 1 — Cài Node.js 20 LTS

1. Mở trình duyệt trên VPS, vào: https://nodejs.org/
2. Tải **20.x LTS** (Windows Installer .msi)
3. Cài đặt — giữ mặc định, click Next
4. **Mở CMD mới** (đóng CMD cũ nếu đang mở), kiểm tra:

```cmd
node --version
npm --version
```

Nếu ra `v20.x.x` → OK ✅

---

## Bước 2 — Cài MySQL 8.0

### 2.1. Tải MySQL

1. Vào: https://dev.mysql.com/downloads/installer/
2. Tải **MySQL Installer for Windows** (mysql-installer-community)
3. Chạy installer:
   - Chọn **Custom** setup
   - Chọn **MySQL Server 8.0** (chỉ cần Server, không cần Workbench)
   - Click **Execute** để tải + cài

### 2.2. Cấu hình MySQL

Trong wizard cấu hình:
1. **Type**: Standalone MySQL Server
2. **Networking**: Port `3306` (mặc định)
3. **Authentication**: Use Legacy Authentication Method
4. **Root Password**: Đặt mật khẩu root mạnh (ghi nhớ lại!)
5. **Windows Service**: ☑ Configure MySQL Server as a Windows Service
   - Service Name: `MySQL80`
   - ☑ Start the MySQL Server at System Startup
6. Finish

### 2.3. Tạo database và user

Mở **CMD** (hoặc PowerShell):

```cmd
mysql -u root -p
```

Nhập root password, rồi chạy:

```sql
-- Tạo database
CREATE DATABASE anime3d_chill CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user
CREATE USER 'anime3d_user'@'localhost' IDENTIFIED BY 'Admin@123!';

-- Cấp quyền
GRANT ALL PRIVILEGES ON anime3d_chill.* TO 'anime3d_user'@'localhost';
FLUSH PRIVILEGES;

-- Kiểm tra
SHOW DATABASES;
EXIT;
```

✅ Thấy `anime3d_chill` trong danh sách → OK

---

## Bước 3 — Cài Redis

### 3.1. Tải Redis cho Windows

Redis chính thức không có bản Windows, dùng bản Memurai (tương thích 100%):

1. Vào: https://github.com/tporadowski/redis/releases
2. Tải **Redis-x64-5.x.x.msi** (bản mới nhất)
3. Cài đặt:
   - ☑ **Add the Redis installation folder to the PATH**
   - ☑ **Add Windows Firewall rule** (nội bộ thôi)
   - Port: `6379` (mặc định)
   - Finish

### 3.2. Kiểm tra Redis

```cmd
redis-cli ping
```

Nếu ra `PONG` → OK ✅

> Nếu lệnh `redis-cli` không nhận, mở CMD mới hoặc thêm đường dẫn Redis vào PATH:
> `set PATH=%PATH%;C:\Program Files\Redis`

---

## Bước 4 — Cài Git + Clone Project

### 4.1. Cài Git

1. Vào: https://git-scm.com/download/win
2. Tải + cài đặt (giữ mặc định)
3. Kiểm tra (mở CMD mới):

```cmd
git --version
```

### 4.2. Clone Project

```cmd
mkdir C:\apps
cd C:\apps
git clone https://github.com/nan-ntn36/anime3d-chill.git
cd anime3d-chill
```

---

## Bước 5 — Cấu Hình .env

### 5.1. Tạo JWT Secret Keys

Chạy **2 lần**, copy kết quả ra:

```cmd
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5.2. Lấy IP công khai VPS

```cmd
curl ifconfig.me
```

Hoặc xem trên trang quản lý VPS của nhà cung cấp.

### 5.3. Tạo file .env cho Server

```cmd
cd C:\apps\anime3d-chill\server
notepad .env
```

Dán nội dung sau, **thay đổi tất cả giá trị**:

```env
NODE_ENV=production
PORT=5000

# ---- MySQL ----
DB_HOST=localhost
DB_PORT=3306
DB_NAME=anime3d_chill
DB_USER=anime3d_user
DB_PASSWORD=MatKhauManh123!

# ---- Redis ----
REDIS_HOST=localhost
REDIS_PORT=6379

# ---- JWT (dán chuỗi random đã tạo) ----
JWT_ACCESS_SECRET=dan_chuoi_random_thu_1_vao_day
JWT_REFRESH_SECRET=dan_chuoi_random_thu_2_vao_day
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# ---- CORS (thay bằng IP VPS) ----
CLIENT_URL=http://IP_VPS_CUA_BAN,http://IP_VPS_CUA_BAN:3001

# ---- API ----
KKPHIM_API_URL=https://phimapi.com
LOG_LEVEL=info
```

> ⚠️ Lưu ý:
> - `DB_HOST=localhost` (không phải `mysql` như Docker)
> - `REDIS_HOST=localhost` (không phải `redis` như Docker)
> - `CLIENT_URL` phải có CÙNG IP VPS, phân tách bằng dấu `,`

---

## Bước 6 — Cài Dependencies + Build Frontend

### 6.1. Cài dependencies cho Server

```cmd
cd C:\apps\anime3d-chill\server
npm install
```

### 6.2. Build Client (Frontend)

```cmd
cd C:\apps\anime3d-chill\client
npm install --legacy-peer-deps
npm run build
```

Sau khi build xong, thư mục `client\dist` sẽ chứa file HTML/JS/CSS đã build.

### 6.3. Build Admin Panel

```cmd
cd C:\apps\anime3d-chill\admin
npm install --legacy-peer-deps
npm run build
```

Sau khi build xong, thư mục `admin\dist` sẽ chứa file HTML/JS/CSS đã build.

✅ Kiểm tra:

```cmd
dir C:\apps\anime3d-chill\client\dist
dir C:\apps\anime3d-chill\admin\dist
```

Phải thấy file `index.html` + thư mục `assets` trong mỗi dist.

---

## Bước 7 — Cài Nginx

### 7.1. Tải Nginx

1. Vào: https://nginx.org/en/download.html
2. Tải **Stable version** → `nginx/Windows-x.x.x` (file .zip)
3. Giải nén vào `C:\nginx`

### 7.2. Cấu hình Nginx

Mở notepad để sửa file config:

```cmd
notepad C:\nginx\conf\nginx.conf
```

**XÓA toàn bộ nội dung cũ**, dán nội dung bên dưới (thay `IP_VPS_CUA_BAN`):

```nginx
worker_processes  auto;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout  65;

    # ── Gzip ──────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript image/svg+xml;

    # ══════════════════════════════════════════════
    # Website chính — Port 80
    # ══════════════════════════════════════════════
    server {
        listen       80;
        server_name  IP_VPS_CUA_BAN;

        # Serve frontend (client)
        root C:/apps/anime3d-chill/client/dist;
        index index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }

        # Proxy API → Backend (Express port 5000)
        location /api/ {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Proxy Swagger docs
        location /api-docs {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }

        # SPA fallback — mọi route trả về index.html
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # ══════════════════════════════════════════════
    # Admin Panel — Port 3001
    # ══════════════════════════════════════════════
    server {
        listen       3001;
        server_name  IP_VPS_CUA_BAN;

        # Serve admin frontend
        root C:/apps/anime3d-chill/admin/dist;
        index index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
            try_files $uri =404;
        }

        # Proxy API → Backend
        location /api/ {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}
```

### 7.3. Test config Nginx

```cmd
cd C:\nginx
nginx -t
```

Nếu ra `syntax is ok` và `test is successful` → OK ✅

### 7.4. Chạy Nginx

```cmd
cd C:\nginx
start nginx
```

Kiểm tra Nginx đang chạy:

```cmd
tasklist | findstr nginx
```

> Các lệnh quản lý Nginx:
> ```cmd
> nginx -s reload    &REM Reload config (sau khi sửa nginx.conf)
> nginx -s stop      &REM Dừng Nginx
> ```

---

## Bước 8 — Chạy Backend bằng PM2

PM2 giúp chạy Node.js như service: tự restart khi crash, tự khởi động khi boot.

### 8.1. Cài PM2

```cmd
npm install -g pm2
npm install -g pm2-windows-startup
```

### 8.2. Chạy Server

```cmd
cd C:\apps\anime3d-chill\server
pm2 start src/index.js --name anime3d-server --env production
```

### 8.3. Kiểm tra

```cmd
pm2 status
```

Kết quả mong đợi:

```
┌──────────────────┬────┬─────────┬──────┬───────┐
│ name             │ id │ status  │ cpu  │ mem   │
├──────────────────┼────┼─────────┼──────┼───────┤
│ anime3d-server   │ 0  │ online  │ 0%   │ 80MB  │
└──────────────────┴────┴─────────┴──────┴───────┘
```

### 8.4. Xem logs

```cmd
pm2 logs anime3d-server
```

Chờ đến khi thấy:

```
✅ Database connected successfully
🚀 Server running on http://localhost:5000
```

### 8.5. Lưu config PM2 (để tự khởi động)

```cmd
pm2 save
pm2-startup install
```

---

## Bước 9 — Mở Firewall + Test

### 9.1. Mở Firewall

Mở **CMD (Run as Administrator)**:

```cmd
netsh advfirewall firewall add rule name="Anime3D - HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="Anime3D - Admin" dir=in action=allow protocol=TCP localport=3001
```

> ⚠️ Nếu VPS có Security Group (Vultr, AWS...), mở port 80 + 3001 trên giao diện web nữa.

### 9.2. Test từ VPS

```cmd
curl http://localhost/api/v1/health
```

Kết quả mong đợi: JSON có `"status": "ok"`

### 9.3. Test từ máy cá nhân

Mở trình duyệt:

| Service | URL |
|---------|-----|
| 🌐 **Website** | `http://IP_VPS_CUA_BAN:85` |
| 🔧 **Admin** | `http://IP_VPS_CUA_BAN:86` |
| 💚 **API** | `http://IP_VPS_CUA_BAN/api/v1/health` |

✅ Thấy trang web → **Deploy thành công!** 🎉

---

## Bước 10 — Tự Động Khởi Động Khi Reboot

### 10.1. PM2 (Backend) — đã thiết lập ở Bước 8.5

```cmd
pm2 save
pm2-startup install
```

### 10.2. Nginx — tạo Windows Service

Tải **WinSW** để chạy Nginx như service:

1. Tải: https://github.com/winsw/winsw/releases/latest → `WinSW-x64.exe`
2. Copy vào `C:\nginx\` và đổi tên thành `nginx-service.exe`

Tạo file `C:\nginx\nginx-service.xml`:

```cmd
notepad C:\nginx\nginx-service.xml
```

Dán:

```xml
<service>
  <id>nginx</id>
  <name>Nginx Web Server</name>
  <description>Nginx reverse proxy for Anime3D-Chill</description>
  <executable>C:\nginx\nginx.exe</executable>
  <arguments>-p C:\nginx</arguments>
  <logpath>C:\nginx\logs</logpath>
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>3</keepFiles>
  </log>
  <stopexecutable>C:\nginx\nginx.exe</stopexecutable>
  <stoparguments>-p C:\nginx -s stop</stoparguments>
</service>
```

Cài service:

```cmd
cd C:\nginx
nginx-service.exe install
nginx-service.exe start
```

### 10.3. MySQL + Redis — đã tự khởi động (cài qua installer)

Kiểm tra:

```cmd
sc query MySQL80
sc query Redis
```

Cả hai phải có `STATE: RUNNING`.

---

## 🔄 Cập Nhật Code Mới

Khi push code mới lên GitHub, chạy trên VPS:

```cmd
cd C:\apps\anime3d-chill

REM Kéo code mới
git pull origin main

REM Cài lại dependencies (nếu có thay đổi)
cd server && npm install && cd ..

REM Build lại client
cd client && npm install --legacy-peer-deps && npm run build && cd ..

REM Build lại admin
cd admin && npm install --legacy-peer-deps && npm run build && cd ..

REM Restart backend
pm2 restart anime3d-server

REM Reload nginx (để serve file mới)
cd C:\nginx && nginx -s reload
```

### Nếu chỉ thay đổi backend:

```cmd
cd C:\apps\anime3d-chill\server
git pull origin main
npm install
pm2 restart anime3d-server
```

### Nếu chỉ thay đổi frontend:

```cmd
cd C:\apps\anime3d-chill\client
git pull origin main
npm install --legacy-peer-deps
npm run build
cd C:\nginx && nginx -s reload
```

---

## 🛑 Dừng / Khởi Động Lại

```cmd
REM ── Backend ──
pm2 stop anime3d-server        &REM Dừng
pm2 restart anime3d-server     &REM Restart
pm2 logs anime3d-server        &REM Xem logs

REM ── Nginx ──
cd C:\nginx
nginx -s stop                  &REM Dừng
start nginx                    &REM Chạy
nginx -s reload                &REM Reload config

REM ── MySQL ──
net stop MySQL80               &REM Dừng
net start MySQL80              &REM Chạy

REM ── Redis ──
net stop Redis                 &REM Dừng
net start Redis                &REM Chạy
```

---

## ❓ Xử Lý Lỗi

### Xem logs

```cmd
REM Backend logs
pm2 logs anime3d-server --lines 50

REM Nginx error log
type C:\nginx\logs\error.log

REM MySQL log
type "C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err"
```

### Bảng xử lý lỗi

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| **Server: Missing env variables** | File `.env` thiếu biến | Kiểm tra `server\.env` có đủ biến không |
| **DB: Connection refused** | MySQL chưa chạy | `net start MySQL80` |
| **DB: Access denied** | Sai user/password | Kiểm tra `DB_USER` và `DB_PASSWORD` trong `.env` |
| **Redis: Connection refused** | Redis chưa chạy | `net start Redis` |
| **Port 80 bị chiếm** | IIS đang chạy | `iisreset /stop` rồi `sc config W3SVC start=disabled` |
| **CORS error** | `CLIENT_URL` sai | Sửa `CLIENT_URL` trong `server\.env` → `pm2 restart anime3d-server` |
| **Trang trắng** | Build lỗi hoặc path sai | Kiểm tra `client\dist\index.html` tồn tại + path trong `nginx.conf` |
| **502 Bad Gateway** | Backend chưa chạy | `pm2 status` → `pm2 restart anime3d-server` |
| **nginx: command not found** | Chưa vào đúng thư mục | `cd C:\nginx` trước khi chạy lệnh nginx |

### Kiểm tra port

```cmd
netstat -ano | findstr :80
netstat -ano | findstr :5000
netstat -ano | findstr :3306
netstat -ano | findstr :6379
```

---

## 📊 Kiến Trúc Hệ Thống

```
  Người dùng (Internet)
       │
       ▼
  ┌──────────────────────────────────────────────┐
  │          Windows Server VPS                   │
  │                                               │
  │  ┌────────────────────────────────────────┐   │
  │  │  Nginx (C:\nginx)                      │   │
  │  │  ├── Port 80  → client\dist (React)    │   │
  │  │  ├── Port 3001 → admin\dist  (React)   │   │
  │  │  └── /api/*   → proxy 127.0.0.1:5000  │   │
  │  └────────────────────────────────────────┘   │
  │                    │                           │
  │                    ▼                           │
  │  ┌────────────────────────────────────────┐   │
  │  │  Node.js + PM2                         │   │
  │  │  Express API (port 5000)               │   │
  │  └──────┬───────────────┬─────────────────┘   │
  │         │               │                      │
  │    ┌────▼─────┐   ┌────▼─────┐                │
  │    │ MySQL 8  │   │  Redis   │                │
  │    │ :3306    │   │  :6379   │                │
  │    └──────────┘   └──────────┘                │
  └──────────────────────────────────────────────┘

Ports mở ra Internet: 80 (website), 3001 (admin)
Ports nội bộ: 5000 (API), 3306 (MySQL), 6379 (Redis)
```
