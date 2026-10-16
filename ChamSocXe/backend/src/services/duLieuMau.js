/**
 * duLieuMau.js — dữ liệu khởi tạo cho DB trống: dịch vụ, đánh giá, bài viết, tài khoản
 * quản trị đầu tiên.
 *
 * `khoiTaoNeuTrong()` chạy mỗi lần server khởi động nhưng CHỈ chèn vào collection đang trống — sửa
 * dữ liệu ở trang quản trị rồi khởi động lại không bị ghi đè.
 * Muốn xoá sạch nạp lại: `npm run seed:lai`.
 *
 * Địa chỉ, hotline, đánh giá ở đây là DỮ LIỆU MẪU — thay bằng thông tin thật ở trang
 * quản trị trước khi đưa website lên mạng.
 */
import { col, getDb, TEN } from '../db.js';
import { ADMIN_MAC_DINH } from '../config.js';
import { bamMatKhau } from '../lib/matKhau.js';
import { homNayVN } from '../lib/kiemTra.js';
import { taoSlug } from '../lib/slug.js';
import { CAU_HINH_MAC_DINH } from './CauHinhService.js';

const ANH = {
  rua: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=70',
  bot: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1200&q=70',
  detail: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=70',
  xe: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70',
  noiThat: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=70',
};

const BANG_GIA = (a, b, c, d) => [
  { loai_xe: 'Sedan / Hatchback 4-5 chỗ', gia: a },
  { loai_xe: 'SUV / Crossover 5-7 chỗ', gia: b },
  { loai_xe: 'MPV / Bán tải', gia: c },
  { loai_xe: 'Xe 7-16 chỗ', gia: d },
];

