/** thongBaoStore — thông báo nổi góc màn hình (toast). */
import { defineStore } from 'pinia'

let dem = 0
export const useThongBao = defineStore('thongBao', {
  state: () => ({ ds: [] }),
  actions: {
    hien(noiDung, loai = 'ok', ms = 3500) {
      const id = ++dem
      this.ds.push({ id, noiDung, loai })
      setTimeout(() => this.dong(id), ms)
    },
    ok(s) { this.hien(s, 'ok') },
    loi(s) { this.hien(s?.thongBao || s?.message || s, 'loi', 5000) },
    dong(id) { this.ds = this.ds.filter((t) => t.id !== id) },
  },
})
