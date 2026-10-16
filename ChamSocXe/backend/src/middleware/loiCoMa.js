/**
 * loiCoMa.js — lưới bắt lỗi cuối cùng: đổi mọi lỗi thành JSON `{ error, ma_loi, truong? }`.
 *
 * Lỗi Mongo tạm thời (mất kết nối, chưa chọn được server) → 503 để FE biết là "thử lại sau",
 * không phải lỗi dữ liệu.
 */
function laLoiDbTamThoi(err) {
  const name = String(err?.name || '');
  return /^Mongo(ServerSelection|Network|PoolCleared|NotPrimary|Topology)/.test(name);
}

// eslint-disable-next-line no-unused-vars
export function loiCoMa(err, _req, res, _next) {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Dữ liệu gửi lên không phải JSON hợp lệ', ma_loi: 'json_hong' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Dữ liệu gửi lên quá lớn', ma_loi: 'qua_lon' });
  }
  // Trùng khoá duy nhất (slug, tài khoản…) — nói rõ trường nào để form tô đỏ.
  if (err?.code === 11000) {
    const truong = Object.keys(err.keyPattern || err.keyValue || {})[0] || '';
    return res.status(409).json({ error: `Giá trị "${truong}" đã tồn tại, hãy chọn giá trị khác`, ma_loi: 'trung', truong });
  }

  let status = err?.status || 500;
  if (!err?.status && laLoiDbTamThoi(err)) status = 503;
  if (status >= 500) console.error('[loi]', err?.stack || err);

  res.status(status).json({
    error: status === 503
      ? 'Máy chủ dữ liệu tạm thời chưa sẵn sàng, vui lòng thử lại sau ít phút'
      : (status >= 500 ? 'Đã có lỗi xảy ra, vui lòng thử lại' : err.message),
    ma_loi: err?.ma_loi || (status >= 500 ? 'loi_may_chu' : 'loi'),
    ...(err?.truong ? { truong: err.truong } : {}),
  });
}
