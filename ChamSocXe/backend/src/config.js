/**
 * config.js — gom mọi biến môi trường về một chỗ.
 */
import 'dotenv/config';

const chuoi = (v, macDinh = '') => String(v ?? macDinh).trim();
const so = (v, macDinh) => {
  const n = Number(v);
  return Number.isFinite(n) && String(v ?? '').trim() !== '' ? n : macDinh;
};

export const MOI_TRUONG = chuoi(process.env.NODE_ENV, 'development');
export const LA_PRODUCTION = MOI_TRUONG === 'production';
export const PORT = so(process.env.PORT, 3041);
export const CORS_ORIGIN = chuoi(process.env.CORS_ORIGIN, 'http://localhost:5200');

export const MONGO = Object.freeze({
  uri: chuoi(process.env.MONGODB_URI, 'mongodb://localhost:27017/'),
  dbName: chuoi(process.env.MONGODB_DB_NAME, 'cham_soc_xe'),
});

export const JWT_SECRET = chuoi(process.env.JWT_SECRET);
export const JWT_HET_HAN = chuoi(process.env.JWT_HET_HAN, '12h');

export const ADMIN_MAC_DINH = Object.freeze({
  taiKhoan: chuoi(process.env.ADMIN_TAI_KHOAN, 'admin'),
  matKhau: chuoi(process.env.ADMIN_MAT_KHAU),
});

export const DAT_LICH = Object.freeze({
  sucChuaMoiKhung: Math.max(1, so(process.env.SUC_CHUA_MOI_KHUNG, 3)),
  /** Khung giờ nhận xe: 07:00 → 17:30, cách nhau 30 phút (giờ làm việc 07:00–18:00). */
  gioMo: '07:00',
  gioDong: '17:30',
  buocPhut: 30,
  /** Đặt trước tối đa bao nhiêu ngày. */
  toiDaNgay: 30,
});

export const GIOI_HAN = Object.freeze({
  chung: so(process.env.RATE_LIMIT_GLOBAL_MAX, 2000),
  form: so(process.env.RATE_LIMIT_FORM_MAX, 20),
});

/** Gọi lúc khởi động: thiếu khoá ký vé thì ở production không cho chạy. */
export function kiemTraCauHinh() {
  if (!JWT_SECRET) {
    if (LA_PRODUCTION) throw new Error('[config] Thiếu JWT_SECRET trong backend/.env');
    console.warn('[config] ⚠ Chưa khai JWT_SECRET — dùng khoá tạm cho môi trường dev.');
  }
  if (!ADMIN_MAC_DINH.matKhau) {
    console.warn('[config] ⚠ Chưa khai ADMIN_MAT_KHAU — sẽ không tự tạo tài khoản quản trị đầu tiên.');
  }
}

/** Khoá thật để ký vé; dev mà quên khai thì dùng khoá tạm thay vì sập. */
export const KHOA_VE = JWT_SECRET || 'cham-soc-xe-dev-khong-dung-o-production';
