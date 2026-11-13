import 'server-only';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { one, q } from './db';

const scrypt = promisify(crypto.scrypt) as (pw: crypto.BinaryLike, salt: crypto.BinaryLike, len: number, opts: crypto.ScryptOptions) => Promise<Buffer>;

/* ---------- 비밀번호: 되돌릴 수 없게 섞어서(해시) 저장 ---------- */
const N = 16384, R = 8, P = 1, LEN = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, LEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const [algo, n, r, p, saltB64, hashB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64url'), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

/* ---------- 서버 비밀값: 세션 서명과 인터넷 주소 섞기에 씀 ---------- */
type Holder = { __mathingSecret?: Promise<string> };
const g = globalThis as unknown as Holder;

export function getServerSecret(): Promise<string> {
  const fromEnv = process.env.SESSION_SECRET;
  if (fromEnv && fromEnv.length >= 32) return Promise.resolve(fromEnv);
  if (!g.__mathingSecret) {
    g.__mathingSecret = (async () => {
      const row = await one<{ value: string }>(`select value from app_settings where key = 'server_secret'`);
      if (row) return row.value;
      const fresh = crypto.randomBytes(48).toString('base64url');
      await q(`insert into app_settings (key, value) values ('server_secret', $1) on conflict (key) do nothing`, [fresh]);
      const again = await one<{ value: string }>(`select value from app_settings where key = 'server_secret'`);
      return again!.value;
    })();
  }
  return g.__mathingSecret;
}

/* ---------- 서명한 값 (쿠키용) ---------- */
export async function signToken(payload: object): Promise<string> {
  const secret = await getServerSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export async function readToken<T extends { exp: number }>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const secret = await getServerSecret();
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

/* ---------- 비교와 섞기 ---------- */
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** 인터넷 주소처럼 그대로 두면 안 되는 값을 서버 비밀값으로 섞어 짧은 표시로 바꾼다 */
export async function keyedHash(value: string): Promise<string> {
  return crypto.createHmac('sha256', await getServerSecret()).update(value).digest('base64url').slice(0, 32);
}

/* ---------- 복구 코드: 헷갈리는 글자(0/O, 1/I/L)는 뺀다 ---------- */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function makeRecoveryCode(): string {
  const bytes = crypto.randomBytes(12);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}
export function normalizeRecoveryCode(input: string): string {
  const c = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 12 ? `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8, 12)}` : '';
}