export const DICH_VU = [
  {
    ten: 'Rửa Xe Ô Tô', slug: 'rua-xe-o-to', nhom: 'cham_soc', bieu_tuong: 'fa-soap', anh: ANH.rua, noi_bat: true,
    mo_ta_ngan: 'Rửa xe cơ bản, cao cấp và bảo dưỡng định kỳ với dung dịch pH trung tính, an toàn cho lớp sơn.',
    noi_dung: 'Rửa xe không chỉ để xe sạch mà còn để bảo vệ lớp sơn lâu dài. Chúng tôi áp dụng phương pháp rửa 2 xô, bọt tuyết (snow foam) làm mềm bụi bẩn trước khi chạm tay, khăn microfiber riêng cho từng khu vực để hạn chế tối đa vết xước xoáy.\n\nGói rửa cao cấp bao gồm làm sạch mâm lốp chuyên sâu, dưỡng lốp, hút bụi nội thất và lau kính trong – ngoài.',
    quy_trinh: ['Kiểm tra tình trạng xe cùng khách', 'Xịt rửa áp lực cao làm trôi bụi bẩn', 'Phủ bọt tuyết pH trung tính', 'Rửa tay phương pháp 2 xô', 'Làm sạch mâm, lốp, hốc bánh', 'Lau khô bằng khăn microfiber & khí nén', 'Hút bụi, lau kính, dưỡng lốp'],
    loi_ich: ['Không gây xước xoáy lớp sơn', 'Dung dịch an toàn, thân thiện môi trường', 'Hoàn thành trong 45–60 phút'],
    thoi_gian_phut: 60, gia_tu: 120000, bang_gia: BANG_GIA(120000, 150000, 180000, 220000), thu_tu: 1,
  },
  {
    ten: 'Vệ Sinh Nội Thất', slug: 've-sinh-noi-that', nhom: 'cham_soc', bieu_tuong: 'fa-couch', anh: ANH.noiThat, noi_bat: true,
    mo_ta_ngan: 'Làm sạch ghế, sàn, taplo, cửa gió; khử mùi, diệt khuẩn bằng hơi nước nóng và Ozone.',
    noi_dung: 'Nội thất là nơi bạn và gia đình tiếp xúc hằng ngày. Vết bẩn, mồ hôi, đồ ăn rơi vãi lâu ngày sinh vi khuẩn và mùi khó chịu.\n\nĐội kỹ thuật tháo rời những chi tiết cần thiết, giặt ghế nỉ bằng máy hút – giặt chuyên dụng, làm sạch và dưỡng da cho ghế da, vệ sinh từng khe cửa gió, cuối cùng khử mùi bằng máy Ozone.',
    quy_trinh: ['Hút bụi toàn bộ khoang xe', 'Giặt / làm sạch ghế, trần, thảm sàn', 'Vệ sinh taplo, cửa gió, tapi cửa', 'Dưỡng da & nhựa nội thất', 'Khử mùi diệt khuẩn bằng Ozone'],
    loi_ich: ['Loại bỏ vi khuẩn, nấm mốc', 'Hết mùi ẩm mốc, mùi thuốc lá', 'Bảo vệ da ghế khỏi nứt nẻ'],
    thoi_gian_phut: 240, gia_tu: 900000, bang_gia: BANG_GIA(900000, 1100000, 1300000, 1600000), thu_tu: 2,
  },
  {
    ten: 'Vệ Sinh Khoang Máy', slug: 've-sinh-khoang-may', nhom: 'cham_soc', bieu_tuong: 'fa-gears', anh: ANH.detail,
    mo_ta_ngan: 'Làm sạch bụi bẩn, dầu mỡ trong khoang động cơ, phủ dưỡng chống lão hoá cao su và nhựa.',
    noi_dung: 'Khoang máy sạch giúp kỹ thuật viên phát hiện sớm rò rỉ dầu, nước làm mát và giúp động cơ tản nhiệt tốt hơn. Chúng tôi che chắn kỹ các bộ phận điện tử trước khi làm sạch bằng dung dịch chuyên dụng và hơi nước.',
    quy_trinh: ['Che chắn hộp ECU, cầu chì, cổ hút gió', 'Phun dung dịch tẩy dầu mỡ', 'Chải và làm sạch bằng hơi nước', 'Thổi khô bằng khí nén', 'Phủ dưỡng nhựa, cao su'],
    loi_ich: ['Động cơ tản nhiệt tốt hơn', 'Dễ phát hiện rò rỉ', 'Chống lão hoá gioăng, ống cao su'],
    thoi_gian_phut: 90, gia_tu: 400000, bang_gia: BANG_GIA(400000, 500000, 550000, 650000), thu_tu: 3,
  },
  {
    ten: 'Vệ Sinh Dàn Lạnh', slug: 've-sinh-dan-lanh', nhom: 'cham_soc', bieu_tuong: 'fa-snowflake', anh: ANH.noiThat,
    mo_ta_ngan: 'Nội soi, vệ sinh dàn lạnh không tháo taplo; khử mùi, khử khuẩn hệ thống điều hoà.',
    noi_dung: 'Sau 1–2 năm sử dụng, dàn lạnh bám bụi và nấm mốc khiến điều hoà kém mát, có mùi hôi. Với camera nội soi và dung dịch chuyên dụng, chúng tôi làm sạch dàn lạnh mà không cần tháo taplo, kèm thay lọc gió cabin nếu cần.',
    quy_trinh: ['Nội soi kiểm tra dàn lạnh', 'Phun bọt làm sạch qua đường ống', 'Hút xả chất bẩn qua đường thoát nước', 'Khử khuẩn & khử mùi', 'Kiểm tra lại nhiệt độ cửa gió'],
    loi_ich: ['Điều hoà mát sâu hơn', 'Không còn mùi hôi khi bật lạnh', 'Không tháo taplo, không ảnh hưởng zin xe'],
    thoi_gian_phut: 90, gia_tu: 600000, bang_gia: BANG_GIA(600000, 700000, 800000, 1000000), thu_tu: 4,
  },
  {
    ten: 'Đánh Bóng Xe Ô Tô', slug: 'danh-bong-xe-o-to', nhom: 'cham_soc', bieu_tuong: 'fa-wand-magic-sparkles', anh: ANH.xe, noi_bat: true,
    mo_ta_ngan: 'Xoá xước nhẹ, xước xoáy, phục hồi độ bóng và chiều sâu cho lớp sơn.',
    noi_dung: 'Đánh bóng 3 bước (cắt – xoá xoáy – bóng) với máy đánh bóng lệch tâm và xi chuyên dụng, đo độ dày sơn trước khi làm để đảm bảo an toàn cho lớp sơn zin.',
    quy_trinh: ['Rửa xe & tẩy bụi sắt, nhựa đường', 'Đất sét (clay bar) làm sạch bề mặt', 'Đo độ dày sơn', 'Đánh bóng 3 bước', 'Phủ wax bảo vệ'],
    loi_ich: ['Xoá 70–90% xước nhẹ', 'Sơn bóng sâu như mới', 'Chuẩn bị bề mặt tốt cho phủ ceramic'],
    thoi_gian_phut: 300, gia_tu: 1500000, bang_gia: BANG_GIA(1500000, 1800000, 2000000, 2500000), thu_tu: 5,
  },
  {
    ten: 'Phủ Ceramic Ô Tô', slug: 'phu-ceramic-o-to', nhom: 'cham_soc', bieu_tuong: 'fa-shield-halved', anh: ANH.bot, noi_bat: true,
    mo_ta_ngan: 'Lớp phủ gốm bảo vệ sơn tới 3 năm: tăng độ bóng, chống bám bẩn, chống tia UV.',
    noi_dung: 'Ceramic (gốm Nano SiO2) liên kết với lớp sơn tạo màng cứng trong suốt, kỵ nước mạnh, giúp xe luôn bóng và dễ vệ sinh. Gói phủ đã bao gồm đánh bóng hiệu chỉnh sơn và bảo hành định kỳ.',
    quy_trinh: ['Rửa & tẩy bụi sắt, clay bar', 'Đánh bóng hiệu chỉnh sơn', 'Lau IPA làm sạch dầu', 'Phủ ceramic 1–3 lớp', 'Sấy hồng ngoại & bàn giao'],
    loi_ich: ['Bảo vệ sơn 1–3 năm', 'Hiệu ứng lá sen, ít bám bụi', 'Chống tia UV, phai màu sơn'],
    thoi_gian_phut: 600, gia_tu: 5000000, bang_gia: BANG_GIA(5000000, 6000000, 6500000, 8000000), thu_tu: 6,
  },
  {
    ten: 'Sơn Phủ Gầm Ô Tô', slug: 'son-phu-gam-o-to', nhom: 'cham_soc', bieu_tuong: 'fa-car-burst', anh: ANH.detail,
    mo_ta_ngan: 'Chống rỉ sét, giảm ồn, hạn chế đá văng cho gầm xe — đặc biệt cần với xe hay đi đường ngập.',
    noi_dung: 'Lớp phủ gầm gốc cao su non / polyurethane bám chắc, đàn hồi, chống nước mặn và hoá chất trên đường, giảm tiếng ồn vọng lên cabin.',
    quy_trinh: ['Nâng xe, tháo bánh & ốp hốc bánh', 'Rửa gầm áp lực cao, sấy khô', 'Che chắn ống xả, phanh, cảm biến', 'Phun 2 lớp phủ gầm', 'Lắp lại & kiểm tra'],
    loi_ich: ['Chống rỉ sét khung gầm', 'Giảm ồn mặt đường', 'Bảo vệ khỏi đá văng'],
    thoi_gian_phut: 240, gia_tu: 2500000, bang_gia: BANG_GIA(2500000, 3000000, 3500000, 4000000), thu_tu: 7,
  },
  {
    ten: 'Đánh Bóng Kính Ô Tô', slug: 'danh-bong-kinh-o-to', nhom: 'cham_soc', bieu_tuong: 'fa-eye', anh: ANH.rua,
    mo_ta_ngan: 'Tẩy ố mốc, cặn canxi, xước nhẹ trên kính; phủ nano chống bám nước cho tầm nhìn rõ khi mưa.',
    noi_dung: 'Kính ố mốc gây chói khi đi đêm và mưa. Chúng tôi tẩy cặn bằng dung dịch chuyên dụng, đánh bóng kính bằng bột cerium và phủ nano kỵ nước.',
    quy_trinh: ['Rửa sạch kính', 'Tẩy ố, cặn canxi', 'Đánh bóng bằng bột cerium', 'Phủ nano chống bám nước'],
    loi_ich: ['Tầm nhìn trong suốt', 'Nước mưa tự trôi', 'Giảm chói đèn ban đêm'],
    thoi_gian_phut: 120, gia_tu: 500000, bang_gia: BANG_GIA(500000, 600000, 700000, 800000), thu_tu: 8,
  },
  // ── Phụ kiện ô tô ──
  { ten: 'Phim Cách Nhiệt', slug: 'phim-cach-nhiet', nhom: 'phu_kien', bieu_tuong: 'fa-sun', mo_ta_ngan: 'Cản nhiệt, chống tia UV tới 99%, bảo vệ sự riêng tư — bảo hành chính hãng.', gia_tu: 3500000, thu_tu: 11 },
  { ten: 'Camera Hành Trình', slug: 'camera-hanh-trinh', nhom: 'phu_kien', bieu_tuong: 'fa-video', mo_ta_ngan: 'Ghi hình trước – sau sắc nét, cảnh báo va chạm, xem lại qua điện thoại.', gia_tu: 1800000, thu_tu: 12 },
  { ten: 'Camera 360 Độ', slug: 'camera-360-do', nhom: 'phu_kien', bieu_tuong: 'fa-camera-rotate', mo_ta_ngan: 'Quan sát toàn cảnh quanh xe, đỗ xe trong ngõ hẹp dễ dàng.', gia_tu: 7500000, thu_tu: 13 },
  { ten: 'Màn Hình Android', slug: 'man-hinh-android', nhom: 'phu_kien', bieu_tuong: 'fa-tablet-screen-button', mo_ta_ngan: 'Màn hình lớn, dẫn đường, giải trí, kết nối Apple CarPlay / Android Auto.', gia_tu: 5500000, thu_tu: 14 },
  { ten: 'Cảm Biến Áp Suất Lốp', slug: 'cam-bien-ap-suat-lop', nhom: 'phu_kien', bieu_tuong: 'fa-gauge-high', mo_ta_ngan: 'Theo dõi áp suất, nhiệt độ lốp theo thời gian thực, cảnh báo xì lốp.', gia_tu: 1500000, thu_tu: 15 },
  { ten: 'Cách Âm Chống Ồn', slug: 'cach-am-chong-on', nhom: 'phu_kien', bieu_tuong: 'fa-volume-xmark', mo_ta_ngan: 'Giảm tiếng ồn từ lốp, gầm và gió, cabin yên tĩnh hơn.', gia_tu: 6000000, thu_tu: 16 },
  { ten: 'Đèn LED Nội Thất', slug: 'den-led-noi-that', nhom: 'phu_kien', bieu_tuong: 'fa-lightbulb', mo_ta_ngan: 'Đèn viền nội thất đổi màu, tạo không gian sang trọng.', gia_tu: 2500000, thu_tu: 17 },
  { ten: 'Đèn Tăng Sáng', slug: 'den-tang-sang', nhom: 'phu_kien', bieu_tuong: 'fa-car-on', mo_ta_ngan: 'Nâng cấp bi LED / bi-laser, tăng tầm chiếu sáng, an toàn khi đi đêm.', gia_tu: 4500000, thu_tu: 18 },
];

