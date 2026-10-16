/**
 * api/index.js — axios dùng chung. Gắn vé quản trị nếu có; 401 ở trang quản trị thì xoá vé và
 * đưa về màn đăng nhập. Lỗi trả về luôn có `.thongBao` để màn hình hiện thẳng cho người dùng.
 */
import axios from 'axios'

export const KHOA_VE = 'csx_ve'

const api = axios.create({ baseURL: '/api', timeout: 20000 })

api.interceptors.request.use((cfg) => {
  const ve = localStorage.getItem(KHOA_VE)
  if (ve && !cfg.url.startsWith('/cong-khai')) cfg.headers.Authorization = `Bearer ${ve}`
  return cfg
})

api.interceptors.response.use(
  (res) => res.data?.data,
  (err) => {
    const r = err.response
    const loi = new Error(
      r?.data?.error || (err.code === 'ECONNABORTED' ? 'Máy chủ phản hồi quá lâu, vui lòng thử lại' : 'Không kết nối được máy chủ'),
    )
    loi.thongBao = loi.message
    loi.status = r?.status
    loi.ma = r?.data?.ma_loi
    loi.truong = r?.data?.truong
    const url = err.config?.url || ''
    if (r?.status === 401 && !url.startsWith('/auth/dang-nhap') && !url.startsWith('/cong-khai')) {
      localStorage.removeItem(KHOA_VE)
      if (location.pathname.startsWith('/quan-tri') && !location.pathname.startsWith('/quan-tri/dang-nhap')) {
        location.href = `/quan-tri/dang-nhap?ve=${encodeURIComponent(location.pathname)}`
      }
    }
    return Promise.reject(loi)
  },
)

export default api
