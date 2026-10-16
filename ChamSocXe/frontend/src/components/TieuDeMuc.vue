<script setup>
defineProps({
  nhanNho: { type: String, default: '' },
  tieuDe: { type: String, required: true },
  moTa: { type: String, default: '' },
  sang: { type: Boolean, default: false },
})
</script>

<template>
  <div class="mx-auto mb-10 max-w-3xl text-center">
    <p v-if="nhanNho" class="mb-2 text-sm font-bold uppercase tracking-[0.2em]" :class="sang ? 'text-accent-400' : 'text-accent'">{{ nhanNho }}</p>
    <h2 class="text-3xl font-extrabold leading-tight md:text-4xl" :class="sang ? 'text-white' : 'text-primary-900'">{{ tieuDe }}</h2>
    <div class="mx-auto mt-4 h-1 w-16 rounded-full bg-accent"></div>
    <p v-if="moTa" class="mt-4 leading-relaxed" :class="sang ? 'text-primary-100' : 'text-slate-500'">{{ moTa }}</p>
  </div>
</template>
