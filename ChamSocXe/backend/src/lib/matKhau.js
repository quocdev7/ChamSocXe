/**
 * matKhau.js — băm mật khẩu bằng scrypt có sẵn trong Node (khỏi kéo thêm bcrypt cần biên dịch).
 * Định dạng lưu: `scrypt$<muối hex>$<băm hex>`.
 */
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const DO_DAI = 64;

export async function bamMatKhau(matKhau) {
  const muoi = randomBytes(16).toString('hex');
  const bam = await scryptAsync(String(matKhau), muoi, DO_DAI);
  return `scrypt$${muoi}$${bam.toString('hex')}`;
}

export async function soMatKhau(matKhau, daLuu) {
  const [loai, muoi, bamHex] = String(daLuu || '').split('$');
  if (loai !== 'scrypt' || !muoi || !bamHex) return false;
  const bam = await scryptAsync(String(matKhau), muoi, DO_DAI);
  const goc = Buffer.from(bamHex, 'hex');
  return goc.length === bam.length && timingSafeEqual(goc, bam);
}
