<script setup>
/**
 * CRUD chung cho 3 loại nội dung (dịch vụ, tin tức, đánh giá). Danh sách trường ở đây
 * phản chiếu `backend/src/lib/boSuuTap.js` — backend chỉ nhận các trường đã khai báo ở đó.
 */
import { computed, ref, watch } from 'vue'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { useKhungStore } from '@/stores/khungStore.js'
import { dsNoiDung, taoNoiDung, suaNoiDung, xoaNoiDung } from '@/api/quanTri.js'
import { tien, ngayVN, homNay } from '@/utils/dinhDang.js'
import DangTai from '@/components/DangTai.vue'

const props = defineProps({ loai: { type: String, required: true } })
const tb = useThongBao()
const khung = useKhungStore()

// kieu: chu | van_ban | so | bool | chon | ngay | mang_chu | bang_gia ; rong: 2 = chiếm cả hàng
const LOAI = {
  'dich-vu': {
    nhan: 'dịch vụ',
    cot: [['ten', 'Tên'], ['nhom', 'Nhóm', (v) => (v === 'phu_kien' ? 'Phụ kiện' : 'Chăm sóc')], ['gia_tu', 'Giá từ', tien], ['thu_tu', 'TT']],
    truong: [
      { k: 'ten', n: 'Tên dịch vụ *', kieu: 'chu', rong: 2 },
      { k: 'slug', n: 'Đường dẫn (để trống = tự sinh)', kieu: 'chu' },
      { k: 'nhom', n: 'Nhóm', kieu: 'chon', chon: [['cham_soc', 'Chăm sóc xe'], ['phu_kien', 'Phụ kiện ô tô']] },
      { k: 'mo_ta_ngan', n: 'Mô tả ngắn', kieu: 'chu', rong: 2 },
      { k: 'noi_dung', n: 'Nội dung chi tiết', kieu: 'van_ban', rong: 2 },
      { k: 'quy_trinh', n: 'Quy trình (mỗi dòng một bước)', kieu: 'mang_chu' },
      { k: 'loi_ich', n: 'Lợi ích (mỗi dòng một ý)', kieu: 'mang_chu' },
      { k: 'bieu_tuong', n: 'Biểu tượng FontAwesome (vd: fa-car)', kieu: 'chu' },
      { k: 'anh', n: 'Link ảnh', kieu: 'chu' },
      { k: 'gia_tu', n: 'Giá từ (đ)', kieu: 'so' },
      { k: 'thoi_gian_phut', n: 'Thời gian (phút)', kieu: 'so' },
      { k: 'bang_gia', n: 'Bảng giá theo loại xe', kieu: 'bang_gia', rong: 2 },
      { k: 'thu_tu', n: 'Thứ tự', kieu: 'so' },
      { k: 'noi_bat', n: 'Nổi bật', kieu: 'bool' },
      { k: 'hien_thi', n: 'Hiển thị', kieu: 'bool' },
    ],
    mac_dinh: { nhom: 'cham_soc', bieu_tuong: 'fa-car', hien_thi: true, noi_bat: false, bang_gia: [], quy_trinh: [], loi_ich: [] },
  },
  'tin-tuc': {
    nhan: 'bài viết',
    cot: [['tieu_de', 'Tiêu đề'], ['chuyen_muc', 'Chuyên mục'], ['ngay_dang', 'Ngày đăng', ngayVN]],
    truong: [
      { k: 'tieu_de', n: 'Tiêu đề *', kieu: 'chu', rong: 2 },
      { k: 'slug', n: 'Đường dẫn (để trống = tự sinh)', kieu: 'chu' },
      { k: 'chuyen_muc', n: 'Chuyên mục', kieu: 'chu' },
      { k: 'tom_tat', n: 'Tóm tắt', kieu: 'van_ban', dong: 2, rong: 2 },
      { k: 'noi_dung', n: 'Nội dung', kieu: 'van_ban', dong: 12, rong: 2 },
      { k: 'anh', n: 'Link ảnh', kieu: 'chu', rong: 2 },
      { k: 'nguon', n: 'Nguồn', kieu: 'chu' },
      { k: 'lien_ket_nguon', n: 'Link nguồn', kieu: 'chu' },
      { k: 'ngay_dang', n: 'Ngày đăng', kieu: 'ngay' },
      { k: 'hien_thi', n: 'Hiển thị', kieu: 'bool' },
    ],
    mac_dinh: { chuyen_muc: 'Kiến thức', hien_thi: true },
  },
  'danh-gia': {
    nhan: 'đánh giá',
    cot: [['ten_khach', 'Khách hàng'], ['so_sao', 'Sao', (v) => '★'.repeat(v || 0)], ['noi_dung', 'Nội dung'], ['thu_tu', 'TT']],
    truong: [
      { k: 'ten_khach', n: 'Tên khách hàng *', kieu: 'chu' },
      { k: 'khu_vuc', n: 'Khu vực', kieu: 'chu' },
      { k: 'dich_vu', n: 'Dịch vụ đã dùng', kieu: 'chu' },
      { k: 'so_sao', n: 'Số sao', kieu: 'chon', chon: [5, 4, 3, 2, 1].map((n) => [n, `${n} sao`]) },
      { k: 'noi_dung', n: 'Nội dung *', kieu: 'van_ban', rong: 2 },
      { k: 'thu_tu', n: 'Thứ tự', kieu: 'so' },
      { k: 'hien_thi', n: 'Hiển thị', kieu: 'bool' },
    ],
    mac_dinh: { so_sao: 5, hien_thi: true },
  },
}

