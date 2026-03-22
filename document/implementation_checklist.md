# 📋 Anime3D-Chill — Checklist Triển Khai

> Dựa trên [implementation_plan.md](file:///d:/Workspace/reactJS_nextjs/product-manager/anime3d-chill/document/implementation_plan.md). Chia thành **5 giai đoạn**, ước lượng **~22 ngày làm việc**.

---

## 🎯 Mục Tiêu Tiên Quyết — Quy Tắc Documentation

> [!CAUTION]
> **BẮT BUỘC**: Sau khi hoàn thành mỗi task/module, **phải tạo 2 file tài liệu** và lưu vào folder `document/`. Task **chưa được coi là hoàn thành** nếu chưa có cả 2 document đi kèm.

### Quy tắc — Mỗi ngày/module phải có 2 file

#### 📘 File 1: Hướng dẫn chạy (`dayXX-<tên>-run.md`)

Dành cho **người mới** muốn chạy được code nhanh nhất:

- ✅ **Yêu cầu phần mềm** (prerequisites): phiên bản Node.js, Docker, npm, v.v.
- ✅ **Từng bước chạy** (step-by-step): clone repo → install → config → start
- ✅ **Chạy Local** vs **Chạy Docker**: hướng dẫn riêng cho cả 2 cách
- ✅ **Kiểm tra kết quả**: URL nào mở được, curl lệnh gì, output mong đợi
- ✅ **Troubleshooting**: các lỗi thường gặp + cách khắc phục
- ✅ **Biến môi trường**: giải thích ý nghĩa từng biến trong `.env`

#### 📗 File 2: Giải thích triển khai code (`dayXX-<tên>-code.md`)

Dành cho **developer** muốn hiểu code hoạt động thế nào:

- ✅ **Kiến trúc tổng quan**: sơ đồ (mermaid) các service/module liên kết
- ✅ **Giải thích từng file**: mục đích, logic chính, các function quan trọng
- ✅ **Quyết định thiết kế**: TẠI SAO chọn giải pháp này (ví dụ: tại sao dùng `legacy-peer-deps`)
- ✅ **Mối liên hệ**: module này phụ thuộc/kết nối với module nào
- ✅ **Lưu ý quan trọng**: edge cases, gotchas, breaking changes
- ✅ **Ví dụ code**: snippet minh họa cách sử dụng/mở rộng

### Cấu trúc folder `document/`

```
document/
├── implementation_plan.md              # Plan tổng thể
├── implementation_checklist.md         # Checklist này
├── phase-1/
│   ├── day01-monorepo-docker-run.md    # Hướng dẫn chạy
│   ├── day01-monorepo-docker-code.md   # Giải thích code
│   ├── day02-backend-foundation-run.md
│   ├── day02-backend-foundation-code.md
│   ├── day03-database-auth-run.md
│   ├── day03-database-auth-code.md
│   ├── day04-frontend-foundation-run.md
│   └── day04-frontend-foundation-code.md
├── phase-2/
│   ├── day05-movie-proxy-cache-run.md
│   ├── day05-movie-proxy-cache-code.md
│   ├── day06-movie-routes-run.md
│   ├── day06-movie-routes-code.md
│   ├── day07-homepage-components-run.md
│   ├── day07-homepage-components-code.md
│   ├── day08-banner-3d-run.md
│   └── day08-banner-3d-code.md
├── phase-3/
│   ├── day09-movie-detail-run.md
│   ├── day09-movie-detail-code.md
│   ├── day10-11-video-player-run.md
│   ├── day10-11-video-player-code.md
│   ├── day12-watch-progress-run.md
│   ├── day12-watch-progress-code.md
│   ├── day13-favorites-history-run.md
│   ├── day13-favorites-history-code.md
│   ├── day14-search-run.md
│   └── day14-search-code.md
├── phase-4/
│   ├── day15-admin-dashboard-run.md
│   ├── day15-admin-dashboard-code.md
│   ├── day16-profile-continue-watching-run.md
│   ├── day16-profile-continue-watching-code.md
│   ├── day17-analytics-trending-run.md
│   ├── day17-analytics-trending-code.md
│   ├── day18-seo-accessibility-run.md
│   └── day18-seo-accessibility-code.md
└── phase-5/
    ├── day19-testing-run.md
    ├── day19-testing-code.md
    ├── day20-e2e-performance-run.md
    ├── day20-e2e-performance-code.md
    ├── day21-cdn-flags-security-run.md
    ├── day21-cdn-flags-security-code.md
    ├── day22-docker-deploy-run.md
    └── day22-docker-deploy-code.md
```

### Checklist documentation mỗi ngày

Thêm vào cuối mỗi ngày làm việc:

- [ ] 📘 Tạo file **hướng dẫn chạy** (`dayXX-<tên>-run.md`) — đủ chi tiết để người mới follow được
- [ ] 📗 Tạo file **giải thích code** (`dayXX-<tên>-code.md`) — đủ chi tiết để developer hiểu
- [ ] 📂 Lưu vào `document/phase-X/`
- [ ] ✅ Review lại 2 documents đảm bảo đầy đủ nội dung bắt buộc

---

## Phase 1 — Nền Tảng (P0) · Ngày 1–4

### Ngày 1 · Monorepo & DevOps Setup

**Module: Monorepo**
- [x] Khởi tạo project root: `turbo.json`, `package.json` (workspaces)
- [x] Tạo `.gitignore`, `.env.example`
- [x] Tạo cấu trúc thư mục `client/` và `server/`
- [x] Config Turborepo scripts (`dev`, `build`, `lint`)

**Module: Docker**
- [x] Viết `docker-compose.yml` (MySQL 8.0, Redis 7, server, client)
- [x] Viết `server/Dockerfile`
- [x] Viết `client/Dockerfile`
- [x] Test `docker-compose up` chạy thành công

---

### Ngày 2 · Backend Foundation

**Module: Server Config**
- [ ] Init `server/package.json` + cài dependencies (Express, Sequelize, ioredis, Pino, v.v.)
- [ ] `src/config/env.js` — load biến môi trường + validation
- [ ] `src/config/database.js` — kết nối Sequelize → MySQL
- [ ] `src/config/redis.js` — kết nối ioredis + fallback `node-cache`
- [ ] `server/.env.example` với tất cả biến cần thiết

**Module: Middleware Stack**
- [ ] `src/middleware/requestId.js` — gắn UUID cho mỗi request
- [ ] `src/middleware/rateLimiter.js` — rate limit theo IP/User (Redis store)
- [ ] `src/middleware/errorHandler.js` — xử lý lỗi tập trung
- [ ] `src/middleware/validate.js` — wrapper cho express-validator
- [ ] Setup Helmet, CORS, cookie-parser trong `src/index.js`

**Module: Logging**
- [ ] `src/utils/logger.js` — Pino logger (JSON structured)
- [ ] `src/utils/response.js` — helper format response chuẩn (`success/error`)
- [ ] Endpoint `GET /api/v1/health` + `GET /api/v1/ready`

---

### Ngày 3 · Database Models & Auth Backend

**Module: Models (Sequelize)**
- [ ] `src/models/User.js` — users table + hooks (hash password)
- [ ] `src/models/RefreshToken.js` — refresh_tokens table
- [ ] `src/models/Favorite.js` — favorites table
- [ ] `src/models/WatchHistory.js` — watch_history table
- [ ] `src/models/MovieView.js` — movie_views table (analytics)
- [ ] `src/models/index.js` — associations + sync
- [ ] Tạo Sequelize migrations cho tất cả bảng
- [ ] Tạo seeders: admin account, test users

**Module: Auth (JWT)**
- [ ] `src/utils/jwt.js` — tạo/xác minh access + refresh token
- [ ] `src/middleware/auth.js` — xác thực JWT middleware
- [ ] `src/middleware/authorize.js` — phân quyền theo role
- [ ] `src/validators/authValidators.js` — rules cho register/login
- [ ] `src/controllers/authController.js` — register, login, refresh, logout, logout-all, me
- [ ] `src/routes/v1/authRoutes.js` — mount tất cả auth endpoints
- [ ] Token rotation logic (vô hiệu token cũ khi refresh)
- [ ] Cookie HttpOnly cho refresh token
- [ ] Khóa tài khoản sau 10 lần login thất bại

---

### Ngày 4 · Frontend Foundation

**Module: Client Setup**
- [ ] Init Vite + React project (`client/package.json`)
- [ ] Cài tất cả frontend dependencies
- [ ] `vite.config.js` — proxy API, alias paths
- [ ] `src/index.css` — hệ thống thiết kế (CSS variables, dark theme, typography)

**Module: Routing & Layout**
- [ ] `src/App.jsx` — React Router DOM setup, code split lazy routes
- [ ] `src/main.jsx` — QueryClientProvider, ErrorBoundary, HelmetProvider
- [ ] `src/components/layout/Header.jsx` + `.css` — navigation, responsive
- [ ] `src/components/layout/Footer.jsx` + `.css`
- [ ] `src/components/layout/AppLayout.jsx` — wrapper layout
- [ ] `src/components/common/ErrorBoundary.jsx` — class component

**Module: API Layer**
- [ ] `src/api/axiosConfig.js` — base URL, interceptors, auto refresh token
- [ ] `src/api/authApi.js` — register, login, refresh, logout, getMe
- [ ] `src/api/movieApi.js` — getNew, getDetail, search, getByGenre, v.v.
- [ ] `src/api/userApi.js` — updateProfile, getFavorites, getHistory

**Module: State Management**
- [ ] `src/store/authStore.js` — Zustand: user, token, login/logout actions
- [ ] `src/store/playerStore.js` — Zustand: playing, volume, episode, v.v.
- [ ] `src/store/uiStore.js` — Zustand: sidebar, modal, theme

**Module: Cron Jobs**
- [ ] `src/jobs/cleanExpiredTokens.js` — xóa refresh token hết hạn (daily 3AM)
- [ ] `src/jobs/index.js` — đăng ký tất cả cron jobs

---

## Phase 2 — Phim Cốt Lõi (P0) · Ngày 5–8

### Ngày 5 · Movie Proxy + Cache Backend

**Module: nguonc Service**
- [ ] `src/services/nguoncService.js` — proxy gọi API phim.nguonc.com
- [ ] Implement cache-first strategy (Redis → API → save cache)
- [ ] Implement retry (2 lần, exponential backoff)
- [ ] Implement circuit breaker (5 fails → ngắt 60s)
- [ ] Stale-while-revalidate logic
- [ ] Fallback khi Redis down → `node-cache` in-memory

**Module: Data Transformer**
- [ ] `src/services/nguoncTransformer.js`
  - [ ] `transformMovieListResponse()` → `{ items, pagination }`
  - [ ] `transformMovieDetailResponse()` → normalized detail
  - [ ] `transformEpisodeResponse()` → normalized episodes

**Module: Cache Helper**
- [ ] `src/utils/cache.js` — get/set/del/flush helpers cho Redis

---

### Ngày 6 · Movie Routes Backend + Validators

**Module: Movie API**
- [ ] `src/validators/movieValidators.js` — validate slug, page, keyword
- [ ] `src/controllers/movieController.js`:
  - [ ] `getNewMovies` — phim mới (?page)
  - [ ] `getMoviesByList` — danh sách theo slug (?page)
  - [ ] `getMovieDetail` — chi tiết theo slug
  - [ ] `getByGenre` — theo thể loại
  - [ ] `getByCountry` — theo quốc gia
  - [ ] `getByYear` — theo năm
  - [ ] `searchMovies` — tìm kiếm (?keyword)
- [ ] `src/routes/v1/movieRoutes.js` — mount routes
- [ ] `src/routes/v1/index.js` — tổng hợp auth + movie routes

---

### Ngày 7 · Frontend — Trang Chủ & Movie Components

**Module: UI Components**
- [ ] `src/components/ui/Skeleton.jsx` — loading skeleton
- [ ] `src/components/ui/Pagination.jsx` — phân trang
- [ ] `src/components/ui/SearchBar.jsx` — ô tìm kiếm
- [ ] `src/components/movie/MovieCard.jsx` + `.css` — card phim (poster, title, year, quality)
- [ ] `src/components/movie/MovieGrid.jsx` — grid responsive

**Module: Movie Hooks**
- [ ] `src/hooks/useMovies.js`:
  - [ ] `useNewMovies(page)` — TanStack Query
  - [ ] `useMovieDetail(slug)` — TanStack Query
  - [ ] `useMoviesByGenre(slug, page)`
  - [ ] `useSearchMovies(keyword, page)`

**Module: Trang Chủ**
- [ ] `src/pages/HomePage.jsx` — layout sections: phim mới, phim bộ, phim lẻ
- [ ] `src/components/movie/MovieCarousel.jsx` — Swiper slider nổi bật
- [ ] Fallback UI: component `ErrorFallback` với nút Thử lại

---

### Ngày 8 · Banner 3D (Three.js)

**Module: HeroBanner3D**
- [ ] `src/components/banner/HeroBanner3D.jsx`:
  - [ ] Canvas scene với @react-three/fiber
  - [ ] Poster planes trôi nổi 3D
  - [ ] Hệ thống hạt (particles) nền
  - [ ] Camera chuyển cảnh mượt mà
  - [ ] Click poster → navigate tới chi tiết
- [ ] Overlay HTML: title, genre, nút phát
- [ ] `frameloop="demand"` + lazy load textures + `Suspense`
- [ ] Mobile: đơn giản hóa (ít hạt, poster tĩnh)
- [ ] Feature flag: `FEATURE_3D_BANNER` → fallback ảnh tĩnh
- [ ] ErrorBoundary riêng cho Banner 3D

---

## Phase 3 — Player & Tính Năng User (P0) · Ngày 9–14

### Ngày 9 · Trang Chi Tiết Phim

**Module: MovieDetailPage**
- [ ] `src/pages/MovieDetailPage.jsx`:
  - [ ] Hiển thị poster, title, mô tả, thể loại, quốc gia, năm, diễn viên, đạo diễn
  - [ ] Danh sách tập (grid/list selector)
  - [ ] Selector server (dropdown)
  - [ ] Nút Yêu thích (toggle)
  - [ ] Prefetch m3u8 URL tập 1
- [ ] SEO: `react-helmet-async` cho title + meta description + OG image

---

### Ngày 10–11 · Video Player

**Module: MoviePlayer (HLS.js)**
- [ ] `src/components/movie/MoviePlayer.jsx`:
  - [ ] Tích hợp `hls.js` + fallback Safari native HLS
  - [ ] Custom controls: play/pause, progress bar, volume, fullscreen
  - [ ] Phím tắt: Space, M, F, ←/→, ↑/↓
  - [ ] Chế độ rạp (theater mode)
  - [ ] Buffer/loading states (skeleton → spinner → play)
  - [ ] Error states: stream chết → "Nguồn phim lỗi" + nút Đổi server / Thử lại
- [ ] `src/pages/MoviePlayerPage.jsx` — page wrapper
- [ ] `src/hooks/usePlayer.js` — hook quản lý player logic
- [ ] ErrorBoundary riêng cho Player
- [ ] Nhớ âm lượng → `localStorage`
- [ ] Preload tập tiếp theo khi đạt 80% thời lượng

---

### Ngày 12 · Watch Progress — Guest & User Mode

**Module: Watch Progress Service**
- [ ] `src/services/watchProgressService.js`:
  - [ ] `saveProgress()` — lưu vào localStorage (guest) hoặc server (user)
  - [ ] `loadProgress()` — đọc từ localStorage hoặc server
  - [ ] `shouldSaveProgress()` — chỉ lưu khi xem > 30s, chưa kết thúc
  - [ ] Debounce 15 giây
  - [ ] Events: pause, beforeunload, visibilitychange, chuyển tập

**Module: Guest Session**
- [ ] `src/services/guestId.js` — tạo/quản lý `anime3d_session_id` trong localStorage

**Module: History Sync**
- [ ] Backend `POST /api/v1/me/history/sync` — nhận batch, upsert idempotent
- [ ] Frontend merge logic: so sánh `updatedAt` → giữ bản mới hơn
- [ ] Sau khi merge → xóa localStorage đã sync

---

### Ngày 13 · Yêu Thích & Lịch Sử Xem

**Module: Me Routes (Backend)**
- [ ] `src/controllers/meController.js`:
  - [ ] Favorites: GET (phân trang), POST (thêm), DELETE (xóa)
  - [ ] History: GET (phân trang), POST (lưu), POST sync (batch)
  - [ ] Profile: PATCH (cập nhật hồ sơ)
- [ ] `src/validators/userValidators.js` — validate input
- [ ] `src/routes/v1/meRoutes.js` — mount routes (yêu cầu auth)
- [ ] Phân trang: `?page=1&limit=20`, max=50

**Module: Frontend Pages**
- [ ] Auth hooks: `src/hooks/useAuth.js` — login, register, logout, refresh
- [ ] `src/pages/LoginPage.jsx` — React Hook Form + validation
- [ ] `src/pages/RegisterPage.jsx` — React Hook Form + validation
- [ ] `src/components/ui/ProtectedRoute.jsx` — redirect nếu chưa login

---

### Ngày 14 · Tìm Kiếm

**Module: Search**
- [ ] `src/pages/SearchPage.jsx`:
  - [ ] Ô tìm kiếm với debounce input
  - [ ] Kết quả grid (MovieGrid)
  - [ ] Phân trang
  - [ ] Loading/empty/error states
  - [ ] Fallback: "Không thể tìm kiếm" → gợi ý duyệt theo thể loại
- [ ] `src/pages/MovieListPage.jsx` — danh sách theo thể loại/quốc gia/năm
- [ ] `src/components/ui/TopicCard.jsx` — card cho thể loại/quốc gia

---

## Phase 4 — Hoàn Thiện (P1) · Ngày 15–18

### Ngày 15 · Admin Dashboard

**Module: Admin Backend**
- [ ] `src/controllers/userController.js`:
  - [ ] GET users (phân trang + search)
  - [ ] GET user by ID
  - [ ] PATCH user (update role, active status)
  - [ ] DELETE user (soft delete)
- [ ] `src/routes/v1/adminRoutes.js` — mount routes (yêu cầu admin role)
- [ ] `GET /api/v1/admin/stats` — tổng user, phim xem nhiều, v.v.

**Module: Admin Frontend**
- [ ] `src/pages/admin/AdminDashboard.jsx` — thống kê tổng quan
- [ ] `src/pages/admin/UserManagement.jsx` — bảng user, CRUD actions

---

### Ngày 16 · Profile & Continue Watching

**Module: Profile**
- [ ] `src/pages/ProfilePage.jsx`:
  - [ ] Hiển thị thông tin user (username, email, avatar)
  - [ ] Form cập nhật profile (React Hook Form)
  - [ ] Tab: Yêu thích, Lịch sử xem
  - [ ] Phân trang cho từng tab

**Module: Xem Tiếp (Continue Watching)**
- [ ] Section "Đang Xem" trên trang chủ với thanh progress
- [ ] Prompt "Xem tiếp từ phút X:XX?" trên trang chi tiết/player
- [ ] Nút: Xem tiếp / Xem từ đầu

---

### Ngày 17 · Analytics & Trending

**Module: Analytics Backend**
- [ ] Ghi `movie_views` khi user vào trang chi tiết (dedupe bằng session_id)
- [ ] `GET /api/v1/movies/trending` — top phim, cache 15 phút
- [ ] Cron job `updateTrending` — aggregate `movie_views` mỗi 15 phút
- [ ] `src/jobs/cleanOldHistory.js` — dọn history cũ > 1 năm (weekly)

**Module: Analytics Frontend**
- [ ] Section "Trending" trên trang chủ
- [ ] Admin stats: tổng lượt xem, top phim, biểu đồ

---

### Ngày 18 · SEO & Accessibility

**Module: SEO**
- [ ] `react-helmet-async` cho mỗi page: title, meta description, OG tags
- [ ] `public/robots.txt` — allow search engines
- [ ] `public/sitemap.xml` — danh sách URL chính
- [ ] Semantic HTML: `<main>`, `<article>`, `<nav>`, `<section>`, `<h1>` mỗi trang
- [ ] URL canonical, OG image từ poster phim

**Module: Accessibility (A11y)**
- [ ] Keyboard navigation: Tab, Enter/Space
- [ ] `aria-label` cho player controls
- [ ] Color contrast ≥ 4.5:1
- [ ] Alt text cho poster images (dùng tên phim)
- [ ] Focus visible outline
- [ ] Skip-to-content link

---

## Phase 5 — Sẵn Sàng Production (P1–P2) · Ngày 19–22

### Ngày 19 · Testing Suite

**Module: Unit Tests (Vitest)**
- [ ] Backend:
  - [ ] `tests/unit/auth.test.js` — hash password, verify login
  - [ ] `tests/unit/jwt.test.js` — tạo/xác minh/hết hạn
  - [ ] `tests/unit/transformer.test.js` — chuyển đổi data nguonc
  - [ ] Validators, Cache helpers
- [ ] Frontend:
  - [ ] `MovieCard` render đúng
  - [ ] `Header` responsive + navigation
  - [ ] `ProtectedRoute` redirect logic
  - [ ] `authStore` state transitions

**Module: Integration Tests (Supertest)**
- [ ] `tests/integration/auth.routes.test.js` — full auth flow
- [ ] `tests/integration/movie.routes.test.js` — proxy + cache + transform
- [ ] `tests/integration/favorite.routes.test.js` — CRUD + auth

---

### Ngày 20 · E2E Tests + Performance

**Module: E2E Tests (Playwright)**
- [ ] Auth flow: register → login → protected page → logout
- [ ] Browse: home → click movie → detail → play episode
- [ ] Search: keyword → results → click movie
- [ ] Favorites: login → add → verify list
- [ ] Player: play → pause → resume from position
- [ ] Responsive: test 375px, 768px, 1280px

**Module: Performance Budget**
- [ ] Đo bundle size < 300KB gzipped (main)
- [ ] FCP < 1.5s, LCP < 2.5s, TTI < 3.0s
- [ ] Code split theo route: `React.lazy()` + `Suspense` cho mỗi page
- [ ] Lazy load Three.js (chỉ khi scroll vào viewport)
- [ ] Lazy load HLS.js (chỉ khi vào player page)
- [ ] Dynamic import: `import('three')`
- [ ] Tree shaking: chỉ import icons cần dùng từ `react-icons`
- [ ] Images: `loading="lazy"`, responsive `srcSet`

---

### Ngày 21 · CDN, Feature Flags & Security

**Module: CDN & Image Proxy**
- [ ] `GET /api/v1/images/:encodedUrl` — backend proxy ảnh
- [ ] Response headers: `Cache-Control: public, max-age=86400`
- [ ] Frontend: `loading="lazy"` + placeholder khi ảnh lỗi
- [ ] Flag `FEATURE_IMAGE_PROXY` kiểm soát bật/tắt

**Module: Feature Flags**
- [ ] `src/utils/featureFlags.js`:
  - [ ] `FEATURE_3D_BANNER` (default: true)
  - [ ] `FEATURE_PRERENDER` (default: false)
  - [ ] `FEATURE_ANALYTICS` (default: true)
  - [ ] `FEATURE_IMAGE_PROXY` (default: false)
  - [ ] `DEBUG_MODE` (default: false)

**Module: Security Checklist**
- [ ] Helmet headers enabled
- [ ] CORS whitelist (`CLIENT_URL` only)
- [ ] Rate limit hoạt động (test 429)
- [ ] Password bcrypt hashing
- [ ] JWT rotate refresh tokens
- [ ] Account lockout sau 10 fails
- [ ] Input validation tất cả endpoints
- [ ] Không leak stack trace ở production
- [ ] Dependency audit: `npm audit`

---

### Ngày 22 · Docker Production & Deploy

**Module: Docker Production**
- [ ] Optimize Dockerfiles: multi-stage build, .dockerignore
- [ ] `docker-compose.prod.yml` (nếu cần)
- [ ] Health check config trong Docker
- [ ] Test `docker-compose up --build` production mode

**Module: Deploy**
- [ ] Frontend → Vercel / Netlify / Nginx
- [ ] Backend → Render / Railway / VPS
- [ ] MySQL → PlanetScale / AWS RDS
- [ ] Redis → Upstash / Redis Cloud
- [ ] Config environment variables production
- [ ] Test full luồng trên staging

**Module: Documentation**
- [ ] README.md — hướng dẫn cài đặt, chạy dev, deploy
- [ ] API docs (endpoint list, request/response samples)

---

## 📊 Tổng Kết

| Phase | Mô tả | Ngày | Ưu tiên |
|:---|:---|:---|:---|
| **Phase 1** | Nền Tảng | 1–4 | P0 |
| **Phase 2** | Phim Cốt Lõi | 5–8 | P0 |
| **Phase 3** | Player & User Features | 9–14 | P0 |
| **Phase 4** | Hoàn Thiện | 15–18 | P1 |
| **Phase 5** | Production Ready | 19–22 | P1–P2 |

> [!TIP]
> Mỗi "ngày" ước lượng cho **1 ngày làm việc tập trung (~6-8h)**. Tùy tốc độ thực tế có thể điều chỉnh linh hoạt. Các task P2 (PWA, light/dark toggle, comments) chưa đưa vào checklist này — có thể bổ sung sau Phase 5.
