/**
 * test-api.mjs — kiểm tra nhanh các API chính trên server đang chạy.
 *
 *   npm run test                      (mặc định http://localhost:3041)
 *   API=http://host:port npm run test
 *
 * Tạo một lịch hẹn thật rồi huỷ nó, và một liên hệ — chạy trên DB thử, đừng chạy trên DB thật.
 */
const API = (process.env.API || 'http://localhost:3041').replace(/\/$/, '') + '/api';
const TK = process.env.ADMIN_TAI_KHOAN || 'admin';
const MK = process.env.ADMIN_MAT_KHAU || 'admin@123';

let dat = 0, truot = 0;
async function goi(phuongThuc, duong, than, token) {
  const r = await fetch(API + duong, {
    method: phuongThuc,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: than ? JSON.stringify(than) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  return { status: r.status, ...json };
}
function kiem(ten, dk, chiTiet) {
  if (dk) { dat++; console.log(`  ✓ ${ten}`); } else { truot++; console.log(`  ✗ ${ten}`, chiTiet ?? ''); }
}

console.log(`Kiểm tra ${API}\n`);

const health = await goi('GET', '/health');
kiem('health', health.ok === true, health);

const khung = await goi('GET', '/cong-khai/khung');
kiem('khung: có cấu hình + dịch vụ', khung.data?.cau_hinh && khung.data.dich_vu?.length, khung);

const tc = await goi('GET', '/cong-khai/trang-chu');
kiem('trang chủ', tc.data?.dich_vu?.length > 0 && tc.data.danh_gia?.length > 0, tc.error);

const slug = tc.data?.dich_vu?.find((d) => d.nhom === 'cham_soc')?.slug;
const ct = await goi('GET', `/cong-khai/dich-vu/${slug}`);
kiem(`chi tiết dịch vụ ${slug}`, ct.data?.dich_vu?.slug === slug, ct.error);
kiem('dịch vụ không tồn tại → 404', (await goi('GET', '/cong-khai/dich-vu/khong-co-dau')).status === 404);

const tin = await goi('GET', '/cong-khai/tin-tuc');
kiem('tin tức', tin.data?.ds?.length > 0, tin.error);
if (tin.data?.ds?.[0]) kiem('chi tiết tin', (await goi('GET', `/cong-khai/tin-tuc/${tin.data.ds[0].slug}`)).data?.bai);

const tuyChon = await goi('GET', '/cong-khai/dat-lich/tuy-chon');
kiem('tuỳ chọn đặt lịch', tuyChon.data?.dich_vu?.length && tuyChon.data.loai_xe?.length, tuyChon.error);

const ngayMai = new Date(Date.now() + 7 * 3600e3 + 86400e3).toISOString().slice(0, 10);
const kg = await goi('GET', `/cong-khai/dat-lich/khung-gio?ngay=${ngayMai}`);
kiem('khung giờ ngày mai', Array.isArray(kg.data) && kg.data.some((k) => k.trong), kg.error);
const gio = kg.data.find((k) => k.trong).gio;

kiem('đặt lịch thiếu SĐT → 400', (await goi('POST', '/cong-khai/dat-lich', { ho_ten: 'A' })).status === 400);
const sdt = '0901234567';
const dl = await goi('POST', '/cong-khai/dat-lich', {
  ho_ten: 'Khách Thử', dien_thoai: sdt, bien_so: '51A-123.45', loai_xe: tuyChon.data.loai_xe[0],
  ngay: ngayMai, gio, dich_vu: [slug], ghi_chu: 'test-api',
});
kiem('đặt lịch', dl.status === 201 && dl.data?.ma, dl);
const ma = dl.data?.ma;
kiem('tra cứu đúng SĐT', (await goi('POST', '/cong-khai/dat-lich/tra-cuu', { ma, dien_thoai: sdt })).data?.ma === ma);
kiem('tra cứu sai SĐT → 404', (await goi('POST', '/cong-khai/dat-lich/tra-cuu', { ma, dien_thoai: '0999999999' })).status === 404);

const lh = await goi('POST', '/cong-khai/lien-he', { ho_ten: 'Khách Thử', dien_thoai: sdt, noi_dung: 'test-api' });
kiem('gửi liên hệ', lh.status === 201, lh);

// ── Quản trị ──
kiem('quản trị không vé → 401', (await goi('GET', '/quan-tri/tong-quan')).status === 401);
kiem('đăng nhập sai → 401', (await goi('POST', '/auth/dang-nhap', { tai_khoan: TK, mat_khau: 'sai' })).status === 401);
const dn = await goi('POST', '/auth/dang-nhap', { tai_khoan: TK, mat_khau: MK });
kiem('đăng nhập', dn.data?.token, dn);
const t = dn.data?.token;

const tq = await goi('GET', '/quan-tri/tong-quan', null, t);
kiem('tổng quan', tq.data?.bay_ngay?.length === 7, tq.error);

const ds = await goi('GET', `/quan-tri/dat-lich?q=${ma}`, null, t);
kiem('tìm lịch theo mã', ds.data?.ds?.[0]?.ma === ma, ds.error);
const sua = await goi('PATCH', `/quan-tri/dat-lich/${ds.data.ds[0]._id}`, { trang_thai: 'da_xac_nhan' }, t);
kiem('xác nhận lịch', sua.data?.trang_thai === 'da_xac_nhan', sua);
kiem('khách huỷ lịch', (await goi('POST', '/cong-khai/dat-lich/huy', { ma, dien_thoai: sdt })).data?.trang_thai === 'da_huy');

const moi = await goi('POST', '/quan-tri/noi-dung/danh-gia', { ten_khach: 'Test', so_sao: 5, noi_dung: 'Tốt' }, t);
kiem('tạo đánh giá', moi.status === 201, moi);
kiem('sửa đánh giá', (await goi('PUT', `/quan-tri/noi-dung/danh-gia/${moi.data._id}`, { so_sao: 4 }, t)).data?.so_sao === 4);
kiem('xoá đánh giá', (await goi('DELETE', `/quan-tri/noi-dung/danh-gia/${moi.data._id}`, null, t)).data?.ok);
kiem('loại nội dung lạ → 404', (await goi('GET', '/quan-tri/noi-dung/abc', null, t)).status === 404);

// dọn rác
await goi('DELETE', `/quan-tri/dat-lich/${ds.data.ds[0]._id}`, null, t);
await goi('DELETE', `/quan-tri/lien-he/${lh.data?._id}`, null, t);

console.log(`\n${dat} đạt, ${truot} trượt`);
process.exitCode = truot ? 1 : 0;
