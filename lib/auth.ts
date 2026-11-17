import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { one, q } from './db';
import { openText, readToken, sealText, signToken } from './security';

const USER_COOKIE = 'm_u';
const ADMIN_COOKIE = 'm_a';
const USER_TTL = 30 * 24 * 60 * 60 * 1000;
const ADMIN_TTL = 12 * 60 * 60 * 1000;
const secure = process.env.NODE_ENV === 'production';

export type User = {
  id: string;
  nickname: string;
  interests: string[];
  career: string;
  career_unknown: boolean;
};
export type Admin = { id: string; name: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);

/* ---------- 학생 ---------- */

export async function startUserSession(userId: string, version: number) {
  const token = await signToken({ u: userId, v: version, exp: Date.now() + USER_TTL });
  (await cookies()).set(USER_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: USER_TTL / 1000 });
}

export async function endUserSession() {
  (await cookies()).delete(USER_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  const payload = await readToken<{ u: string; v: number; exp: number }>(token);
  if (!payload || !isUuid(payload.u) || typeof payload.v !== 'number') return null;
  // 비밀번호를 바꾸거나 로그아웃·계정 막힘이 되면 예전 로그인은 통하지 않는다
  return one<User>(
    'select id, nickname, interests, career, career_unknown from users where id = $1 and session_version = $2 and not blocked',
    [payload.u, payload.v],
  );
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

/* ---------- 운영자 ---------- */

export async function hasAdmin(): Promise<boolean> {
  const row = await one<{ n: number }>('select count(*)::int as n from admins');
  return (row?.n ?? 0) > 0;
}

/** 비밀번호와 2단계 코드를 모두 통과했을 때만 부른다. m: 2단계를 통과했다는 표시 */
export async function startAdminSession(adminId: string, version: number) {
  const token = await signToken({ a: adminId, v: version, m: 1, exp: Date.now() + ADMIN_TTL });
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge: ADMIN_TTL / 1000 });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** 2단계 표시가 없는 예전 세션이나 2단계가 꺼진 계정은 운영자로 인정하지 않는다 */
export async function currentAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const payload = await readToken<{ a: string; v: number; m?: number; exp: number }>(token);
  if (!payload || !isUuid(payload.a) || typeof payload.v !== 'number' || payload.m !== 1) return null;
  return one<Admin>('select id, name from admins where id = $1 and session_version = $2 and totp_on', [payload.a, payload.v]);
}

/* ---------- 운영자 2단계: 비밀번호 다음 10분 동안만 쓰는 '대기' 표 ---------- */

const ADMIN_PENDING_COOKIE = 'm_ap';
const PENDING_TTL = 10 * 60 * 1000;
export type PendingStage = 'setup' | 'code';
export type AdminPending = {
  id: string; name: string; stage: PendingStage; session_version: number;
  totp_secret: string | null; last_step: number;
};

/** 비밀번호가 맞았을 때. setup = 인증 앱을 처음 연결, code = 6자리(또는 예비 코드) 입력 */
export async function startAdminPending(adminId: string, version: number, stage: PendingStage) {
  const token = await signToken({ p: adminId, v: version, s: stage, exp: Date.now() + PENDING_TTL });
  (await cookies()).set(ADMIN_PENDING_COOKIE, token, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge: PENDING_TTL / 1000 });
}

export async function endAdminPending() {
  (await cookies()).delete(ADMIN_PENDING_COOKIE);
}

/** 대기 표가 유효하고, 그 사이 계정 상태(세션 버전, 2단계 켜짐)가 바뀌지 않았을 때만 */
export async function currentAdminPending(): Promise<AdminPending | null> {
  const token = (await cookies()).get(ADMIN_PENDING_COOKIE)?.value;
  const payload = await readToken<{ p: string; v: number; s: string; exp: number }>(token);
  if (!payload || !isUuid(payload.p) || typeof payload.v !== 'number' || (payload.s !== 'setup' && payload.s !== 'code')) return null;
  const row = await one<{ id: string; name: string; session_version: number; totp_on: boolean; totp_secret: string | null; last_step: number }>(
    'select id, name, session_version, totp_on, totp_secret, totp_last_step::float8 as last_step from admins where id = $1 and session_version = $2',
    [payload.p, payload.v],
  );
  if (!row || row.totp_on !== (payload.s === 'code')) return null;
  return { id: row.id, name: row.name, stage: payload.s, session_version: row.session_version, totp_secret: row.totp_secret, last_step: row.last_step };
}

/* ---------- 새 예비 코드를 한 번 보여 주기: 암호화해 10분만 두고, 그 운영자만 열 수 있다 ---------- */

const ADMIN_BACKUP_COOKIE = 'm_ab';

export async function revealBackupCodes(adminId: string, codes: string[]) {
  const sealed = await sealText(JSON.stringify({ a: adminId, c: codes, exp: Date.now() + PENDING_TTL }));
  (await cookies()).set(ADMIN_BACKUP_COOKIE, sealed, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge: PENDING_TTL / 1000 });
}

export async function readBackupCodes(adminId: string): Promise<string[] | null> {
  const plain = await openText((await cookies()).get(ADMIN_BACKUP_COOKIE)?.value);
  if (!plain) return null;
  try {
    const v = JSON.parse(plain) as { a: string; c: string[]; exp: number };
    return v.a === adminId && v.exp > Date.now() && Array.isArray(v.c) ? v.c : null;
  } catch {
    return null;
  }
}

export async function clearBackupCodes() {
  (await cookies()).delete(ADMIN_BACKUP_COOKIE);
}

/* ---------- 로그인 잠금 ---------- */

/**
 * 시도 한 번을 먼저 기록하고 나서 비밀번호를 확인한다.
 * 동시에 여러 번 보내도 기록되는 시도는 5번까지이고, 5번째에 잠긴다.
 * 잠겨 있으면 false.
 */
export async function reserveAttempt(table: 'users' | 'admins', id: string, minutes: number): Promise<boolean> {
  const row = await one(
    `update ${table} set
       failed_attempts = case when locked_until is not null then 1 else failed_attempts + 1 end,
       locked_until = case when (case when locked_until is not null then 1 else failed_attempts + 1 end) >= 5
                           then now() + make_interval(mins => $2::int) else null end
     where id = $1 and (locked_until is null or locked_until <= now()) returning id`,
    [id, minutes],
  );
  return !!row;
}

export async function clearAttempts(table: 'users' | 'admins', id: string) {
  await q(`update ${table} set failed_attempts = 0, locked_until = null where id = $1`, [id]);
}
