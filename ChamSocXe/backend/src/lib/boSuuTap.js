/**
 * boSuuTap.js — khai báo các loại nội dung mà trang quản trị được thêm/sửa/xoá.
 *
 * Mỗi loại: collection, danh sách trường và kiểu. `chuanHoa()` CHỈ nhận các trường đã khai — ai gửi
 * thêm `_id`, `tao_luc` hay trường lạ đều bị bỏ, nên một controller CRUD chung dùng được cho cả bốn.
 *
 * Kiểu trường:
 *   chu       chuỗi một dòng          van_ban   nhiều dòng
 *   so        số nguyên ≥ 0           bool      bật/tắt
 *   slug      đường dẫn, tự sinh từ trường `slug_tu` nếu bỏ trống
 *   ngay      YYYY-MM-DD              mang_chu  mảng chuỗi (danh sách gạch đầu dòng)
 *   bang_gia  [{ loai_xe, gia }]
 */
import { TEN } from '../db.js';
import { chu, vanBan, soNguyen, boolean, ngay as kiemNgay, batBuoc, homNayVN, LoiNghiepVu } from './kiemTra.js';
import { taoSlug } from './slug.js';

export const BO_SUU_TAP = Object.freeze({
  'dich-vu': {
    col: TEN.dichVu,
    nhan: 'Dịch vụ',
    slug_tu: 'ten',
    sap_xep: { nhom: 1, thu_tu: 1, ten: 1 },
    tim_theo: ['ten', 'mo_ta_ngan'],
    truong: {
      ten: { kieu: 'chu', bat_buoc: true, nhan: 'tên dịch vụ' },
      slug: { kieu: 'slug' },
      nhom: { kieu: 'chu', mac_dinh: 'cham_soc', chon: ['cham_soc', 'phu_kien'] },
      mo_ta_ngan: { kieu: 'chu', toi_da: 300 },
      noi_dung: { kieu: 'van_ban' },
      quy_trinh: { kieu: 'mang_chu' },
      loi_ich: { kieu: 'mang_chu' },
      bieu_tuong: { kieu: 'chu', mac_dinh: 'fa-car' },
      anh: { kieu: 'chu', toi_da: 1000 },
      thoi_gian_phut: { kieu: 'so' },
      gia_tu: { kieu: 'so' },
      bang_gia: { kieu: 'bang_gia' },
      noi_bat: { kieu: 'bool', mac_dinh: false },
      thu_tu: { kieu: 'so' },
      hien_thi: { kieu: 'bool', mac_dinh: true },
    },
  },
  'tin-tuc': {
    col: TEN.tinTuc,
    nhan: 'Bài viết',
    slug_tu: 'tieu_de',
    sap_xep: { ngay_dang: -1, _id: -1 },
    tim_theo: ['tieu_de', 'tom_tat'],
    truong: {
      tieu_de: { kieu: 'chu', bat_buoc: true, nhan: 'tiêu đề', toi_da: 300 },
      slug: { kieu: 'slug' },
      chuyen_muc: { kieu: 'chu', mac_dinh: 'Kiến thức' },
      tom_tat: { kieu: 'chu', toi_da: 600 },
      noi_dung: { kieu: 'van_ban' },
      anh: { kieu: 'chu', toi_da: 1000 },
      nguon: { kieu: 'chu' },
      lien_ket_nguon: { kieu: 'chu', toi_da: 1000 },
      ngay_dang: { kieu: 'ngay' },
      hien_thi: { kieu: 'bool', mac_dinh: true },
    },
  },
  'danh-gia': {
    col: TEN.danhGia,
    nhan: 'Đánh giá',
    sap_xep: { thu_tu: 1, _id: -1 },
    tim_theo: ['ten_khach', 'noi_dung'],
    truong: {
      ten_khach: { kieu: 'chu', bat_buoc: true, nhan: 'tên khách hàng' },
      khu_vuc: { kieu: 'chu' },
      dich_vu: { kieu: 'chu' },
      so_sao: { kieu: 'so', mac_dinh: 5, min: 1, max: 5 },
      noi_dung: { kieu: 'van_ban', bat_buoc: true, nhan: 'nội dung đánh giá', toi_da: 2000 },
      thu_tu: { kieu: 'so' },
      hien_thi: { kieu: 'bool', mac_dinh: true },
    },
  },
});

export function layBoSuuTap(loai) {
  const bst = BO_SUU_TAP[loai];
  if (!bst) throw new LoiNghiepVu('Loại nội dung không hợp lệ', { status: 404, ma: 'khong_thay' });
  return bst;
}

function giaTriTruong(dinhNghia, v) {
  switch (dinhNghia.kieu) {
    case 'chu': {
      const s = chu(v, dinhNghia.toi_da ?? 300);
      if (dinhNghia.chon && s && !dinhNghia.chon.includes(s)) return dinhNghia.mac_dinh;
      return s || (dinhNghia.mac_dinh ?? '');
    }
    case 'van_ban': return vanBan(v, dinhNghia.toi_da ?? 20000);
    case 'so': return soNguyen(v, { min: dinhNghia.min ?? 0, max: dinhNghia.max, macDinh: dinhNghia.mac_dinh ?? 0 });
    case 'bool': return boolean(v, dinhNghia.mac_dinh ?? true);
    case 'slug': return taoSlug(v);
    case 'ngay': return v ? kiemNgay(v) : homNayVN();
    case 'mang_chu': {
      const ds = Array.isArray(v) ? v : String(v ?? '').split('\n');
      return ds.map((x) => chu(x, 500)).filter(Boolean).slice(0, 50);
    }
    case 'bang_gia': {
      const ds = Array.isArray(v) ? v : [];
      return ds
        .map((d) => ({ loai_xe: chu(d?.loai_xe, 100), gia: soNguyen(d?.gia) }))
        .filter((d) => d.loai_xe)
        .slice(0, 20);
    }
    default: return undefined;
  }
}

/**
 * Lọc + chuẩn hoá thân request theo khai báo.
 * `capNhat = true` (PUT): chỉ đụng các trường có mặt trong thân, trường vắng giữ nguyên trong DB.
 */
export function chuanHoa(bst, than, { capNhat = false } = {}) {
  const kq = {};
  for (const [ten, dn] of Object.entries(bst.truong)) {
    if (capNhat && !(ten in (than || {}))) continue;
    const gt = giaTriTruong(dn, than?.[ten]);
    if (dn.bat_buoc) batBuoc(gt, ten, dn.nhan || ten);
    kq[ten] = gt;
  }
  if (bst.slug_tu && 'slug' in kq && !kq.slug && kq[bst.slug_tu]) kq.slug = taoSlug(kq[bst.slug_tu]);
  if (bst.slug_tu && !capNhat && !kq.slug) throw new LoiNghiepVu('Thiếu đường dẫn (slug)', { truong: 'slug' });
  return kq;
}
