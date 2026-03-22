# 📖 Phase 1 / Day 01 — Monorepo & Docker Setup

> Tài liệu triển khai cho ngày 1: Cấu trúc monorepo Turborepo + Docker Compose cho development.

---

## 📝 Giải Thích Code

### 1. Root Monorepo

| File | Mục đích |
|:---|:---|
| `package.json` | Config npm workspaces (`client/`, `server/`), scripts delegate qua Turborepo |
| `turbo.json` | Turborepo pipeline: `dev` (persistent, no cache), `build` (depends on `^build`), `lint`, `clean` |
| `.npmrc` | `legacy-peer-deps=true` — giải quyết conflict giữa Three.js/R3F với React 18 |
| `.gitignore` | Ignore node_modules, dist, .env, .turbo, docker-data |
| `.env.example` | Template biến môi trường cho toàn bộ project |
| `.env` | Biến môi trường development (đã có giá trị mặc định) |

**Cách hoạt động**: Turborepo quản lý 2 workspace `client` và `server`. Khi chạy `npm run dev`, Turborepo sẽ chạy song song `vite` (client) và `nodemon` (server). Mỗi workspace có `package.json` riêng nhưng share `node_modules` ở root qua hoisting.

### 2. Server (`@anime3d-chill/server`)

| File | Mục đích |
|:---|:---|
| `package.json` | Dependencies: Express, Sequelize, mysql2, ioredis, JWT, bcrypt, pino, helmet, CORS, v.v. |
| `src/index.js` | Express server với Helmet, CORS, cookie-parser, health check endpoints, 404 + error handlers |
| `Dockerfile` | Multi-stage: `dev` (nodemon), `production` (non-root user, health check) |
| `.env.example` | Template biến môi trường riêng cho server |

**Endpoints có sẵn**:
- `GET /api/v1/health` → `{ status: "ok", uptime, timestamp, environment }`
- `GET /api/v1/ready` → `{ status: "ready", services: { database, redis } }`

### 3. Client (`@anime3d-chill/client`)

| File | Mục đích |
|:---|:---|
| `package.json` | Dependencies: React 18, Vite 6, React Router, TanStack Query, Zustand, Three.js, Swiper, HLS.js, v.v. |
| `vite.config.js` | React plugin, path aliases (`@/`, `@components/`, v.v.), proxy `/api` → `localhost:5000`, manual chunks |
| `index.html` | Entry HTML: lang="vi", Inter font preload, SEO meta, dark theme color |
| `src/main.jsx` | React entry point với StrictMode |
| `src/App.jsx` | Placeholder component |
| `src/index.css` | Design system: CSS variables (colors, typography, spacing, shadows), reset, scrollbar, focus styles |
| `Dockerfile` | Multi-stage: `dev` (Vite dev server), `production` (nginx SPA) |

**Design System Tokens (index.css)**:
- **Colors**: Dark theme palette (`--color-bg-primary: #0a0a0f`, accent `#8b5cf6`)
- **Gradients**: Primary gradient `purple → cyan`
- **Typography**: Inter font, 8 size tokens, 6 weight tokens
- **Spacing**: 14 space tokens (0.25rem → 5rem)
- **Shadows**: 5 levels + glow effect

### 4. Docker Compose

| Service | Image | Port | Chi tiết |
|:---|:---|:---|:---|
| `mysql` | mysql:8.0 | 3306 | UTF-8, health check, persistent volume |
| `redis` | redis:7-alpine | 6379 | AOF persistence, health check |
| `server` | Custom (dev stage) | 5000 | Volume mount `./server`, depends on mysql+redis healthy |
| `client` | Custom (dev stage) | 3000 | Volume mount `./client`, depends on server |

---

## 🚀 Hướng Dẫn Triển Khai

### Chạy Local (không Docker)

```bash
# 1. Install dependencies
npm install

# 2. Copy env
cp .env.example .env

# 3. Chạy server
npm run server:dev

# 4. Chạy client (terminal mới)
npm run client:dev

# 5. Hoặc chạy cả hai
npm run dev
```

### Chạy với Docker

```bash
# 1. Copy env
cp .env.example .env

# 2. Build & start
docker-compose up --build

# 3. Stop
docker-compose down

# 4. Stop + xóa data
docker-compose down -v
```

### Kiểm tra

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Client
# Mở browser → http://localhost:3000
```

---

## 🔗 Mối Liên Hệ

- **Root `package.json`** → quản lý cả `client/` và `server/` qua npm workspaces
- **`turbo.json`** → orchestrate scripts song song cho 2 workspace
- **`docker-compose.yml`** → link các services: server depends on mysql + redis, client depends on server
- **`vite.config.js`** proxy → server Express ở port 5000 (giải quyết CORS trong dev)
- **`.env`** → shared bởi docker-compose, server đọc trực tiếp qua `dotenv`

---

## ⚠️ Lưu Ý Quan Trọng

1. **Peer deps**: Cần `.npmrc` với `legacy-peer-deps=true` vì conflict Three.js `@react-three/fiber` v9 yêu cầu React 19 nhưng project dùng React 18.
2. **Docker volume mount**: `node_modules` inside container được exclude (`/app/node_modules`) để tránh conflict với host OS.
3. **MySQL health check**: Server chỉ start **sau khi** MySQL healthy (30s start period). Nếu timeout → restart docker-compose.
4. **Vite proxy**: Chỉ hoạt động trong dev mode. Production cần Nginx reverse proxy hoặc cùng domain.
5. **Path aliases**: Đã config `@/`, `@components/`, `@pages/`, v.v. trong `vite.config.js` — cần dùng nhất quán trong code frontend.
