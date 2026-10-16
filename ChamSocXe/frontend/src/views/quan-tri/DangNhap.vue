<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const f = reactive({ tai_khoan: '', mat_khau: '' })
const loi = ref('')
const dangGui = ref(false)

async function dangNhap() {
  loi.value = ''
  dangGui.value = true
  try {
    await auth.dangNhap(f.tai_khoan, f.mat_khau)
    const ve = String(route.query.ve || '')
    router.replace(ve.startsWith('/quan-tri') ? ve : '/quan-tri')
  } catch (e) { loi.value = e.thongBao } finally { dangGui.value = false }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 p-4">
    <form class="the w-full max-w-sm p-8" @submit.prevent="dangNhap">
      <div class="mb-6 text-center">
        <span class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl text-white"><i class="fas fa-car-side"></i></span>
        <h1 class="text-xl font-extrabold text-primary-900">Quản trị ChamSocXe</h1>
        <p class="text-sm text-slate-500">Đăng nhập để quản lý lịch hẹn &amp; nội dung</p>
      </div>
      <label class="mb-4 block"><span class="nhan-o">Tài khoản</span><input v-model="f.tai_khoan" class="o-nhap" required autocomplete="username" autofocus /></label>
      <label class="mb-4 block"><span class="nhan-o">Mật khẩu</span><input v-model="f.mat_khau" type="password" class="o-nhap" required autocomplete="current-password" /></label>
      <p v-if="loi" class="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ loi }}</p>
      <button class="nut-chinh h-11 w-full" :disabled="dangGui"><i class="fas" :class="dangGui ? 'fa-spinner fa-spin' : 'fa-right-to-bracket'"></i> Đăng nhập</button>
      <router-link to="/" class="mt-4 block text-center text-sm text-slate-500 hover:text-primary"><i class="fas fa-arrow-left"></i> Về trang chủ</router-link>
    </form>
  </div>
</template>
