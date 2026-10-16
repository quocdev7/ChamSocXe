/**
 * quanTriController.js — trang quản trị: đăng nhập, tổng quan, lịch hẹn, liên hệ, cấu hình và
 * CRUD chung cho nội dung (dịch vụ, bài viết, đánh giá — xem `lib/boSuuTap.js`).
 */
import { col, TEN } from '../db.js';
import { kyVe } from '../middleware/requireQuanTri.js';
import { bamMatKhau, soMatKhau } from '../lib/matKhau.js';
import { layBoSuuTap, chuanHoa } from '../lib/boSuuTap.js';
import {
  LoiNghiepVu, khongThay, chu, maId, phanTrang, thoatRegex, homNayVN, boolean,
} from '../lib/kiemTra.js';
import { layCauHinh, luuCauHinh } from '../services/CauHinhService.js';
import { capNhatTrangThai, TRANG_THAI } from '../services/DatLichService.js';

const boc = (fn) => async (req, res, next) => {
  try { res.json({ data: await fn(req, res) }); } catch (e) { next(e); }
};

// ── Đăng nhập ───────────────────────────────────────────────────────────────────────────────

/** POST /auth/dang-nhap { tai_khoan, mat_khau } */
export const dangNhap = boc(async (req) => {
  const taiKhoan = chu(req.body?.tai_khoan, 60).toLowerCase();
  const matKhau = String(req.body?.mat_khau ?? '');
  const nguoi = taiKhoan ? await (await col(TEN.quanTriVien)).findOne({ tai_khoan: taiKhoan }) : null;
  // Cùng một câu cho "sai tài khoản" và "sai mật khẩu" — không cho dò tài khoản nào tồn tại.
  if (!nguoi || !(await soMatKhau(matKhau, nguoi.mat_khau))) {
    throw new LoiNghiepVu('Tài khoản hoặc mật khẩu không đúng', { status: 401, ma: 'sai_dang_nhap' });
  }
  const user = { sub: String(nguoi._id), tai_khoan: nguoi.tai_khoan, ten: nguoi.ten || nguoi.tai_khoan };
  await (await col(TEN.quanTriVien)).updateOne({ _id: nguoi._id }, { $set: { dang_nhap_cuoi: new Date() } });
  return { token: kyVe(user), user };
});

/** GET /auth/toi */
export const toi = boc((req) => ({ user: req.user }));

/** POST /auth/doi-mat-khau { mat_khau_cu, mat_khau_moi } */
export const doiMatKhau = boc(async (req) => {
  const moi = String(req.body?.mat_khau_moi ?? '');
  if (moi.length < 8) throw new LoiNghiepVu('Mật khẩu mới phải có ít nhất 8 ký tự', { truong: 'mat_khau_moi' });
  const c = await col(TEN.quanTriVien);
  const nguoi = await c.findOne({ _id: maId(req.user.sub, 'Tài khoản') });
  if (!nguoi || !(await soMatKhau(req.body?.mat_khau_cu, nguoi.mat_khau))) {
    throw new LoiNghiepVu('Mật khẩu hiện tại không đúng', { truong: 'mat_khau_cu' });
  }
  await c.updateOne({ _id: nguoi._id }, { $set: { mat_khau: await bamMatKhau(moi), sua_luc: new Date() } });
  return { ok: true };
});

// ── Tổng quan ───────────────────────────────────────────────────────────────────────────────

/** GET /quan-tri/tong-quan */
export const tongQuan = boc(async () => {
  const homNay = homNayVN();
  const tuNgay = homNayVN(-6);
  const dl = await col(TEN.datLich);
  const [theoTrangThai, homNayDs, bayNgay, lienHeMoi, soNoiDung] = await Promise.all([
    dl.aggregate([{ $group: { _id: '$trang_thai', so: { $sum: 1 } } }]).toArray(),
    dl.find({ ngay: homNay, trang_thai: { $ne: 'da_huy' } }).sort({ gio: 1 }).limit(50).toArray(),
    dl.aggregate([
      { $match: { ngay: { $gte: tuNgay, $lte: homNay } } },
      { $group: { _id: '$ngay', so: { $sum: 1 } } },
    ]).toArray(),
    (await col(TEN.lienHe)).countDocuments({ da_xu_ly: false }),
    Promise.all([TEN.dichVu, TEN.tinTuc, TEN.danhGia].map(async (t) => (await col(t)).countDocuments())),
  ]);

  const theoNgay = new Map(bayNgay.map((d) => [d._id, d.so]));
  return {
    trang_thai: Object.fromEntries(Object.keys(TRANG_THAI).map((k) => [k, theoTrangThai.find((x) => x._id === k)?.so || 0])),
    hom_nay: homNayDs,
    bay_ngay: Array.from({ length: 7 }, (_, i) => { const n = homNayVN(i - 6); return { ngay: n, so: theoNgay.get(n) || 0 }; }),
    lien_he_moi: lienHeMoi,
    noi_dung: { dich_vu: soNoiDung[0], tin_tuc: soNoiDung[1], danh_gia: soNoiDung[2] },
  };
});

// ── Lịch hẹn ────────────────────────────────────────────────────────────────────────────────

