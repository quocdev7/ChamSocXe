<script setup>
/**
 * Trang chủ — các khối theo thứ tự: hero + số liệu, dịch vụ chăm sóc, vì sao chọn, dải số liệu,
 * giới thiệu, quy trình, phụ kiện, đánh giá khách hàng, cửa hàng + bản đồ, tin tức.
 */
import { computed, onMounted, ref } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'
import { layTrangChu } from '@/api/congKhai.js'
import { telHref } from '@/utils/dinhDang.js'
import TieuDeMuc from '@/components/TieuDeMuc.vue'
import TheDichVu from '@/components/TheDichVu.vue'
import TheTin from '@/components/TheTin.vue'
import DemSo from '@/components/DemSo.vue'
import AnhAnToan from '@/components/AnhAnToan.vue'
import DangTai from '@/components/DangTai.vue'
import BanDoCuaHang from '@/components/BanDoCuaHang.vue'

const khung = useKhungStore()
const ch = computed(() => khung.cauHinh || {})
const sl = computed(() => ch.value.so_lieu || {})
const chiDuong = computed(() => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(khung.diaChi)}`)
const soNam = computed(() => Math.max(1, new Date().getFullYear() - (ch.value.nam_thanh_lap || 2010)))

const d = ref(null)
const loi = ref('')
async function tai() {
  loi.value = ''
  try { d.value = await layTrangChu() } catch (e) { loi.value = e.thongBao }
}
onMounted(tai)

const chamSoc = computed(() => d.value?.dich_vu.filter((x) => x.nhom === 'cham_soc') || [])
const phuKien = computed(() => d.value?.dich_vu.filter((x) => x.nhom === 'phu_kien') || [])

const LY_DO = [
  { i: 'fa-user-gear', t: 'Đội ngũ chuyên nghiệp', m: 'Kỹ thuật viên được đào tạo bài bản, nhiều năm kinh nghiệm, tận tâm với từng chiếc xe.' },
  { i: 'fa-flask', t: 'Công nghệ hiện đại', m: 'Máy móc, hoá chất chuyên dụng nhập khẩu, an toàn tuyệt đối cho lớp sơn và nội thất.' },
  { i: 'fa-list-check', t: 'Quy trình chuẩn quốc tế', m: 'Quy trình nhiều bước được kiểm soát chặt chẽ, nghiệm thu cùng khách trước khi giao xe.' },
  { i: 'fa-shield-halved', t: 'Bảo hành & hậu mãi', m: 'Bảo hành rõ ràng cho từng dịch vụ, chăm sóc định kỳ và ưu đãi cho khách hàng thân thiết.' },
]

const QUY_TRINH = [
  { i: 'fa-calendar-check', t: 'Đặt lịch', m: 'Đặt online hoặc gọi hotline, chọn khung giờ phù hợp.' },
  { i: 'fa-magnifying-glass', t: 'Kiểm tra xe', m: 'Kiểm tra hiện trạng cùng khách, tư vấn gói phù hợp.' },
  { i: 'fa-spray-can-sparkles', t: 'Thực hiện', m: 'Kỹ thuật viên thực hiện theo quy trình chuẩn.' },
  { i: 'fa-car-on', t: 'Bàn giao', m: 'Nghiệm thu cùng khách, hướng dẫn bảo dưỡng.' },
]

const HERO_ANH = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1920&q=70'
const GIOI_THIEU_ANH = 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1200&q=70'
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative isolate overflow-hidden bg-primary-950 text-white">
      <img :src="HERO_ANH" alt="" class="absolute inset-0 -z-10 h-full w-full object-cover opacity-35" @error="$event.target.remove()" />
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-primary-950 via-primary-950/85 to-primary-900/40"></div>
      <div class="khung grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span class="nhan mb-5 bg-white/10 px-3 py-1 text-sm text-accent-400 ring-1 ring-white/20"><i class="fas fa-star"></i> Hơn {{ soNam }} năm kinh nghiệm</span>
          <h1 class="text-4xl font-black leading-tight md:text-5xl xl:text-6xl">
            Rửa Xe &amp; <span class="text-accent-400">Chăm Sóc Xe</span> Ô Tô Chuyên Nghiệp
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-relaxed text-primary-100">{{ ch.mo_ta }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <router-link to="/dat-lich" class="nut-cam h-12 px-7 text-base"><i class="far fa-calendar-check"></i> Đặt Hẹn Online</router-link>
            <router-link to="/cham-soc-xe" class="nut-vien-trang h-12 px-7 text-base">Xem Dịch Vụ <i class="fas fa-arrow-right"></i></router-link>
          </div>
          <a :href="telHref(khung.hotline)" class="mt-8 inline-flex items-center gap-3 text-primary-100 hover:text-white">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><i class="fas fa-headset text-accent-400"></i></span>
            <span>Tư vấn miễn phí: <b class="text-xl text-white">{{ khung.hotline }}</b></span>
          </a>
        </div>
        <div class="grid grid-cols-3 gap-3 sm:gap-4 lg:ml-auto lg:max-w-md lg:grid-cols-1">
          <div v-for="s in [
            { i: 'fa-users', v: sl.khach_hang, h: '+', t: 'Khách hàng' },
            { i: 'fa-car', v: sl.xe_moi_ngay, h: '+', t: 'Xe mỗi ngày' },
            { i: 'fa-screwdriver-wrench', v: sl.dich_vu, h: '+', t: 'Dịch vụ' },
          ]" :key="s.t" class="flex flex-col items-center gap-2 rounded-2xl bg-white/10 p-4 text-center ring-1 ring-white/15 backdrop-blur lg:flex-row lg:gap-5 lg:p-5 lg:text-left">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-xl"><i class="fas" :class="s.i"></i></span>
            <span>
              <span class="block text-2xl font-black md:text-3xl"><DemSo :gia-tri="s.v || 0" :hau-to="s.h" /></span>
              <span class="text-xs text-primary-100 md:text-sm">{{ s.t }}</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <DangTai v-if="!d" :loi="loi" @thu-lai="tai" />

    <template v-else>
      <!-- DỊCH VỤ CHĂM SÓC -->
      <section class="bg-slate-50 py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Dịch vụ của chúng tôi" tieu-de="Dịch Vụ Chăm Sóc Xe Toàn Diện" mo-ta="Từ rửa xe hằng ngày đến phủ ceramic, dán PPF — mọi nhu cầu chăm sóc xe của bạn được đáp ứng tại một nơi." />
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <TheDichVu v-for="dv in chamSoc" :key="dv._id" :dv="dv" />
          </div>
        </div>
      </section>

      <!-- VÌ SAO CHỌN -->
      <section class="py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Vì sao chọn chúng tôi" :tieu-de="`Tại Sao Nên Chọn ${khung.ten}?`" />
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(l, i) in LY_DO" :key="l.t" class="group relative overflow-hidden rounded-2xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-xl">
              <span class="absolute -right-2 -top-4 text-8xl font-black text-slate-100 transition group-hover:text-primary-50">0{{ i + 1 }}</span>
              <span class="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-2xl text-primary transition group-hover:bg-primary group-hover:text-white">
                <i class="fas" :class="l.i"></i>
              </span>
              <h3 class="relative text-lg font-bold text-primary-900">{{ l.t }}</h3>
              <p class="relative mt-2 text-sm leading-relaxed text-slate-500">{{ l.m }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- DẢI SỐ LIỆU -->
      <section class="relative overflow-hidden bg-primary-900 py-16 text-white">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(47,116,208,.5),transparent_50%)]"></div>
        <div class="khung relative grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          <div v-for="s in [
            { v: sl.danh_gia, h: '+', t: 'Đánh giá 5 sao', i: 'fa-star' },
            { v: soNam, h: '+', t: 'Năm kinh nghiệm', i: 'fa-award' },
            { v: sl.khach_hang, h: '+', t: 'Lượt khách phục vụ', i: 'fa-car-side' },
            { v: 100, h: '%', t: 'Khách hàng hài lòng', i: 'fa-face-smile' },
          ]" :key="s.t">
            <i class="fas mb-3 text-3xl text-accent-400" :class="s.i"></i>
            <div class="text-4xl font-black md:text-5xl"><DemSo :gia-tri="s.v || 0" :hau-to="s.h" /></div>
            <div class="mt-1 text-primary-200">{{ s.t }}</div>
          </div>
        </div>
      </section>

      <!-- GIỚI THIỆU -->
      <section class="py-20">
        <div class="khung grid items-center gap-12 lg:grid-cols-2">
          <div class="relative">
            <div class="aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <AnhAnToan :src="GIOI_THIEU_ANH" alt="Xưởng chăm sóc xe" bieu-tuong="fa-car-side" />
            </div>
            <div class="absolute -bottom-6 -right-2 rounded-2xl bg-accent p-5 text-white shadow-xl sm:-right-6">
              <div class="text-4xl font-black">{{ soNam }}+</div>
              <div class="text-sm">năm đồng hành<br />cùng chủ xe</div>
            </div>
          </div>
          <div>
            <p class="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-accent">Về {{ khung.ten }}</p>
            <h2 class="text-3xl font-extrabold leading-tight text-primary-900 md:text-4xl">{{ ch.khau_hieu }}</h2>
            <p class="mt-5 leading-relaxed text-slate-600">
              Thành lập từ năm {{ ch.nam_thanh_lap }}, {{ khung.ten }} mang đến dịch vụ rửa xe và chăm sóc xe ô tô theo quy trình chuẩn:
              dung dịch an toàn, dụng cụ chuyên dụng, kỹ thuật viên được đào tạo bài bản. Mỗi chiếc xe đều được kiểm tra trước và
              nghiệm thu cùng khách sau khi hoàn thành.
            </p>
            <ul class="mt-6 grid gap-3 sm:grid-cols-2">
              <li v-for="x in ['Đặt lịch online, không chờ đợi', 'Giá niêm yết minh bạch', 'Phòng chờ máy lạnh, wifi miễn phí', 'Bảo hành rõ ràng từng dịch vụ']" :key="x" class="flex items-center gap-3 text-slate-700">
                <i class="fas fa-circle-check text-emerald-500"></i>{{ x }}
              </li>
            </ul>
            <div class="mt-8 flex flex-wrap gap-3">
              <router-link to="/ve-chung-toi" class="nut-chinh h-12 px-6">Tìm hiểu thêm <i class="fas fa-arrow-right"></i></router-link>
              <router-link to="/lien-he" class="nut-phu h-12 px-6"><i class="fas fa-location-dot"></i> Xem bản đồ</router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- QUY TRÌNH -->
      <section class="bg-slate-50 py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Quy trình làm việc" tieu-de="4 Bước Đơn Giản" />
          <div class="grid gap-8 md:grid-cols-4">
            <div v-for="(b, i) in QUY_TRINH" :key="b.t" class="relative text-center">
              <div v-if="i < QUY_TRINH.length - 1" class="absolute left-1/2 top-10 hidden h-0.5 w-full border-t-2 border-dashed border-primary-200 md:block"></div>
              <div class="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-primary shadow-lg ring-4 ring-primary-50">
                <i class="fas" :class="b.i"></i>
                <span class="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{{ i + 1 }}</span>
              </div>
              <h3 class="text-lg font-bold text-primary-900">{{ b.t }}</h3>
              <p class="mt-2 text-sm text-slate-500">{{ b.m }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- PHỤ KIỆN -->
      <section v-if="phuKien.length" class="py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Nâng cấp xe" tieu-de="Phụ Kiện Ô Tô Chính Hãng" mo-ta="Lắp đặt tại cửa hàng, bảo hành chính hãng, tư vấn đúng nhu cầu sử dụng." />
          <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <router-link
              v-for="p in phuKien" :key="p._id" :to="{ name: 'dich-vu', params: { slug: p.slug } }"
              class="group flex flex-col items-center rounded-2xl border border-slate-200 p-6 text-center transition hover:border-primary hover:bg-primary hover:text-white hover:shadow-xl"
            >
              <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-2xl text-primary transition group-hover:bg-white/15 group-hover:text-white">
                <i class="fas" :class="p.bieu_tuong"></i>
              </span>
              <h3 class="font-bold text-primary-900 group-hover:text-white">{{ p.ten }}</h3>
              <p class="mt-1 line-clamp-2 text-xs text-slate-500 group-hover:text-primary-100">{{ p.mo_ta_ngan }}</p>
            </router-link>
          </div>
        </div>
      </section>

      <!-- ĐÁNH GIÁ -->
      <section v-if="d.danh_gia.length" class="bg-gradient-to-b from-primary-50 to-white py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Khách hàng nói gì" tieu-de="Đánh Giá Từ Khách Hàng" :mo-ta="`Hơn ${(sl.danh_gia || 0).toLocaleString('vi-VN')} đánh giá 5 sao từ khách hàng đã sử dụng dịch vụ.`" />
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <figure v-for="r in d.danh_gia.slice(0, 6)" :key="r._id" class="the relative p-6">
              <i class="fas fa-quote-right absolute right-6 top-6 text-4xl text-primary-100"></i>
              <div class="mb-3 text-amber-400">
                <i v-for="n in 5" :key="n" class="fa-star" :class="n <= r.so_sao ? 'fas' : 'far'"></i>
              </div>
              <blockquote class="leading-relaxed text-slate-600">“{{ r.noi_dung }}”</blockquote>
              <figcaption class="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span class="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{{ r.ten_khach.trim().split(' ').pop()[0] }}</span>
                <span>
                  <span class="block font-bold text-primary-900">{{ r.ten_khach }}</span>
                  <span class="text-xs text-slate-500">{{ [r.dich_vu, r.khu_vuc].filter(Boolean).join(' · ') }}</span>
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- CỬA HÀNG -->
      <section class="py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Ghé thăm chúng tôi" tieu-de="Cửa Hàng Tại Cam Ranh" :mo-ta="`Mở cửa ${ch.gio_lam_viec}`" />
          <div class="grid gap-6 lg:grid-cols-5">
            <div class="the flex flex-col gap-4 p-6 lg:col-span-2">
              <span class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-xl text-accent"><i class="fas fa-store"></i></span>
              <h3 class="text-xl font-bold text-primary-900">{{ khung.ten }}</h3>
              <p class="text-slate-600"><i class="fas fa-location-dot mr-2 text-primary-400"></i>{{ khung.diaChi }}</p>
              <p class="text-slate-600"><i class="far fa-clock mr-2 text-primary-400"></i>{{ ch.gio_lam_viec }}</p>
              <a :href="telHref(khung.hotline)" class="font-semibold text-primary"><i class="fas fa-phone mr-2"></i>{{ khung.hotline }}</a>
              <div class="mt-auto flex flex-wrap gap-3 pt-2">
                <a :href="chiDuong" target="_blank" rel="noopener" class="nut-chinh h-11 px-5"><i class="fas fa-diamond-turn-right"></i> Chỉ đường</a>
                <router-link to="/dat-lich" class="nut-cam h-11 px-5"><i class="far fa-calendar-check"></i> Đặt lịch</router-link>
              </div>
            </div>
            <div class="the h-80 overflow-hidden lg:col-span-3 lg:h-auto lg:min-h-[340px]"><BanDoCuaHang /></div>
          </div>
        </div>
      </section>

      <!-- TIN TỨC -->
      <section v-if="d.tin_tuc.length" class="bg-slate-50 py-20">
        <div class="khung">
          <TieuDeMuc nhan-nho="Tin tức & kiến thức" tieu-de="Cẩm Nang Chăm Sóc Xe" />
          <div class="grid gap-6 md:grid-cols-3">
            <TheTin v-for="b in d.tin_tuc" :key="b._id" :bai="b" />
          </div>
          <div class="mt-8 text-center">
            <router-link to="/tin-tuc" class="nut-phu h-12 px-6">Xem tất cả bài viết <i class="fas fa-arrow-right"></i></router-link>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
