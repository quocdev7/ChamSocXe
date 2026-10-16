/** authStore — phiên đăng nhập trang quản trị (JWT lưu localStorage). */
import { defineStore } from 'pinia'
import { KHOA_VE } from '@/api/index.js'
import * as qt from '@/api/quanTri.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null, daKiem: false }),
  actions: {
    async dangNhap(taiKhoan, matKhau) {
      const d = await qt.dangNhap(taiKhoan, matKhau)
      localStorage.setItem(KHOA_VE, d.token)
      this.user = d.user
      this.daKiem = true
    },
    async kiemPhien() {
      if (this.daKiem) return !!this.user
      this.daKiem = true
      if (!localStorage.getItem(KHOA_VE)) return false
      try {
        this.user = (await qt.layToi()).user
      } catch {
        this.user = null
      }
      return !!this.user
    },
    dangXuat() {
      localStorage.removeItem(KHOA_VE)
      this.user = null
    },
  },
})
