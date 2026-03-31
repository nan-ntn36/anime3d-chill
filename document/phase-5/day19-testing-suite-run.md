# Ngày 19 — Testing Suite — Hướng Dẫn Chạy Test

> Hướng dẫn cách cài đặt, cấu hình và chạy các bài test tự động cho cả Backend và Frontend sử dụng Vitest.

---

## 1. Yêu Cầu Môi Trường

Đảm bảo Node.js (≥ 18.x) và NPM (≥ 9.x) đã được cài đặt.

Các dependencies cần thiết đã được thêm trong package tương ứng, gồm có:
- **Backend**: `vitest`, `supertest`
- **Frontend**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`

---

## 2. Các Bài Kiểm Tra Backend

Các test của Backend bao gồm 3 loại chính:
1. **Unit Test - `utils`**: Xác minh token, mã hóa password...
2. **Unit Test - `transformers`**: Kiểm tra việc chuẩn hóa dữ liệu từ nguồn phim KKPhim.
3. **Integration Test**: Kết hợp nhiều lớp (Router, Middleware, Controller) qua supertest.

**Vị trí**: `server/tests/`

### Chạy Backend Tests

Chuyển vào thư mục server:
```bash
cd server
```

**Chạy toàn bộ bài test:**
```bash
npm run test
```

**Chạy với chế độ Watch (tự động chạy lại khi code đổi):**
```bash
npm run test:watch
```

**Chạy báo cáo độ phủ (Coverage):**
```bash
npm run test:coverage
```

### Các modules đang có test path:
- `tests/unit/jwt.test.js` - Generate/Verify JSON Web Token
- `tests/unit/cache.test.js` - Node cache fallback helper
- `tests/unit/transformer.test.js` - Logic mapping JSON từ phimapi.com
- `tests/integration/auth.routes.test.js` - Đăng nhập, đăng ký API endpoints

---

## 3. Các Bài Kiểm Tra Frontend

Frontend áp dụng Vitest và React Testing Library để test việc render Components cũng như logic của Zustand Store.

**Vị trí**: `client/src/__tests__/`

### Chạy Frontend Tests

Chuyển vào thư mục client:
```bash
cd client
```

**Chạy toàn bộ bài test 1 lần:**
```bash
npm run test
```

**Tương tác UI thông qua trình duyệt cho phép debug test (Vitest UI):**
```bash
npm run test:ui
```

### Các modules đang có test path:
- `client/src/__tests__/authStore.test.js` - Kiểm tra quá trình đăng nhập (login -> refresh -> logout state transition) trong Zustand.

---

## 4. Xử Lý Lỗi Thường Gặp Khi Test

| Mã Lỗi / Biểu Hiện | Nguyên Nhân | Cách Giải Quyết |
|:---|:---|:---|
| **`vitest: command not found`** | Chưa cài NPM packages | Chạy lệnh `npm install` tại thư mục đang test. |
| **Fail: `Redis Client` / `MySQL Error`** | Integration test gọi nhầm logic production gọi DB thật. | Sử dụng mock module hoặc file setup (`tests/setup.js`) để nạp giá trị môi trường tĩnh. |
| **`module requires node` khi test React** | Chưa thiết lập môi trường browser | Cấu hình `{ test: { environment: 'jsdom' } }` bên trong `vite.config.js`. |
| **Mock return bị mất ở cache get/set** | Interop CJS/ESM của Vitest không chèn mock vào logic nested `require()` | Giữ các test này kiểm tra gián tiếp thông qua component module thay vì unit test trực tiếp cho logic wrapper. |
