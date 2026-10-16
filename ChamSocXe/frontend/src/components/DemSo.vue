<script setup>
/** Số đếm chạy từ 0 lên khi cuộn tới — như khối số liệu ở trang chủ. */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { so } from '@/utils/dinhDang.js'

const props = defineProps({
  giaTri: { type: Number, default: 0 },
  hauTo: { type: String, default: '' },
  ms: { type: Number, default: 1600 },
})
const hien = ref(0)
const el = ref(null)
let daChay = false
let quan = null

function chay() {
  daChay = true
  const batDau = performance.now()
  const buoc = (t) => {
    const p = Math.min(1, (t - batDau) / props.ms)
    hien.value = Math.round(props.giaTri * (1 - (1 - p) ** 3))
    if (p < 1) requestAnimationFrame(buoc)
  }
  requestAnimationFrame(buoc)
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) { hien.value = props.giaTri; return }
  quan = new IntersectionObserver(([e]) => { if (e.isIntersecting && !daChay) chay() }, { threshold: 0.4 })
  quan.observe(el.value)
})
watch(() => props.giaTri, () => { if (daChay) hien.value = props.giaTri })
onBeforeUnmount(() => quan?.disconnect())
</script>

<template>
  <span ref="el">{{ so(hien) }}{{ hauTo }}</span>
</template>
