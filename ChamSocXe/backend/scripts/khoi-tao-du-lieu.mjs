/**
 * khoi-tao-du-lieu.mjs — nạp dữ liệu mẫu (dịch vụ, đánh giá, bài viết, cấu hình,
 * tài khoản quản trị đầu tiên) vào MongoDB.
 *
 *   npm run seed        chỉ nạp vào collection đang trống
 *   npm run seed:lai    xoá nội dung mẫu rồi nạp lại (KHÔNG đụng lịch hẹn, liên hệ, tài khoản)
 */
import { ketNoiDb, dongDb } from '../src/db.js';
import { khoiTaoNeuTrong, xoaNoiDung } from '../src/services/duLieuMau.js';
import { MONGO } from '../src/config.js';

const xoa = process.argv.includes('--xoa');

try {
  await ketNoiDb();
  console.log(`[seed] Kết nối ${MONGO.uri} / ${MONGO.dbName}`);
  if (xoa) {
    await xoaNoiDung();
    console.log('[seed] Đã xoá nội dung mẫu cũ');
  }
  await khoiTaoNeuTrong();
  console.log('[seed] Xong');
} catch (e) {
  console.error('[seed] Lỗi:', e.message);
  process.exitCode = 1;
} finally {
  await dongDb();
}
