import rateLimit from 'express-rate-limit';
import { GIOI_HAN } from '../config.js';

const traLoi = (thongBao) => ({ error: thongBao, ma_loi: 'qua_nhieu_yeu_cau' });

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: GIOI_HAN.chung,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: traLoi('Quá nhiều yêu cầu, vui lòng thử lại sau'),
});

/** Form công khai (đặt lịch, liên hệ) — chặn spam. */
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: GIOI_HAN.form,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: traLoi('Bạn đã gửi quá nhiều lần, vui lòng thử lại sau 15 phút hoặc gọi hotline'),
});

/** Đăng nhập quản trị — chặn dò mật khẩu. */
export const dangNhapLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: traLoi('Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút'),
});
