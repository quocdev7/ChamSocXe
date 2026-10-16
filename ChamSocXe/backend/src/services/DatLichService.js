/**
 * DatLichService.js — đặt lịch rửa xe / chăm sóc xe.
 *
 * Khung giờ: từ `DAT_LICH.gioMo` tới `gioDong`, mỗi `buocPhut` phút một khung. Mỗi khung nhận
 * tối đa `sucChuaMoiKhung` xe (số cầu rửa của cửa hàng). Lịch đã huỷ không chiếm chỗ.
 */
import { col, TEN, soTiepTheo } from '../db.js';
import { DAT_LICH } from '../config.js';
import {
  LoiNghiepVu, khongThay, chu, vanBan, batBuoc, dienThoai, email, ngay as kiemNgay, gio as kiemGio,
  maId, homNayVN, gioHienTaiVN,
} from '../lib/kiemTra.js';

export const TRANG_THAI = Object.freeze({
  cho_xac_nhan: 'Chờ xác nhận',
  da_xac_nhan: 'Đã xác nhận',
  dang_lam: 'Đang thực hiện',
  hoan_thanh: 'Hoàn thành',
  da_huy: 'Đã huỷ',
});

export const LOAI_XE = Object.freeze([
  'Sedan / Hatchback 4-5 chỗ',
  'SUV / Crossover 5-7 chỗ',
  'MPV / Bán tải',
  'Xe 7-16 chỗ',
]);

/** Các trạng thái còn chiếm chỗ trong khung giờ. */
const CHIEM_CHO = ['cho_xac_nhan', 'da_xac_nhan', 'dang_lam', 'hoan_thanh'];

const doiPhut = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const doiGio = (phut) => `${String(Math.floor(phut / 60)).padStart(2, '0')}:${String(phut % 60).padStart(2, '0')}`;

export function dsKhungGio() {
  const ds = [];
  for (let p = doiPhut(DAT_LICH.gioMo); p <= doiPhut(DAT_LICH.gioDong); p += DAT_LICH.buocPhut) ds.push(doiGio(p));
  return ds;
}


function kiemNgayDat(ngay) {
  const homNay = homNayVN();
  if (ngay < homNay) throw new LoiNghiepVu('Không thể đặt lịch cho ngày đã qua', { truong: 'ngay' });
  if (ngay > homNayVN(DAT_LICH.toiDaNgay)) {
    throw new LoiNghiepVu(`Chỉ nhận đặt lịch trước tối đa ${DAT_LICH.toiDaNgay} ngày`, { truong: 'ngay' });
  }
}

/** Khung giờ còn trống trong một ngày. */
export async function khungGioTrong(ngayChon) {
  const ngay = kiemNgay(ngayChon);
  kiemNgayDat(ngay);

  const dem = await (await col(TEN.datLich)).aggregate([
    { $match: { ngay, trang_thai: { $in: CHIEM_CHO } } },
    { $group: { _id: '$gio', so: { $sum: 1 } } },
  ]).toArray();
  const daDat = new Map(dem.map((d) => [d._id, d.so]));

  // Hôm nay thì khung giờ đã qua (cộng 30 phút chuẩn bị) không cho chọn nữa.
  const moc = ngay === homNayVN() ? doiPhut(gioHienTaiVN()) + 30 : -1;
  return dsKhungGio().map((g) => {
    const conLai = Math.max(0, DAT_LICH.sucChuaMoiKhung - (daDat.get(g) || 0));
    return { gio: g, con_lai: conLai, trong: conLai > 0 && doiPhut(g) >= moc };
  });
}