export const DANH_GIA = [
  { ten_khach: 'Anh Minh', khu_vuc: 'Cam Nghĩa', dich_vu: 'Rửa Xe Ô Tô', noi_dung: 'Xe rửa rất kỹ, nhân viên lau từng khe cửa. Đặt lịch online đến là làm ngay, không phải chờ.' },
  { ten_khach: 'Chị Lan', khu_vuc: 'Cam Lợi', dich_vu: 'Vệ Sinh Nội Thất', noi_dung: 'Ghế nỉ bị đổ sữa của bé lâu ngày, làm xong sạch mùi hoàn toàn. Tư vấn rõ ràng, báo giá trước khi làm.' },
  { ten_khach: 'Anh Tuấn', khu_vuc: 'Ba Ngòi', dich_vu: 'Phủ Ceramic Ô Tô', noi_dung: 'Phủ ceramic được 6 tháng, xe vẫn bóng, rửa rất nhanh sạch. Có nhắc lịch bảo dưỡng định kỳ.' },
  { ten_khach: 'Chị Hà', khu_vuc: 'Cam Phúc Bắc', dich_vu: 'Vệ Sinh Dàn Lạnh', noi_dung: 'Điều hoà mát hẳn, hết mùi hôi. Làm đúng giờ hẹn, khu chờ sạch sẽ có wifi và nước uống.' },
  { ten_khach: 'Anh Khoa', khu_vuc: 'Cam Đức', dich_vu: 'Đánh Bóng Xe Ô Tô', noi_dung: 'Xe cũ 7 năm đánh bóng xong nhìn như mới, các vết xước xoáy gần như biến mất.' },
  { ten_khach: 'Anh Phúc', khu_vuc: 'Cam Thuận', dich_vu: 'Sơn Phủ Gầm Ô Tô', noi_dung: 'Phủ gầm xong đi đường ngập yên tâm hơn, cabin cũng êm hơn rõ rệt. Giá hợp lý.' },
].map((d, i) => ({ ...d, so_sao: 5, thu_tu: i + 1 }));

