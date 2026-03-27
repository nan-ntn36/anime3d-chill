# 🚀 Deploy Anime3D-Chill lên Windows Server VPS

## Bước 1 — Cài Docker Desktop trên VPS

1. Mở trình duyệt trên VPS, vào: https://docs.docker.com/desktop/setup/install/windows-install/
2. Tải **Docker Desktop for Windows**
3. Chạy installer, tick ☑ **"Use WSL 2 instead of Hyper-V"** (nếu có)
4. Restart máy khi được yêu cầu
5. Mở Docker Desktop, đợi nó khởi động xong (icon cá voi xanh ở taskbar)
6. Mở **PowerShell** (Run as Administrator), kiểm tra:

```powershell
docker --version
docker compose version
```

> Nếu cả 2 lệnh đều chạy được → Docker đã sẵn sàng ✅

---

## Bước 2 — Cài Git trên VPS

1. Tải Git: https://git-scm.com/download/win
2. Cài đặt (mặc định là được)
3. Kiểm tra:

```powershell
git --version
```

---

## Bước 3 — Clone Project

Mở **PowerShell**, chọn thư mục muốn lưu code:

```powershell
cd C:\
git clone https://github.com/nan-ntn36/anime3d-chill.git
cd anime3d-chill
```

---

## Bước 4 — Tạo File .env.production

Tạo file `.env.production` trong thư mục `anime3d-chill`:

```powershell
notepad .env.production
```

Dán nội dung bên dưới, **thay đổi các giá trị CHANGE_ME**:

```env
NODE_ENV=production
PORT=5000

DB_NAME=anime3d_chill
DB_USER=anime3d_user
DB_PASSWORD=MatKhauManh123!
DB_ROOT_PASSWORD=RootManh456!

REDIS_HOST=redis
REDIS_PORT=6379

JWT_ACCESS_SECRET=thay_bang_chuoi_random_dai
JWT_REFRESH_SECRET=thay_bang_chuoi_random_dai_khac

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CLIENT_URL=http://YOUR_VPS_IP
KKPHIM_API_URL=https://phimapi.com
LOG_LEVEL=info
```

### Tạo JWT Secret ngẫu nhiên:

Mở PowerShell, chạy:

```powershell
node -e "console.log('ACCESS:', require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH:', require('crypto').randomBytes(64).toString('hex'))"
```

Copy kết quả vào `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET`.

### Lấy IP VPS:

```powershell
ipconfig
```

Tìm dòng `IPv4 Address` → thay vào `CLIENT_URL=http://IP_CUA_BAN`

---

## Bước 5 — Build & Chạy 🚀

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

> Lần đầu sẽ mất 5-10 phút để build. Đợi cho đến khi hoàn tất.

### Kiểm tra trạng thái:

```powershell
docker compose -f docker-compose.prod.yml ps
```

Tất cả services phải ở trạng thái `Up` hoặc `running`.

### Xem logs nếu có lỗi:

```powershell
# Xem tất cả
docker compose -f docker-compose.prod.yml logs -f

# Xem từng service
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f client
docker compose -f docker-compose.prod.yml logs -f mysql
```

---

## Bước 6 — Mở Firewall

Mở **Windows Firewall** cho phép port 80 và 3001:

```powershell
# Mở port 80 (Client)
netsh advfirewall firewall add rule name="Anime3D Client" dir=in action=allow protocol=TCP localport=80

# Mở port 3001 (Admin)
netsh advfirewall firewall add rule name="Anime3D Admin" dir=in action=allow protocol=TCP localport=3001
```

---

## Bước 7 — Truy cập

- **Trang chủ (Client)**: `http://YOUR_VPS_IP`
- **Admin Panel**: `http://YOUR_VPS_IP:3001`

---

## 🔄 Cập nhật code mới

Khi bạn push code mới lên GitHub, chạy trên VPS:

```powershell
cd C:\anime3d-chill
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## 🛑 Dừng/Khởi động lại

```powershell
# Dừng
docker compose -f docker-compose.prod.yml down

# Dừng + xoá data (MySQL sẽ mất hết dữ liệu!)
docker compose -f docker-compose.prod.yml down -v

# Khởi động lại
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## ❓ Troubleshooting

| Vấn đề | Giải pháp |
|---------|-----------|
| Port 80 bị chiếm | `netstat -ano \| findstr :80` → tìm process → tắt IIS nếu có |
| MySQL không start | Xem logs: `docker compose -f docker-compose.prod.yml logs mysql` |
| Không truy cập được từ ngoài | Kiểm tra Firewall (Bước 6) + kiểm tra IP đúng chưa |
| Build lỗi | Chạy `docker system prune -a` rồi build lại |
