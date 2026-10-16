<script setup>
/**
 * Đặt lịch online: chọn ngày → khung giờ còn trống → dịch vụ → thông tin xe & liên hệ.
 * Phía dưới có ô tra cứu / huỷ lịch bằng mã + số điện thoại.
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useKhungStore } from '@/stores/khungStore.js'
import { useThongBao } from '@/stores/thongBaoStore.js'
import { layTuyChonDatLich, layKhungGio, datLich, traCuuLich, huyLich } from '@/api/congKhai.js'
import { tien, ngayVN, homNay, thuTrongTuan, telHref, TRANG_THAI_LICH } from '@/utils/dinhDang.js'
import BannerTrang from '@/components/BannerTrang.vue'
import DangTai from '@/components/DangTai.vue'

const route = useRoute()
const khung = useKhungStore()
const tb = useThongBao()

const tc = ref(null)
const loiTai = ref('')
const f = reactive({ ngay: homNay(), gio: '', dich_vu: [], loai_xe: '', bien_so: '', ho_ten: '', dien_thoai: '', email: '', ghi_chu: '' })
const loiTruong = reactive({})
const dangGui = ref(false)
const ketQua = ref(null)

async function tai() {
  loiTai.value = ''
  try {
    tc.value = await layTuyChonDatLich()
    if (!f.loai_xe) f.loai_xe = tc.value.loai_xe[0] || ''
    const chon = route.query.dich_vu
    if (chon) f.dich_vu = [].concat(chon).filter((s) => tc.value.dich_vu.some((d) => d.slug === s))
  } catch (e) { loiTai.value = e.thongBao }
}
onMounted(tai)

// Danh sách 7 ngày gần nhất làm nút chọn nhanh, kèm ô chọn ngày bất kỳ.
const ngayNhanh = computed(() => Array.from({ length: 7 }, (_, i) => homNay(i)))
const ngayToiDa = computed(() => homNay(tc.value?.toi_da_ngay || 30))

const gioDs = ref([])
const dangTaiGio = ref(false)
async function taiGio() {
  if (!f.ngay) return
  dangTaiGio.value = true
  try {
    gioDs.value = await layKhungGio(f.ngay)
    if (f.gio && !gioDs.value.find((g) => g.gio === f.gio)?.trong) f.gio = ''
  } catch (e) {
    gioDs.value = []
    tb.loi(e.thongBao)
  } finally { dangTaiGio.value = false }
}
watch(() => f.ngay, taiGio, { immediate: true })

const dvChamSoc = computed(() => tc.value?.dich_vu.filter((d) => d.nhom === 'cham_soc') || [])
const dvPhuKien = computed(() => tc.value?.dich_vu.filter((d) => d.nhom === 'phu_kien') || [])
const dvDaChon = computed(() => tc.value?.dich_vu.filter((d) => f.dich_vu.includes(d.slug)) || [])
const tamTinh = computed(() => dvDaChon.value.reduce((t, d) => t + (d.gia_tu || 0), 0))

function batTatDv(slug) {
  const i = f.dich_vu.indexOf(slug)
  if (i >= 0) f.dich_vu.splice(i, 1)
  else f.dich_vu.push(slug)
}

async function gui() {
  Object.keys(loiTruong).forEach((k) => delete loiTruong[k])
  if (!f.gio) { loiTruong.gio = 'Vui lòng chọn khung giờ'; tb.loi('Vui lòng chọn khung giờ'); return }
  if (!f.dich_vu.length) { loiTruong.dich_vu = 'Vui lòng chọn ít nhất một dịch vụ'; tb.loi(loiTruong.dich_vu); return }
  dangGui.value = true
  try {
    ketQua.value = await datLich({ ...f })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    if (e.truong) loiTruong[e.truong] = e.thongBao
    tb.loi(e.thongBao)
    if (e.ma === 'het_cho') taiGio()
  } finally { dangGui.value = false }
}

function datMoi() {
  ketQua.value = null
  Object.assign(f, { gio: '', dich_vu: [], ghi_chu: '' })
  taiGio()
}

// --- Tra cứu / huỷ ---
const tra = reactive({ ma: '', dien_thoai: '' })
const lichTra = ref(null)
const dangTra = ref(false)
async function traCuu() {
  dangTra.value = true
  lichTra.value = null
  try { lichTra.value = await traCuuLich(tra.ma, tra.dien_thoai) } catch (e) { tb.loi(e.thongBao) } finally { dangTra.value = false }
}
async function huy() {
  if (!confirm(`Huỷ lịch hẹn ${lichTra.value.ma}?`)) return
  try {
    lichTra.value = await huyLich(tra.ma, tra.dien_thoai)
    tb.ok('Đã huỷ lịch hẹn')
  } catch (e) { tb.loi(e.thongBao) }
}
</script>

<template>
  <div>
    <BannerTrang tieu-de="Đặt Lịch Rửa Xe" mo-ta="Chọn khung giờ phù hợp — không phải chờ đợi khi đến nơi." :duong-dan="[{ nhan: 'Đặt lịch' }]" />

    <section class="bg-slate-50 py-14">
      <div class="khung">
        <DangTai v-if="!tc" :loi="loiTai" @thu-lai="tai" />

        <!-- ĐẶT THÀNH CÔNG -->
        <div v-else-if="ketQua" class="the mx-auto max-w-2xl p-8 text-center md:p-12">
          <span class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600"><i class="fas fa-check"></i></span>
          <h2 class="text-2xl font-extrabold text-primary-900">Đặt lịch thành công!</h2>
          <p class="mt-2 text-slate-600">Mã lịch hẹn của bạn</p>
          <p class="my-3 text-4xl font-black tracking-wider text-accent">{{ ketQua.ma }}</p>
          <p class="text-sm text-slate-500">Vui lòng lưu lại mã này để tra cứu hoặc huỷ lịch. Chúng tôi sẽ gọi xác nhận trong thời gian sớm nhất.</p>
          <dl class="mt-8 grid gap-3 rounded-2xl bg-slate-50 p-5 text-left text-sm sm:grid-cols-2">
            <div><dt class="text-slate-500">Khách hàng</dt><dd class="font-semibold">{{ ketQua.ho_ten }} · {{ ketQua.dien_thoai }}</dd></div>
            <div><dt class="text-slate-500">Thời gian</dt><dd class="font-semibold">{{ ketQua.gio }} · {{ thuTrongTuan(ketQua.ngay) }}, {{ ngayVN(ketQua.ngay) }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-slate-500">Địa điểm</dt><dd class="font-semibold">{{ khung.ten }} — {{ khung.diaChi }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-slate-500">Dịch vụ</dt><dd class="font-semibold">{{ ketQua.dich_vu.map((x) => x.ten).join(', ') }}</dd></div>
          </dl>
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            <button class="nut-chinh h-11 px-6" @click="datMoi"><i class="fas fa-plus"></i> Đặt lịch khác</button>
            <router-link to="/" class="nut-phu h-11 px-6">Về trang chủ</router-link>
          </div>
        </div>

        <!-- FORM -->
        <form v-else class="grid gap-8 lg:grid-cols-3" @submit.prevent="gui">
          <div class="space-y-6 lg:col-span-2">
            <!-- 1. Ngày giờ -->
            <div class="the p-6">
              <h2 class="mb-4 flex items-center gap-3 text-lg font-bold text-primary-900"><span class="buoc">1</span> Chọn ngày &amp; giờ</h2>
              <div class="mb-4 flex flex-wrap gap-2">
                <button v-for="n in ngayNhanh" :key="n" type="button"
                  class="min-w-[78px] rounded-xl border-2 px-3 py-2 text-center text-sm transition"
                  :class="f.ngay === n ? 'border-primary bg-primary text-white' : 'border-slate-200 hover:border-primary-300'"
                  @click="f.ngay = n">
                  <span class="block text-xs opacity-80">{{ n === ngayNhanh[0] ? 'Hôm nay' : thuTrongTuan(n) }}</span>
                  <span class="font-bold">{{ ngayVN(n).slice(0, 5) }}</span>
                </button>
                <input v-model="f.ngay" type="date" :min="ngayNhanh[0]" :max="ngayToiDa" class="o-nhap w-auto" required />
              </div>
              <p v-if="loiTruong.ngay" class="mb-2 text-sm text-rose-600">{{ loiTruong.ngay }}</p>
              <div v-if="dangTaiGio" class="py-6 text-center text-slate-400"><i class="fas fa-spinner fa-spin"></i> Đang tải khung giờ...</div>
              <div v-else class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                <button v-for="g in gioDs" :key="g.gio" type="button" :disabled="!g.trong"
                  class="rounded-lg border py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 disabled:line-through"
                  :class="f.gio === g.gio ? 'border-accent bg-accent text-white' : 'border-slate-200 hover:border-accent'"
                  :title="g.trong ? `Còn ${g.con_lai} chỗ` : 'Hết chỗ'"
                  @click="f.gio = g.gio">{{ g.gio }}</button>
              </div>
              <p v-if="loiTruong.gio" class="mt-2 text-sm text-rose-600">{{ loiTruong.gio }}</p>
            </div>

            <!-- 2. Dịch vụ -->
            <div class="the p-6">
              <h2 class="mb-4 flex items-center gap-3 text-lg font-bold text-primary-900"><span class="buoc">2</span> Chọn dịch vụ</h2>
              <template v-for="nhom in [{ t: 'Chăm sóc xe', ds: dvChamSoc }, { t: 'Phụ kiện ô tô', ds: dvPhuKien }]" :key="nhom.t">
                <p v-if="nhom.ds.length" class="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-slate-400 first:mt-0">{{ nhom.t }}</p>
                <div class="grid gap-2 sm:grid-cols-2">
                  <button v-for="d in nhom.ds" :key="d.slug" type="button"
                    class="flex items-center gap-3 rounded-xl border-2 p-3 text-left transition"
                    :class="f.dich_vu.includes(d.slug) ? 'border-primary bg-primary-50' : 'border-slate-200 hover:border-primary-300'"
                    @click="batTatDv(d.slug)">
                    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                      :class="f.dich_vu.includes(d.slug) ? 'bg-primary text-white' : 'bg-slate-100 text-primary'">
                      <i class="fas" :class="f.dich_vu.includes(d.slug) ? 'fa-check' : d.bieu_tuong"></i>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate font-semibold text-primary-900">{{ d.ten }}</span>
                      <span class="text-sm text-accent-600">{{ d.gia_tu ? `Từ ${tien(d.gia_tu)}` : 'Liên hệ' }}</span>
                    </span>
                  </button>
                </div>
              </template>
              <p v-if="loiTruong.dich_vu" class="mt-2 text-sm text-rose-600">{{ loiTruong.dich_vu }}</p>
            </div>

            <!-- 3. Thông tin -->
            <div class="the p-6">
              <h2 class="mb-4 flex items-center gap-3 text-lg font-bold text-primary-900"><span class="buoc">3</span> Thông tin của bạn</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                <label><span class="nhan-o">Họ và tên *</span><input v-model="f.ho_ten" class="o-nhap" :class="{ 'border-rose-400': loiTruong.ho_ten }" required maxlength="100" /></label>
                <label><span class="nhan-o">Số điện thoại *</span><input v-model="f.dien_thoai" type="tel" class="o-nhap" :class="{ 'border-rose-400': loiTruong.dien_thoai }" required /></label>
                <label><span class="nhan-o">Email</span><input v-model="f.email" type="email" class="o-nhap" :class="{ 'border-rose-400': loiTruong.email }" /></label>
                <label><span class="nhan-o">Biển số xe</span><input v-model="f.bien_so" class="o-nhap uppercase" placeholder="VD: 51A-123.45" maxlength="20" /></label>
                <label class="sm:col-span-2"><span class="nhan-o">Loại xe</span>
                  <select v-model="f.loai_xe" class="o-nhap"><option v-for="l in tc.loai_xe" :key="l" :value="l">{{ l }}</option></select>
                </label>
                <label class="sm:col-span-2"><span class="nhan-o">Ghi chú</span><textarea v-model="f.ghi_chu" rows="3" class="o-nhap" maxlength="1000" placeholder="Yêu cầu thêm, tình trạng xe..."></textarea></label>
              </div>
              <p v-for="k in ['ho_ten', 'dien_thoai', 'email']" v-show="loiTruong[k]" :key="k" class="mt-2 text-sm text-rose-600">{{ loiTruong[k] }}</p>
            </div>
          </div>

          <!-- TÓM TẮT -->
          <aside class="lg:sticky lg:top-28 lg:self-start">
            <div class="the overflow-hidden">
              <div class="bg-primary p-5 text-white"><h3 class="text-lg font-bold"><i class="far fa-calendar-check"></i> Lịch hẹn của bạn</h3></div>
              <div class="space-y-4 p-5 text-sm">
                <div><p class="text-slate-500">Địa điểm</p><p class="font-semibold">{{ khung.ten }} — {{ khung.diaChi }}</p></div>
                <div><p class="text-slate-500">Thời gian</p><p class="font-semibold">{{ f.gio || '--:--' }} · {{ thuTrongTuan(f.ngay) }}, {{ ngayVN(f.ngay) }}</p></div>
                <div>
                  <p class="text-slate-500">Dịch vụ ({{ dvDaChon.length }})</p>
                  <p v-if="!dvDaChon.length" class="text-slate-400">Chưa chọn</p>
                  <ul v-else class="mt-1 space-y-1">
                    <li v-for="d in dvDaChon" :key="d.slug" class="flex justify-between gap-2"><span>{{ d.ten }}</span><span class="shrink-0 text-slate-500">{{ tien(d.gia_tu) }}</span></li>
                  </ul>
                </div>
                <div class="flex items-end justify-between border-t border-slate-100 pt-4">
                  <span class="text-slate-500">Tạm tính từ</span>
                  <span class="text-2xl font-black text-accent">{{ tien(tamTinh) }}</span>
                </div>
                <button type="submit" class="nut-cam h-12 w-full text-base" :disabled="dangGui">
                  <i class="fas" :class="dangGui ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i> Xác nhận đặt lịch
                </button>
                <p class="text-center text-xs text-slate-500">Cần hỗ trợ? Gọi <a :href="telHref(khung.hotline)" class="font-bold text-primary">{{ khung.hotline }}</a></p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>

    <!-- TRA CỨU -->
    <section class="py-14">
      <div class="khung max-w-3xl">
        <div class="the p-6 md:p-8">
          <h2 class="text-xl font-extrabold text-primary-900"><i class="fas fa-magnifying-glass text-primary"></i> Tra cứu / huỷ lịch hẹn</h2>
          <form class="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" @submit.prevent="traCuu">
            <input v-model="tra.ma" class="o-nhap uppercase" placeholder="Mã lịch hẹn (VD: DL000001)" required />
            <input v-model="tra.dien_thoai" type="tel" class="o-nhap" placeholder="Số điện thoại đã đặt" required />
            <button class="nut-chinh h-11 px-6" :disabled="dangTra"><i class="fas" :class="dangTra ? 'fa-spinner fa-spin' : 'fa-search'"></i> Tra cứu</button>
          </form>
          <div v-if="lichTra" class="mt-6 rounded-2xl border border-slate-200 p-5">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span class="text-lg font-black text-primary-900">{{ lichTra.ma }}</span>
              <span class="nhan" :class="TRANG_THAI_LICH[lichTra.trang_thai]?.mau">{{ TRANG_THAI_LICH[lichTra.trang_thai]?.nhan }}</span>
            </div>
            <dl class="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt class="text-slate-500">Khách hàng</dt><dd class="font-semibold">{{ lichTra.ho_ten }}</dd></div>
              <div><dt class="text-slate-500">Thời gian</dt><dd class="font-semibold">{{ lichTra.gio }} · {{ ngayVN(lichTra.ngay) }}</dd></div>
              <div><dt class="text-slate-500">Địa điểm</dt><dd class="font-semibold">{{ khung.diaChi }}</dd></div>
              <div><dt class="text-slate-500">Dịch vụ</dt><dd class="font-semibold">{{ lichTra.dich_vu.map((x) => x.ten).join(', ') }}</dd></div>
            </dl>
            <button v-if="['cho_xac_nhan', 'da_xac_nhan'].includes(lichTra.trang_thai)" class="nut-phu mt-4 h-10 border-rose-200 px-4 text-rose-600 hover:bg-rose-50" @click="huy">
              <i class="fas fa-xmark"></i> Huỷ lịch hẹn
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.buoc {
  @apply flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm text-white;
}
</style>