/** GET /quan-tri/dat-lich?trang_thai=&ngay=&q=&trang= */
export const danhSachDatLich = boc(async (req) => {
  const { soDong, trang, boQua } = phanTrang(req.query, 20);
  const loc = {};
  const tt = chu(req.query.trang_thai, 30);
  if (tt) loc.trang_thai = tt;
  const ngay = chu(req.query.ngay, 10);
  if (ngay) loc.ngay = ngay;
  const q = chu(req.query.q, 60);
  if (q) {
    const re = new RegExp(thoatRegex(q), 'i');
    loc.$or = [{ ma: re }, { ho_ten: re }, { dien_thoai: re }, { bien_so: re }];
  }
  const c = await col(TEN.datLich);
  const [ds, tong] = await Promise.all([
    c.find(loc).sort({ ngay: -1, gio: -1, _id: -1 }).skip(boQua).limit(soDong).toArray(),
    c.countDocuments(loc),
  ]);
  return { ds, tong, trang, so_dong: soDong, trang_thai: TRANG_THAI };
});

/** PATCH /quan-tri/dat-lich/:id { trang_thai?, ghi_chu_noi_bo? } */
export const suaDatLich = boc((req) => capNhatTrangThai(req.params.id, req.body, req.user.tai_khoan));

/** DELETE /quan-tri/dat-lich/:id */
export const xoaDatLich = boc(async (req) => {
  const kq = await (await col(TEN.datLich)).deleteOne({ _id: maId(req.params.id, 'Lịch hẹn') });
  if (!kq.deletedCount) throw khongThay('Lịch hẹn');
  return { ok: true };
});

// ── Liên hệ ─────────────────────────────────────────────────────────────────────────────────

/** GET /quan-tri/lien-he?da_xu_ly=0|1&trang= */
export const danhSachLienHe = boc(async (req) => {
  const { soDong, trang, boQua } = phanTrang(req.query, 20);
  const loc = {};
  if (req.query.da_xu_ly !== undefined && req.query.da_xu_ly !== '') loc.da_xu_ly = boolean(req.query.da_xu_ly);
  const c = await col(TEN.lienHe);
  const [ds, tong] = await Promise.all([
    c.find(loc).sort({ tao_luc: -1 }).skip(boQua).limit(soDong).toArray(),
    c.countDocuments(loc),
  ]);
  return { ds, tong, trang, so_dong: soDong };
});

/** PATCH /quan-tri/lien-he/:id { da_xu_ly } */
export const suaLienHe = boc(async (req) => {
  const _id = maId(req.params.id, 'Liên hệ');
  const c = await col(TEN.lienHe);
  const kq = await c.findOneAndUpdate({ _id }, { $set: { da_xu_ly: boolean(req.body?.da_xu_ly), sua_luc: new Date() } }, { returnDocument: 'after' });
  if (!kq) throw khongThay('Liên hệ');
  return kq;
});

export const xoaLienHe = boc(async (req) => {
  const kq = await (await col(TEN.lienHe)).deleteOne({ _id: maId(req.params.id, 'Liên hệ') });
  if (!kq.deletedCount) throw khongThay('Liên hệ');
  return { ok: true };
});

// ── Cấu hình website ────────────────────────────────────────────────────────────────────────

export const xemCauHinh = boc(() => layCauHinh());
export const suaCauHinh = boc((req) => luuCauHinh(req.body));

// ── CRUD nội dung chung: /quan-tri/noi-dung/:loai ───────────────────────────────────────────

/** GET /quan-tri/noi-dung/:loai?q=&trang= */
export const dsNoiDung = boc(async (req) => {
  const bst = layBoSuuTap(req.params.loai);
  const { soDong, trang, boQua } = phanTrang(req.query, 50);
  const loc = {};
  const q = chu(req.query.q, 60);
  if (q) {
    const re = new RegExp(thoatRegex(q), 'i');
    loc.$or = bst.tim_theo.map((t) => ({ [t]: re }));
  }
  const c = await col(bst.col);
  const [ds, tong] = await Promise.all([
    c.find(loc).sort(bst.sap_xep).skip(boQua).limit(soDong).toArray(),
    c.countDocuments(loc),
  ]);
  return { ds, tong, trang, so_dong: soDong };
});

export const motNoiDung = boc(async (req) => {
  const bst = layBoSuuTap(req.params.loai);
  const doc = await (await col(bst.col)).findOne({ _id: maId(req.params.id, bst.nhan) });
  if (!doc) throw khongThay(bst.nhan);
  return doc;
});

export const taoNoiDung = async (req, res, next) => {
  try {
    const bst = layBoSuuTap(req.params.loai);
    const bayGio = new Date();
    const ban = { ...chuanHoa(bst, req.body), tao_luc: bayGio, sua_luc: bayGio };
    const kq = await (await col(bst.col)).insertOne(ban);
    res.status(201).json({ data: { ...ban, _id: kq.insertedId } });
  } catch (e) { next(e); }
};

export const suaNoiDung = boc(async (req) => {
  const bst = layBoSuuTap(req.params.loai);
  const _id = maId(req.params.id, bst.nhan);
  const doi = { ...chuanHoa(bst, req.body, { capNhat: true }), sua_luc: new Date() };
  const kq = await (await col(bst.col)).findOneAndUpdate({ _id }, { $set: doi }, { returnDocument: 'after' });
  if (!kq) throw khongThay(bst.nhan);
  return kq;
});

export const xoaNoiDung = boc(async (req) => {
  const bst = layBoSuuTap(req.params.loai);
  const _id = maId(req.params.id, bst.nhan);
  const kq = await (await col(bst.col)).deleteOne({ _id });
  if (!kq.deletedCount) throw khongThay(bst.nhan);
  return { ok: true };
});
