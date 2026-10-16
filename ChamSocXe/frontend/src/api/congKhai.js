/** api/congKhai.js — website khách xem. */
import api from './index.js'

const p = '/cong-khai'
export const layKhung = () => api.get(`${p}/khung`)
export const layTrangChu = () => api.get(`${p}/trang-chu`)
export const layDichVu = (nhom = '') => api.get(`${p}/dich-vu`, { params: { nhom } })
export const layChiTietDichVu = (slug) => api.get(`${p}/dich-vu/${encodeURIComponent(slug)}`)
export const layDanhGia = () => api.get(`${p}/danh-gia`)
export const layTinTuc = (params) => api.get(`${p}/tin-tuc`, { params })
export const layChiTietTin = (slug) => api.get(`${p}/tin-tuc/${encodeURIComponent(slug)}`)

export const layTuyChonDatLich = () => api.get(`${p}/dat-lich/tuy-chon`)
export const layKhungGio = (ngay) => api.get(`${p}/dat-lich/khung-gio`, { params: { ngay } })
export const datLich = (than) => api.post(`${p}/dat-lich`, than)
export const traCuuLich = (ma, dien_thoai) => api.post(`${p}/dat-lich/tra-cuu`, { ma, dien_thoai })
export const huyLich = (ma, dien_thoai) => api.post(`${p}/dat-lich/huy`, { ma, dien_thoai })

export const guiLienHe = (than) => api.post(`${p}/lien-he`, than)
