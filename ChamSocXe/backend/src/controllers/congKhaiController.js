/**
 * congKhaiController.js — mọi thứ khách xem / gửi từ website, không cần đăng nhập.
 *
 * Chỉ trả nội dung `hien_thi !== false`; bài viết / dịch vụ ẩn ở trang quản trị là biến mất khỏi
 * website ngay.
 */
import { col, TEN } from '../db.js';
import { DAT_LICH } from '../config.js';
import { khongThay, chu, vanBan, batBuoc, dienThoai, email, phanTrang } from '../lib/kiemTra.js';
import { layCauHinh } from '../services/CauHinhService.js';
import * as DatLich from '../services/DatLichService.js';

const HIEN = { hien_thi: { $ne: false } };
const BO_NOI_DUNG = { projection: { noi_dung: 0, quy_trinh: 0, loi_ich: 0, bang_gia: 0 } };

const boc = (fn) => async (req, res, next) => {
  try { res.json({ data: await fn(req, res) }); } catch (e) { next(e); }
};

async function dsDichVu(loc = {}, tuyChon = BO_NOI_DUNG) {
  return (await col(TEN.dichVu)).find({ ...HIEN, ...loc }, tuyChon).sort({ thu_tu: 1, ten: 1 }).toArray();
}

/** GET /khung — dữ liệu cho header/footer: cấu hình, menu dịch vụ. Gọi một lần lúc mở web. */
export const khung = boc(async () => {
  const [cauHinh, dichVu] = await Promise.all([
    layCauHinh(),
    dsDichVu({}, { projection: { ten: 1, slug: 1, nhom: 1, bieu_tuong: 1, gia_tu: 1 } }),
  ]);
  return { cau_hinh: cauHinh, dich_vu: dichVu };
});

/** GET /trang-chu */
export const trangChu = boc(async () => {
  const [dichVu, danhGia, tinTuc] = await Promise.all([
    dsDichVu(),
    (await col(TEN.danhGia)).find(HIEN).sort({ thu_tu: 1, _id: -1 }).limit(12).toArray(),
    (await col(TEN.tinTuc)).find(HIEN, { projection: { noi_dung: 0 } }).sort({ ngay_dang: -1, _id: -1 }).limit(3).toArray(),
  ]);
  return { dich_vu: dichVu, danh_gia: danhGia, tin_tuc: tinTuc };
});

/** GET /dich-vu?nhom=cham_soc|phu_kien */
export const danhSachDichVu = boc(async (req) => {
  const nhom = chu(req.query.nhom, 20);
  return dsDichVu(nhom ? { nhom } : {});
});

/** GET /dich-vu/:slug — kèm vài dịch vụ cùng nhóm để gợi ý. */
export const chiTietDichVu = boc(async (req) => {
  const c = await col(TEN.dichVu);
  const dv = await c.findOne({ ...HIEN, slug: chu(req.params.slug, 120) });
  if (!dv) throw khongThay('Dịch vụ');
  const lienQuan = await c.find({ ...HIEN, nhom: dv.nhom, _id: { $ne: dv._id } }, BO_NOI_DUNG)
    .sort({ noi_bat: -1, thu_tu: 1 }).limit(4).toArray();
  return { dich_vu: dv, lien_quan: lienQuan };
});

/** GET /danh-gia */
export const danhSachDanhGia = boc(async () => (await col(TEN.danhGia)).find(HIEN).sort({ thu_tu: 1, _id: -1 }).toArray());

/** GET /tin-tuc?trang=&chuyen_muc= */
export const danhSachTinTuc = boc(async (req) => {
  const { soDong, trang, boQua } = phanTrang(req.query, 9);
  const loc = { ...HIEN };
  const cm = chu(req.query.chuyen_muc, 60);
  if (cm) loc.chuyen_muc = cm;
  const c = await col(TEN.tinTuc);
  const [ds, tong, chuyenMuc] = await Promise.all([
    c.find(loc, { projection: { noi_dung: 0 } }).sort({ ngay_dang: -1, _id: -1 }).skip(boQua).limit(soDong).toArray(),
    c.countDocuments(loc),
    c.distinct('chuyen_muc', HIEN),
  ]);
  return { ds, tong, trang, so_dong: soDong, chuyen_muc: chuyenMuc.filter(Boolean) };
});

/** GET /tin-tuc/:slug */
export const chiTietTinTuc = boc(async (req) => {
  const c = await col(TEN.tinTuc);
  const bai = await c.findOne({ ...HIEN, slug: chu(req.params.slug, 120) });
  if (!bai) throw khongThay('Bài viết');
  const khac = await c.find({ ...HIEN, _id: { $ne: bai._id } }, { projection: { noi_dung: 0 } })
    .sort({ ngay_dang: -1 }).limit(3).toArray();
  return { bai, bai_khac: khac };
});

/** GET /dat-lich/tuy-chon — dữ liệu dựng form đặt lịch. */
export const tuyChonDatLich = boc(async () => ({
  loai_xe: DatLich.LOAI_XE,
  toi_da_ngay: DAT_LICH.toiDaNgay,
  dich_vu: await dsDichVu({ nhom: 'cham_soc' }, { projection: { ten: 1, slug: 1, gia_tu: 1, thoi_gian_phut: 1, bieu_tuong: 1 } }),
}));

/** GET /dat-lich/khung-gio?ngay= */
export const khungGio = boc((req) => DatLich.khungGioTrong(req.query.ngay));

/** POST /dat-lich */
export const datLich = async (req, res, next) => {
  try {
    const ban = await DatLich.taoDatLich(req.body);
    res.status(201).json({ data: ban });
  } catch (e) { next(e); }
};

/** POST /dat-lich/tra-cuu { ma, dien_thoai } */
export const traCuuLich = boc((req) => DatLich.traCuu(req.body?.ma, req.body?.dien_thoai));

/** POST /dat-lich/huy { ma, dien_thoai } */
export const huyLich = boc((req) => DatLich.khachHuy(req.body?.ma, req.body?.dien_thoai));

/** POST /lien-he */
export const guiLienHe = async (req, res, next) => {
  try {
    const ban = {
      ho_ten: batBuoc(chu(req.body?.ho_ten, 100), 'ho_ten', 'họ tên'),
      dien_thoai: dienThoai(req.body?.dien_thoai),
      email: email(req.body?.email),
      chu_de: chu(req.body?.chu_de, 200),
      noi_dung: batBuoc(vanBan(req.body?.noi_dung, 3000), 'noi_dung', 'nội dung'),
      da_xu_ly: false,
      tao_luc: new Date(),
    };
    const kq = await (await col(TEN.lienHe)).insertOne(ban);
    res.status(201).json({ data: { _id: kq.insertedId } });
  } catch (e) { next(e); }
};