export const TIN_TUC = [
  {
    tieu_de: 'Bao lâu nên rửa xe ô tô một lần?', chuyen_muc: 'Kiến thức', anh: ANH.rua,
    tom_tat: 'Tần suất rửa xe hợp lý phụ thuộc vào thời tiết, môi trường di chuyển và nơi đỗ xe. Cùng tìm hiểu để bảo vệ lớp sơn tốt nhất.',
    noi_dung: 'Với điều kiện đi lại trong đô thị, trung bình 1–2 tuần nên rửa xe một lần. Mùa mưa hoặc khi xe đi qua đường ngập, công trình, nên rửa ngay để tránh bùn đất, nước bẩn bám lâu gây ăn mòn.\n\nPhân chim, nhựa cây, xác côn trùng có tính axit — cần làm sạch càng sớm càng tốt vì chỉ sau vài ngày dưới nắng chúng có thể làm loang lổ lớp sơn bóng.\n\nNếu xe đã phủ ceramic, bạn vẫn cần rửa định kỳ nhưng thao tác nhẹ nhàng và nhanh hơn rất nhiều.',
  },
  {
    tieu_de: 'Phủ ceramic có thực sự cần thiết?', chuyen_muc: 'Kiến thức', anh: ANH.bot,
    tom_tat: 'Ceramic giúp xe bóng đẹp và dễ vệ sinh, nhưng không phải xe nào cũng cần. Đây là những điều bạn nên biết trước khi quyết định.',
    noi_dung: 'Ceramic là lớp phủ gốc SiO2 tạo màng bảo vệ cứng trên bề mặt sơn. Ưu điểm lớn nhất là kỵ nước, chống bám bẩn, giữ màu sơn trước tia UV.\n\nTuy nhiên ceramic không chống được va quẹt hay đá văng mạnh — nếu cần, bạn nên cân nhắc dán PPF. Trước khi phủ, xe cần được đánh bóng hiệu chỉnh sơn; nếu bỏ qua bước này, ceramic sẽ "khoá" luôn các vết xước bên dưới.',
  },
  {
    tieu_de: '5 dấu hiệu xe cần vệ sinh dàn lạnh ngay', chuyen_muc: 'Kinh nghiệm', anh: ANH.noiThat,
    tom_tat: 'Điều hoà kém mát, có mùi hôi, gió yếu… là những dấu hiệu dàn lạnh đã bám bẩn. Đừng để lâu ảnh hưởng tới sức khoẻ cả nhà.',
    noi_dung: '1. Điều hoà lâu mát dù đã bật mức lạnh sâu.\n2. Có mùi ẩm mốc, mùi chua khi mới bật.\n3. Gió ra yếu dù quạt ở mức cao.\n4. Kính hay bị mờ hơi nước.\n5. Người ngồi trong xe hay hắt hơi, khó chịu mũi.\n\nKhuyến nghị vệ sinh dàn lạnh 12–18 tháng một lần, đồng thời thay lọc gió cabin mỗi 10.000 km.',
  },
  {
    tieu_de: 'Chăm sóc xe mùa mưa: những điều cần nhớ', chuyen_muc: 'Kinh nghiệm', anh: ANH.xe,
    tom_tat: 'Mùa mưa là thời điểm xe dễ xuống cấp nhất: gầm rỉ sét, nội thất ẩm mốc, kính mờ. Một vài thói quen nhỏ giúp xe bền hơn.',
    noi_dung: 'Sau khi đi qua đường ngập, hãy rửa gầm xe sớm nhất có thể. Kiểm tra thảm sàn, phơi khô nếu bị ướt để tránh mùi mốc. Thay gạt mưa khi gạt để lại vệt, và phủ nano kính để tăng tầm nhìn.\n\nVới xe hay đi vùng ngập, sơn phủ gầm là khoản đầu tư rất đáng giá.',
  },
  {
    tieu_de: 'Quy trình rửa xe 2 xô là gì?', chuyen_muc: 'Kiến thức', anh: ANH.detail,
    tom_tat: 'Phương pháp rửa xe 2 xô giúp hạn chế gần như hoàn toàn xước xoáy — tiêu chuẩn tại mọi trung tâm detailing chuyên nghiệp.',
    noi_dung: 'Một xô chứa dung dịch rửa, một xô nước sạch có lưới lọc cát ở đáy. Sau mỗi lần lau một mảng, găng rửa được giũ trong xô nước sạch để cát bụi lắng xuống, rồi mới nhúng lại vào xô dung dịch.\n\nNhờ vậy hạt cát không quay trở lại bề mặt sơn — nguyên nhân chính gây ra các vết xước xoáy hình mạng nhện.',
  },
  {
    tieu_de: 'Ra mắt tính năng đặt lịch online', chuyen_muc: 'Tin tức', anh: ANH.rua,
    tom_tat: 'Giờ đây bạn có thể đặt lịch rửa xe, chăm sóc xe trực tuyến 24/7, chọn khung giờ phù hợp — đến nơi là làm ngay.',
    noi_dung: 'Chỉ với vài thao tác trên website, bạn chọn dịch vụ và khung giờ còn trống. Hệ thống gửi mã đặt lịch để bạn tra cứu hoặc huỷ khi cần.\n\nNhân viên sẽ gọi xác nhận trong vòng 15 phút trong giờ làm việc.',
  },
];


