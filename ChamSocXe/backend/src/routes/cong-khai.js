/**
 * cong-khai.js — API cho website khách xem. Không cần đăng nhập; form gửi lên có `formLimiter`.
 */
import { Router } from 'express';
import { formLimiter } from '../middleware/rateLimiter.js';
import * as ck from '../controllers/congKhaiController.js';

const router = Router();

router.get('/khung', ck.khung);
router.get('/trang-chu', ck.trangChu);
router.get('/dich-vu', ck.danhSachDichVu);
router.get('/dich-vu/:slug', ck.chiTietDichVu);
router.get('/danh-gia', ck.danhSachDanhGia);
router.get('/tin-tuc', ck.danhSachTinTuc);
router.get('/tin-tuc/:slug', ck.chiTietTinTuc);

router.get('/dat-lich/tuy-chon', ck.tuyChonDatLich);
router.get('/dat-lich/khung-gio', ck.khungGio);
router.post('/dat-lich', formLimiter, ck.datLich);
router.post('/dat-lich/tra-cuu', formLimiter, ck.traCuuLich);
router.post('/dat-lich/huy', formLimiter, ck.huyLich);

router.post('/lien-he', formLimiter, ck.guiLienHe);

export default router;
