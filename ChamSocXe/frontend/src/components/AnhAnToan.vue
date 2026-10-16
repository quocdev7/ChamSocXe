<script setup>
/**
 * Ảnh có dự phòng: thiếu link hoặc link hỏng (ảnh mẫu lấy từ Unsplash, máy không có mạng) thì vẽ
 * nền gradient + biểu tượng thay vì một ô vỡ.
 */
import { ref, watch } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  bieuTuong: { type: String, default: 'fa-car' },
})
const hong = ref(!props.src)
watch(() => props.src, (v) => { hong.value = !v })
</script>

<template>
  <img v-if="!hong" :src="src" :alt="alt" loading="lazy" class="h-full w-full object-cover" @error="hong = true" />
  <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-600 via-primary-800 to-primary-950 text-white/80">
    <i class="fas text-5xl" :class="bieuTuong"></i>
  </div>
</template>
