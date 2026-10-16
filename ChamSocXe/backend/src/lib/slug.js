/**
 * slug.js — "Phủ Ceramic Ô Tô" → "phu-ceramic-o-to".
 */
export function taoSlug(chuoi) {
  return String(chuoi ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
