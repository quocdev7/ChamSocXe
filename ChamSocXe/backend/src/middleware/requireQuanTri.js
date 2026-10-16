/**
 * requireQuanTri.js — mở vé JWT của trang quản trị, gắn `req.user`.
 * Vé mang: { sub, tai_khoan, ten }.
 */
import jwt from 'jsonwebtoken';
import { KHOA_VE, JWT_HET_HAN } from '../config.js';

export function kyVe(payload) {
  return jwt.sign(payload, KHOA_VE, { expiresIn: JWT_HET_HAN });
}

export function requireQuanTri(req, res, next) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập', ma_loi: 'CHUA_DANG_NHAP' });

  try {
    const ve = jwt.verify(token, KHOA_VE);
    req.user = { sub: String(ve.sub || ''), tai_khoan: String(ve.tai_khoan || ''), ten: String(ve.ten || '') };
    next();
  } catch (e) {
    return e.name === 'TokenExpiredError'
      ? res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn, mời đăng nhập lại', ma_loi: 'PHIEN_HET_HAN' })
      : res.status(401).json({ error: 'Vé đăng nhập không hợp lệ', ma_loi: 'VE_HONG' });
  }
}
