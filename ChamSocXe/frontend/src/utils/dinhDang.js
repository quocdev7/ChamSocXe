/** utils/dinhDang.js — định dạng hiển thị dùng chung. */
const SO = new Intl.NumberFormat('vi-VN')

export const so = (n) => SO.format(Number(n) || 0)
export const tien = (n) => (Number(n) > 0 ? `${SO.format(n)}đ` : 'Liên hệ')

/** '2026-10-16' → '16/10/2026' */
export const ngayVN = (s) => {
  if (!s) return ''
  const [y, m, d] = String(s).slice(0, 10).split('-')
  return d ? `${d}/${m}/${y}` : s
}

export const ngayGio = (s) => (s ? new Date(s).toLocaleString('vi-VN', { hour12: false }) : '')

/** Ngày hôm nay theo giờ Việt Nam, 'YYYY-MM-DD', cộng thêm `cong` ngày. */
export const homNay = (cong = 0) => new Date(Date.now() + 7 * 3600e3 + cong * 86400e3).toISOString().slice(0, 10)

export const telHref = (sdt) => `tel:${String(sdt || '').replace(/[^\d+]/g, '')}`

export const thuTrongTuan = (s) => ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][new Date(`${s}T00:00:00`).getDay()]

export const TRANG_THAI_LICH = {
  cho_xac_nhan: { nhan: 'Chờ xác nhận', mau: 'bg-amber-100 text-amber-800' },
  da_xac_nhan: { nhan: 'Đã xác nhận', mau: 'bg-blue-100 text-blue-800' },
  dang_lam: { nhan: 'Đang thực hiện', mau: 'bg-violet-100 text-violet-800' },
  hoan_thanh: { nhan: 'Hoàn thành', mau: 'bg-emerald-100 text-emerald-800' },
  da_huy: { nhan: 'Đã huỷ', mau: 'bg-slate-200 text-slate-600' },
}
