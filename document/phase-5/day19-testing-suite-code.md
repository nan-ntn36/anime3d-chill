# Ngày 19 — Testing Suite — Giải Thích Code

> Giải thích chi tiết về kiến trúc test, cách mock dependencies và các pattern được sử dụng để test ứng dụng Anime3D-Chill.

---

## Kiến Trúc Kiểm Thử

Hệ thống được thiết kế theo 3 tầng kiểm thử phổ biến để mang lại độ tin cậy tối đa:
1. **Unit Testing** (Frontend / Backend): Test một hàm, một utils, một store state.
2. **Integration Testing** (Backend): Test một chuỗi liên kết nhiều layer (Routes -> Middlewares -> Validators -> Controllers).
3. **E2E Testing** (Dự kiến Phase sau): Chạy full luồng tương tác của người dùng.

Tại Anime3D-Chill, chúng ta dùng **Vitest** làm module test runner chung cho cả 2 môi trường. Điều này đem đến độ đồng bộ về file config, tốc độ thực thi (nhờ build bởi Vite), và cú pháp tựa `jest`.

---

## Giải Thích Từng Mảng 

### Tổng Quát Backend (Node / Express)

File khởi động `server/tests/setup.js` chịu trách nhiệm thay thế các biến cấu hình (Environment Variables - `.env`) sang bản nháp (Mock) hoàn toàn nhằm đảm bảo test độc lập, không bị sụp hệ thống nếu ta vô ý can thiệp nhầm vào cấu hình Production/Development. 

#### Unit Test Utils (`jwt.test.js`, `cache.test.js`)

**Cách thực hiện**: Nhập hàm và assert kết quả trả ra.

**Điểm lưu ý ở Module Interop (CJS/ESM)**:
- `utils/cache.js` của chúng ta load file config theo cú pháp CommonJS (`require()`).
- Khi test chạy qua Vitest (ESM), một vài hàm `vi.mock` có thể không thâm nhập đầy đủ vào Module Registry, làm lỗi fallback khi test Redis Connection.
- -> *Cách giải quyết Anime3D-Chill dùng*: Tập trung vào test fallback tĩnh hoặc gián tiếp, cấu trúc module lại một cách hợp lý và dùng Integration Test.

#### Unit Test Services (`transformer.test.js`)

**Vai trò chính**:
Data lấy từ `phimapi.com` có những khi bị rỗng (null field, object thiếu dữ liệu)... Transformer sẽ ép kiểu, gắn Base URL (`https://phimimg.com/...`) hoặc điền Default Val cho toàn bộ object. Đây là khối cốt lõi cần phải pass Unit Test.
- Kiểm tra `normalizeMovieItem(null)`
- Kiểm tra `transformMovieList({})` trả về `pagination` đúng format thay vì error
- Xử lý link `trailer_url` rỗng

#### Integration API (`auth.routes.test.js`)

Test toàn chặng qua **Supertest**:
1. Lập một instance `Express App` test (nhẹ hơn index.js chính, không mount Swagger hay Database Engine thực thụ).
2. Gọi `app.use(validate)` cho Register / Login.
3. Test Validation Error Array (Lỗi 422 - Unprocessable Entity). 
   - VD: Email thiếu đuôi `@...` -> Trả về JSON lỗi.
4. Môi trường `GET /api/v1/auth/me` cần token mới cho phép truy xuất JSON Profile. Gửi kèm Headers `Authorization: Bearer <token_fake>`.

---

## Giải Quát Frontend (React / Zustand)

Thư viện: 
- `vitest`
- `@testing-library/react` (Tương tác giả lập Component như User)
- `jsdom` (Bắt chước DOM của trình duyệt Chrome trong terminal Node)

#### Unit Test Zustand (`authStore.test.js`)

Tại đây, chúng ta test Flow State của Frontend: User vào `Login` -> Request Server -> Lấy Token -> `useAuthStore.setState({ user })` -> Request Update UI.

*Cụ thể:*
1. Call hàm `getState().setAuth(...)` và theo dõi sự chuyển dịch của `isAuthenticated` từ `false -> true`.
2. Kiểm tra việc Store giữ đúng `accessToken` mới khi Refresh.
3. Test `clearAuth()` để chắn chắn `isLoading` hoặc `user` object không còn lưu lại bộ nhớ gây bẩn UI session khác.

### Lưu ý cho Phase sau

Việc có Test không bảo đảm 100% ứng dụng lỗi free, nhưng các Endpoint, Middleware cốt lõi hoặc Helper Data Mapping sẽ được duy trì bền vững hơn nếu ta liên tục cập nhật Test Case cho quá trình scale dự án trong tương lai (Ngày 20 - E2E Playwright).
