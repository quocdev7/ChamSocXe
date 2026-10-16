<template>
  <section class="flex min-h-[60vh] items-center py-20">
    <div class="khung text-center">
      <p class="text-8xl font-black text-primary-100">404</p>
      <h1 class="mt-2 text-3xl font-extrabold text-primary-900">Không tìm thấy trang</h1>
      <p class="mt-3 text-slate-500">Trang bạn tìm có thể đã bị xoá hoặc đổi địa chỉ.</p>
      <div class="mt-8 flex justify-center gap-3">
        <router-link to="/" class="nut-chinh h-11 px-6"><i class="fas fa-house"></i> Trang chủ</router-link>
        <router-link to="/dat-lich" class="nut-cam h-11 px-6"><i class="far fa-calendar-check"></i> Đặt lịch</router-link>
      </div>
    </div>
  </section>
</template>
