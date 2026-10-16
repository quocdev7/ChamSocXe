/**
 * kiemTra.js — chuẩn hoá & kiểm dữ liệu người dùng gửi lên.
 *
 * Mọi controller ném `LoiNghiepVu` khi dữ liệu sai; `middleware/loiCoMa.js` đổi nó thành JSON
 * `{ error, ma_loi, truong }` để form bên FE tô đỏ đúng ô.
 */
import { ObjectId } from 'mongodb';

export class LoiNghiepVu extends Error {
  constructor(thongBao, { status = 400, ma = 'du_lieu_sai', truong } = {}) {
    super(thongBao);
    this.status = status;
    this.ma_loi = ma;
    if (truong) this.truong = truong;
  }
}

export const khongThay = (vat = 'Dữ liệu') => new LoiNghiepVu(`${vat} không tồn tại`, { status: 404, ma: 'khong_thay' });

/** Chuỗi đã cắt khoảng trắng, giới hạn độ dài. */
export function chu(v, toiDa = 500) {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, toiDa);
}

/** Chuỗi nhiều dòng (nội dung bài viết, ghi chú) — giữ xuống dòng. */
export function vanBan(v, toiDa = 20000) {
  return String(v ?? '').replace(/\r\n/g, '\n').trim().slice(0, toiDa);
}

export function batBuoc(gt, truong, nhan) {
  if (gt === '' || gt === null || gt === undefined) {
    throw new LoiNghiepVu(`Vui lòng nhập ${nhan}`, { truong, ma: 'thieu_truong' });
  }
  return gt;
}

/** Số điện thoại Việt Nam: 10 số bắt đầu bằng 0, hoặc +84. Trả về dạng 0xxxxxxxxx. */
export function dienThoai(v, truong = 'dien_thoai') {
  const so = String(v ?? '').replace(/[\s.\-()]/g, '').replace(/^\+?84/, '0');
  if (!/^0\d{9}$/.test(so)) throw new LoiNghiepVu('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)', { truong });
  return so;
}

export function email(v, truong = 'email') {
  const e = chu(v, 200).toLowerCase();
  if (!e) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new LoiNghiepVu('Email không hợp lệ', { truong });
  return e;
}

export function soNguyen(v, { min = 0, max = Number.MAX_SAFE_INTEGER, macDinh = 0 } = {}) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return macDinh;
  return Math.min(max, Math.max(min, n));
}

export function boolean(v, macDinh = true) {
  if (v === undefined || v === null || v === '') return macDinh;
  if (typeof v === 'boolean') return v;
  return ['1', 'true', 'on', 'yes', 'co'].includes(String(v).toLowerCase());
}

export function maId(v, vat = 'Dữ liệu') {
  const s = String(v ?? '');
  if (!ObjectId.isValid(s) || String(new ObjectId(s)) !== s) throw khongThay(vat);
  return new ObjectId(s);
}

/** Ngày dạng YYYY-MM-DD theo giờ Việt Nam (UTC+7). */
export function homNayVN(cong = 0) {
  const d = new Date(Date.now() + 7 * 3600_000 + cong * 86400_000);
  return d.toISOString().slice(0, 10);
}

export function gioHienTaiVN() {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(11, 16);
}

export function ngay(v, truong = 'ngay') {
  const s = chu(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T00:00:00Z`))) {
    throw new LoiNghiepVu('Ngày không hợp lệ', { truong });
  }
  return s;
}

export function gio(v, truong = 'gio') {
  const s = chu(v, 5);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) throw new LoiNghiepVu('Giờ không hợp lệ', { truong });
  return s;
}

/** Thoát ký tự đặc biệt để ghép vào RegExp tìm kiếm. */
export function thoatRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Phân trang chung: ?trang=1&so_dong=20 */
export function phanTrang(query, macDinh = 20) {
  const soDong = soNguyen(query.so_dong, { min: 1, max: 100, macDinh });
  const trang = soNguyen(query.trang, { min: 1, max: 100000, macDinh: 1 });
  return { soDong, trang, boQua: (trang - 1) * soDong };
}
