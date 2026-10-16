/**
 * quan-tri.js — API trang quản trị. Mọi route (trừ đăng nhập) đi sau `requireQuanTri`.
 */
import { Router } from 'express';
import { requireQuanTri } from '../middleware/requireQuanTri.js';
import { dangNhapLimiter } from '../middleware/rateLimiter.js';
import * as qt from '../controllers/quanTriController.js';

export const authRouter = Router();
authRouter.post('/dang-nhap', dangNhapLimiter, qt.dangNhap);
authRouter.get('/toi', requireQuanTri, qt.toi);
authRouter.post('/doi-mat-khau', requireQuanTri, qt.doiMatKhau);

const router = Router();
router.use(requireQuanTri);

router.get('/tong-quan', qt.tongQuan);

router.get('/dat-lich', qt.danhSachDatLich);
router.patch('/dat-lich/:id', qt.suaDatLich);
router.delete('/dat-lich/:id', qt.xoaDatLich);

router.get('/lien-he', qt.danhSachLienHe);
router.patch('/lien-he/:id', qt.suaLienHe);
router.delete('/lien-he/:id', qt.xoaLienHe);

router.get('/cau-hinh', qt.xemCauHinh);
router.put('/cau-hinh', qt.suaCauHinh);

router.get('/noi-dung/:loai', qt.dsNoiDung);
router.get('/noi-dung/:loai/:id', qt.motNoiDung);
router.post('/noi-dung/:loai', qt.taoNoiDung);
router.put('/noi-dung/:loai/:id', qt.suaNoiDung);
router.delete('/noi-dung/:loai/:id', qt.xoaNoiDung);

export default router;