async function chenNeuTrong(ten, ds) {
  const c = await col(ten);
  if (await c.estimatedDocumentCount() > 0) return 0;
  const bayGio = new Date();
  await c.insertMany(ds.map((d) => ({ hien_thi: true, tao_luc: bayGio, sua_luc: bayGio, ...d })));
  return ds.length;
}

export async function khoiTaoNeuTrong() {
  const tin = TIN_TUC.map((t, i) => ({ ...t, slug: taoSlug(t.tieu_de), nguon: '', lien_ket_nguon: '', ngay_dang: homNayVN(-i * 9) }));
  const dv = DICH_VU.map((d) => ({
    noi_dung: '', quy_trinh: [], loi_ich: [], anh: '', thoi_gian_phut: 0, bang_gia: [], noi_bat: false, ...d,
  }));

  const kq = {
    dich_vu: await chenNeuTrong(TEN.dichVu, dv),
    danh_gia: await chenNeuTrong(TEN.danhGia, DANH_GIA),
    tin_tuc: await chenNeuTrong(TEN.tinTuc, tin),
  };

  const cauHinh = await col(TEN.cauHinh);
  if (!(await cauHinh.findOne({ _id: 'website' }))) {
    await cauHinh.insertOne({ _id: 'website', ...CAU_HINH_MAC_DINH });
    kq.cau_hinh = 1;
  }

  const qtv = await col(TEN.quanTriVien);
  if (ADMIN_MAC_DINH.matKhau && (await qtv.estimatedDocumentCount()) === 0) {
    await qtv.insertOne({
      tai_khoan: ADMIN_MAC_DINH.taiKhoan.toLowerCase(),
      ten: 'Quản trị viên',
      mat_khau: await bamMatKhau(ADMIN_MAC_DINH.matKhau),
      tao_luc: new Date(),
    });
    kq.quan_tri_vien = ADMIN_MAC_DINH.taiKhoan;
  }

  const coChen = Object.values(kq).some(Boolean);
  if (coChen) console.log('[du-lieu-mau] Đã khởi tạo:', kq);
  return kq;
}

/** Xoá sạch dữ liệu nội dung (KHÔNG xoá lịch hẹn, liên hệ, tài khoản quản trị). */
export async function xoaNoiDung() {
  const db = await getDb();
  await Promise.all([TEN.dichVu, TEN.danhGia, TEN.tinTuc, TEN.cauHinh].map((t) => db.collection(t).deleteMany({})));
}
