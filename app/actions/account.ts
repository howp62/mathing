'use server';

import { redirect } from 'next/navigation';
import { one, q } from '@/lib/db';
import { checkText } from '@/lib/filter';
import { allow, clientIp, purgeInactive } from '@/lib/rate';
import { hashPassword, makeRecoveryCode, normalizeRecoveryCode, verifyPassword } from '@/lib/security';
import { clearAttempts, currentUser, endUserSession, requireUser, reserveAttempt, startUserSession } from '@/lib/auth';
import { INTERESTS, LOGINS_PER_IP_10MIN, SIGNUPS_PER_HOUR } from '@/lib/constants';

export type FormState = { error?: string; ok?: string; code?: string } | undefined;

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

function nicknameProblem(nick: string): string | null {
  if (nick.length < 2 || nick.length > 12) return '별명은 2~12자로 써 줘.';
  if (!/^[0-9A-Za-z가-힣_]+$/.test(nick)) return '별명은 한글, 영문, 숫자, 밑줄(_)만 쓸 수 있어.';
  if (checkText(nick)) return '별명에 쓸 수 없는 표현이 있어.';
  return null;
}

function passwordProblem(pw: string): string | null {
  if (pw.length < 8 || pw.length > 72 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return '비밀번호는 영문과 숫자를 섞어 8자 이상으로 정해 줘.';
  return null;
}

/* ---------- 가입 ---------- */

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const nickname = str(form.get('nickname'));
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  const problem = nicknameProblem(nickname) ?? passwordProblem(password);
  if (problem) return { error: problem };
  if (form.get('age') !== 'on') return { error: '만 14세 이상만 가입할 수 있어.' };
  if (form.get('agree') !== 'on') return { error: '개인정보 처리방침에 동의해 줘.' };
  if (!(await allow('signup', await clientIp(), SIGNUPS_PER_HOUR, 60))) {
    return { error: '여기서 가입이 너무 많이 일어나고 있어. 한 시간쯤 뒤에 다시 해 줘.' };
  }
  const code = makeRecoveryCode();
  const row = await one<{ id: string }>(
    `insert into users (nickname, password_hash, recovery_hash) values ($1, $2, $3)
     on conflict do nothing returning id`,
    [nickname, await hashPassword(password), await hashPassword(code)],
  );
  if (!row) return { error: '이미 누가 쓰고 있는 별명이야. 다른 별명을 골라 줘.' };
  await startUserSession(row.id, 0);
  return { code };
}

/* ---------- 로그인 ---------- */

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const nickname = str(form.get('nickname'));
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  if (!(await allow('login', await clientIp(), LOGINS_PER_IP_10MIN, 10))) return { error: '여기서 로그인 시도가 너무 많아. 10분쯤 뒤에 다시 해 줘.' };
  const u = await one<{ id: string; password_hash: string; blocked: boolean; session_version: number }>(
    'select id, password_hash, blocked, session_version from users where lower(nickname) = lower($1)',
    [nickname],
  );
  if (!u) {
    await hashPassword(password); // 없는 별명이어도 같은 시간이 걸리게
    return { error: '별명이나 비밀번호가 맞지 않아.' };
  }
  if (!(await reserveAttempt('users', u.id, 10))) return { error: '여러 번 틀려서 10분 동안 잠겼어. 잠시 뒤 다시 해 줘.' };
  if (!(await verifyPassword(password, u.password_hash))) return { error: '별명이나 비밀번호가 맞지 않아.' };
  if (u.blocked) return { error: '이 계정은 운영 규칙 위반으로 막혀 있어. 운영자에게 문의해 줘.' };
  await clearAttempts('users', u.id);
  await q('update users set last_login_at = now() where id = $1', [u.id]);
  await startUserSession(u.id, u.session_version);
  if (Math.random() < 0.1) await purgeInactive();
  redirect('/home');
}

/* ---------- 복구 코드로 비밀번호 다시 정하기 ---------- */

