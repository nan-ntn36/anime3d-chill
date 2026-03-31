# Ngày 18 — SEO & Accessibility — Hướng Dẫn Chạy

> Hướng dẫn kiểm tra và xác nhận các cải tiến SEO & Accessibility.

---

## Yêu Cầu

| Phần mềm | Phiên bản | Mục đích |
|:---|:---|:---|
| **Node.js** | ≥ 18.x | Runtime |
| **Chrome DevTools** | Latest | Lighthouse audit |
| **npm** | ≥ 9.x | Package manager |

---

## Kiểm Tra SEO

### 1. Robots.txt

```bash
# Development
curl http://localhost:5173/robots.txt

# Expected output:
# User-agent: *
# Allow: /
# Disallow: /ca-nhan
# Disallow: /dang-nhap
# ...
# Sitemap: https://anime3d-chill.vercel.app/sitemap.xml
```

### 2. Sitemap.xml

```bash
curl http://localhost:5173/sitemap.xml

# Expected: XML with <urlset> containing 6 URLs
```

### 3. Kiểm Tra Meta Tags

Mở Chrome DevTools → Elements tab → `<head>`:

| Trang | Kiểm tra |
|:---|:---|
| **Trang chủ** (/) | title, description, og:title, og:description, og:type, canonical, twitter:card |
| **Chi tiết** (/phim/:slug) | title, description, og:title, og:image, og:type=video.movie, canonical, twitter:card, twitter:image |
| **Player** (/phim/:slug/xem) | title, description, og:title, og:type=video.episode, canonical |
| **Tìm kiếm** (/tim-kiem) | title (dynamic), description, canonical, og:title |
| **Kho phim** (/thung-phim) | title (dynamic tab), description, canonical, og:title |
| **Thể loại** (/the-loai) | title, description, canonical, og:title |
| **Đăng nhập** (/dang-nhap) | title, description, **noindex nofollow**, canonical |
| **Cá nhân** (/ca-nhan) | title, **noindex nofollow** |

### 4. Lighthouse SEO Audit

```
1. Mở Chrome DevTools → Lighthouse tab
2. Chọn "SEO" category
3. Run audit
4. Target: Score ≥ 90
```

---

## Kiểm Tra Accessibility

### 1. Skip-to-Content Link

```
1. Mở trang web bất kỳ
2. Nhấn Tab 1 lần
3. Expected: Thanh vàng "Chuyển đến nội dung chính" xuất hiện trên đầu
4. Nhấn Enter → focus di chuyển đến <main>
```

### 2. Focus Visible Outline

```
1. Mở trang web
2. Dùng Tab để navigate qua các elements
3. Expected: Viền vàng (2px solid #EAB308) xuất hiện quanh element focused
4. Dùng chuột click → không có viền (chỉ keyboard mới thấy)
```

### 3. Keyboard Navigation

| Phím | Hành động mong đợi |
|:---|:---|
| **Tab** | Di chuyển focus tới element tiếp theo |
| **Shift+Tab** | Di chuyển focus ngược lại |
| **Enter/Space** | Activate button/link |
| **←→** (Player) | Tua video ±10s |
| **M** (Player) | Toggle mute |
| **F** (Player) | Toggle fullscreen |
| **T** (Player) | Toggle theater mode |
| **Space** (Player) | Play/Pause |

### 4. Screen Reader Test

```
# Kiểm tra aria-label:
- Player controls: "Phát video", "Tạm dừng", "Tắt tiếng", "Bật tiếng", "Toàn màn hình", "Chế độ rạp"
- Volume slider: "Âm lượng"
- Progress bar: role="slider" + aria-valuenow/min/max
- Toggle menu: "Toggle menu"
- Search input: "Nhập tên phim cần tìm"
- Nav: aria-label="Điều hướng chính"
```

### 5. Alt Text Audit

```
1. Mở DevTools → Elements
2. Tìm tất cả <img>
3. Expected: alt={movie.title} hoặc alt={user.username}
4. Decorative images (backdrop): alt=""
```

### 6. Color Contrast Check

```
1. DevTools → Elements → chọn text element
2. Click vào màu color → xem contrast ratio
3. Minimum targets:
   - Primary text (#e8e8f0 on #000): ≥ 4.5:1 ✓ (contrast ~18:1)
   - Secondary text (#a0a0b8 on #000): ≥ 4.5:1 ✓ (contrast ~9.5:1)
   - Muted text (#8e8ea8 on #000): ≥ 4.5:1 ✓ (contrast ~5.7:1)
   - Accent (#EAB308 on #000): ≥ 4.5:1 ✓ (contrast ~9.5:1)
```

### 7. Lighthouse Accessibility Audit

```
1. Mở Chrome DevTools → Lighthouse tab
2. Chọn "Accessibility" category
3. Run audit
4. Target: Score ≥ 90
```

---

## Troubleshooting

### robots.txt không load

**Nguyên nhân**: Vite không serve public/ directory.

**Fix**: Đảm bảo `robots.txt` nằm trong `client/public/`. Vite tự động copy vào `dist/` khi build.

### Focus outline không hiển thị

**Nguyên nhân**: Browser chưa hỗ trợ `:focus-visible`.

**Fix**: Tất cả modern browsers (Chrome 86+, Firefox 85+, Safari 15.4+) đều hỗ trợ. IE không hỗ trợ nhưng không phải target.

### Lighthouse SEO score thấp

**Nguyên nhân phổ biến**:
- Thiếu `viewport` meta → đã có trong `index.html`
- Font size quá nhỏ → min 14px
- Link không crawlable → tất cả dùng `<Link>` hoặc `<a>` tag
