/**
 * CauHinhService.js — thông tin chung của website (tên, hotline, giờ làm việc, số liệu trang chủ,
 * mạng xã hội). Chỉ có MỘT tài liệu `_id: 'website'`; quản trị sửa được.
 */
import { col, TEN } from '../db.js';
import { chu, vanBan, soNguyen } from '../lib/kiemTra.js';

export const CAU_HINH_MAC_DINH = Object.freeze({
  ten_thuong_hieu: 'ChamSocXe',
  khau_hieu: 'Rửa xe & chăm sóc xe ô tô chuyên nghiệp',
  mo_ta: 'Quy trình rửa xe & chăm sóc xe ô tô đúng chuẩn — sạch từng chi tiết, an toàn cho lớp sơn, đúng hẹn từng phút.',
  hotline: '1900 0000',
  email: 'hotro@chamsocxe.vn',
  gio_lam_viec: '07:00 – 18:00, tất cả các ngày trong tuần',
  dia_chi_tru_so: 'Cam Ranh, Khánh Hòa',
  // Link nhúng Google Maps (https://www.google.com/maps/embed?...) hoặc để trống = dùng địa chỉ để tìm.
  ban_do: '',
  ten_cong_ty: 'Công ty TNHH Dịch vụ Chăm Sóc Xe',
  nam_thanh_lap: 2010,
  so_lieu: { khach_hang: 25000, xe_moi_ngay: 50, dich_vu: 16, danh_gia: 2000 },
  mang_xa_hoi: { facebook: '', youtube: '', tiktok: '', zalo: '' },
});

export async function layCauHinh() {
  const doc = await (await col(TEN.cauHinh)).findOne({ _id: 'website' });
  return {
    ...CAU_HINH_MAC_DINH,
    ...(doc || {}),
    so_lieu: { ...CAU_HINH_MAC_DINH.so_lieu, ...(doc?.so_lieu || {}) },
    mang_xa_hoi: { ...CAU_HINH_MAC_DINH.mang_xa_hoi, ...(doc?.mang_xa_hoi || {}) },
    _id: undefined,
  };
}

export async function luuCauHinh(than) {
  const sl = than?.so_lieu || {};
  const mxh = than?.mang_xa_hoi || {};
  const ban = {
    ten_thuong_hieu: chu(than?.ten_thuong_hieu, 80) || CAU_HINH_MAC_DINH.ten_thuong_hieu,
    khau_hieu: chu(than?.khau_hieu, 200),
    mo_ta: vanBan(than?.mo_ta, 1000),
    hotline: chu(than?.hotline, 30),
    email: chu(than?.email, 120),
    gio_lam_viec: chu(than?.gio_lam_viec, 120),
    dia_chi_tru_so: chu(than?.dia_chi_tru_so, 300),
    ban_do: chu(than?.ban_do, 1000),
    ten_cong_ty: chu(than?.ten_cong_ty, 200),
    nam_thanh_lap: soNguyen(than?.nam_thanh_lap, { min: 1900, max: 2100, macDinh: CAU_HINH_MAC_DINH.nam_thanh_lap }),
    so_lieu: {
      khach_hang: soNguyen(sl.khach_hang),
      xe_moi_ngay: soNguyen(sl.xe_moi_ngay),
      dich_vu: soNguyen(sl.dich_vu),
      danh_gia: soNguyen(sl.danh_gia),
    },
    mang_xa_hoi: {
      facebook: chu(mxh.facebook, 300),
      youtube: chu(mxh.youtube, 300),
      tiktok: chu(mxh.tiktok, 300),
      zalo: chu(mxh.zalo, 300),
    },
    sua_luc: new Date(),
  };
  await (await col(TEN.cauHinh)).updateOne({ _id: 'website' }, { $set: ban }, { upsert: true });
  return layCauHinh();
}
