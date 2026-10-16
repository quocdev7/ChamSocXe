<script setup>
import { useThongBao } from '@/stores/thongBaoStore.js'
const tb = useThongBao()
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
    <TransitionGroup name="hien-dan">
      <div
        v-for="t in tb.ds" :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-xl"
        :class="t.loai === 'loi' ? 'bg-rose-600' : 'bg-emerald-600'"
      >
        <i class="fas mt-0.5" :class="t.loai === 'loi' ? 'fa-circle-exclamation' : 'fa-circle-check'"></i>
        <span class="flex-1">{{ t.noiDung }}</span>
        <button class="opacity-70 hover:opacity-100" @click="tb.dong(t.id)"><i class="fas fa-xmark"></i></button>
      </div>
    </TransitionGroup>
  </div>
</template>
