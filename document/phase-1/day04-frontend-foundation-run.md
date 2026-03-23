# Ngày 4 — Frontend Foundation · Hướng Dẫn Chạy

> Setup nền tảng frontend: design system, routing, API layer, state management.

---

## Chạy Bằng Docker

```bash
docker compose up --build -d

# Kiểm tra client
docker logs anime3d-client --tail 5
# Expected: VITE v6.x ready in xxx ms

# Kiểm tra server (cron jobs)
docker logs anime3d-server --tail 5
# Expected: 📅 Cron jobs registered: cleanExpiredTokens (daily 3:00 AM)
```

---

## Truy Cập

| URL | Trang |
|:---|:---|
| http://localhost:3000 | Home — skeleton cards |
| http://localhost:3000/dang-nhap | Login form |
| http://localhost:3000/phim/test-slug | Movie detail placeholder |
| http://localhost:3000/abc123 | 404 Not Found |
| http://localhost:5000/api-docs | Swagger API docs |

---

## Kiểm Tra Nhanh

### Navigation
- Click các nav links → URL thay đổi, không reload trang (SPA)
- Hamburger menu hiện trên mobile (< 768px)

### Search
- Nhập "naruto" → Enter → redirect `/tim-kiem?keyword=naruto`

### Design System
- Dark theme, gradient text, skeleton loading cards
- Sticky header với glassmorphism effect

---

## Cấu Trúc Thư Mục (Sau Day 4)

```
client/src/
├── api/
│   ├── axiosConfig.js      ← interceptors + auto refresh
│   ├── authApi.js
│   ├── movieApi.js
│   └── userApi.js
├── components/
│   ├── common/
│   │   └── ErrorBoundary.jsx
│   └── layout/
│       ├── AppLayout.jsx
│       ├── Header.jsx + .css
│       └── Footer.jsx + .css
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── MovieDetail.jsx
│   └── NotFound.jsx
├── store/
│   ├── authStore.js        ← Zustand
│   ├── playerStore.js
│   └── uiStore.js
├── App.jsx                 ← React Router + lazy load
├── main.jsx                ← Providers
└── index.css               ← Design system
```
