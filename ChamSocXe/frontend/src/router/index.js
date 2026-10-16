import { createRouter, createWebHistory } from 'vue-router'
import TrangLayout from '@/layouts/TrangLayout.vue'
import { useAuthStore } from '@/stores/authStore.js'

const routes = [
  {
    path: '/',
    component: TrangLayout,
    children: [
      { path: '', name: 'trang-chu', component: () => import('@/views/trang/TrangChu.vue') },
      { path: 've-chung-toi', name: 've-chung-toi', component: () => import('@/views/trang/VeChungToi.vue'), meta: { tieuDe: 'Về chúng tôi' } },
      { path: 'cham-soc-xe', name: 'cham-soc-xe', component: () => import('@/views/trang/DanhSachDichVu.vue'), props: { nhom: 'cham_soc' }, meta: { tieuDe: 'Chăm sóc xe' } },
      { path: 'phu-kien-o-to', name: 'phu-kien', component: () => import('@/views/trang/DanhSachDichVu.vue'), props: { nhom: 'phu_kien' }, meta: { tieuDe: 'Phụ kiện ô tô' } },
      { path: 'dich-vu/:slug', name: 'dich-vu', component: () => import('@/views/trang/ChiTietDichVu.vue'), props: true },
      { path: 'dat-lich', name: 'dat-lich', component: () => import('@/views/trang/DatLich.vue'), meta: { tieuDe: 'Đặt lịch rửa xe' } },
      { path: 'he-thong-cua-hang', redirect: '/lien-he' },
      { path: 'tin-tuc', name: 'tin-tuc', component: () => import('@/views/trang/TinTuc.vue'), meta: { tieuDe: 'Tin tức' } },
      { path: 'tin-tuc/:slug', name: 'chi-tiet-tin', component: () => import('@/views/trang/ChiTietTin.vue'), props: true },
      { path: 'lien-he', name: 'lien-he', component: () => import('@/views/trang/LienHe.vue'), meta: { tieuDe: 'Liên hệ' } },
      { path: 'chinh-sach/:loai', name: 'chinh-sach', component: () => import('@/views/trang/ChinhSach.vue'), props: true },
      { path: ':duongDan(.*)*', name: 'khong-thay', component: () => import('@/views/trang/KhongTimThay.vue'), meta: { tieuDe: 'Không tìm thấy trang' } },
    ],
  },
  { path: '/quan-tri/dang-nhap', name: 'qt-dang-nhap', component: () => import('@/views/quan-tri/DangNhap.vue'), meta: { tieuDe: 'Đăng nhập quản trị' } },
  {
    path: '/quan-tri',
    component: () => import('@/layouts/QuanTriLayout.vue'),
    meta: { canDangNhap: true },
    children: [
      { path: '', name: 'qt-tong-quan', component: () => import('@/views/quan-tri/TongQuan.vue'), meta: { tieuDe: 'Tổng quan' } },
      { path: 'dat-lich', name: 'qt-dat-lich', component: () => import('@/views/quan-tri/QuanLyDatLich.vue'), meta: { tieuDe: 'Lịch hẹn' } },
      { path: 'lien-he', name: 'qt-lien-he', component: () => import('@/views/quan-tri/QuanLyLienHe.vue'), meta: { tieuDe: 'Liên hệ' } },
      { path: 'noi-dung/:loai', name: 'qt-noi-dung', component: () => import('@/views/quan-tri/QuanLyNoiDung.vue'), props: true, meta: { tieuDe: 'Nội dung' } },
      { path: 'cau-hinh', name: 'qt-cau-hinh', component: () => import('@/views/quan-tri/CauHinh.vue'), meta: { tieuDe: 'Cấu hình website' } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (to.matched.some((r) => r.meta.canDangNhap)) {
    const ok = await useAuthStore().kiemPhien()
    if (!ok) return { name: 'qt-dang-nhap', query: { ve: to.fullPath } }
  }
})

router.afterEach((to) => {
  if (to.meta.tieuDe) document.title = `${to.meta.tieuDe} — ChamSocXe`
})

export default router
