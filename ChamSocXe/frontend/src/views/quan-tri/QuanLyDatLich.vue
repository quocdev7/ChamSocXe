<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { dsDatLich, suaDatLich, xoaDatLich } from '@/api/quanTri.js'
import { tien, ngayVN, ngayGio, telHref, TRANG_THAI_LICH } from '@/utils/dinhDang.js'
import DangTai from '@/components/DangTai.vue'

const route = useRoute()
const router = useRouter()
const tb = useThongBao()

const d = ref(null)
const loi = ref('')
const loc = computed(() => ({
  trang_thai: route.query.trang_thai || '',
  ngay: route.query.ngay || '',
  q: route.query.q || '',
  trang: Number(route.query.trang) || 1,
}))
const tim = ref(loc.value.q)

async function tai() {
  loi.value = ''
  try {
    const p = Object.fromEntries(Object.entries(loc.value).filter(([, v]) => v))
    d.value = await dsDatLich(p)
  } catch (e) { loi.value = e.thongBao }
}
watch(() => route.fullPath, tai, { immediate: true })

const doiLoc = (q) => router.push({ query: Object.fromEntries(Object.entries({ ...route.query, trang: undefined, ...q }).filter(([, v]) => v)) })
const soTrang = computed(() => (d.value ? Math.max(1, Math.ceil(d.value.tong / d.value.so_dong)) : 1))

const chon = ref(null)
const ghiChu = ref('')
function moChiTiet(l) {
  chon.value = l
  ghiChu.value = l.ghi_chu_noi_bo || ''
}

async function doiTrangThai(l, trangThai) {
  try {
    const moi = await suaDatLich(l._id, { trang_thai: trangThai })
    Object.assign(l, moi)
    if (chon.value?._id === l._id) chon.value = l
    tb.ok(`${l.ma}: ${TRANG_THAI_LICH[trangThai].nhan}`)
  } catch (e) { tb.loi(e.thongBao) }
}
async function luuGhiChu() {
  try {
    Object.assign(chon.value, await suaDatLich(chon.value._id, { ghi_chu_noi_bo: ghiChu.value }))
    tb.ok('Đã lưu ghi chú')
  } catch (e) { tb.loi(e.thongBao) }
}
async function xoa(l) {
  if (!confirm(`Xoá vĩnh viễn lịch hẹn ${l.ma}?`)) return
  try {
    await xoaDatLich(l._id)
    chon.value = null
    tb.ok('Đã xoá')
    tai()
  } catch (e) { tb.loi(e.thongBao) }
}
</script>

