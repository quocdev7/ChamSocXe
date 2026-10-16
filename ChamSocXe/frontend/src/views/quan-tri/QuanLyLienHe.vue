<script setup>
import { computed, ref, watch } from 'vue'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { dsLienHe, suaLienHe, xoaLienHe } from '@/api/quanTri.js'
import { ngayGio, telHref } from '@/utils/dinhDang.js'
import DangTai from '@/components/DangTai.vue'

const tb = useThongBao()
const d = ref(null)
const loi = ref('')
const loc = ref('0')
const trang = ref(1)

async function tai() {
  loi.value = ''
  try { d.value = await dsLienHe({ da_xu_ly: loc.value, trang: trang.value }) } catch (e) { loi.value = e.thongBao }
}
watch([loc, trang], tai, { immediate: true })
watch(loc, () => { trang.value = 1 })
const soTrang = computed(() => (d.value ? Math.max(1, Math.ceil(d.value.tong / d.value.so_dong)) : 1))

async function danhDau(x) {
  try {
    Object.assign(x, await suaLienHe(x._id, !x.da_xu_ly))
    tb.ok(x.da_xu_ly ? 'Đã đánh dấu xử lý' : 'Đã chuyển về chưa xử lý')
  } catch (e) { tb.loi(e.thongBao) }
}
async function xoa(x) {
  if (!confirm(`Xoá liên hệ của ${x.ho_ten}?`)) return
  try { await xoaLienHe(x._id); tb.ok('Đã xoá'); tai() } catch (e) { tb.loi(e.thongBao) }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <button v-for="[v, t] in [['0', 'Chưa xử lý'], ['1', 'Đã xử lý'], ['', 'Tất cả']]" :key="v" class="nut-nho"
        :class="loc === v ? 'bg-primary text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'" @click="loc = v">{{ t }}</button>
    </div>
    <DangTai v-if="!d" :loi="loi" @thu-lai="tai" />
    <template v-else>
      <p v-if="!d.ds.length" class="the py-12 text-center text-slate-400">Không có liên hệ nào.</p>
      <div v-for="x in d.ds" :key="x._id" class="the p-5" :class="{ 'opacity-70': x.da_xu_ly }">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-bold text-primary-900">{{ x.ho_ten }} <span v-if="x.chu_de" class="font-normal text-slate-500">— {{ x.chu_de }}</span></p>
            <p class="text-sm text-slate-500">
              <a :href="telHref(x.dien_thoai)" class="text-primary">{{ x.dien_thoai }}</a>
              <template v-if="x.email"> · <a :href="`mailto:${x.email}`" class="text-primary">{{ x.email }}</a></template>
              · {{ ngayGio(x.tao_luc) }}
            </p>
          </div>
          <div class="flex gap-2">
            <button class="nut-nho" :class="x.da_xu_ly ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'" @click="danhDau(x)">
              <i class="fas" :class="x.da_xu_ly ? 'fa-rotate-left' : 'fa-check'"></i> {{ x.da_xu_ly ? 'Bỏ đánh dấu' : 'Đã xử lý' }}
            </button>
            <button class="nut-nho bg-rose-50 text-rose-600" @click="xoa(x)"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <p class="van-ban mt-3 text-slate-700">{{ x.noi_dung }}</p>
      </div>
      <div v-if="soTrang > 1" class="flex justify-center gap-2">
        <button v-for="n in soTrang" :key="n" class="nut-nho" :class="n === trang ? 'bg-primary text-white' : 'bg-white ring-1 ring-slate-200'" @click="trang = n">{{ n }}</button>
      </div>
    </template>
  </div>
</template>