export async function recover(_prev: FormState, form: FormData): Promise<FormState> {
  const nickname = str(form.get('nickname'));
  const code = normalizeRecoveryCode(str(form.get('code')));
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (!(await allow('login', await clientIp(), LOGINS_PER_IP_10MIN, 10))) return { error: '여기서 시도가 너무 많아. 10분쯤 뒤에 다시 해 줘.' };
  const u = await one<{ id: string; recovery_hash: string; blocked: boolean }>(
    'select id, recovery_hash, blocked from users where lower(nickname) = lower($1)',
    [nickname],
  );
  if (!u) return { error: '별명이나 복구 코드가 맞지 않아.' };
  // 복구 코드 맞히기도 로그인과 같은 잠금을 쓴다
  if (!(await reserveAttempt('users', u.id, 10))) return { error: '여러 번 틀려서 10분 동안 잠겼어. 잠시 뒤 다시 해 줘.' };
  if (!code || !(await verifyPassword(code, u.recovery_hash))) return { error: '별명이나 복구 코드가 맞지 않아.' };
  if (u.blocked) return { error: '이 계정은 운영 규칙 위반으로 막혀 있어.' };
  const fresh = makeRecoveryCode();
  const row = await one<{ session_version: number }>(
    `update users set password_hash = $2, recovery_hash = $3, failed_attempts = 0, locked_until = null,
            session_version = session_version + 1, last_login_at = now()
      where id = $1 returning session_version`,
    [u.id, await hashPassword(password), await hashPassword(fresh)],
  );
  await startUserSession(u.id, row!.session_version);
  return { code: fresh };
}

/* ---------- 로그아웃, 비밀번호 바꾸기, 계정 지우기 ---------- */

export async function logout() {
  const user = await currentUser();
  // 번호를 올려 이 계정의 다른 기기 로그인도 함께 끊는다(같이 쓰는 기기 대비)
  if (user) await q('update users set session_version = session_version + 1 where id = $1', [user.id]);
  await endUserSession();
  redirect('/');
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = typeof form.get('current') === 'string' ? (form.get('current') as string) : '';
  const next = typeof form.get('next') === 'string' ? (form.get('next') as string) : '';
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  const row = await one<{ password_hash: string }>('select password_hash from users where id = $1', [user.id]);
  if (!(await reserveAttempt('users', user.id, 10))) return { error: '여러 번 틀려서 10분 동안 잠겼어.' };
  if (!row || !(await verifyPassword(current, row.password_hash))) return { error: '지금 비밀번호가 맞지 않아.' };
  const updated = await one<{ session_version: number }>(
    `update users set password_hash = $2, failed_attempts = 0, locked_until = null, session_version = session_version + 1
      where id = $1 returning session_version`,
    [user.id, await hashPassword(next)],
  );
  await startUserSession(user.id, updated!.session_version);
  return { ok: '비밀번호를 바꿨어. 다른 기기의 로그인은 모두 끊겼어.' };
}

export async function deleteAccount(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (str(form.get('confirm')) !== user.nickname) return { error: '별명을 똑같이 입력해 줘.' };
  await q('delete from users where id = $1', [user.id]);
  await endUserSession();
  redirect('/?deleted=1');
}

/* ---------- 관심사와 진로 ---------- */

export async function saveProfile(input: { interests: string[]; career: string; careerUnknown: boolean }): Promise<{ error?: string }> {
  const user = await requireUser();
  const preset = new Set<string>(INTERESTS);
  const interests = [...new Set((Array.isArray(input.interests) ? input.interests : []).map((t) => String(t).trim()).filter(Boolean))].slice(0, 8);
  for (const t of interests) {
    if (t.length > 12) return { error: '직접 쓴 관심사는 12자까지야.' };
    if (!preset.has(t) && checkText(t)) return { error: '관심사에 쓸 수 없는 표현이 있어.' };
  }
  if (!interests.length) return { error: '관심사를 하나 이상 골라 줘.' };
  const careerUnknown = !!input.careerUnknown;
  const career = careerUnknown ? '' : String(input.career ?? '').trim().slice(0, 40);
  if (career && checkText(career)) return { error: '진로에 쓸 수 없는 표현이 있어.' };
  await q('update users set interests = $2::text::jsonb, career = $3, career_unknown = $4 where id = $1', [user.id, JSON.stringify(interests), career, careerUnknown]);
  return {};
}
