# Ngày 7 — Trang Chủ & Movie Components · Hướng Dẫn Chạy

> UI components, TanStack Query hooks, trang chủ với dữ liệu phim thật.

---

## Chạy

```bash
docker compose up --build -d
```

Truy cập http://localhost:3000 — trang chủ hiển thị phim thật từ API.

---

## Cấu Trúc File (Sau Day 7)

```
client/src/
├── api/
│   └── movieApi.js             ← Fix URLs khớp Day 6 routes
├── hooks/
│   └── useMovies.js            ← 6 TanStack Query hooks
├── components/
│   ├── ui/
│   │   ├── Skeleton.jsx        ← Loading placeholder
│   │   ├── Pagination.jsx+.css ← Phân trang với ellipsis
│   │   └── SearchBar.jsx+.css  ← Ô tìm kiếm
│   ├── movie/
│   │   ├── MovieCard.jsx+.css  ← Card phim (poster, badges, hover)
│   │   ├── MovieGrid.jsx+.css  ← Grid responsive (5→2 cols)
│   │   └── MovieCarousel.jsx+.css ← Horizontal scroll-snap slider
│   └── common/
│       └── ErrorFallback.jsx+.css ← Error + nút Thử lại
├── pages/
│   ├── Home.jsx+.css           ← 4 sections: phim mới, bộ, lẻ, hoạt hình
```

---

## Features Trên Trang Chủ

1. **🔥 Phim Mới** — MovieCarousel, scroll ngang, dữ liệu real-time
2. **📺 Phim Bộ** — MovieCarousel từ `/movies/list/phim-bo`
3. **🎬 Phim Lẻ** — MovieCarousel từ `/movies/list/phim-le`
4. **🎨 Hoạt Hình** — MovieGrid 5 cột từ `/movies/list/hoat-hinh`

Mỗi section có ErrorFallback + nút "Thử lại" khi API lỗi.