<template>
  <div class="space-y-4">
    <div class="the flex flex-wrap items-end gap-3 p-4">
      <label class="min-w-[200px] flex-1"><span class="nhan-o">Tìm kiếm</span>
        <input v-model="tim" class="o-nhap" placeholder="Mã, tên, SĐT, biển số..." @keyup.enter="doiLoc({ q: tim })" />
      </label>
      <label><span class="nhan-o">Trạng thái</span>
        <select class="o-nhap" :value="loc.trang_thai" @change="doiLoc({ trang_thai: $event.target.value })">
          <option value="">Tất cả</option>
          <option v-for="(v, k) in TRANG_THAI_LICH" :key="k" :value="k">{{ v.nhan }}</option>
        </select>
      </label>
      <label><span class="nhan-o">Ngày hẹn</span>
        <input type="date" class="o-nhap" :value="loc.ngay" @change="doiLoc({ ngay: $event.target.value })" />
      </label>
      <button class="nut-chinh h-11" @click="doiLoc({ q: tim })"><i class="fas fa-search"></i> Lọc</button>
      <button class="nut-phu h-11" @click="tim = ''; router.push({ query: {} })">Xoá lọc</button>
    </div>

    <DangTai v-if="!d" :loi="loi" @thu-lai="tai" />
    <div v-else class="the overflow-x-auto">
      <table class="w-full min-w-[780px] text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr><th class="px-4 py-3">Mã</th><th>Hẹn lúc</th><th>Khách hàng</th><th>Xe</th><th>Dịch vụ</th><th>Trạng thái</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-if="!d.ds.length"><td colspan="7" class="py-10 text-center text-slate-400">Không có lịch hẹn nào.</td></tr>
          <tr v-for="l in d.ds" :key="l._id" class="cursor-pointer border-t border-slate-100 hover:bg-primary-50/40" @click="moChiTiet(l)">
            <td class="px-4 py-3 font-bold text-primary">{{ l.ma }}</td>
            <td><b>{{ l.gio }}</b> {{ ngayVN(l.ngay) }}</td>
            <td>{{ l.ho_ten }}<br /><span class="text-xs text-slate-500">{{ l.dien_thoai }}</span></td>
            <td>{{ l.bien_so || '—' }}<br /><span class="text-xs text-slate-500">{{ l.loai_xe }}</span></td>
            <td class="max-w-[220px] truncate">{{ l.dich_vu.map((x) => x.ten).join(', ') }}</td>
            <td @click.stop>
              <select class="rounded-full border-0 px-3 py-1 text-xs font-semibold" :class="TRANG_THAI_LICH[l.trang_thai]?.mau" :value="l.trang_thai" @change="doiTrangThai(l, $event.target.value)">
                <option v-for="(v, k) in TRANG_THAI_LICH" :key="k" :value="k">{{ v.nhan }}</option>
              </select>
            </td>
            <td class="pr-4 text-right"><i class="fas fa-chevron-right text-slate-300"></i></td>
          </tr>
        </tbody>
      </table>
      <div class="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
        <span>Tổng {{ d.tong }} lịch hẹn</span>
        <span v-if="soTrang > 1" class="flex items-center gap-2">
          <button class="nut-nho bg-slate-100" :disabled="loc.trang <= 1" @click="router.push({ query: { ...route.query, trang: loc.trang - 1 } })"><i class="fas fa-chevron-left"></i></button>
          Trang {{ loc.trang }}/{{ soTrang }}
          <button class="nut-nho bg-slate-100" :disabled="loc.trang >= soTrang" @click="router.push({ query: { ...route.query, trang: loc.trang + 1 } })"><i class="fas fa-chevron-right"></i></button>
        </span>
      </div>
    </div>

    <!-- Chi tiết -->
    <div v-if="chon" class="fixed inset-0 z-50 flex justify-end bg-black/40" @click.self="chon = null">
      <div class="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-black text-primary-900">{{ chon.ma }}</h2>
          <button class="text-xl text-slate-400 hover:text-slate-700" @click="chon = null"><i class="fas fa-xmark"></i></button>
        </div>
        <span class="nhan" :class="TRANG_THAI_LICH[chon.trang_thai]?.mau">{{ TRANG_THAI_LICH[chon.trang_thai]?.nhan }}</span>
        <dl class="mt-4 space-y-3 text-sm">
          <div><dt class="text-slate-500">Khách hàng</dt><dd class="font-semibold">{{ chon.ho_ten }} · <a :href="telHref(chon.dien_thoai)" class="text-primary">{{ chon.dien_thoai }}</a></dd></div>
          <div v-if="chon.email"><dt class="text-slate-500">Email</dt><dd>{{ chon.email }}</dd></div>
          <div><dt class="text-slate-500">Xe</dt><dd>{{ chon.bien_so || '—' }} · {{ chon.loai_xe }}</dd></div>
          <div><dt class="text-slate-500">Hẹn lúc</dt><dd class="font-semibold">{{ chon.gio }} {{ ngayVN(chon.ngay) }}</dd></div>
          <div><dt class="text-slate-500">Dịch vụ</dt>
            <dd><ul><li v-for="x in chon.dich_vu" :key="x.slug" class="flex justify-between"><span>{{ x.ten }}</span><span class="text-slate-500">{{ tien(x.gia_tu) }}</span></li></ul></dd>
          </div>
          <div v-if="chon.ghi_chu"><dt class="text-slate-500">Ghi chú của khách</dt><dd class="van-ban rounded-lg bg-amber-50 p-3">{{ chon.ghi_chu }}</dd></div>
          <div><dt class="text-slate-500">Đặt lúc</dt><dd>{{ ngayGio(chon.tao_luc) }}</dd></div>
        </dl>
        <p class="nhan-o mt-5">Chuyển trạng thái</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="(v, k) in TRANG_THAI_LICH" :key="k" class="nut-nho" :class="chon.trang_thai === k ? v.mau + ' ring-2 ring-offset-1' : 'bg-slate-100 text-slate-600'" @click="doiTrangThai(chon, k)">{{ v.nhan }}</button>
        </div>
        <label class="mt-5 block"><span class="nhan-o">Ghi chú nội bộ</span><textarea v-model="ghiChu" rows="3" class="o-nhap"></textarea></label>
        <button class="nut-chinh mt-2" @click="luuGhiChu"><i class="fas fa-save"></i> Lưu ghi chú</button>
        <div v-if="chon.lich_su?.length" class="mt-6">
          <p class="nhan-o">Lịch sử</p>
          <ul class="space-y-1 text-xs text-slate-500">
            <li v-for="(h, i) in chon.lich_su" :key="i">{{ ngayGio(h.luc) }} — {{ TRANG_THAI_LICH[h.trang_thai]?.nhan }} ({{ h.boi }})</li>
          </ul>
        </div>
        <button class="nut-phu mt-8 w-full border-rose-200 text-rose-600 hover:bg-rose-50" @click="xoa(chon)"><i class="fas fa-trash"></i> Xoá lịch hẹn</button>
      </div>
    </div>
  </div>
</template>