const cfg = computed(() => LOAI[props.loai])
const d = ref(null)
const loi = ref('')
const tim = ref('')

async function tai() {
  loi.value = ''
  try { d.value = await dsNoiDung(props.loai, tim.value ? { q: tim.value } : undefined) } catch (e) { loi.value = e.thongBao }
}

// --- Form ---
const f = ref(null) // null = đóng
const dangLuu = ref(false)

function mo(ban) {
  const g = structuredClone({ ...cfg.value.mac_dinh, ...(ban ? JSON.parse(JSON.stringify(ban)) : {}) })
  if (props.loai === 'tin-tuc' && !g.ngay_dang) g.ngay_dang = homNay()
  // mang_chu hiển thị dạng textarea mỗi dòng một mục
  for (const t of cfg.value.truong) if (t.kieu === 'mang_chu') g[t.k] = (g[t.k] || []).join('\n')
  f.value = g
}
function dong() { f.value = null }

// Đặt sau khai báo `f`: watch immediate chạy ngay khi setup, gọi dong() trước đó sẽ lỗi TDZ.
watch(() => props.loai, () => { d.value = null; tim.value = ''; dong(); tai() }, { immediate: true })

async function luu() {
  dangLuu.value = true
  const than = { ...f.value }
  delete than._id
  for (const t of cfg.value.truong) if (t.kieu === 'mang_chu') than[t.k] = String(than[t.k] || '').split('\n')
  try {
    if (f.value._id) await suaNoiDung(props.loai, f.value._id, than)
    else await taoNoiDung(props.loai, than)
    tb.ok('Đã lưu')
    dong()
    tai()
    khung.tai(true)
  } catch (e) { tb.loi(e.thongBao) } finally { dangLuu.value = false }
}

async function xoa(ban) {
  if (!confirm(`Xoá ${cfg.value.nhan} "${ban.ten || ban.tieu_de || ban.ten_khach}"?`)) return
  try { await xoaNoiDung(props.loai, ban._id); tb.ok('Đã xoá'); tai(); khung.tai(true) } catch (e) { tb.loi(e.thongBao) }
}
async function batTatHien(ban) {
  try {
    const than = { ...ban, hien_thi: !ban.hien_thi }
    delete than._id
    Object.assign(ban, await suaNoiDung(props.loai, ban._id, than))
    khung.tai(true)
  } catch (e) { tb.loi(e.thongBao) }
}

