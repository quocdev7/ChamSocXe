<script setup>
import { onMounted, ref } from 'vue'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { useKhungStore } from '@/stores/khungStore.js'
import { layCauHinh, luuCauHinh } from '@/api/quanTri.js'
import DangTai from '@/components/DangTai.vue'

const tb = useThongBao()
const khung = useKhungStore()
const f = ref(null)
const loi = ref('')
const dangLuu = ref(false)

async function tai() {
  loi.value = ''
  try { f.value = await layCauHinh() } catch (e) { loi.value = e.thongBao }
}
onMounted(tai)

async function luu() {
  dangLuu.value = true
  try {
    f.value = await luuCauHinh(f.value)
    tb.ok('Đã lưu cấu hình')
    khung.tai(true)
  } catch (e) { tb.loi(e.thongBao) } finally { dangLuu.value = false }
}
</script>

<template>
  <DangTai v-if="!f" :loi="loi" @thu-lai="tai" />
  <form v-else class="max-w-4xl space-y-6" @submit.prevent="luu">
    <div class="the grid gap-4 p-6 sm:grid-cols-2">
      <h2 class="font-bold text-primary-900 sm:col-span-2">Thông tin chung</h2>
      <label><span class="nhan-o">Tên thương hiệu</span><input v-model="f.ten_thuong_hieu" class="o-nhap" /></label>
      <label><span class="nhan-o">Tên công ty</span><input v-model="f.ten_cong_ty" class="o-nhap" /></label>
      <label class="sm:col-span-2"><span class="nhan-o">Khẩu hiệu</span><input v-model="f.khau_hieu" class="o-nhap" /></label>
      <label class="sm:col-span-2"><span class="nhan-o">Mô tả (hiển thị ở trang chủ & chân trang)</span><textarea v-model="f.mo_ta" rows="3" class="o-nhap"></textarea></label>
      <label><span class="nhan-o">Hotline</span><input v-model="f.hotline" class="o-nhap" /></label>
      <label><span class="nhan-o">Email</span><input v-model="f.email" type="email" class="o-nhap" /></label>
      <label><span class="nhan-o">Giờ làm việc</span><input v-model="f.gio_lam_viec" class="o-nhap" /></label>
      <label><span class="nhan-o">Năm thành lập</span><input v-model.number="f.nam_thanh_lap" type="number" class="o-nhap" /></label>
      <label class="sm:col-span-2"><span class="nhan-o">Địa chỉ cửa hàng</span><input v-model="f.dia_chi_tru_so" class="o-nhap" /></label>
      <label class="sm:col-span-2"><span class="nhan-o">Bản đồ (link nhúng Google Maps hoặc từ khoá tìm; để trống = dùng địa chỉ)</span><input v-model="f.ban_do" class="o-nhap" placeholder="https://www.google.com/maps/embed?pb=..." /></label>
    </div>

    <div class="the grid gap-4 p-6 sm:grid-cols-4">
      <h2 class="font-bold text-primary-900 sm:col-span-4">Số liệu trang chủ</h2>
      <label><span class="nhan-o">Khách hàng</span><input v-model.number="f.so_lieu.khach_hang" type="number" min="0" class="o-nhap" /></label>
      <label><span class="nhan-o">Xe phục vụ mỗi ngày</span><input v-model.number="f.so_lieu.xe_moi_ngay" type="number" min="0" class="o-nhap" /></label>
      <label><span class="nhan-o">Dịch vụ</span><input v-model.number="f.so_lieu.dich_vu" type="number" min="0" class="o-nhap" /></label>
      <label><span class="nhan-o">Đánh giá 5 sao</span><input v-model.number="f.so_lieu.danh_gia" type="number" min="0" class="o-nhap" /></label>
    </div>

    <div class="the grid gap-4 p-6 sm:grid-cols-2">
      <h2 class="font-bold text-primary-900 sm:col-span-2">Mạng xã hội</h2>
      <label v-for="[k, n] in [['facebook', 'Facebook'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['zalo', 'Zalo (link hoặc SĐT)']]" :key="k">
        <span class="nhan-o">{{ n }}</span><input v-model="f.mang_xa_hoi[k]" class="o-nhap" placeholder="https://..." />
      </label>
    </div>

    <button class="nut-chinh h-11 px-8" :disabled="dangLuu"><i class="fas" :class="dangLuu ? 'fa-spinner fa-spin' : 'fa-save'"></i> Lưu cấu hình</button>
  </form>
</template>
