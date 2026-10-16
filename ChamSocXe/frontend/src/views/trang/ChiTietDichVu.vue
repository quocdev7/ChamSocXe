<script setup>
import { computed, ref, watch } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'
import { layChiTietDichVu } from '@/api/congKhai.js'
import { tien, telHref } from '@/utils/dinhDang.js'
import BannerTrang from '@/components/BannerTrang.vue'
import TheDichVu from '@/components/TheDichVu.vue'
import AnhAnToan from '@/components/AnhAnToan.vue'
import DangTai from '@/components/DangTai.vue'

const props = defineProps({ slug: { type: String, required: true } })
const khung = useKhungStore()

const d = ref(null)
const loi = ref('')
async function tai() {
  d.value = null
  loi.value = ''
  try {
    d.value = await layChiTietDichVu(props.slug)
    document.title = `${d.value.dich_vu.ten} | ${khung.ten}`
  } catch (e) { loi.value = e.thongBao }
}
watch(() => props.slug, tai, { immediate: true })

const dv = computed(() => d.value?.dich_vu)
const nhomNhan = computed(() => (dv.value?.nhom === 'phu_kien'
  ? { nhan: 'Phụ kiện ô tô', to: '/phu-kien-o-to' }
  : { nhan: 'Chăm sóc xe', to: '/cham-soc-xe' }))
</script>

<template>
  <div>
    <DangTai v-if="!dv" :loi="loi" class="min-h-[50vh]" @thu-lai="tai" />
    <template v-else>
      <BannerTrang :tieu-de="dv.ten" :mo-ta="dv.mo_ta_ngan" :duong-dan="[nhomNhan, { nhan: dv.ten }]" />

      <section class="py-16">
        <div class="khung grid gap-10 lg:grid-cols-3">
          <article class="lg:col-span-2">
            <div class="mb-8 aspect-video overflow-hidden rounded-3xl shadow-lg">
              <AnhAnToan :src="dv.anh" :alt="dv.ten" :bieu-tuong="dv.bieu_tuong" />
            </div>

            <div v-if="dv.noi_dung" class="van-ban text-[17px] leading-relaxed text-slate-700">{{ dv.noi_dung }}</div>

            <div v-if="dv.loi_ich?.length" class="mt-10">
              <h2 class="mb-4 text-2xl font-extrabold text-primary-900">Lợi ích</h2>
              <ul class="grid gap-3 sm:grid-cols-2">
                <li v-for="x in dv.loi_ich" :key="x" class="flex gap-3 rounded-xl bg-emerald-50 p-4 text-slate-700">
                  <i class="fas fa-circle-check mt-1 text-emerald-500"></i><span>{{ x }}</span>
                </li>
              </ul>
            </div>

            <div v-if="dv.quy_trinh?.length" class="mt-10">
              <h2 class="mb-4 text-2xl font-extrabold text-primary-900">Quy trình thực hiện</h2>
              <ol class="relative space-y-4 border-l-2 border-dashed border-primary-200 pl-8">
                <li v-for="(b, i) in dv.quy_trinh" :key="i" class="relative">
                  <span class="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white ring-4 ring-white">{{ i + 1 }}</span>
                  <div class="rounded-xl border border-slate-200 p-4 text-slate-700">{{ b }}</div>
                </li>
              </ol>
            </div>

            <div v-if="dv.bang_gia?.length" class="mt-10">
              <h2 class="mb-4 text-2xl font-extrabold text-primary-900">Bảng giá tham khảo</h2>
              <div class="overflow-hidden rounded-2xl border border-slate-200">
                <table class="w-full text-left">
                  <thead class="bg-primary text-white"><tr><th class="px-5 py-3">Loại xe</th><th class="px-5 py-3 text-right">Giá</th></tr></thead>
                  <tbody>
                    <tr v-for="g in dv.bang_gia" :key="g.loai_xe" class="border-t border-slate-100 odd:bg-slate-50">
                      <td class="px-5 py-3">{{ g.loai_xe }}</td>
                      <td class="px-5 py-3 text-right font-bold text-accent-600">{{ tien(g.gia) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="mt-2 text-xs text-slate-500">* Giá có thể thay đổi theo tình trạng thực tế của xe. Vui lòng liên hệ để được báo giá chính xác.</p>
            </div>
          </article>

          <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div class="the overflow-hidden">
              <div class="bg-primary p-6 text-white">
                <p class="text-sm text-primary-200">Giá chỉ từ</p>
                <p class="text-3xl font-black">{{ tien(dv.gia_tu) }}</p>
                <p v-if="dv.thoi_gian_phut" class="mt-2 text-sm text-primary-100"><i class="far fa-clock"></i> Thời gian ~ {{ dv.thoi_gian_phut }} phút</p>
              </div>
              <div class="space-y-3 p-6">
                <router-link :to="{ path: '/dat-lich', query: { dich_vu: dv.slug } }" class="nut-cam h-12 w-full"><i class="far fa-calendar-check"></i> Đặt lịch dịch vụ này</router-link>
                <a :href="telHref(khung.hotline)" class="nut-phu h-12 w-full"><i class="fas fa-phone"></i> {{ khung.hotline }}</a>
              </div>
            </div>
            <div class="the p-6">
              <h3 class="mb-3 font-bold text-primary-900">{{ nhomNhan.nhan }}</h3>
              <ul class="space-y-1">
                <li v-for="x in (dv.nhom === 'phu_kien' ? khung.phuKien : khung.chamSoc)" :key="x.slug">
                  <router-link :to="{ name: 'dich-vu', params: { slug: x.slug } }"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-primary-50"
                    :class="x.slug === dv.slug ? 'bg-primary-50 font-bold text-primary' : 'text-slate-600'">
                    <i class="fas w-5 text-center text-primary-400" :class="x.bieu_tuong"></i>{{ x.ten }}
                  </router-link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section v-if="d.lien_quan?.length" class="bg-slate-50 py-16">
        <div class="khung">
          <h2 class="mb-8 text-2xl font-extrabold text-primary-900">Dịch vụ liên quan</h2>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <TheDichVu v-for="x in d.lien_quan" :key="x._id" :dv="x" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
