# Ngày 5 — Movie Proxy + Cache Backend · Hướng Dẫn Chạy

> Proxy tới phim.nguonc.com với cache Redis, retry, circuit breaker.

---

## Chạy Bằng Docker

```bash
docker compose up --build -d
docker logs anime3d-server --tail 5
```

---

## Test Service (trong Docker)

```bash
docker exec anime3d-server node -e "
  process.env.LOG_LEVEL='fatal';
  const svc = require('./src/services/nguoncService');
  (async () => {
    const d = await svc.getNewMovies(1);
    console.log('LIST:', d.items.length, 'first:', d.items[0]?.title);

    const d2 = await svc.getMovieDetail(d.items[0]?.slug);
    console.log('DETAIL:', d2?.title, 'eps:', d2?.episodes?.length);

    const d3 = await svc.searchMovies('naruto');
    console.log('SEARCH:', d3.items.length);

    // Cache hit
    const t = Date.now();
    await svc.getNewMovies(1);
    console.log('CACHE:', Date.now() - t, 'ms');
    process.exit(0);
  })()
"
```

**Expected:**
```
LIST: 10 first: <tên phim mới nhất>
DETAIL: <tên phim> eps: 1
SEARCH: 10
CACHE: 0 ms
```

---

## Cấu Trúc File (Sau Day 5)

```
server/src/
├── utils/
│   └── cache.js               ← Redis wrapper + memory fallback
├── services/
│   ├── nguoncService.js       ← Proxy 7 endpoints + cache + retry + CB
│   ├── nguoncTransformer.js   ← Normalize NguonC → frontend format
│   └── authService.js         ← (Day 3)
```

---

## Cache TTL

| Endpoint | TTL | Cache Key |
|:---|:---|:---|
| Phim mới | 5 phút | `movies:new:page:{n}` |
| Danh sách | 15 phút | `movies:list:{slug}:page:{n}` |
| Chi tiết | 30 phút | `movies:detail:{slug}` |
| Thể loại | 15 phút | `movies:genre:{slug}:page:{n}` |
| Quốc gia | 15 phút | `movies:country:{slug}:page:{n}` |
| Năm | 15 phút | `movies:year:{y}:page:{n}` |
| Tìm kiếm | 3 phút | `movies:search:{kw}:page:{n}` |