/** Khách đặt lịch từ trang web. */
export async function taoDatLich(than) {
  const hoTen = batBuoc(chu(than?.ho_ten, 100), 'ho_ten', 'họ tên');
  const sdt = dienThoai(than?.dien_thoai);
  const mail = email(than?.email);
  const bienSo = chu(than?.bien_so, 20).toUpperCase();
  const loaiXe = chu(than?.loai_xe, 100);
  if (loaiXe && !LOAI_XE.includes(loaiXe)) throw new LoiNghiepVu('Loại xe không hợp lệ', { truong: 'loai_xe' });

  const ngay = kiemNgay(than?.ngay);
  kiemNgayDat(ngay);
  const gio = kiemGio(than?.gio);

  const khung = (await khungGioTrong(ngay)).find((k) => k.gio === gio);
  if (!khung) throw new LoiNghiepVu('Khung giờ không hợp lệ', { truong: 'gio' });
  if (!khung.trong) throw new LoiNghiepVu('Khung giờ này đã kín lịch, vui lòng chọn giờ khác', { truong: 'gio', ma: 'het_cho', status: 409 });

  const slugDv = (Array.isArray(than?.dich_vu) ? than.dich_vu : [than?.dich_vu]).map((s) => chu(s, 120)).filter(Boolean);
  if (!slugDv.length) throw new LoiNghiepVu('Vui lòng chọn ít nhất một dịch vụ', { truong: 'dich_vu' });
  const dsDv = await (await col(TEN.dichVu))
    .find({ slug: { $in: slugDv.slice(0, 10) }, hien_thi: { $ne: false } }, { projection: { slug: 1, ten: 1, gia_tu: 1 } })
    .toArray();
  if (!dsDv.length) throw new LoiNghiepVu('Dịch vụ đã chọn không tồn tại', { truong: 'dich_vu' });

  const stt = await soTiepTheo('dat_lich');
  const bayGio = new Date();
  const ban = {
    ma: `DL${String(stt).padStart(6, '0')}`,
    ho_ten: hoTen,
    dien_thoai: sdt,
    email: mail,
    bien_so: bienSo,
    loai_xe: loaiXe,
    dich_vu: dsDv.map((d) => ({ slug: d.slug, ten: d.ten, gia_tu: d.gia_tu || 0 })),
    ngay,
    gio,
    ghi_chu: vanBan(than?.ghi_chu, 1000),
    trang_thai: 'cho_xac_nhan',
    lich_su: [{ trang_thai: 'cho_xac_nhan', luc: bayGio, boi: 'khach' }],
    tao_luc: bayGio,
    sua_luc: bayGio,
  };
  const kq = await (await col(TEN.datLich)).insertOne(ban);
  return { ...ban, _id: kq.insertedId };
}

/**
 * Khách tra cứu lịch đã đặt. Bắt buộc mã + số điện thoại khớp nhau — chỉ biết mã thì không xem
 * được tên/biển số của người khác.
 */
export async function traCuu(ma, sdt) {
  const maChuan = chu(ma, 20).toUpperCase();
  const so = dienThoai(sdt);
  const ban = await (await col(TEN.datLich)).findOne(
    { ma: maChuan, dien_thoai: so },
    { projection: { lich_su: 0, email: 0 } },
  );
  if (!ban) throw khongThay('Lịch hẹn');
  return ban;
}

/** Khách tự huỷ khi lịch còn ở trạng thái chờ xác nhận / đã xác nhận. */
export async function khachHuy(ma, sdt) {
  const ban = await traCuu(ma, sdt);
  if (!['cho_xac_nhan', 'da_xac_nhan'].includes(ban.trang_thai)) {
    throw new LoiNghiepVu('Lịch hẹn này không thể huỷ nữa, vui lòng gọi hotline', { ma: 'khong_huy_duoc' });
  }
  const bayGio = new Date();
  await (await col(TEN.datLich)).updateOne(
    { _id: ban._id },
    { $set: { trang_thai: 'da_huy', sua_luc: bayGio }, $push: { lich_su: { trang_thai: 'da_huy', luc: bayGio, boi: 'khach' } } },
  );
  return { ...ban, trang_thai: 'da_huy' };
}

/** Quản trị đổi trạng thái / ghi chú nội bộ. */
export async function capNhatTrangThai(id, than, nguoiSua) {
  const _id = maId(id, 'Lịch hẹn');
  const trangThai = chu(than?.trang_thai, 30);
  if (trangThai && !TRANG_THAI[trangThai]) throw new LoiNghiepVu('Trạng thái không hợp lệ', { truong: 'trang_thai' });

  const c = await col(TEN.datLich);
  const ban = await c.findOne({ _id });
  if (!ban) throw khongThay('Lịch hẹn');

  const bayGio = new Date();
  const doi = { sua_luc: bayGio };
  const capNhat = { $set: doi };
  if ('ghi_chu_noi_bo' in (than || {})) doi.ghi_chu_noi_bo = vanBan(than.ghi_chu_noi_bo, 2000);
  if (trangThai && trangThai !== ban.trang_thai) {
    doi.trang_thai = trangThai;
    capNhat.$push = { lich_su: { trang_thai: trangThai, luc: bayGio, boi: nguoiSua || 'quan_tri' } };
  }
  await c.updateOne({ _id }, capNhat);
  return c.findOne({ _id });
}