const xemLink = (ban) => (props.loai === 'dich-vu' ? `/dich-vu/${ban.slug}` : props.loai === 'tin-tuc' ? `/tin-tuc/${ban.slug}` : '')
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <form class="flex flex-1 gap-2" @submit.prevent="tai">
        <input v-model="tim" class="o-nhap max-w-xs" placeholder="Tìm kiếm..." />
        <button class="nut-phu"><i class="fas fa-search"></i></button>
      </form>
      <button class="nut-cam" @click="mo()"><i class="fas fa-plus"></i> Thêm {{ cfg.nhan }}</button>
    </div>

    <DangTai v-if="!d" :loi="loi" @thu-lai="tai" />
    <div v-else class="the overflow-x-auto">
      <table class="w-full min-w-[700px] text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr><th v-for="c in cfg.cot" :key="c[0]" class="px-4 py-3">{{ c[1] }}</th><th class="px-4">Hiển thị</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-if="!d.ds.length"><td :colspan="cfg.cot.length + 2" class="py-10 text-center text-slate-400">Chưa có dữ liệu.</td></tr>
          <tr v-for="x in d.ds" :key="x._id" class="border-t border-slate-100 hover:bg-slate-50">
            <td v-for="(c, i) in cfg.cot" :key="c[0]" class="max-w-[320px] truncate px-4 py-3" :class="{ 'font-semibold text-primary-900': i === 0 }">
              {{ c[2] ? c[2](x[c[0]]) : x[c[0]] }}
            </td>
            <td class="px-4">
              <button class="relative h-6 w-11 rounded-full transition" :class="x.hien_thi ? 'bg-emerald-500' : 'bg-slate-300'" @click="batTatHien(x)">
                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" :class="x.hien_thi ? 'left-[22px]' : 'left-0.5'"></span>
              </button>
            </td>
            <td class="whitespace-nowrap px-4 text-right">
              <a v-if="xemLink(x)" :href="xemLink(x)" target="_blank" class="nut-nho bg-slate-100 text-slate-600" title="Xem"><i class="fas fa-eye"></i></a>
              <button class="nut-nho ml-1 bg-primary-50 text-primary" @click="mo(x)"><i class="fas fa-pen"></i></button>
              <button class="nut-nho ml-1 bg-rose-50 text-rose-600" @click="xoa(x)"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">Tổng {{ d.tong }} mục</p>
    </div>

    <!-- Form thêm/sửa -->
    <div v-if="f" class="fixed inset-0 z-50 flex justify-end bg-black/40" @click.self="dong">
      <form class="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl" @submit.prevent="luu">
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 class="text-lg font-bold text-primary-900">{{ f._id ? 'Sửa' : 'Thêm' }} {{ cfg.nhan }}</h2>
          <button type="button" class="text-xl text-slate-400 hover:text-slate-700" @click="dong"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="grid flex-1 content-start gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          <div v-for="t in cfg.truong" :key="t.k" :class="{ 'sm:col-span-2': t.rong === 2 || t.kieu === 'bang_gia' }">
            <label v-if="t.kieu === 'bool'" class="flex h-full cursor-pointer items-center gap-3 pt-5">
              <input v-model="f[t.k]" type="checkbox" class="h-5 w-5 accent-primary" /><span class="font-semibold text-slate-700">{{ t.n }}</span>
            </label>
            <template v-else>
              <span class="nhan-o">{{ t.n }}</span>
              <input v-if="t.kieu === 'chu'" v-model="f[t.k]" class="o-nhap" />
              <input v-else-if="t.kieu === 'so'" v-model.number="f[t.k]" type="number" min="0" class="o-nhap" />
              <input v-else-if="t.kieu === 'ngay'" v-model="f[t.k]" type="date" class="o-nhap" />
              <select v-else-if="t.kieu === 'chon'" v-model="f[t.k]" class="o-nhap">
                <option v-for="[v, n] in t.chon" :key="v" :value="v">{{ n }}</option>
              </select>
              <textarea v-else-if="t.kieu === 'van_ban'" v-model="f[t.k]" :rows="t.dong || 6" class="o-nhap"></textarea>
              <textarea v-else-if="t.kieu === 'mang_chu'" v-model="f[t.k]" rows="5" class="o-nhap"></textarea>
              <div v-else-if="t.kieu === 'bang_gia'" class="space-y-2">
                <div v-for="(g, i) in f[t.k]" :key="i" class="flex gap-2">
                  <input v-model="g.loai_xe" class="o-nhap flex-1" placeholder="Loại xe" />
                  <input v-model.number="g.gia" type="number" min="0" class="o-nhap w-40" placeholder="Giá" />
                  <button type="button" class="nut-nho bg-rose-50 text-rose-600" @click="f[t.k].splice(i, 1)"><i class="fas fa-xmark"></i></button>
                </div>
                <button type="button" class="nut-nho bg-slate-100 text-slate-700" @click="f[t.k].push({ loai_xe: '', gia: 0 })"><i class="fas fa-plus"></i> Thêm dòng giá</button>
              </div>
              <p v-if="t.k === 'bieu_tuong' && f[t.k]" class="mt-1 text-sm text-slate-500">Xem trước: <i class="fas text-lg text-primary" :class="f[t.k]"></i></p>
            </template>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" class="nut-phu" @click="dong">Huỷ</button>
          <button class="nut-chinh" :disabled="dangLuu"><i class="fas" :class="dangLuu ? 'fa-spinner fa-spin' : 'fa-save'"></i> Lưu</button>
        </div>
      </form>
    </div>
  </div>
</template>
