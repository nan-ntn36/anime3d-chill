<div align="center">

# ⚡ Anime3D-Chill

**Nền tảng xem Anime Online hiện đại, miễn phí và tốc độ cao.**

[![Node.js](https://img.shields.io/badge/Node.js-≥20.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)

</div>

---

## ✨ Tính Năng Nổi Bật

| Tính năng | Mô tả |
|-----------|-------|
| 🎥 **HLS Streaming** | Phát video chất lượng cao qua HLS.js |
| 🔥 **Trending & Ranking** | Bảng xếp hạng phim thịnh hành theo thời gian thực |
| 🔐 **Auth JWT** | Hệ thống đăng nhập bảo mật với Access + Refresh Token |
| ⏯️ **Continue Watching** | Lưu lịch sử và tiếp tục xem từ đúng vị trí |
| 🗂️ **Thùng Phim** | Danh sách phim yêu thích cá nhân |
| 💬 **Bình Luận** | Hệ thống comment threaded theo từng phim |
| 🔍 **Tìm Kiếm** | Tìm kiếm anime nhanh theo tên, thể loại |
| 📱 **Responsive** | Giao diện tối ưu hoàn toàn trên Mobile, Tablet, Desktop |
| 🛡️ **Admin CMS** | Quản trị phim, người dùng, thể loại qua giao diện riêng |
| ⚡ **Redis Cache** | Cache thông minh giảm tải API và tăng tốc độ |
| 📄 **API Docs** | Swagger UI tích hợp sẵn tại `/api-docs` |

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

```
anime3d-chill/                  ← Monorepo (Turborepo)
├── client/                     ← React App (User-facing) [:3000]
│   ├── src/
│   │   ├── components/         ← Banner, Cards, Player, ...
│   │   ├── pages/              ← Home, Detail, Player, Profile, ...
│   │   ├── hooks/              ← React Query custom hooks
│   │   ├── store/              ← Zustand global state
│   │   └── api/                ← Axios API client
│   └── vite.config.js
│
├── admin/                      ← React CMS (Admin) [:3001]
│   └── src/
│       ├── pages/              ← Dashboard, Movie CRUD, Users
│       └── components/
│
├── server/                     ← Express.js API [:5000]
│   └── src/
│       ├── routes/             ← REST API routes
│       ├── controllers/        ← Business logic
│       ├── models/             ← Sequelize ORM models
│       ├── middlewares/        ← Auth, Rate Limit, Error handler
│       ├── services/           ← Redis cache, KKPhim API
│       └── config/             ← DB, Redis, Swagger
│
├── docker-compose.yml          ← Dev environment
├── docker-compose.prod.yml     ← Production environment
└── turbo.json                  ← Turborepo pipeline
```

---

## 🛠️ Tech Stack

### Frontend (Client & Admin)
| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | 18 | UI Framework |
| Vite | 6 | Build tool & Dev server |
| React Router | 7 | Client-side routing |
| TanStack Query | 5 | Server state & caching |
| Zustand | 5 | Global state management |
| Framer Motion | 12 | Animations |
| HLS.js | 1.6 | HLS video streaming |
| Swiper | 11 | Touch carousel |
| React Hook Form | 7 | Form validation |
| Axios | 1.8 | HTTP client |

### Backend (Server)
| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| Express.js | 4 | REST API framework |
| Sequelize | 6 | ORM cho MySQL |
| MySQL2 | 3 | Database driver |
| ioRedis | 5 | Redis client |
| JWT | 9 | Authentication |
| bcryptjs | 3 | Password hashing |
| Helmet | 8 | Security headers |
| Pino | 9 | High-performance logging |
| Swagger | 6 | API documentation |
| node-cron | 3 | Scheduled tasks |

### Infrastructure
| Công nghệ | Mục đích |
|-----------|----------|
| MySQL 8.0 | Database chính |
| Redis 7 | Cache & Session |
| Docker Compose | Container orchestration |
| Turborepo | Monorepo build system |
| Nginx (prod) | Reverse proxy |

---

## 🚦 Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker & Docker Compose** *(Khuyên dùng)*

---

### 🐳 Cách 1: Chạy bằng Docker *(Khuyên dùng)*

Chỉ cần 3 bước, không cần cài MySQL hay Redis trên máy:

```bash
# 1. Clone repository
git clone https://github.com/nan-ntn36/anime3d-chill.git
cd anime3d-chill

# 2. Sao chép file env và cấu hình
cp server/.env.example server/.env
# ⚠️  Chỉnh sửa server/.env nếu cần (DB password, JWT secret, ...)

# 3. Khởi động toàn bộ hệ thống
docker-compose up -d
```

✅ Hệ thống sẽ tự động khởi động MySQL, Redis, Server, Client và Admin.

---

### 💻 Cách 2: Chạy Local *(Yêu cầu MySQL & Redis sẵn có)*

```bash
# 1. Clone & cài dependencies
git clone https://github.com/nan-ntn36/anime3d-chill.git
cd anime3d-chill
npm install

# 2. Cấu hình môi trường
cp server/.env.example server/.env
# Chỉnh sửa server/.env với thông tin DB local của bạn

# 3. Chạy tất cả (Client + Admin + Server) cùng lúc
npm run dev
```

Hoặc chạy từng service riêng biệt:
```bash
npm run client:dev    # Chỉ chạy website người dùng
npm run admin:dev     # Chỉ chạy trang quản trị
npm run server:dev    # Chỉ chạy API server
```

---

## 🌐 Truy Cập Các Dịch Vụ

| Dịch vụ | URL | Mô tả |
|---------|-----|-------|
| 🌐 **Website** | `http://localhost:3000` | Trang xem phim cho người dùng |
| 🛡️ **Admin** | `http://localhost:3001` | Trang quản trị CMS |
| ⚙️ **API Server** | `http://localhost:5000` | REST API backend |
| 📖 **API Docs** | `http://localhost:5000/api-docs` | Swagger UI documentation |
| 💚 **Health Check** | `http://localhost:5000/api/v1/health` | Kiểm tra trạng thái server |

---

## ⚙️ Biến Môi Trường (Environment Variables)

Tạo file `server/.env` từ template:

```bash
cp server/.env.example server/.env
```

Các biến quan trọng cần cấu hình:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=anime3d_chill
DB_USER=your_user
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT — Tạo secret mạnh bằng lệnh:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CLIENT_URL=http://localhost:3000

# External API
KKPHIM_API_URL=https://phimapi.com
```

---

## 🚀 Deploy Production

### Sử dụng Docker Compose Production:

```bash
# Build và khởi chạy môi trường production
docker-compose -f docker-compose.prod.yml up -d --build
```

> 📖 **Xem hướng dẫn deploy chi tiết lên Windows Server** tại [`document/deploy-windows-server.md`](document/deploy-windows-server.md)

---

## 📁 Nguồn Dữ Liệu

Dự án tích hợp API từ **[KKPhim (phimapi.com)](https://phimapi.com)** — nguồn cung cấp dữ liệu phim, hình ảnh, và link HLS streaming miễn phí.

---

## 📜 License

MIT © [nan-ntn36](https://github.com/nan-ntn36)
