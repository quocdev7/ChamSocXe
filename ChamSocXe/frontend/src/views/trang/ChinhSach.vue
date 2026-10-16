<script setup>
import { computed } from 'vue'
import { useKhungStore } from '@/stores/khungStore.js'
import BannerTrang from '@/components/BannerTrang.vue'

const props = defineProps({ loai: { type: String, required: true } })
const khung = useKhungStore()

const NOI_DUNG = {
  'bao-hanh': {
    tieuDe: 'Chính Sách Bảo Hành',
    muc: [
      ['Phạm vi bảo hành', 'Áp dụng cho các dịch vụ phủ ceramic, dán phim cách nhiệt, dán PPF và phụ kiện lắp đặt tại hệ thống. Thời hạn bảo hành ghi rõ trên phiếu bảo hành của từng dịch vụ.'],
      ['Điều kiện bảo hành', 'Xe được bảo dưỡng định kỳ đúng hẹn; lỗi phát sinh do kỹ thuật thi công hoặc vật liệu; còn phiếu bảo hành hoặc mã lịch hẹn hợp lệ.'],
      ['Không thuộc phạm vi bảo hành', 'Hư hỏng do va chạm, tai nạn, thiên tai; tự ý tháo gỡ hoặc can thiệp bởi bên thứ ba; sử dụng hoá chất không phù hợp.'],
      ['Cách thức yêu cầu', `Liên hệ hotline ${khung.hotline} hoặc mang xe tới cửa hàng. Kỹ thuật viên sẽ kiểm tra và phản hồi trong vòng 24 giờ làm việc.`],
    ],
  },
  'bao-mat': {
    tieuDe: 'Chính Sách Bảo Mật',
    muc: [
      ['Thông tin thu thập', 'Họ tên, số điện thoại, email, biển số và loại xe khi bạn đặt lịch hoặc gửi liên hệ.'],
      ['Mục đích sử dụng', 'Xác nhận lịch hẹn, chăm sóc khách hàng, thông báo bảo hành và ưu đãi (nếu bạn đồng ý).'],
      ['Bảo vệ thông tin', 'Thông tin được lưu trữ an toàn, chỉ nhân viên có thẩm quyền mới được truy cập. Chúng tôi không bán hay chia sẻ thông tin cho bên thứ ba ngoài phạm vi pháp luật yêu cầu.'],
      ['Quyền của khách hàng', 'Bạn có thể yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân bằng cách liên hệ hotline hoặc email.'],
    ],
  },
  'thanh-toan': {
    tieuDe: 'Chính Sách Thanh Toán',
    muc: [
      ['Hình thức thanh toán', 'Tiền mặt, chuyển khoản ngân hàng, quẹt thẻ ATM/Visa/Master và ví điện tử tại quầy.'],
      ['Thời điểm thanh toán', 'Thanh toán sau khi nghiệm thu dịch vụ. Với gói dịch vụ lớn (ceramic, PPF), có thể đặt cọc trước để giữ lịch.'],
      ['Hoá đơn', 'Xuất hoá đơn VAT theo yêu cầu, vui lòng cung cấp thông tin trước khi thanh toán.'],
      ['Hoàn tiền', 'Tiền đặt cọc được hoàn lại 100% nếu bạn huỷ lịch trước 24 giờ.'],
    ],
  },
}

const nd = computed(() => NOI_DUNG[props.loai] || NOI_DUNG['bao-hanh'])
</script>

<template>
  <div>
    <BannerTrang :tieu-de="nd.tieuDe" :duong-dan="[{ nhan: nd.tieuDe }]" />
    <section class="py-14">
      <div class="khung grid gap-8 lg:grid-cols-4">
        <nav class="space-y-1 lg:sticky lg:top-28 lg:self-start">
          <router-link v-for="(v, k) in NOI_DUNG" :key="k" :to="`/chinh-sach/${k}`"
            class="block rounded-lg px-4 py-3 font-semibold transition"
            :class="k === loai ? 'bg-primary text-white' : 'text-slate-600 hover:bg-primary-50'">{{ v.tieuDe }}</router-link>
        </nav>
        <article class="space-y-8 lg:col-span-3">
          <div v-for="(m, i) in nd.muc" :key="i">
            <h2 class="mb-2 text-xl font-bold text-primary-900">{{ i + 1 }}. {{ m[0] }}</h2>
            <p class="leading-relaxed text-slate-600">{{ m[1] }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
