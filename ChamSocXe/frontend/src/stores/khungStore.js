/**
 * khungStore — cấu hình website + menu dịch vụ, tải một lần lúc mở web và dùng ở
 * header, footer, nút gọi nổi, form đặt lịch.
 */
import { defineStore } from 'pinia'
import { layKhung } from '@/api/congKhai.js'

export const useKhungStore = defineStore('khung', {
  state: () => ({ cauHinh: null, dichVu: [], daTai: false, loi: '' }),
  getters: {
    chamSoc: (s) => s.dichVu.filter((d) => d.nhom === 'cham_soc'),
    phuKien: (s) => s.dichVu.filter((d) => d.nhom === 'phu_kien'),
    ten: (s) => s.cauHinh?.ten_thuong_hieu || 'ChamSocXe',
    hotline: (s) => s.cauHinh?.hotline || '',
    diaChi: (s) => s.cauHinh?.dia_chi_tru_so || '',
  },
  actions: {
    async tai(ep = false) {
      if (this.daTai && !ep) return
      try {
        const d = await layKhung()
        this.cauHinh = d.cau_hinh
        this.dichVu = d.dich_vu
        this.daTai = true
        this.loi = ''
      } catch (e) {
        this.loi = e.thongBao
      }
    },
  },
})
