<script setup>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { doiMatKhau } from '@/api/quanTri.js'

const auth = useAuthStore()
const tb = useThongBao()
const route = useRoute()
const router = useRouter()
const moMenu = ref(false)
watch(() => route.fullPath, () => { moMenu.value = false })

const MENU = [
  { to: '/quan-tri', i: 'fa-gauge', t: 'Tổng quan' },
  { to: '/quan-tri/dat-lich', i: 'fa-calendar-check', t: 'Lịch hẹn' },
  { to: '/quan-tri/lien-he', i: 'fa-envelope', t: 'Liên hệ' },
  { nhom: 'Nội dung website' },
  { to: '/quan-tri/noi-dung/dich-vu', i: 'fa-spray-can-sparkles', t: 'Dịch vụ' },
  { to: '/quan-tri/noi-dung/tin-tuc', i: 'fa-newspaper', t: 'Tin tức' },
  { to: '/quan-tri/noi-dung/danh-gia', i: 'fa-star', t: 'Đánh giá' },
  { to: '/quan-tri/cau-hinh', i: 'fa-gear', t: 'Cấu hình' },
]

function dangXuat() {
  auth.dangXuat()
  router.push({ name: 'qt-dang-nhap' })
}

const doiMk = ref(false)
const mk = reactive({ cu: '', moi: '', lai: '' })
async function luuMk() {
  if (mk.moi !== mk.lai) { tb.loi('Mật khẩu nhập lại không khớp'); return }
  try {
    await doiMatKhau(mk.cu, mk.moi)
    tb.ok('Đã đổi mật khẩu')
    doiMk.value = false
    Object.assign(mk, { cu: '', moi: '', lai: '' })
  } catch (e) { tb.loi(e.thongBao) }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 lg:flex">
    <aside class="fixed inset-y-0 left-0 z-40 w-64 -translate-x-full bg-primary-950 text-primary-100 transition lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
      :class="{ 'translate-x-0': moMenu }">
      <div class="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white"><i class="fas fa-car-side"></i></span>
        <span><span class="block font-extrabold text-white">ChamSocXe</span><span class="text-xs text-primary-300">Quản trị</span></span>
      </div>
      <nav class="space-y-1 overflow-y-auto p-3" style="height: calc(100vh - 4rem - 7.5rem)">
        <template v-for="m in MENU" :key="m.t || m.nhom">
          <p v-if="m.nhom" class="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-primary-400">{{ m.nhom }}</p>
          <router-link v-else :to="m.to" class="muc-qt">
            <i class="fas w-5 text-center" :class="m.i"></i>{{ m.t }}
          </router-link>
        </template>
      </nav>
      <div class="absolute inset-x-0 bottom-0 space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" class="muc-qt"><i class="fas fa-arrow-up-right-from-square w-5 text-center"></i>Xem website</a>
        <button class="muc-qt w-full" @click="doiMk = true"><i class="fas fa-key w-5 text-center"></i>Đổi mật khẩu</button>
        <button class="muc-qt w-full" @click="dangXuat"><i class="fas fa-right-from-bracket w-5 text-center"></i>Đăng xuất</button>
      </div>
    </aside>
    <div v-if="moMenu" class="fixed inset-0 z-30 bg-black/40 lg:hidden" @click="moMenu = false"></div>

    <div class="min-w-0 flex-1">
      <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 md:px-6">
        <button class="text-xl text-slate-600 lg:hidden" @click="moMenu = true"><i class="fas fa-bars"></i></button>
        <h1 class="flex-1 truncate text-lg font-bold text-primary-900">{{ route.meta.tieuDe }}</h1>
        <span class="flex items-center gap-2 text-sm text-slate-600">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"><i class="fas fa-user"></i></span>
          <span class="hidden sm:inline">{{ auth.user?.ho_ten || auth.user?.tai_khoan }}</span>
        </span>
      </header>
      <main class="p-4 md:p-6"><router-view /></main>
    </div>

    <div v-if="doiMk" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="doiMk = false">
      <form class="the w-full max-w-sm space-y-4 p-6" @submit.prevent="luuMk">
        <h2 class="text-lg font-bold text-primary-900">Đổi mật khẩu</h2>
        <label class="block"><span class="nhan-o">Mật khẩu hiện tại</span><input v-model="mk.cu" type="password" class="o-nhap" required autocomplete="current-password" /></label>
        <label class="block"><span class="nhan-o">Mật khẩu mới (≥ 8 ký tự)</span><input v-model="mk.moi" type="password" class="o-nhap" required minlength="8" autocomplete="new-password" /></label>
        <label class="block"><span class="nhan-o">Nhập lại mật khẩu mới</span><input v-model="mk.lai" type="password" class="o-nhap" required minlength="8" autocomplete="new-password" /></label>
        <div class="flex justify-end gap-2">
          <button type="button" class="nut-phu" @click="doiMk = false">Huỷ</button>
          <button class="nut-chinh">Lưu</button>
        </div>
      </form>
    </div>
  </div>
</template>
