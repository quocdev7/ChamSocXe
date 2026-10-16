<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { layTinTuc } from '@/api/congKhai.js'
import BannerTrang from '@/components/BannerTrang.vue'
import TheTin from '@/components/TheTin.vue'
import DangTai from '@/components/DangTai.vue'

const route = useRoute()
const router = useRouter()

const d = ref(null)
const loi = ref('')
const trang = computed(() => Math.max(1, Number(route.query.trang) || 1))
const chuyenMuc = computed(() => route.query.chuyen_muc || '')

async function tai() {
  d.value = null
  loi.value = ''
  try { d.value = await layTinTuc({ trang: trang.value, chuyen_muc: chuyenMuc.value || undefined }) } catch (e) { loi.value = e.thongBao }
}
watch(() => route.fullPath, tai, { immediate: true })

const soTrang = computed(() => (d.value ? Math.max(1, Math.ceil(d.value.tong / d.value.so_dong)) : 1))
const den = (q) => router.push({ query: { ...route.query, ...q } })
</script>

<template>
  <div>
    <BannerTrang tieu-de="Tin Tức & Cẩm Nang" mo-ta="Kiến thức chăm sóc xe, kinh nghiệm sử dụng và tin khuyến mãi." :duong-dan="[{ nhan: 'Tin tức' }]" />
    <section class="bg-slate-50 py-14">
      <div class="khung">
        <div v-if="d?.chuyen_muc?.length" class="mb-8 flex flex-wrap gap-2">
          <button v-for="c in ['', ...d.chuyen_muc]" :key="c" class="nut-nho"
            :class="chuyenMuc === c ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'"
            @click="den({ chuyen_muc: c || undefined, trang: undefined })">{{ c || 'Tất cả' }}</button>
        </div>
        <DangTai v-if="!d" :loi="loi" @thu-lai="tai" />
        <p v-else-if="!d.ds.length" class="py-16 text-center text-slate-500">Chưa có bài viết nào.</p>
        <template v-else>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TheTin v-for="b in d.ds" :key="b._id" :bai="b" />
          </div>
          <nav v-if="soTrang > 1" class="mt-10 flex justify-center gap-2">
            <button v-for="n in soTrang" :key="n" class="h-10 w-10 rounded-lg font-semibold"
              :class="n === trang ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-primary-50'"
              @click="den({ trang: n > 1 ? n : undefined })">{{ n }}</button>
          </nav>
        </template>
      </div>
    </section>
  </div>
</template>
