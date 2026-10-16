<script setup>
import { ref, watch } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'
import { layChiTietTin } from '@/api/congKhai.js'
import { ngayVN } from '@/utils/dinhDang.js'
import BannerTrang from '@/components/BannerTrang.vue'
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
    d.value = await layChiTietTin(props.slug)
    document.title = `${d.value.bai.tieu_de} | ${khung.ten}`
  } catch (e) { loi.value = e.thongBao }
}
watch(() => props.slug, tai, { immediate: true })
</script>

<template>
  <div>
    <DangTai v-if="!d" :loi="loi" class="min-h-[50vh]" @thu-lai="tai" />
    <template v-else>
      <BannerTrang :tieu-de="d.bai.tieu_de" :duong-dan="[{ nhan: 'Tin tức', to: '/tin-tuc' }, { nhan: d.bai.chuyen_muc || 'Bài viết' }]" />
      <section class="py-14">
        <div class="khung grid gap-10 lg:grid-cols-3">
          <article class="lg:col-span-2">
            <div class="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span v-if="d.bai.chuyen_muc" class="nhan bg-primary-50 text-primary">{{ d.bai.chuyen_muc }}</span>
              <span><i class="far fa-calendar"></i> {{ ngayVN(d.bai.ngay_dang) }}</span>
            </div>
            <p v-if="d.bai.tom_tat" class="mb-6 text-lg font-semibold leading-relaxed text-slate-700">{{ d.bai.tom_tat }}</p>
            <div v-if="d.bai.anh" class="mb-8 aspect-video overflow-hidden rounded-3xl">
              <AnhAnToan :src="d.bai.anh" :alt="d.bai.tieu_de" bieu-tuong="fa-newspaper" />
            </div>
            <div class="van-ban text-[17px] leading-relaxed text-slate-700">{{ d.bai.noi_dung }}</div>
            <p v-if="d.bai.nguon" class="mt-8 text-right text-sm italic text-slate-500">
              Nguồn:
              <a v-if="d.bai.lien_ket_nguon" :href="d.bai.lien_ket_nguon" target="_blank" rel="noopener nofollow" class="text-primary hover:underline">{{ d.bai.nguon }}</a>
              <span v-else>{{ d.bai.nguon }}</span>
            </p>
            <div class="mt-10">
              <router-link to="/tin-tuc" class="nut-phu h-11 px-5"><i class="fas fa-arrow-left"></i> Tất cả tin tức</router-link>
            </div>
          </article>
          <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div v-if="d.bai_khac?.length" class="the p-6">
              <h3 class="mb-4 font-bold text-primary-900">Bài viết khác</h3>
              <ul class="space-y-4">
                <li v-for="b in d.bai_khac" :key="b._id">
                  <router-link :to="{ name: 'chi-tiet-tin', params: { slug: b.slug } }" class="group flex gap-3">
                    <span class="h-16 w-20 shrink-0 overflow-hidden rounded-lg"><AnhAnToan :src="b.anh" :alt="b.tieu_de" bieu-tuong="fa-newspaper" /></span>
                    <span>
                      <span class="line-clamp-2 text-sm font-semibold text-slate-700 group-hover:text-primary">{{ b.tieu_de }}</span>
                      <span class="text-xs text-slate-400">{{ ngayVN(b.ngay_dang) }}</span>
                    </span>
                  </router-link>
                </li>
              </ul>
            </div>
            <div class="rounded-2xl bg-primary p-6 text-white">
              <h3 class="text-lg font-bold">Xe của bạn cần chăm sóc?</h3>
              <p class="mt-2 text-sm text-primary-100">Đặt lịch online để được phục vụ ngay, không cần chờ đợi.</p>
              <router-link to="/dat-lich" class="nut-cam mt-4 h-11 w-full"><i class="far fa-calendar-check"></i> Đặt lịch ngay</router-link>
            </div>
          </aside>
        </div>
      </section>
    </template>
  </div>
</template>
