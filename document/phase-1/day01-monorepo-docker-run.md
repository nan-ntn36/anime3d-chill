# 📘 Day 01 — Hướng Dẫn Chạy: Monorepo & Docker Setup

> Tài liệu dành cho **người mới** — hướng dẫn từng bước để chạy được dự án Anime3D-Chill.

---

## ✅ Yêu Cầu Phần Mềm (Prerequisites)

Cài đặt **tất cả** các công cụ sau trước khi bắt đầu:

| Công cụ | Phiên bản tối thiểu | Kiểm tra | Tải về |
|:---|:---|:---|:---|
| **Node.js** | `>= 20.0.0` | `node -v` | [nodejs.org](https://nodejs.org/) |
| **npm** | `>= 10.0.0` | `npm -v` | Đi kèm Node.js |
| **Git** | Bất kỳ | `git --version` | [git-scm.com](https://git-scm.com/) |
| **Docker** *(tùy chọn)* | `>= 24.0` | `docker --version` | [docker.com](https://www.docker.com/) |
| **Docker Compose** *(tùy chọn)* | `>= 2.20` | `docker compose version` | Đi kèm Docker Desktop |

> [!TIP]
> Nếu chỉ muốn code frontend/backend mà không cần MySQL/Redis → chạy **Local** không cần Docker.
> Nếu muốn full stack (MySQL + Redis + Server + Client) → chạy **Docker**.

---

## 🚀 Cách 1: Chạy Local (Không Docker)

### Bước 1: Clone repository

```bash
git clone <repo-url>
cd anime3d-chill
```

### Bước 2: Cấu hình biến môi trường

```bash
# Copy file mẫu
cp .env.example .env

# (Windows)
copy .env.example .env
```

> Giữ nguyên giá trị mặc định trong `.env` cho development. Xem [Giải Thích Biến Môi Trường](#-giải-thích-biến-môi-trường) bên dưới.

### Bước 3: Cài đặt dependencies

```bash
npm install
```

> [!NOTE]
> Lệnh này cài đặt dependencies cho **cả root, client, và server** cùng lúc nhờ npm workspaces. File `.npmrc` đã có config `legacy-peer-deps=true` để giải quyết conflict giữa `@react-three/fiber` v9 (yêu cầu React 19) với React 18 của project.

### Bước 4: Chạy development server

```bash
# Chạy cả client + server cùng lúc
npm run dev

# Hoặc chạy riêng từng phần
npm run server:dev    # Chỉ chạy backend (port 5000)
npm run client:dev    # Chỉ chạy frontend (port 3000)
```

### Bước 5: Kiểm tra kết quả

| Service | URL | Kết quả mong đợi |
|:---|:---|:---|
| **Client (Vite)** | http://localhost:3000 | Trang web React hiển thị |
| **Server (Express)** | http://localhost:5000 | Server API đang chạy |
| **Health Check** | http://localhost:5000/api/v1/health | `{ "status": "ok", ... }` |
| **API Docs (Swagger)** | http://localhost:5000/api-docs | Giao diện Swagger UI |

Kiểm tra bằng curl:

```bash
curl http://localhost:5000/api/v1/health
# Output: {"status":"ok","uptime":...,"timestamp":"...","environment":"development"}
```

> [!WARNING]
> Khi chạy Local **không có Docker**, MySQL và Redis chưa khả dụng. Endpoint `/api/v1/ready` sẽ báo `database: "disconnected"`. Điều này bình thường — các tính năng cần DB sẽ được thêm từ Day 02.

---

## 🐳 Cách 2: Chạy Với Docker

### Bước 1: Clone và cấu hình

```bash
git clone <repo-url>
cd anime3d-chill
cp .env.example .env    # hoặc copy .env.example .env (Windows)
```

### Bước 2: Build và khởi động tất cả services

```bash
docker compose up --build
```

**Lần đầu chạy sẽ mất 2-5 phút** để:
1. Tải Docker images (MySQL, Redis, Node.js, Nginx)
2. Install npm dependencies trong container
3. Khởi động MySQL và đợi health check pass (30 giây)
4. Khởi động Redis
5. Khởi động Server (Express) sau khi MySQL + Redis healthy
6. Khởi động Client (Vite)

### Bước 3: Kiểm tra tất cả services đang chạy

```bash
# Xem status containers
docker compose ps
```

Output mong đợi:

```
NAME              STATUS                    PORTS
anime3d-mysql     running (healthy)         0.0.0.0:3306->3306/tcp
anime3d-redis     running (healthy)         0.0.0.0:6379->6379/tcp
anime3d-server    running                   0.0.0.0:5000->5000/tcp
anime3d-client    running                   0.0.0.0:3000->3000/tcp
```

### Bước 4: Truy cập

| Service | URL |
|:---|:---|
| **Client** | http://localhost:3000 |
| **Server** | http://localhost:5000 |
| **Health check** | http://localhost:5000/api/v1/health |
| **Ready check** | http://localhost:5000/api/v1/ready |
| **API Docs** | http://localhost:5000/api-docs |

### Bước 5: Dừng services

```bash
# Dừng tất cả (giữ data)
docker compose down

# Dừng + xóa toàn bộ data (MySQL, Redis)
docker compose down -v

# Xem logs
docker compose logs -f server    # Log server
docker compose logs -f client    # Log client
docker compose logs -f mysql     # Log MySQL
```

---

## 🔧 Troubleshooting — Lỗi Thường Gặp

### ❌ Lỗi: `ERESOLVE unable to resolve dependency tree`

**Nguyên nhân**: `@react-three/fiber` v9 yêu cầu React 19 nhưng project dùng React 18.

**Cách sửa**: Đảm bảo file `.npmrc` ở root có nội dung:

```
legacy-peer-deps=true
```

Nếu chạy trong Docker, Dockerfile của client phải có:

```dockerfile
RUN npm install --legacy-peer-deps
```

### ❌ Lỗi: `Port 3000 is already in use`

**Cách sửa**: Tắt ứng dụng đang dùng port 3000, hoặc đổi port trong `vite.config.js`:

```bash
# Tìm process dùng port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Tìm process dùng port 3000 (Mac/Linux)
lsof -i :3000
kill -9 <PID>
```

### ❌ Lỗi: `docker compose up` → MySQL container restart liên tục

**Nguyên nhân**: Volume MySQL cũ bị corrupt hoặc password đã thay đổi.

**Cách sửa**:

```bash
docker compose down -v    # Xóa volumes
docker compose up --build # Build lại
```

### ❌ Lỗi: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Nguyên nhân**: Server cố kết nối MySQL trước khi MySQL sẵn sàng.

**Giải thích**: `docker-compose.yml` đã config `depends_on` + health check nên server **chờ** MySQL healthy. Nếu vẫn lỗi → đợi 30 giây rồi restart:

```bash
docker compose restart server
```

### ❌ Lỗi: `npm warn deprecated` nhiều dòng

**Giải thích**: Đây chỉ là **cảnh báo**, không phải lỗi. Bỏ qua — không ảnh hưởng đến ứng dụng.

### ❌ Lỗi: `url.parse() DeprecationWarning`

**Giải thích**: Cảnh báo từ dependency (swagger hoặc Express). Không ảnh hưởng — sẽ được fix trong phiên bản tương lai.

---

## 🌍 Giải Thích Biến Môi Trường

File `.env` ở root project chứa các biến cấu hình. Giá trị mặc định đã đủ cho development:

### Database (MySQL)

| Biến | Mặc định | Ý nghĩa |
|:---|:---|:---|
| `DB_ROOT_PASSWORD` | `rootpassword` | Password root MySQL |
| `DB_NAME` | `anime3d_chill` | Tên database |
| `DB_USER` | `anime3d_user` | Username kết nối DB |
| `DB_PASSWORD` | `anime3d_pass` | Password kết nối DB |
| `DB_PORT` | `3306` | Port MySQL expose ra host |

### Redis

| Biến | Mặc định | Ý nghĩa |
|:---|:---|:---|
| `REDIS_PORT` | `6379` | Port Redis expose ra host |

### Authentication (JWT)

| Biến | Mặc định | Ý nghĩa |
|:---|:---|:---|
| `JWT_ACCESS_SECRET` | `dev_access_secret_change_me` | Secret ký access token — **đổi khi deploy production** |
| `JWT_REFRESH_SECRET` | `dev_refresh_secret_change_me` | Secret ký refresh token — **đổi khi deploy production** |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Thời hạn access token |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Thời hạn refresh token |

> [!CAUTION]
> **Khi deploy production**, BẮT BUỘC đổi tất cả password, secret keys sang giá trị mạnh, ngẫu nhiên. **KHÔNG ĐƯỢC** dùng giá trị mặc định.

---

## 📊 Tóm Tắt Lệnh Hay Dùng

| Lệnh | Mô tả |
|:---|:---|
| `npm run dev` | Chạy client + server (local) |
| `npm run server:dev` | Chạy riêng server |
| `npm run client:dev` | Chạy riêng client |
| `docker compose up --build` | Build + chạy Docker |
| `docker compose down` | Dừng Docker |
| `docker compose down -v` | Dừng + xóa data |
| `docker compose ps` | Xem status containers |
| `docker compose logs -f <service>` | Xem log realtime |
