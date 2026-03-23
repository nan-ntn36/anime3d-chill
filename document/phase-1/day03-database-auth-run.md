# Ngày 3 — Database Models & Auth Backend · Hướng Dẫn Chạy

> Hướng dẫn chạy và test hệ thống database models + authentication JWT.

---

## Chạy Bằng Docker

```bash
# Start tất cả services
docker compose up --build -d

# Kiểm tra server logs
docker logs anime3d-server --tail 20
# Expected:
# ✅ Database connected successfully
# ✅ Database models synced successfully
# ✅ Seeded 3 users (admin: admin@anime3d.local)
# ✅ Redis connected successfully
# 🚀 Server running on http://localhost:5000
```

---

## Test Auth Endpoints

### 1. Login (Admin)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@anime3d.local","password":"Admin@123"}'

# Response: { success: true, data: { user: {...}, accessToken: "eyJ..." } }
# Cookie: refreshToken (HttpOnly)
```

### 2. Register

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"myuser","email":"my@test.com","password":"MyPass@1"}'

# Response: { success: true, data: { user: {...}, accessToken: "eyJ..." } }
```

### 3. Get Me (Protected)

```bash
# Lấy accessToken từ login, gán vào $TOKEN
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Response: { success: true, data: { user: {...} } }
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  --cookie "refreshToken=<token_từ_login>"

# Response: { success: true, data: { accessToken: "eyJ..." } }
# Cookie mới được set (token rotation)
```

### 5. Logout

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  --cookie "refreshToken=<token>"

# Response: { success: true, data: { message: "Đăng xuất thành công" } }
```

### 6. Validation Error

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bad","password":"short"}'

# Response: { success: false, code: "VALIDATION_ERROR", errors: [...] }
```

---

## Seeded Accounts

| Username | Email | Password | Role |
|:---|:---|:---|:---|
| `admin` | `admin@anime3d.local` | `Admin@123` | admin |
| `testuser1` | `user1@anime3d.local` | `User@123` | user |
| `testuser2` | `user2@anime3d.local` | `User@123` | user |

---

## Swagger API Docs

Mở trình duyệt: http://localhost:5000/api-docs → Tab **Auth** để test trực tiếp.

---

## Troubleshooting

### ❌ "Executing (default): SELECT TABLE_NAME..." chạy lâu
- Bình thường lần đầu: Sequelize đang `ALTER TABLE` để sync schema. Các lần sau sẽ nhanh hơn.

### ❌ Login trả 401 "Invalid credentials"
- Kiểm tra seeder đã chạy: `docker logs anime3d-server | grep Seeded`
- Mật khẩu phải đúng format (case-sensitive)

### ❌ Token expired
- Access token hết hạn sau 15 phút → gọi `/auth/refresh` để lấy token mới
