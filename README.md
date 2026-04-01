# Anime3D Chill 🎌

Hệ thống ứng dụng Fullstack hiện đại để xem và theo dõi Anime 3D. Dự án được xây dựng theo kiến trúc monorepo sử dụng Turborepo.

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Quản lý Monorepo:** Turborepo
- **Frontend (Client & Admin):** React, Vite, React Router, React Query, Zustand, Framer Motion
- **Backend (Server):** Node.js, Express.js, Sequelize ORM
- **Cơ sở dữ liệu (Database):** MySQL 8.0
- **Bộ nhớ đệm (Cache):** Redis 7
- **Triển khai (Deployment):** Docker & Docker Compose

## 📁 Cấu trúc dự án

```text
anime3d-chill/
├── client/          # Ứng dụng dành cho người dùng (React/Vite) [Port: 3000]
├── admin/           # Hệ thống quản trị CMS (React/Vite) [Port: 3001]
├── server/          # API Backend (Express.js) [Port: 5000]
├── document/        # Tài liệu dự án và quy trình triển khai hiện tại
└── docker-compose*  # Cấu hình container cho môi trường Dev & Prod
```

## 🛠️ Yêu cầu hệ thống (Prerequisites)

- [Node.js](https://nodejs.org/) (Phiên bản >= 20.0.0)
- npm (Phiên bản >= 10.0.0)
- [Docker & Docker Compose](https://www.docker.com/) (Khuyên dùng để setup môi trường nhanh chóng)
- MySQL & Redis (Nếu bạn muốn chạy trực tiếp không qua Docker)

## 🚦 Hướng dẫn cài đặt và chạy dự án (Getting Started)

### 1. Cài đặt các gói phụ thuộc (Dependencies)
Dự án sử dụng npm workspaces, bạn chỉ cần chạy lệnh sau ở thư mục gốc:
```bash
npm install
```

### 2. Cài đặt biến môi trường (Environment Variables)
Cấp quyền cấu hình môi trường bằng cách sao chép file `.env.example` thành `.env` tại thư mục `server`:
```bash
cp server/.env.example server/.env
```
*(Hãy mở file `server/.env` và cập nhật các thông tin kết nối DB, Redis, JWT secret,... nếu cần thiết khi chạy local)*

### 3. Khởi chạy bằng Docker (Được khuyên dùng)
Bạn có thể khởi động toàn bộ hệ thống (bao gồm MySQL, Redis, Server, Client, và Admin) chỉ với một lệnh:
```bash
docker-compose up -d
```
*Lưu ý: Nếu bạn sử dụng Windows/Mac, hãy chắc chắn Docker Desktop đã được bật. Quá trình này sẽ tự động pull các image cần thiết và dựng database, chạy các portal đầy đủ.*

### 4. Khởi chạy thủ công (Local Development)
Nếu bạn đã có sẵn MySQL, Redis đang chạy trên máy tính và muốn debug bằng Node.js, bạn có thể khởi chạy dự án thông qua Turborepo:

```bash
# Chạy đồng thời cả Client, Server và Admin
npm run dev
```

Hoặc chạy từng tiến trình riêng biệt:
- `npm run client:dev` (Chạy website người dùng)
- `npm run admin:dev` (Chạy trang quản trị)
- `npm run server:dev` (Chạy API server backend)

## 🌐 Các cổng kết nối mặc định (Access Points)

- **Client Application:** `http://localhost:3000`
- **Admin Dashboard:** `http://localhost:3001`
- **API Server:** `http://localhost:5000`

## 🐳 Triển khai lên Production (Deployment)

Dự án có sẵn file cấu hình dành cho môi trường Production.
```bash
# Build và khởi chạy với cấu hình production
docker-compose -f docker-compose.prod.yml up -d --build
```

---
💡 **Tài liệu tham khảo thêm:** Vui lòng xem thêm trong thư mục `/document` để biết các giai đoạn phát triển, lịch trình dự án và tính năng cụ thể đang được hoàn thiện.
