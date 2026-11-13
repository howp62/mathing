import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { one, q } from './db';
import { readToken, signToken } from './security';

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

export async function startAdminSession(adminId: string, version: number) {
  const token = await signToken({ a: adminId, v: version, exp: Date.now() + ADMIN_TTL });
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge: ADMIN_TTL / 1000 });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function currentAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const payload = await readToken<{ a: string; v: number; exp: number }>(token);
  if (!payload || !isUuid(payload.a) || typeof payload.v !== 'number') return null;
  return one<Admin>('select id, name from admins where id = $1 and session_version = $2', [payload.a, payload.v]);
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
