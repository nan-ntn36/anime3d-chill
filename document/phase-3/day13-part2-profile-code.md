# Giải thích Coding - Nốt Phần Ngày 13 (Profile/Favorites)

## Luồng API & Model DB Tối ưu hóa

### Danh sách Yêu Thích (`Favorite` DB)
- **Primary Keys**: Bảng này thiết lập Compound Index dựa vào `userId` + `movieSlug` để đảm bảo user không thể spam thêm mãi 1 phim.
- Khi gọi Function `meController.addFavorite`, mình dùng cơ chế `findOrCreate()`. 
  - Nếu query bị duplicate => return HTTP `409 Conflict`.
  - Thành công => HTTP `201 Created`.
- Cơ chế `userApi.js` phía Frontend hoạt động mượt mà cùng `React Query` => Nó gọi API ngầm rồi Invalidate Cache để giao diện cập nhật ngay lập tức mà không phải bắt User f5.

### Trang Cá Nhân (`Profile.jsx`)
- Sử dụng mô hình Layout _Sidebar Master-Detail_ hiện đại: Một Cột ngang làm Navigation Tab (`history | favorites | settings`), Một Cột to chửa nội dung tương ứng.
- Khi chuyển đổi qua lại giữa `History` và `Favorites`, query API của React_Query được kiểm soát qua cờ: `enabled: activeTab === 'favorites'`. 
  - => Thao tác này giúp Website giảm tải dư thừa đến API vì chỉ "đang ở ô nào" mới Trigger HTTP Get data ô đó. Quá xịn xò.
- Mapper: Vì Model History và Favorites trong MySQL được lưu tối giản (`movieThumb`, `movieSlug`), khi trả về Web, File `Profile.jsx` dùng Array Map Data Convert nó sang chuẩn Object `movie` để ném ngược lại vào `MovieCard` tái chế linh kiện giao diện dễ dàng.

### Security
Các Route `/profile`, `/favorites` đều được wrap chặt chẽ bằng middleware bảo mật `authenticate`. Middleware này đảm bảo rằng không một truy cập thiếu JWT/hết Date Auth nào có thể chọc ngoáy vào dữ liệu nội bộ.
