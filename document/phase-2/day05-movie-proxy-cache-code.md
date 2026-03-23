# Ngày 5 — Movie Proxy + Cache Backend · Giải Thích Code

> Giải thích theo **3 features**.

---

## Feature A: Cache Helper

### `utils/cache.js`

Wrapper thống nhất cho Redis + fallback node-cache:

```mermaid
graph TD
    A[cacheGet/Set/Del/Flush] --> B{Redis connected?}
    B -->|Yes| C[Redis ioredis]
    B -->|No| D[node-cache in-memory]
```

| Function | Mô tả |
|:---|:---|
| `cacheGet(key)` | Lấy + JSON.parse. Trả `null` nếu miss |
| `cacheSet(key, data, ttl)` | JSON.stringify + SET EX. Default 300s |
| `cacheDel(key)` | Xóa 1 key |
| `cacheFlush(pattern)` | Xóa keys matching pattern (`movies:new:*`) |

**Tại sao cần wrapper**: Mọi service đều gọi `cacheGet/cacheSet` mà không cần biết đang dùng Redis hay memory cache. Tất cả operations đều **error-safe** (catch + log, không throw).

---

## Feature B: Data Transformer

### `services/nguoncTransformer.js`

Chuẩn hóa response thô từ NguonC → format frontend.

### Luồng Transform

```mermaid
graph LR
    A["NguonC Raw<br/>{status, items, paginate}"] --> B[transformMovieList]
    B --> C["{ items: [...normalized], pagination }"]

    D["NguonC Raw<br/>{status, movie}"] --> E[transformMovieDetail]
    E --> F["{ ...movie, episodes, description }"]
```

### Mapping Fields

| NguonC Field | Normalized Field | Xử lý |
|:---|:---|:---|
| `name` | `title` | Trực tiếp |
| `original_name` | `originalTitle` | Trực tiếp |
| `poster_url` | `poster` | + CDN prefix |
| `thumb_url` | `thumb` | + CDN prefix |
| `category[]` | `genres[]` | Extract `.name` |
| `country[]` | `country[]` | Extract `.name` |
| `episode_total` | `totalEpisodes` | parseInt |
| `episode_current` | `currentEpisode` | Trực tiếp |
| `episodes[].server_data` | `episodes[].items` | Normalize slug, embed, m3u8 |

### Image CDN

```js
function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `https://phimimg.com/${url}`;
}
```

---

## Feature C: NguonC Service

### `services/nguoncService.js`

Kiến trúc **3 lớp bảo vệ**:

```mermaid
graph TD
    A[Service Method] --> B[cachedFetch]
    B --> C{Cache HIT?}
    C -->|Yes| D[Return cached]
    C -->|No| E{Circuit Open?}
    E -->|Yes| F["503 UPSTREAM_ERROR"]
    E -->|No| G[fetchFromNguonC]
    G --> H{Success?}
    H -->|Yes| I[Transform + Cache + Return]
    H -->|No| J{Retries left?}
    J -->|Yes| K["Backoff (500ms, 1s)"]
    K --> G
    J -->|No| L[Record failure]
    L --> M["502 UPSTREAM_ERROR"]

    style D fill:#00b894,color:#fff
    style F fill:#e17055,color:#fff
    style M fill:#e17055,color:#fff
```

### 1. Cache-First Strategy

```js
async function cachedFetch(cacheKey, apiPath, ttl, transformer) {
  const cached = await cacheGet(cacheKey);  // Redis hoặc memory
  if (cached) return cached;                // HIT → return ngay

  const raw = await fetchFromNguonC(apiPath);  // MISS → gọi API
  const data = transformer(raw);               // Transform
  cacheSet(cacheKey, data, ttl);               // Save cache (fire-and-forget)
  return data;
}
```

### 2. Retry Strategy

| Lần | Delay | Tổng chờ |
|:---|:---|:---|
| Attempt 0 | 0ms | 0ms |
| Attempt 1 (retry 1) | 500ms | 500ms |
| Attempt 2 (retry 2) | 1000ms | 1500ms |
| → Fail | recordFailure() | throw 502 |

### 3. Circuit Breaker

```
State: CLOSED → [5 fails] → OPEN → [60s] → HALF-OPEN → [1 success] → CLOSED
                                              └→ [1 fail] → OPEN
```

| Config | Giá trị |
|:---|:---|
| Threshold | 5 lần fail liên tiếp |
| Reset time | 60 giây |
| Half-open | Cho 1 request thử |

### 7 Public Methods

| Method | NguonC Path | TTL |
|:---|:---|:---|
| `getNewMovies(page)` | `/films/phim-moi-cap-nhat?page=` | 5 min |
| `getMoviesByList(slug, page)` | `/films/danh-sach/{slug}?page=` | 15 min |
| `getMovieDetail(slug)` | `/film/{slug}` | 30 min |
| `getByGenre(slug, page)` | `/films/the-loai/{slug}?page=` | 15 min |
| `getByCountry(slug, page)` | `/films/quoc-gia/{slug}?page=` | 15 min |
| `getByYear(year, page)` | `/films/nam-phat-hanh/{year}?page=` | 15 min |
| `searchMovies(keyword, page)` | `/films/search?keyword=` | 3 min |

---

## Mối Liên Hệ Giữa 3 Feature

```mermaid
sequenceDiagram
    participant Ctrl as Controller (Day 6)
    participant Svc as nguoncService
    participant Cache as cache.js
    participant API as phim.nguonc.com
    participant Tx as nguoncTransformer

    Ctrl->>Svc: getNewMovies(1)
    Svc->>Cache: cacheGet("movies:new:page:1")
    Cache-->>Svc: null (MISS)
    Svc->>API: GET /films/phim-moi-cap-nhat?page=1
    API-->>Svc: raw JSON
    Svc->>Tx: transformMovieList(raw)
    Tx-->>Svc: { items, pagination }
    Svc->>Cache: cacheSet("movies:new:page:1", data, 300)
    Svc-->>Ctrl: { items, pagination }
```
