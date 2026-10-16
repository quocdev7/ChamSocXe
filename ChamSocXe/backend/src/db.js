/**
 * db.js — kết nối Mongo, tên collection và index.
 *
 * Một client duy nhất cho cả app. Mọi nơi lấy collection qua `col(TEN.xxx)` để tên collection chỉ
 * khai đúng một chỗ.
 */
import { MongoClient } from 'mongodb';
import { MONGO } from './config.js';

export const TEN = Object.freeze({
  dichVu: 'dich_vu_col',
  danhGia: 'danh_gia_col',
  tinTuc: 'tin_tuc_col',
  datLich: 'dat_lich_col',
  lienHe: 'lien_he_col',
  quanTriVien: 'quan_tri_vien_col',
  cauHinh: 'cau_hinh_col',
  demSo: 'dem_so_col',
});

const TUY_CHON = {
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
};

/** @type {Promise<MongoClient>|null} */
let hua = null;

function moClient() {
  if (!hua) {
    hua = new MongoClient(MONGO.uri, TUY_CHON).connect().then((c) => {
      console.log(`[db] Đã kết nối Mongo — DB "${MONGO.dbName}"`);
      return c;
    }).catch((e) => {
      // Xoá lời hứa hỏng để lần gọi sau còn thử lại được.
      hua = null;
      throw e;
    });
  }
  return hua;
}

export async function getDb() {
  return (await moClient()).db(MONGO.dbName);
}

export async function col(ten) {
  return (await getDb()).collection(ten);
}

/**
 * Sinh số thứ tự tăng dần (dùng cho mã đặt lịch DL000123) — `findOneAndUpdate` + `$inc` là nguyên
 * tử, hai khách bấm cùng lúc không bao giờ ra trùng mã.
 */
export async function soTiepTheo(khoa) {
  const c = await col(TEN.demSo);
  const kq = await c.findOneAndUpdate(
    { _id: khoa },
    { $inc: { gia_tri: 1 } },
    { upsert: true, returnDocument: 'after' },
  );
  return kq.gia_tri;
}

async function taoIndex() {
  const db = await getDb();
  await Promise.all([
    db.collection(TEN.dichVu).createIndex({ slug: 1 }, { unique: true }),
    db.collection(TEN.dichVu).createIndex({ nhom: 1, thu_tu: 1 }),
    db.collection(TEN.tinTuc).createIndex({ slug: 1 }, { unique: true }),
    db.collection(TEN.tinTuc).createIndex({ ngay_dang: -1 }),
    db.collection(TEN.datLich).createIndex({ ma: 1 }, { unique: true }),
    db.collection(TEN.datLich).createIndex({ ngay: 1, gio: 1 }),
    db.collection(TEN.datLich).createIndex({ trang_thai: 1, tao_luc: -1 }),
    db.collection(TEN.datLich).createIndex({ dien_thoai: 1 }),
    db.collection(TEN.lienHe).createIndex({ tao_luc: -1 }),
    db.collection(TEN.quanTriVien).createIndex({ tai_khoan: 1 }, { unique: true }),
  ]);
}

/** Gọi một lần lúc khởi động: ping + tạo index. */
export async function ketNoiDb() {
  const db = await getDb();
  await db.command({ ping: 1 });
  await taoIndex();
}

export async function dongDb() {
  if (!hua) return;
  const p = hua;
  hua = null;
  try { (await p).close(); } catch { /* đang tắt thì thôi */ }
}
