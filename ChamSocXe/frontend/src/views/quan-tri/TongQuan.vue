<script setup>
import { computed, onMounted, ref } from 'vue'
import { tongQuan } from '@/api/quanTri.js'
import { ngayVN, TRANG_THAI_LICH } from '@/utils/dinhDang.js'
import DangTai from '@/components/DangTai.vue'

const d = ref(null)
const loi = ref('')
async function tai() {
  loi.value = ''
  try { d.value = await tongQuan() } catch (e) { loi.value = e.thongBao }
}
onMounted(tai)

const maxNgay = computed(() => Math.max(1, ...(d.value?.bay_ngay || []).map((x) => x.so)))
</script>

<template>
  <DangTai v-if="!d" :loi="loi" @thu-lai="tai" />
  <div v-else class="space-y-6">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <router-link v-for="(v, k) in TRANG_THAI_LICH" :key="k" :to="{ path: '/quan-tri/dat-lich', query: { trang_thai: k } }" class="the p-4 transition hover:shadow-md">
        <span class="nhan" :class="v.mau">{{ v.nhan }}</span>
        <p class="mt-2 text-3xl font-black text-primary-900">{{ d.trang_thai[k] || 0 }}</p>
      </router-link>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="the p-5 lg:col-span-2">
        <h2 class="mb-4 font-bold text-primary-900">Lịch hẹn hôm nay ({{ d.hom_nay.length }})</h2>
        <p v-if="!d.hom_nay.length" class="py-8 text-center text-slate-400">Chưa có lịch hẹn nào hôm nay.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-500"><tr><th class="py-2">Giờ</th><th>Mã</th><th>Khách</th><th>Dịch vụ</th><th>Trạng thái</th></tr></thead>
            <tbody>
              <tr v-for="l in d.hom_nay" :key="l._id" class="border-t border-slate-100">
                <td class="py-2 font-bold">{{ l.gio }}</td>
                <td>{{ l.ma }}</td>
                <td>{{ l.ho_ten }}<br /><span class="text-xs text-slate-500">{{ l.dien_thoai }} {{ l.bien_so }}</span></td>
                <td class="text-xs">{{ (l.dich_vu || []).map((x) => x.ten).join(', ') }}</td>
                <td><span class="nhan" :class="TRANG_THAI_LICH[l.trang_thai]?.mau">{{ TRANG_THAI_LICH[l.trang_thai]?.nhan }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-6">
        <div class="the p-5">
          <h2 class="mb-4 font-bold text-primary-900">Lịch đặt 7 ngày qua</h2>
          <div class="flex h-40 items-end gap-2">
            <div v-for="x in d.bay_ngay" :key="x.ngay" class="flex flex-1 flex-col items-center gap-1">
              <span class="text-xs font-bold text-primary-900">{{ x.so }}</span>
              <div class="w-full rounded-t bg-primary" :style="{ height: `${(x.so / maxNgay) * 100}px`, minHeight: '3px' }"></div>
              <span class="text-[10px] text-slate-500">{{ ngayVN(x.ngay).slice(0, 5) }}</span>
            </div>
          </div>
        </div>
        <router-link to="/quan-tri/lien-he" class="the flex items-center gap-4 p-5 transition hover:shadow-md">
          <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-xl text-accent"><i class="fas fa-envelope"></i></span>
          <span><span class="block text-2xl font-black text-primary-900">{{ d.lien_he_moi }}</span><span class="text-sm text-slate-500">liên hệ chưa xử lý</span></span>
        </router-link>
        <div class="the grid grid-cols-3 gap-3 p-5 text-center text-sm">
          <router-link v-for="x in [['dich-vu', 'Dịch vụ', d.noi_dung.dich_vu], ['tin-tuc', 'Tin tức', d.noi_dung.tin_tuc], ['danh-gia', 'Đánh giá', d.noi_dung.danh_gia]]"
            :key="x[0]" :to="`/quan-tri/noi-dung/${x[0]}`" class="rounded-lg bg-slate-50 p-3 hover:bg-primary-50">
            <span class="block text-xl font-black text-primary">{{ x[2] }}</span>{{ x[1] }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
