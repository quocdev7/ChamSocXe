/**
 * server.js — khởi động backend website ChamSocXe.
 *
 *   /api/health        kiểm tra sống (nginx/uptime)
 *   /api/cong-khai/*   website khách xem + form đặt lịch, liên hệ
 *   /api/auth/*        đăng nhập trang quản trị
 *   /api/quan-tri/*    trang quản trị (cần vé)
 *
 * Production: nếu có `../frontend/dist` thì phục vụ luôn website tĩnh từ cùng cổng, khỏi cần
 * máy chủ web riêng.
 */
import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { PORT, CORS_ORIGIN, LA_PRODUCTION, MOI_TRUONG, MONGO, kiemTraCauHinh } from './config.js';
import { ketNoiDb, dongDb } from './db.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { loiCoMa } from './middleware/loiCoMa.js';
import { khoiTaoNeuTrong } from './services/duLieuMau.js';
import congKhaiRoutes from './routes/cong-khai.js';
import quanTriRoutes, { authRouter } from './routes/quan-tri.js';

kiemTraCauHinh();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cors({ origin: CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean) }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, app: 'cham-soc-xe', moi_truong: MOI_TRUONG, db: MONGO.dbName, ts: Date.now() });
});

app.use('/api', globalLimiter);
app.use('/api/cong-khai', congKhaiRoutes);
app.use('/api/auth', authRouter);
app.use('/api/quan-tri', quanTriRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Không có endpoint này', ma_loi: 'khong_co_endpoint' }));

// Website tĩnh đã build (production). Mọi đường dẫn không phải /api trả index.html cho vue-router.
const thuMucWeb = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
if (existsSync(path.join(thuMucWeb, 'index.html'))) {
  app.use(express.static(thuMucWeb, { maxAge: '7d', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(thuMucWeb, 'index.html')));
  console.log(`[server] Phục vụ website tĩnh từ ${thuMucWeb}`);
}

app.use(loiCoMa);

const server = app.listen(PORT, async () => {
  console.log(`[server] ChamSocXe — cổng ${PORT} (${MOI_TRUONG})`);
  if (!LA_PRODUCTION) console.log(`[server] FE dev: ${CORS_ORIGIN}`);
  try {
    await ketNoiDb();
    await khoiTaoNeuTrong();
  } catch (e) {
    // Không tắt máy chủ: Mongo có thể lên sau vài giây. Nhưng phải kêu to, vì mọi trang sẽ trống.
    console.error(`[server] ★ CHƯA KẾT NỐI ĐƯỢC MONGO (${MONGO.uri}):`, e.message);
  }
});

async function tatDep(tinHieu) {
  console.log(`[server] Nhận ${tinHieu}, đang đóng...`);
  server.close(async () => {
    await dongDb();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => tatDep('SIGTERM'));
process.on('SIGINT', () => tatDep('SIGINT'));
