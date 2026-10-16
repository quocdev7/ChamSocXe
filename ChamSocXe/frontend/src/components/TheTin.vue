<script setup>
import AnhAnToan from './AnhAnToan.vue'
import { ngayVN } from '@/utils/dinhDang.js'

defineProps({ bai: { type: Object, required: true } })
</script>

<template>
  <router-link
    :to="{ name: 'chi-tiet-tin', params: { slug: bai.slug } }"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="aspect-[16/9] overflow-hidden">
      <div class="h-full w-full transition duration-500 group-hover:scale-105">
        <AnhAnToan :src="bai.anh" :alt="bai.tieu_de" bieu-tuong="fa-newspaper" />
      </div>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <div class="mb-2 flex items-center gap-3 text-xs text-slate-500">
        <span class="nhan bg-primary-50 text-primary-700">{{ bai.chuyen_muc }}</span>
        <span><i class="far fa-calendar mr-1"></i>{{ ngayVN(bai.ngay_dang) }}</span>
      </div>
      <h3 class="line-clamp-2 text-lg font-bold leading-snug text-primary-900 group-hover:text-primary">{{ bai.tieu_de }}</h3>
      <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{{ bai.tom_tat }}</p>
    </div>
  </router-link>
</template>
