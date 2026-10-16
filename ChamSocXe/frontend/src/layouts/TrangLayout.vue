<script setup>
/**
 * Khung website: thanh thông tin trên cùng, menu chính (hai menu xổ "Chăm sóc xe" / "Phụ kiện ô tô"
 * lấy từ danh sách dịch vụ trong DB), menu mobile, footer và cụm nút gọi / Zalo / lên đầu trang.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useKhungStore } from '@/stores/khungStore.js'
import { telHref } from '@/utils/dinhDang.js'

const khung = useKhungStore()
const route = useRoute()
khung.tai()

const moMobile = ref(false)
const moXo = ref('') // menu xổ đang mở trên mobile
const daCuon = ref(false)
const ch = computed(() => khung.cauHinh || {})
const namNay = new Date().getFullYear()

const MENU = computed(() => [
  { nhan: 'Về Chúng Tôi', to: '/ve-chung-toi' },
  { nhan: 'Chăm Sóc Xe', to: '/cham-soc-xe', con: khung.chamSoc },
  { nhan: 'Phụ Kiện Ô Tô', to: '/phu-kien-o-to', con: khung.phuKien },
  { nhan: 'Tin Tức', to: '/tin-tuc' },
  { nhan: 'Đặt Lịch Rửa Xe', to: '/dat-lich' },
  { nhan: 'Liên Hệ', to: '/lien-he' },
])

const MXH = computed(() => [
  { k: 'facebook', i: 'fab fa-facebook-f', mau: 'bg-[#1877f2]' },
  { k: 'youtube', i: 'fab fa-youtube', mau: 'bg-[#ff0000]' },
  { k: 'tiktok', i: 'fab fa-tiktok', mau: 'bg-black' },
  { k: 'zalo', i: 'fas fa-comment-dots', mau: 'bg-[#0068ff]' },
].filter((m) => ch.value.mang_xa_hoi?.[m.k]))

const dangO = (m) => route.path === m.to || (m.con && m.con.some((c) => route.params.slug === c.slug))

const nghe = () => { daCuon.value = window.scrollY > 40 }
const lenDau = () => window.scrollTo({ top: 0, behavior: 'smooth' })
onMounted(() => window.addEventListener('scroll', nghe, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', nghe))
watch(() => route.fullPath, () => { moMobile.value = false; moXo.value = '' })
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Thanh trên cùng -->
    <div class="hidden bg-primary-950 text-xs text-primary-100 md:block">
      <div class="khung flex h-9 items-center justify-between">
        <div class="flex items-center gap-5">
          <span><i class="far fa-clock mr-1.5 text-accent-400"></i>{{ ch.gio_lam_viec }}</span>
          <span><i class="fas fa-location-dot mr-1.5 text-accent-400"></i>{{ ch.dia_chi_tru_so }}</span>
        </div>
        <div class="flex items-center gap-4">
          <a :href="`mailto:${ch.email}`" class="hover:text-white"><i class="far fa-envelope mr-1.5"></i>{{ ch.email }}</a>
          <a v-for="m in MXH" :key="m.k" :href="ch.mang_xa_hoi[m.k]" target="_blank" rel="noopener" class="hover:text-white"><i :class="m.i"></i></a>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur transition" :class="daCuon ? 'shadow-md' : 'border-b border-slate-100'">
      <div class="khung flex h-16 items-center justify-between gap-4 lg:h-20">
        <router-link to="/" class="flex shrink-0 items-center gap-2.5">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 text-white shadow-lg shadow-primary/30">
            <i class="fas fa-droplet text-lg"></i>
          </span>
          <span class="leading-tight">
            <span class="block text-xl font-black tracking-tight text-primary-900">{{ khung.ten }}</span>
            <span class="hidden text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:block">Car Wash &amp; Detailing</span>
          </span>
        </router-link>

        <nav class="hidden items-center gap-1 xl:flex">
          <div v-for="m in MENU" :key="m.to" class="group relative">
            <router-link
              :to="m.to"
              class="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[14px] font-semibold transition hover:text-primary 2xl:px-3 2xl:text-[15px]"
              :class="dangO(m) ? 'text-primary' : 'text-slate-700'"
            >
              {{ m.nhan }}
              <i v-if="m.con?.length" class="fas fa-chevron-down text-[10px] transition group-hover:rotate-180"></i>
            </router-link>
            <div
              v-if="m.con?.length"
              class="invisible absolute left-0 top-full w-72 translate-y-2 pt-2 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="overflow-hidden rounded-xl border border-slate-100 bg-white py-2 shadow-2xl">
                <router-link
                  v-for="c in m.con" :key="c.slug" :to="{ name: 'dich-vu', params: { slug: c.slug } }"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary"
                >
                  <i class="fas w-5 text-center text-primary-500" :class="c.bieu_tuong"></i>{{ c.ten }}
                </router-link>
              </div>
            </div>
          </div>
        </nav>

        <div class="flex items-center gap-2">
          <a :href="telHref(khung.hotline)" class="hidden items-center gap-2 whitespace-nowrap lg:flex xl:hidden 2xl:flex">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 text-accent"><i class="fas fa-phone-volume"></i></span>
            <span class="leading-tight">
              <span class="block text-[11px] text-slate-500">Hotline</span>
              <span class="block font-extrabold text-primary-900">{{ khung.hotline }}</span>
            </span>
          </a>
          <router-link to="/dat-lich" class="nut-cam hidden whitespace-nowrap sm:inline-flex"><i class="far fa-calendar-check"></i> Booking Online</router-link>
          <button class="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-primary-900 hover:bg-slate-100 xl:hidden" aria-label="Menu" @click="moMobile = !moMobile">
            <i class="fas" :class="moMobile ? 'fa-xmark' : 'fa-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <Transition name="hien-dan">
        <div v-if="moMobile" class="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 bg-white xl:hidden">
          <div class="khung py-3">
            <div v-for="m in MENU" :key="m.to" class="border-b border-slate-100 last:border-0">
              <div class="flex items-center">
                <router-link :to="m.to" class="flex-1 py-3 font-semibold" :class="dangO(m) ? 'text-primary' : 'text-slate-700'">{{ m.nhan }}</router-link>
                <button v-if="m.con?.length" class="h-10 w-10 text-slate-500" @click="moXo = moXo === m.to ? '' : m.to">
                  <i class="fas fa-chevron-down transition" :class="moXo === m.to && 'rotate-180'"></i>
                </button>
              </div>
              <div v-if="m.con?.length && moXo === m.to" class="mb-2 grid gap-1 pl-3">
                <router-link v-for="c in m.con" :key="c.slug" :to="{ name: 'dich-vu', params: { slug: c.slug } }" class="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-primary-50">
                  <i class="fas w-5 text-center text-primary-500" :class="c.bieu_tuong"></i>{{ c.ten }}
                </router-link>
              </div>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <a :href="telHref(khung.hotline)" class="nut-phu"><i class="fas fa-phone"></i> {{ khung.hotline }}</a>
              <router-link to="/dat-lich" class="nut-cam"><i class="far fa-calendar-check"></i> Đặt lịch</router-link>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <Transition name="hien-dan" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>

    <!-- Dải kêu gọi trước footer -->
    <section class="bg-gradient-to-r from-accent-600 to-accent-500 text-white">
      <div class="khung flex flex-col items-center justify-between gap-4 py-8 text-center md:flex-row md:text-left">
        <div>
          <h3 class="text-2xl font-extrabold">Xe của bạn xứng đáng được chăm sóc tốt nhất!</h3>
          <p class="mt-1 text-accent-50">Đặt lịch online chỉ 30 giây — không phải chờ đợi khi đến nơi.</p>
        </div>
        <div class="flex shrink-0 gap-3">
          <a :href="telHref(khung.hotline)" class="nut-vien-trang h-12 px-6"><i class="fas fa-phone"></i> {{ khung.hotline }}</a>
          <router-link to="/dat-lich" class="nut h-12 bg-white px-6 text-accent-700 hover:bg-primary-950 hover:text-white">Đặt hẹn ngay</router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-primary-950 text-sm text-primary-200">
      <div class="khung grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div class="mb-4 flex items-center gap-2.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white"><i class="fas fa-droplet"></i></span>
            <span class="text-xl font-black text-white">{{ khung.ten }}</span>
          </div>
          <p class="leading-relaxed">{{ ch.mo_ta }}</p>
          <ul class="mt-5 space-y-2.5">
            <li class="flex gap-3"><i class="fas fa-building mt-0.5 w-4 text-accent-400"></i>{{ ch.ten_cong_ty }}</li>
            <li class="flex gap-3"><i class="fas fa-location-dot mt-0.5 w-4 text-accent-400"></i>{{ ch.dia_chi_tru_so }}</li>
            <li class="flex gap-3"><i class="fas fa-phone mt-0.5 w-4 text-accent-400"></i><a :href="telHref(khung.hotline)" class="font-bold text-white">{{ khung.hotline }}</a></li>
            <li class="flex gap-3"><i class="fas fa-envelope mt-0.5 w-4 text-accent-400"></i><a :href="`mailto:${ch.email}`" class="hover:text-white">{{ ch.email }}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-base font-bold text-white">Dịch vụ chăm sóc xe</h4>
          <ul class="space-y-2">
            <li v-for="d in khung.chamSoc" :key="d.slug">
              <router-link :to="{ name: 'dich-vu', params: { slug: d.slug } }" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>{{ d.ten }}</router-link>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-base font-bold text-white">Phụ kiện ô tô</h4>
          <ul class="space-y-2">
            <li v-for="d in khung.phuKien" :key="d.slug">
              <router-link :to="{ name: 'dich-vu', params: { slug: d.slug } }" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>{{ d.ten }}</router-link>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="mb-4 text-base font-bold text-white">Thông tin</h4>
          <ul class="space-y-2">
            <li><router-link to="/ve-chung-toi" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>Về chúng tôi</router-link></li>
            <li><router-link to="/tin-tuc" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>Tin tức</router-link></li>
            <li><router-link to="/lien-he" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>Liên hệ</router-link></li>
            <li><router-link to="/chinh-sach/bao-hanh" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>Chính sách bảo hành</router-link></li>
            <li><router-link to="/chinh-sach/bao-mat" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>Chính sách bảo mật</router-link></li>
            <li><router-link to="/chinh-sach/thanh-toan" class="hover:text-white"><i class="fas fa-angle-right mr-2 text-accent-400"></i>Chính sách thanh toán</router-link></li>
          </ul>
          <div v-if="MXH.length" class="mt-5 flex gap-2">
            <a v-for="m in MXH" :key="m.k" :href="ch.mang_xa_hoi[m.k]" target="_blank" rel="noopener" class="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:scale-110" :class="m.mau"><i :class="m.i"></i></a>
          </div>
        </div>
      </div>
      <div class="border-t border-white/10">
        <div class="khung flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-300 md:flex-row">
          <span>© {{ namNay }} {{ khung.ten }}. Bảo lưu mọi quyền.</span>
          <router-link to="/quan-tri" class="hover:text-white"><i class="fas fa-lock mr-1"></i>Quản trị</router-link>
        </div>
      </div>
    </footer>

    <!-- Nút nổi -->
    <div class="fixed bottom-5 right-4 z-30 flex flex-col items-end gap-3">
      <a v-if="ch.mang_xa_hoi?.zalo" :href="ch.mang_xa_hoi.zalo" target="_blank" rel="noopener" class="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068ff] text-white shadow-lg transition hover:scale-110" title="Chat Zalo">
        <i class="fas fa-comment-dots text-xl"></i>
      </a>
      <a :href="telHref(khung.hotline)" class="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/40 transition hover:scale-110" :title="`Gọi ${khung.hotline}`">
        <span class="absolute inset-0 animate-ping rounded-full bg-accent opacity-40"></span>
        <i class="fas fa-phone relative text-xl"></i>
      </a>
      <Transition name="hien-dan">
        <button v-if="daCuon" class="flex h-11 w-11 items-center justify-center rounded-full bg-primary-900 text-white shadow-lg hover:bg-primary" title="Lên đầu trang" @click="lenDau">
          <i class="fas fa-arrow-up"></i>
        </button>
      </Transition>
    </div>
  </div>
</template>
