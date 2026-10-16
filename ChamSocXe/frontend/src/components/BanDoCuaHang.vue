<script setup>
/**
 * Bản đồ Google của cửa hàng. `cau_hinh.ban_do` có thể là link nhúng Google Maps
 * hoặc để trống → dùng địa chỉ làm truy vấn tìm kiếm.
 */
import { computed } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'

const khung = useKhungStore()

const src = computed(() => {
  const banDo = khung.cauHinh?.ban_do || ''
  if (/^https:\/\/(www\.)?google\.[^/]+\/maps\/embed/.test(banDo)) return banDo
  const q = banDo || khung.diaChi
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed` : ''
})
</script>

<template>
  <iframe v-if="src" :key="src" :src="src" class="h-full w-full border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" :title="`Bản đồ ${khung.ten}`"></iframe>
</template>
