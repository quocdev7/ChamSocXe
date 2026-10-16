<script setup>
/** Dải tiêu đề đầu mỗi trang con, có đường dẫn (breadcrumb). */
defineProps({
  tieuDe: { type: String, required: true },
  moTa: { type: String, default: '' },
  duongDan: { type: Array, default: () => [] }, // [{ nhan, to }]
})
</script>

<template>
  <section class="relative overflow-hidden bg-primary-900 py-14 text-white md:py-20">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(47,116,208,.55),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(249,115,22,.25),transparent_45%)]"></div>
    <div class="khung relative">
      <nav class="mb-3 flex flex-wrap items-center gap-2 text-sm text-primary-200">
        <router-link to="/" class="hover:text-white"><i class="fas fa-house"></i> Trang chủ</router-link>
        <template v-for="d in duongDan" :key="d.nhan">
          <i class="fas fa-chevron-right text-[10px]"></i>
          <router-link v-if="d.to" :to="d.to" class="hover:text-white">{{ d.nhan }}</router-link>
          <span v-else class="text-white">{{ d.nhan }}</span>
        </template>
      </nav>
      <h1 class="text-3xl font-extrabold md:text-5xl">{{ tieuDe }}</h1>
      <p v-if="moTa" class="mt-3 max-w-2xl text-primary-100">{{ moTa }}</p>
    </div>
  </section>
</template>
