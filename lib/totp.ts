import crypto from 'node:crypto';

/**
 * 인증 앱(구글 OTP, 아이폰 '암호' 앱 등)의 6자리 코드. RFC 6238(TOTP: 30초, 6자리, SHA-1).
 * 데이터베이스·화면과 떨어진 순수 함수라 `node lib/totp.ts`로 공식 시험값을 확인할 수 있다.
 */
const STEP_SECONDS = 30;
const DIGITS = 6;
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

/** 새 비밀값(160비트, base32) */
export function newTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

/** RFC 4226 HOTP: 비밀값과 칸 번호로 6자리를 만든다 */
export function hotp(key: Buffer, counter: number, digits = DIGITS): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const bin = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}

export const stepAt = (nowMs: number) => Math.floor(nowMs / 1000 / STEP_SECONDS);

/**
 * 맞으면 그 코드의 칸 번호, 틀리면 null.
 * 휴대폰 시계가 조금 어긋나도 되도록 앞뒤 한 칸(±30초)까지 받는다.
 * lastStep 이하의 칸은 이미 쓴 코드라 받지 않는다(같은 코드를 엿보고 다시 쓰는 것을 막음).
 */
export function verifyTotp(secret: string, code: string, nowMs: number, lastStep: number): number | null {
  const clean = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return null;
  const key = base32Decode(secret);
  const now = stepAt(nowMs);
  for (const step of [now - 1, now, now + 1]) {
    if (step <= lastStep) continue;
    const expected = hotp(key, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) return step;
  }
  return null;
}

/** 인증 앱에 등록하는 주소(QR 안에 들어간다) */
export function otpauthUri(account: string, secret: string, issuer = 'mathing'): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

// `node lib/totp.ts`로 실행하면 RFC 4226·6238의 공식 시험값으로 확인한다.
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('totp.ts')) {
  const key = Buffer.from('12345678901234567890', 'ascii');
  let fail = 0;
  const check = (name: string, got: unknown, want: unknown) => {
    const ok = got === want;
    if (!ok) fail++;
    console.log(ok ? '통과' : '실패', name, '→', got);
  };
  // RFC 4226 부록 D: 칸 0~9
  ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489']
    .forEach((want, i) => check(`HOTP 칸 ${i}`, hotp(key, i), want));
  // RFC 6238 부록 B(SHA-1, 8자리 값의 끝 6자리)
  ([[59, '287082'], [1111111109, '081804'], [1111111111, '050471'], [1234567890, '005924'], [2000000000, '279037'], [20000000000, '353130']] as const)
    .forEach(([t, want]) => check(`TOTP ${t}초`, hotp(key, stepAt(t * 1000)), want));
  const secret = base32Encode(key);
  check('base32 왕복', base32Decode(secret).equals(key), true);
  check('지금 코드 통과', verifyTotp(secret, '287082', 59_000, 0), 1);
  check('30초 늦은 코드도 통과', verifyTotp(secret, '287082', 89_000, 0), 1);
  check('60초 지난 코드는 거부', verifyTotp(secret, '287082', 119_000, 0), null);
  check('이미 쓴 코드는 거부', verifyTotp(secret, '287082', 59_000, 1), null);
  check('틀린 코드는 거부', verifyTotp(secret, '123456', 59_000, 0), null);
  check('숫자가 아니면 거부', verifyTotp(secret, '28708a', 59_000, 0), null);
  check('새 비밀값은 32글자', newTotpSecret().length, 32);
  if (fail) process.exitCode = 1;
}
