# ChamSocXe — Website rửa xe & chăm sóc xe ô tô

Website giới thiệu dịch vụ, đặt lịch rửa xe online và trang quản trị. Cấu trúc tham khảo BaoCaoSoDangBoApp.

| Phần | Công nghệ | Cổng |
|---|---|---|
| `backend/` | Node.js (ESM) · Express · MongoDB driver · JWT | 3041 |
| `frontend/` | Vue 3 · Vue Router · Pinia · Vite · Tailwind CSS | 5200 (dev) |

Dữ liệu được lưu trong MongoDB `mongodb://localhost:27017/`, database `cham_soc_xe`.

## Chạy lần đầu

Cần có Node.js ≥ 18.11 và MongoDB đang chạy ở localhost:27017.

```bash
# Backend
cd backend
cp .env.example .env          # sửa JWT_SECRET, mật khẩu admin nếu cần
npm install
npm run seed                  # tạo dữ liệu mẫu: dịch vụ, tin tức, đánh giá, cấu hình
npm run dev                   # http://localhost:3041/api

# Frontend (mở một terminal khác)
cd frontend
npm install
npm run dev                   # http://localhost:5200
```

Lệnh `npm run seed:lai` xoá rồi tạo lại toàn bộ nội dung mẫu. Lệnh này không xoá lịch hẹn, liên hệ hay tài khoản.

## Chạy kiểu production (một cổng)

```bash
cd frontend && npm run build  # tạo frontend/dist
cd ../backend && npm start    # phục vụ cả web và API tại http://localhost:3041
```

## Trang quản trị

- Địa chỉ: `/quan-tri`
- Tài khoản mặc định: `admin` / `admin@123`. Tài khoản này được tạo ở lần chạy đầu, lấy từ `.env`. **Hãy đổi mật khẩu ngay sau khi đăng nhập.**
- Chức năng:
  - Tổng quan và thống kê lịch hẹn.
  - Quản lý lịch hẹn: lọc, đổi trạng thái, ghi chú nội bộ.
  - Liên hệ.
  - CRUD dịch vụ, tin tức và đánh giá.
  - Cấu hình thương hiệu, hotline, địa chỉ cửa hàng + bản đồ, số liệu trang chủ và mạng xã hội.

## Trang công khai

| Đường dẫn | Nội dung |
|---|---|
| `/` | Trang chủ |
| `/ve-chung-toi` | Giới thiệu |
| `/cham-soc-xe`, `/phu-kien-o-to` | Danh sách dịch vụ |
| `/dich-vu/:slug` | Chi tiết dịch vụ |
| `/dat-lich` | Đặt lịch theo khung giờ; tra cứu hoặc huỷ bằng mã lịch |
| `/tin-tuc`, `/tin-tuc/:slug` | Tin tức |
| `/lien-he` | Liên hệ, bản đồ cửa hàng |
| `/chinh-sach/:loai` | Chính sách |

## Kiểm thử

```bash
cd backend && npm test        # cần backend đang chạy
```

## Lưu ý

- Website phục vụ **một cửa hàng duy nhất tại Cam Ranh**. Thương hiệu, hotline (1900 0000) và địa chỉ là **dữ liệu mẫu**. Sửa chúng (kèm link bản đồ Google Maps) trong Quản trị → Cấu hình.
- Ảnh mẫu lấy từ Unsplash. Ảnh nào không tải được sẽ được thay bằng ảnh dự phòng. Có thể thay URL ảnh trong trang quản trị.
- Số xe tối đa cửa hàng nhận trong mỗi khung giờ được đặt bằng `SUC_CHUA_MOI_KHUNG` trong `.env`.
