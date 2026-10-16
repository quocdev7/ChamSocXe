<script setup>
import AnhAnToan from './AnhAnToan.vue'
import { tien } from '@/utils/dinhDang.js'

defineProps({ dv: { type: Object, required: true } })
</script>

<template>
  <router-link
    :to="{ name: 'dich-vu', params: { slug: dv.slug } }"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="relative aspect-[4/3] overflow-hidden">
      <div class="h-full w-full transition duration-500 group-hover:scale-105">
        <AnhAnToan :src="dv.anh" :alt="dv.ten" :bieu-tuong="dv.bieu_tuong" />
      </div>
      <span class="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-primary shadow">
        <i class="fas text-lg" :class="dv.bieu_tuong || 'fa-car'"></i>
      </span>
      <span v-if="dv.noi_bat" class="nhan absolute right-3 top-3 bg-accent text-white"><i class="fas fa-fire"></i> Nổi bật</span>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="text-lg font-bold text-primary-900 group-hover:text-primary">{{ dv.ten }}</h3>
      <p class="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">{{ dv.mo_ta_ngan }}</p>
      <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span class="text-slate-500">Chỉ từ <b class="text-base text-accent-600">{{ tien(dv.gia_tu) }}</b></span>
        <span class="font-semibold text-primary group-hover:translate-x-1 transition">Chi tiết <i class="fas fa-arrow-right text-xs"></i></span>
      </div>
    </div>
  </router-link>
</template>
