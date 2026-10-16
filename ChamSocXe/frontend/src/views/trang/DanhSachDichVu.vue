<script setup>
import { computed, ref, watch } from 'vue'
import { layDichVu } from '@/api/congKhai.js'
import BannerTrang from '@/components/BannerTrang.vue'
import TheDichVu from '@/components/TheDichVu.vue'
import DangTai from '@/components/DangTai.vue'

const props = defineProps({ nhom: { type: String, required: true } })

const ds = ref(null)
const loi = ref('')
async function tai() {
  ds.value = null
  loi.value = ''
  try { ds.value = await layDichVu(props.nhom) } catch (e) { loi.value = e.thongBao }
}
watch(() => props.nhom, tai, { immediate: true })

const thongTin = computed(() =>
  props.nhom === 'phu_kien'
    ? { tieuDe: 'Phụ Kiện Ô Tô', moTa: 'Phụ kiện chính hãng, lắp đặt chuyên nghiệp, bảo hành rõ ràng.', nhan: 'Phụ kiện ô tô' }
    : { tieuDe: 'Dịch Vụ Chăm Sóc Xe', moTa: 'Rửa xe, vệ sinh nội thất, đánh bóng, phủ ceramic, dán phim PPF và hơn thế nữa.', nhan: 'Chăm sóc xe' },
)
</script>

<template>
  <div>
    <BannerTrang :tieu-de="thongTin.tieuDe" :mo-ta="thongTin.moTa" :duong-dan="[{ nhan: thongTin.nhan }]" />
    <section class="bg-slate-50 py-16">
      <div class="khung">
        <DangTai v-if="!ds" :loi="loi" @thu-lai="tai" />
        <p v-else-if="!ds.length" class="py-16 text-center text-slate-500">Chưa có dịch vụ nào.</p>
        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TheDichVu v-for="dv in ds" :key="dv._id" :dv="dv" />
        </div>
      </div>
    </section>
  </div>
</template>
