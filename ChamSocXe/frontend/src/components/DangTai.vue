<script setup>
defineProps({ loi: { type: String, default: '' } })
defineEmits(['thuLai'])
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
    <template v-if="loi">
      <i class="fas fa-triangle-exclamation text-3xl text-rose-500"></i>
      <p>{{ loi }}</p>
      <button class="nut-phu" @click="$emit('thuLai')"><i class="fas fa-rotate"></i> Thử lại</button>
    </template>
    <template v-else>
      <i class="fas fa-spinner fa-spin text-3xl text-primary"></i>
      <p>Đang tải...</p>
    </template>
  </div>
</template>
