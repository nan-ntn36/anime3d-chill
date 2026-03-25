---
name: implementation-checklist
description: Quản lý và thực thi checklist triển khai dự án Anime3D-Chill theo 5 phase, 22 ngày. Hỗ trợ tra cứu task, xác định task tiếp theo, và tạo documentation theo quy tắc.
---

# Skill: Implementation Checklist — Anime3D-Chill

## Mục Đích

Skill này giúp bạn làm việc hiệu quả với **checklist triển khai** của dự án Anime3D-Chill. Khi được gọi, skill sẽ:

1. **Tra cứu trạng thái** — Xác định các task đã hoàn thành `[x]`, đang làm `[/]`, và chưa làm `[ ]`
2. **Xác định task tiếp theo** — Tìm task tiếp theo cần làm dựa trên thứ tự phase và ngày
3. **Hướng dẫn thực thi** — Cung cấp context đầy đủ cho task hiện tại (module, files, dependencies)
4. **Tạo documentation** — Tự động tạo 2 file tài liệu bắt buộc sau mỗi task/module

---

## Tham Chiếu

- **Checklist chính**: [implementation_checklist.md](file:///e:/workline/anime3d-chill/document/implementation_checklist.md)
- **Plan tổng thể**: [implementation_plan.md](file:///e:/workline/anime3d-chill/document/implementation_plan.md)
- **Folder documentation**: `e:\workline\anime3d-chill\document\`

---

## Hướng Dẫn Sử Dụng

### 1. Tra cứu trạng thái hiện tại

Khi user yêu cầu kiểm tra tiến độ, thực hiện:

```
1. Đọc file `document/implementation_checklist.md`
2. Đếm số task theo trạng thái:
   - [x] = Hoàn thành
   - [/] = Đang thực hiện
   - [ ] = Chưa làm
3. Xác định Phase hiện tại và ngày đang làm
4. Báo cáo tóm tắt tiến độ
```

### 2. Xác định task tiếp theo

Khi user hỏi "làm gì tiếp?", thực hiện:

```
1. Đọc checklist, tìm task [ ] đầu tiên (chưa hoàn thành)
2. Xác định task đó thuộc Phase nào, Ngày nào, Module nào
3. Liệt kê tất cả sub-tasks trong module đó
4. Kiểm tra dependencies (các module trước đã hoàn thành chưa)
5. Đề xuất kế hoạch thực hiện chi tiết
```

### 3. Thực thi một task/module

Khi bắt đầu làm một task cụ thể:

```
1. Đọc checklist để lấy danh sách sub-tasks của module
2. Đọc implementation_plan.md để lấy context chi tiết (tech stack, patterns, conventions)
3. Cập nhật task status thành [/] trong checklist
4. Thực hiện từng sub-task theo thứ tự
5. Sau khi hoàn thành, cập nhật thành [x]
6. Tạo 2 file documentation bắt buộc (xem mục 4)
```

### 4. Tạo Documentation (BẮT BUỘC)

> [!CAUTION]
> Mỗi ngày/module **PHẢI** có 2 file tài liệu. Task chưa được coi là hoàn thành nếu thiếu.

#### File 1: Hướng dẫn chạy — `dayXX-<tên>-run.md`

Lưu vào `document/phase-X/`. Nội dung bắt buộc:

- **Yêu cầu phần mềm** (prerequisites)
- **Từng bước chạy** (step-by-step): clone → install → config → start
- **Chạy Local** vs **Chạy Docker**
- **Kiểm tra kết quả**: URL, curl commands, output mong đợi
- **Troubleshooting**: lỗi thường gặp + cách fix
- **Biến môi trường**: giải thích từng biến `.env`

#### File 2: Giải thích code — `dayXX-<tên>-code.md`

Lưu vào `document/phase-X/`. Nội dung bắt buộc:

- **Kiến trúc tổng quan**: sơ đồ mermaid
- **Giải thích từng file**: mục đích, logic chính
- **Quyết định thiết kế**: TẠI SAO chọn giải pháp này
- **Mối liên hệ**: module phụ thuộc/kết nối với module nào
- **Lưu ý quan trọng**: edge cases, gotchas
- **Ví dụ code**: snippet minh họa

---

## Cấu Trúc Dự Án

```
anime3d-chill/
├── client/          # Frontend (Vite + React)
├── server/          # Backend (Express + Sequelize)
├── document/        # Documentation theo phase
│   ├── phase-1/     # Day 1-4: Nền tảng
│   ├── phase-2/     # Day 5-8: Phim cốt lõi
│   ├── phase-3/     # Day 9-14: Player & User
│   ├── phase-4/     # Day 15-18: Hoàn thiện
│   └── phase-5/     # Day 19-22: Production
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Tổng Quan 5 Phase

| Phase | Mô tả | Ngày | Ưu tiên | Trạng thái |
|:------|:-------|:-----|:--------|:-----------|
| **Phase 1** | Nền Tảng (Monorepo, Backend, DB, Auth, Frontend) | 1–4 | P0 | ✅ Hoàn thành |
| **Phase 2** | Phim Cốt Lõi (Proxy, Cache, Routes, Homepage, Banner) | 5–8 | P0 | 🔄 Đang làm |
| **Phase 3** | Player & User Features (Detail, Player, Progress, Favorites, Search) | 9–14 | P0 | ⬜ Chưa làm |
| **Phase 4** | Hoàn Thiện (Admin, Profile, Analytics, SEO) | 15–18 | P1 | ⬜ Chưa làm |
| **Phase 5** | Production Ready (Testing, E2E, CDN, Deploy) | 19–22 | P1–P2 | ⬜ Chưa làm |

---

## Quy Tắc Quan Trọng

1. **Thứ tự thực hiện**: Làm theo thứ tự Phase → Ngày → Module. Không nhảy phase.
2. **Dependencies**: Kiểm tra module trước đã hoàn thành trước khi bắt đầu module mới.
3. **Documentation**: 2 files bắt buộc cho mỗi ngày/module.
4. **Cập nhật checklist**: Luôn cập nhật `implementation_checklist.md` khi bắt đầu `[/]` và hoàn thành `[x]` task.
5. **Convention**: Tuân theo coding conventions đã thiết lập trong Phase 1 (folder structure, naming, patterns).

---

## Ví Dụ Gọi Skill

### Kiểm tra tiến độ
```
User: "Checklist đang ở đâu rồi?" hoặc "Tiến độ thế nào?"
→ Skill tra cứu checklist và báo cáo tóm tắt
```

### Làm task tiếp theo
```
User: "Làm task tiếp theo đi" hoặc "Bắt đầu ngày 9"
→ Skill xác định task, đọc context, bắt đầu thực hiện
```

### Tạo documentation
```
User: "Tạo doc cho ngày 7" hoặc "Viết documentation"
→ Skill tạo 2 files: day07-homepage-components-run.md + day07-homepage-components-code.md
```

### Xem tổng quan module
```
User: "Ngày 10 cần làm gì?"
→ Skill liệt kê tất cả sub-tasks của Ngày 10-11 (Video Player)
```
