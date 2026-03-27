# Day 16 — Profile & Continue Watching: Giải Thích Code

## Kiến Trúc

```mermaid
graph TB
    subgraph Homepage
        CW[ContinueWatching] -->|read| LS[(localStorage)]
    end

    subgraph PlayerPage
        RP[Resume Prompt] -->|read| LS
        Player[MoviePlayer] -->|write| LS
        Player -->|saveHistory| API[/api/v1/me/history]
    end

    subgraph ProfilePage
        SF[Settings Form] -->|updateProfile| PAPI[/api/v1/me/profile]
        HT[History Tab] -->|getHistory| API
        FT[Favorites Tab] -->|getFavorites| FAPI[/api/v1/me/favorites]
    end
```

## Files Thay Đổi

### Frontend (client/)

| File | Thay đổi |
|------|----------|
| `pages/Profile.jsx` | Thêm settings form: avatar URL + đổi mật khẩu (show/hide toggle) |
| `pages/Profile.css` | CSS cho form settings: avatar preview, form fields, input wrap |
| `components/home/ContinueWatching.jsx` | [NEW] Section "Đang Xem" — đọc localStorage, thumbnail + progress bar |
| `components/home/ContinueWatching.css` | [NEW] Responsive grid (6→4→3→2 columns), hover effects |
| `pages/Home.jsx` | Import + render `<ContinueWatching />` sau GenreCards |
| `pages/MoviePlayerPage.jsx` | Resume prompt: "Xem tiếp / Xem từ đầu" khi progress > 60s |
| `components/movie/MoviePlayer.css` | CSS resume prompt: slideDown animation, amber-accented banner |

### Backend (không thay đổi)
Tất cả API đã có từ trước: `meController.js`, `meRoutes.js`, `WatchHistory` model

## Quyết Định Thiết Kế

### localStorage-first cho ContinueWatching
- Không cần API call → hiển thị ngay, kể cả guest
- Đồng bộ lên server khi đã login (saveHistory)
- Remove button xóa trực tiếp khỏi localStorage

### Resume prompt vs auto-resume
- Chỉ hiện prompt khi > 60s và chưa xem gần hết (còn > 30s)
- Cho user quyền chọn thay vì tự nhảy → UX tốt hơn
- `startTime` chỉ set sau khi user click, tránh player seek sai

### Profile form đơn giản (không React Hook Form)
- Chỉ 4 fields → controlled form đủ dùng
- Validates: empty check, min 6 chars, confirm match
- Backend validates lại (express-validator)
