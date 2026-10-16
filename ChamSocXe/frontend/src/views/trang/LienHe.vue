<script setup>
import { computed, reactive, ref } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { guiLienHe } from '@/api/congKhai.js'
import { telHref } from '@/utils/dinhDang.js'
import BannerTrang from '@/components/BannerTrang.vue'
import BanDoCuaHang from '@/components/BanDoCuaHang.vue'

const khung = useKhungStore()
const tb = useThongBao()
const ch = computed(() => khung.cauHinh || {})
const chiDuong = computed(() => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(khung.diaChi)}`)

const f = reactive({ ho_ten: '', dien_thoai: '', email: '', chu_de: '', noi_dung: '' })
const dangGui = ref(false)
const daGui = ref(false)

async function gui() {
  dangGui.value = true
  try {
    await guiLienHe({ ...f })
    daGui.value = true
    Object.assign(f, { chu_de: '', noi_dung: '' })
  } catch (e) { tb.loi(e.thongBao) } finally { dangGui.value = false }
}
</script>

<template>
  <div>
    <BannerTrang tieu-de="Liên Hệ" mo-ta="Gửi câu hỏi hoặc yêu cầu báo giá — chúng tôi phản hồi trong giờ làm việc." :duong-dan="[{ nhan: 'Liên hệ' }]" />
    <section class="bg-slate-50 py-14">
      <div class="khung grid gap-8 lg:grid-cols-5">
        <div class="space-y-4 lg:col-span-2">
          <div v-for="x in [
            { i: 'fa-headset', t: 'Hotline', v: khung.hotline, href: telHref(khung.hotline) },
            { i: 'fa-envelope', t: 'Email', v: ch.email, href: ch.email ? `mailto:${ch.email}` : '' },
            { i: 'fa-location-dot', t: 'Địa chỉ', v: ch.dia_chi_tru_so },
            { i: 'fa-clock', t: 'Giờ làm việc', v: ch.gio_lam_viec },
          ].filter((x) => x.v)" :key="x.t" class="the flex items-center gap-4 p-5">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-xl text-white"><i class="fas" :class="x.i"></i></span>
            <span>
              <span class="block text-sm text-slate-500">{{ x.t }}</span>
              <a v-if="x.href" :href="x.href" class="font-bold text-primary-900 hover:text-primary">{{ x.v }}</a>
              <span v-else class="font-bold text-primary-900">{{ x.v }}</span>
            </span>
          </div>
          <div class="the h-64 overflow-hidden"><BanDoCuaHang /></div>
          <a :href="chiDuong" target="_blank" rel="noopener" class="nut-phu h-11 w-full"><i class="fas fa-diamond-turn-right"></i> Chỉ đường đến cửa hàng</a>
        </div>

        <div class="the p-6 md:p-8 lg:col-span-3">
          <div v-if="daGui" class="py-10 text-center">
            <span class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600"><i class="fas fa-check"></i></span>
            <h2 class="text-xl font-bold text-primary-900">Cảm ơn bạn đã liên hệ!</h2>
            <p class="mt-2 text-slate-500">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
            <button class="nut-phu mt-6 h-10 px-5" @click="daGui = false">Gửi tin nhắn khác</button>
          </div>
          <form v-else class="grid gap-4 sm:grid-cols-2" @submit.prevent="gui">
            <h2 class="text-xl font-extrabold text-primary-900 sm:col-span-2">Gửi tin nhắn cho chúng tôi</h2>
            <label><span class="nhan-o">Họ và tên *</span><input v-model="f.ho_ten" class="o-nhap" required maxlength="100" /></label>
            <label><span class="nhan-o">Số điện thoại *</span><input v-model="f.dien_thoai" type="tel" class="o-nhap" required /></label>
            <label><span class="nhan-o">Email</span><input v-model="f.email" type="email" class="o-nhap" /></label>
            <label><span class="nhan-o">Chủ đề</span><input v-model="f.chu_de" class="o-nhap" maxlength="200" placeholder="VD: Báo giá phủ ceramic" /></label>
            <label class="sm:col-span-2"><span class="nhan-o">Nội dung *</span><textarea v-model="f.noi_dung" rows="6" class="o-nhap" required maxlength="3000"></textarea></label>
            <div class="sm:col-span-2">
              <button class="nut-chinh h-12 px-8" :disabled="dangGui"><i class="fas" :class="dangGui ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i> Gửi liên hệ</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
