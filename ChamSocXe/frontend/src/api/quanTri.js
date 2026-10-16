/** api/quanTri.js — trang quản trị. */
import api from './index.js'

export const dangNhap = (tai_khoan, mat_khau) => api.post('/auth/dang-nhap', { tai_khoan, mat_khau })
export const layToi = () => api.get('/auth/toi')
export const doiMatKhau = (mat_khau_cu, mat_khau_moi) => api.post('/auth/doi-mat-khau', { mat_khau_cu, mat_khau_moi })

const p = '/quan-tri'
export const tongQuan = () => api.get(`${p}/tong-quan`)

export const dsDatLich = (params) => api.get(`${p}/dat-lich`, { params })
export const suaDatLich = (id, than) => api.patch(`${p}/dat-lich/${id}`, than)
export const xoaDatLich = (id) => api.delete(`${p}/dat-lich/${id}`)

export const dsLienHe = (params) => api.get(`${p}/lien-he`, { params })
export const suaLienHe = (id, da_xu_ly) => api.patch(`${p}/lien-he/${id}`, { da_xu_ly })
export const xoaLienHe = (id) => api.delete(`${p}/lien-he/${id}`)

export const layCauHinh = () => api.get(`${p}/cau-hinh`)
export const luuCauHinh = (than) => api.put(`${p}/cau-hinh`, than)

export const dsNoiDung = (loai, params) => api.get(`${p}/noi-dung/${loai}`, { params })
export const taoNoiDung = (loai, than) => api.post(`${p}/noi-dung/${loai}`, than)
export const suaNoiDung = (loai, id, than) => api.put(`${p}/noi-dung/${loai}/${id}`, than)
export const xoaNoiDung = (loai, id) => api.delete(`${p}/noi-dung/${loai}/${id}`)
