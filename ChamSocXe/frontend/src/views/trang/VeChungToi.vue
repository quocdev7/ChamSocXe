<script setup>
import { computed } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'
import BannerTrang from '@/components/BannerTrang.vue'
import TieuDeMuc from '@/components/TieuDeMuc.vue'
import DemSo from '@/components/DemSo.vue'
import AnhAnToan from '@/components/AnhAnToan.vue'

const khung = useKhungStore()
const ch = computed(() => khung.cauHinh || {})
const sl = computed(() => ch.value.so_lieu || {})

const GIA_TRI = [
  { i: 'fa-heart', t: 'Tận tâm', m: 'Chăm sóc mỗi chiếc xe như chính xe của mình.' },
  { i: 'fa-scale-balanced', t: 'Minh bạch', m: 'Giá niêm yết rõ ràng, tư vấn đúng nhu cầu, không phát sinh.' },
  { i: 'fa-gem', t: 'Chất lượng', m: 'Sản phẩm chính hãng, quy trình chuẩn, nghiệm thu kỹ lưỡng.' },
  { i: 'fa-leaf', t: 'Bền vững', m: 'Tiết kiệm nước, hoá chất thân thiện môi trường.' },
]
</script>

<template>
  <div>
    <BannerTrang tieu-de="Về Chúng Tôi" :mo-ta="ch.khau_hieu" :duong-dan="[{ nhan: 'Về chúng tôi' }]" />

    <section class="py-20">
      <div class="khung grid items-center gap-12 lg:grid-cols-2">
        <div class="aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
          <AnhAnToan src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=70" alt="Đội ngũ kỹ thuật" bieu-tuong="fa-users-gear" />
        </div>
        <div>
          <p class="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-accent">Câu chuyện của chúng tôi</p>
          <h2 class="text-3xl font-extrabold text-primary-900 md:text-4xl">{{ ch.ten_cong_ty || khung.ten }}</h2>
          <p class="mt-5 leading-relaxed text-slate-600">{{ ch.mo_ta }}</p>
          <p class="mt-4 leading-relaxed text-slate-600">
            Bắt đầu từ một xưởng rửa xe nhỏ năm {{ ch.nam_thanh_lap }}, đến nay {{ khung.ten }} đã trở thành điểm chăm sóc xe uy tín tại Cam Ranh
            với hơn {{ sl.dich_vu }} dịch vụ chăm sóc xe chuyên sâu, phục vụ hàng chục nghìn lượt khách mỗi năm.
          </p>
          <div class="mt-8 grid grid-cols-3 gap-4 text-center">
            <div class="rounded-2xl bg-primary-50 p-4"><div class="text-2xl font-black text-primary"><DemSo :gia-tri="sl.khach_hang || 0" hau-to="+" /></div><div class="text-xs text-slate-500">Khách hàng</div></div>
            <div class="rounded-2xl bg-primary-50 p-4"><div class="text-2xl font-black text-primary"><DemSo :gia-tri="sl.xe_moi_ngay || 0" hau-to="+" /></div><div class="text-xs text-slate-500">Xe mỗi ngày</div></div>
            <div class="rounded-2xl bg-primary-50 p-4"><div class="text-2xl font-black text-primary"><DemSo :gia-tri="sl.danh_gia || 0" hau-to="+" /></div><div class="text-xs text-slate-500">Đánh giá 5★</div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-slate-50 py-20">
      <div class="khung grid gap-6 md:grid-cols-2">
        <div class="the p-8">
          <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-white"><i class="fas fa-eye"></i></span>
          <h3 class="text-xl font-bold text-primary-900">Tầm nhìn</h3>
          <p class="mt-3 leading-relaxed text-slate-600">Trở thành hệ thống chăm sóc xe ô tô được tin cậy hàng đầu, nơi mọi chủ xe có thể yên tâm giao chiếc xe của mình.</p>
        </div>
        <div class="the p-8">
          <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl text-white"><i class="fas fa-bullseye"></i></span>
          <h3 class="text-xl font-bold text-primary-900">Sứ mệnh</h3>
          <p class="mt-3 leading-relaxed text-slate-600">Mang đến dịch vụ chăm sóc xe chất lượng, minh bạch và tiện lợi — giúp chiếc xe luôn sạch đẹp, bền bỉ và an toàn trên mọi hành trình.</p>
        </div>
      </div>
    </section>

    <section class="py-20">
      <div class="khung">
        <TieuDeMuc nhan-nho="Giá trị cốt lõi" tieu-de="Điều Chúng Tôi Theo Đuổi" />
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="g in GIA_TRI" :key="g.t" class="rounded-2xl border border-slate-200 p-7 text-center transition hover:-translate-y-1 hover:shadow-xl">
            <span class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-2xl text-primary"><i class="fas" :class="g.i"></i></span>
            <h3 class="text-lg font-bold text-primary-900">{{ g.t }}</h3>
            <p class="mt-2 text-sm text-slate-500">{{ g.m }}</p>
          </div>
        </div>
        <div class="mt-12 text-center">
          <router-link to="/dat-lich" class="nut-cam h-12 px-7"><i class="far fa-calendar-check"></i> Đặt lịch ngay</router-link>
        </div>
      </div>
    </section>
  </div>
</template>
