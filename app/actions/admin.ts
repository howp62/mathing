'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { one, q } from '@/lib/db';
import { hashBackupCode, hashPassword, makeBackupCodes, normalizeRecoveryCode, openText, safeEqual, sealText, verifyPassword } from '@/lib/security';
import {
  clearBackupCodes, currentAdmin, currentAdminPending, endAdminPending, endAdminSession, hasAdmin, isUuid,
  revealBackupCodes, startAdminPending, startAdminSession,
} from '@/lib/auth';
import { allow, clientIp, forget, purgeInactive } from '@/lib/rate';
import { newTotpSecret, verifyTotp } from '@/lib/totp';
import { logAdmin } from '@/lib/adminlog';

export type FormState = { error?: string } | undefined;
const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');
const raw = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v : '');

/** 2단계 코드 시도 제한: 한 곳에서 15분에 5번, 전체 합쳐 한 시간에 30번 */
async function allowCodeTry() {
  const ip = await clientIp();
  return (await allow('admin-2fa', ip, 5, 15)) && (await allow('admin-2fa', 'all', 30, 60));
}

/**
 * 비밀번호가 맞은 뒤: 바로 운영자 세션을 주지 않고 10분짜리 대기 표만 준다.
 * 2단계를 아직 안 켰으면 인증 앱에 연결할 비밀값을 만들어 둔다(이미 만들어 둔 게 있으면 그대로 써서 찍어 둔 QR이 계속 통하게).
 */
async function beginSecondStep(a: { id: string; session_version: number; totp_on: boolean; totp_secret: string | null }) {
  if (!a.totp_on && !(await openText(a.totp_secret))) {
    await q('update admins set totp_secret = $2 where id = $1 and not totp_on', [a.id, await sealText(newTotpSecret())]);
  }
  await startAdminPending(a.id, a.session_version, a.totp_on ? 'code' : 'setup');
}

/** 2단계까지 통과: 운영자 세션 시작 */
async function finishLogin(adminId: string, version: number, how: 'login' | 'login-backup') {
  await forget('admin-2fa', await clientIp());
  await endAdminPending();
  await startAdminSession(adminId, version);
  await logAdmin(how, { adminId });
  await purgeInactive();
}

/** 운영자 계정은 한 번만 만든다. 인터넷에 배포한 사이트는 SETUP_CODE가 있어야 한다 */
export async function setupAdmin(_prev: FormState, form: FormData): Promise<FormState> {
  if (await hasAdmin()) return { error: '이미 운영자가 있어요. 로그인해 주세요.' };
  const required = process.env.SETUP_CODE;
  if (!required && process.env.NODE_ENV === 'production') return { error: '배포 설정에 SETUP_CODE가 없어요. Vercel 환경 변수에 넣고 다시 배포해 주세요.' };
  // 설정 코드 맞히기를 막는다: 한 곳에서 한 시간에 5번, 전체 합쳐 20번까지
  if (!(await allow('setup', await clientIp(), 5, 60)) || !(await allow('setup', 'all', 20, 60))) return { error: '시도가 너무 많아요. 한 시간쯤 뒤에 다시 해 주세요.' };
  if (required && !safeEqual(str(form.get('setupCode')), required)) return { error: '설정 코드가 맞지 않아요.' };
  const name = str(form.get('name'));
  const password = raw(form.get('password'));
  if (name.length < 2 || name.length > 30) return { error: '로그인 이름은 2~30자로 써 주세요.' };
  if (password.length < 10) return { error: '운영자 비밀번호는 10자 이상으로 정해 주세요.' };
  if (password !== form.get('confirm')) return { error: '두 비밀번호가 서로 달라요.' };
  const row = await one<{ id: string }>(
    `insert into admins (name, password_hash) select $1, $2 where not exists (select 1 from admins) returning id`,
    [name, await hashPassword(password)],
  );
  if (!row) return { error: '이미 운영자가 있어요.' };
  await logAdmin('admin-created', { adminId: row.id });
  // 만들자마자 인증 앱 연결 화면으로 이어진다
  await beginSecondStep({ id: row.id, session_version: 0, totp_on: false, totp_secret: null });
  redirect('/admin');
}

export async function adminLogin(_prev: FormState, form: FormData): Promise<FormState> {
  const name = str(form.get('name'));
  const password = raw(form.get('password'));
  // 잠금은 계정이 아니라 접속한 곳(인터넷 주소)마다 건다. 운영자 이름을 아는 사람이 일부러 틀려도
  // 자기만 막히고 운영자는 계속 로그인할 수 있다. 한 곳에서 15분에 5번, 10분에 20번까지.
  const ip = await clientIp();
  if (!(await allow('admin-login', ip, 20, 10)) || !(await allow('admin-try', ip, 5, 15))) return { error: '여러 번 틀려서 잠시 막혔어요. 15분쯤 뒤에 다시 해 주세요.' };
  const a = await one<{ id: string; password_hash: string; session_version: number; totp_on: boolean; totp_secret: string | null }>(
    'select id, password_hash, session_version, totp_on, totp_secret from admins where name = $1',
    [name],
  );
  if (!a) {
    await hashPassword(password);
    await logAdmin('login-fail');
    return { error: '이름이나 비밀번호가 맞지 않아요.' };
  }
  if (!(await verifyPassword(password, a.password_hash))) {
    await logAdmin('login-fail', { adminId: a.id });
    return { error: '이름이나 비밀번호가 맞지 않아요.' };
  }
  // 맞게 들어오면 이 곳의 비밀번호 시도 기록을 지운다
  await forget('admin-try', ip);
  await beginSecondStep(a);
  redirect('/admin');
}

/** 2단계: 인증 앱 6자리(처음이면 연결 확인), 또는 예비 코드 */
export async function verifyAdminCode(_prev: FormState, form: FormData): Promise<FormState> {
  const p = await currentAdminPending();
  if (!p) return { error: '확인 시간이 지났어요. 처음부터 다시 로그인해 주세요.' };
  if (!(await allowCodeTry())) return { error: '여러 번 틀려서 잠시 막혔어요. 15분쯤 뒤에 다시 해 주세요.' };
  const input = str(form.get('code'));
  const secret = await openText(p.totp_secret);
  if (!secret) return { error: '인증 앱 정보를 읽지 못했어요. 처음부터 다시 로그인해 주세요.' };
  const step = verifyTotp(secret, input, Date.now(), p.last_step);

  if (p.stage === 'setup') {
    if (step === null) {
      await logAdmin('code-fail', { adminId: p.id });
      return { error: '코드가 맞지 않아요. 인증 앱에 지금 보이는 6자리를 넣어 주세요.' };
    }
    const codes = makeBackupCodes();
    const hashes = await Promise.all(codes.map(hashBackupCode));
    const row = await one(
      `update admins set totp_on = true, totp_on_at = now(), totp_last_step = $2, backup_hashes = $3::text::jsonb
        where id = $1 and not totp_on and session_version = $4 returning id`,
      [p.id, step, JSON.stringify(hashes), p.session_version],
    );
    if (!row) return { error: '이미 처리됐어요. 처음부터 다시 로그인해 주세요.' };
    await logAdmin('totp-on', { adminId: p.id });
    await revealBackupCodes(p.id, codes);
    await finishLogin(p.id, p.session_version, 'login');
    redirect('/admin');
  }

  // 인증 앱 코드: 같은 칸(30초)의 코드는 한 번만 통과하도록 마지막으로 쓴 칸을 먼저 올린다
  if (step !== null) {
    const ok = await one(
      'update admins set totp_last_step = $2 where id = $1 and totp_on and session_version = $3 and totp_last_step < $2 returning id',
      [p.id, step, p.session_version],
    );
    if (ok) {
      await finishLogin(p.id, p.session_version, 'login');
      redirect('/admin');
    }
  }
  // 예비 코드: 맞으면 그 코드를 지우면서 통과(한 번만 쓸 수 있다)
  const backup = normalizeRecoveryCode(input);
  if (backup) {
    const used = await one(
      `update admins set backup_hashes = backup_hashes - $2::text
        where id = $1 and totp_on and session_version = $3 and backup_hashes @> jsonb_build_array($2::text) returning id`,
      [p.id, await hashBackupCode(backup), p.session_version],
    );
    if (used) {
      await finishLogin(p.id, p.session_version, 'login-backup');
      redirect('/admin');
    }
  }
  await logAdmin('code-fail', { adminId: p.id });
  return { error: '코드가 맞지 않아요. 인증 앱의 6자리나 예비 코드를 넣어 주세요.' };
}

/** 2단계 화면에서 그만두기 */
export async function cancelAdminPending() {
  await endAdminPending();
  redirect('/admin');
}

/** 새 예비 코드를 적어 두었다고 누르면 화면에서 지운다 */
export async function dismissBackupCodes() {
  await clearBackupCodes();
  redirect('/admin?tab=log');
}

export async function adminLogout() {
  const admin = await currentAdmin();
  if (admin) {
    await q('update admins set session_version = session_version + 1 where id = $1', [admin.id]);
    await logAdmin('logout', { adminId: admin.id });
  }
  await endAdminSession();
  await clearBackupCodes();
  redirect('/admin');
}

async function must() {
  const admin = await currentAdmin();
  if (!admin) throw new Error('운영자 로그인이 필요해요.');
  return admin;
}

/** 예비 코드 다시 만들기: 지금 인증 앱의 6자리가 있어야 한다. 예전 예비 코드는 모두 못 쓰게 된다 */
export async function regenerateBackupCodes(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await must();
  if (!(await allowCodeTry())) return { error: '여러 번 틀려서 잠시 막혔어요. 15분쯤 뒤에 다시 해 주세요.' };
  const a = await one<{ totp_secret: string | null; last_step: number }>('select totp_secret, totp_last_step::float8 as last_step from admins where id = $1', [admin.id]);
  const secret = await openText(a?.totp_secret);
  const step = secret ? verifyTotp(secret, str(form.get('code')), Date.now(), a!.last_step) : null;
  if (step === null) return { error: '코드가 맞지 않아요. 인증 앱에 지금 보이는 6자리를 넣어 주세요.' };
  const codes = makeBackupCodes();
  const hashes = await Promise.all(codes.map(hashBackupCode));
  const row = await one(
    'update admins set totp_last_step = $2, backup_hashes = $3::text::jsonb where id = $1 and totp_last_step < $2 returning id',
    [admin.id, step, JSON.stringify(hashes)],
  );
  if (!row) return { error: '이미 쓴 코드예요. 30초 뒤 새 6자리로 다시 해 주세요.' };
  await logAdmin('backup-new', { adminId: admin.id });
  await revealBackupCodes(admin.id, codes);
  redirect('/admin?tab=log');
}

/**
 * 인증 앱 다시 연결(휴대폰을 바꾸거나 잃었을 때): 비밀번호를 한 번 더 확인하고,
 * 2단계를 끄고 모든 운영자 로그인을 끊은 뒤 연결 화면으로 보낸다. 예전 예비 코드도 못 쓰게 된다.
 */
export async function relinkTotp(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await must();
  const ip = await clientIp();
  if (!(await allow('admin-try', ip, 5, 15))) return { error: '여러 번 틀려서 잠시 막혔어요. 15분쯤 뒤에 다시 해 주세요.' };
  const a = await one<{ password_hash: string }>('select password_hash from admins where id = $1', [admin.id]);
  if (!a || !(await verifyPassword(raw(form.get('password')), a.password_hash))) return { error: '비밀번호가 맞지 않아요.' };
  await forget('admin-try', ip);
  const row = await one<{ session_version: number }>(
    `update admins set totp_on = false, totp_on_at = null, totp_secret = $2, totp_last_step = 0, backup_hashes = '[]'::jsonb,
            session_version = session_version + 1
      where id = $1 returning session_version`,
    [admin.id, await sealText(newTotpSecret())],
  );
  await logAdmin('totp-reset', { adminId: admin.id });
  await endAdminSession();
  await clearBackupCodes();
  await startAdminPending(admin.id, row!.session_version, 'setup');
  redirect('/admin');
}

export async function setHidden(connectionId: string, hidden: boolean) {
  const admin = await must();
  if (!isUuid(connectionId)) return;
  await q(`update connections set hidden = $2, hidden_reason = case when $2 then coalesce(hidden_reason, '운영자 확인') else null end where id = $1`, [connectionId, !!hidden]);
  // 되살리면 쌓인 신고를 '처리함'으로 표시한다. 같은 계정은 다시 신고할 수 없어 같은 무리가 또 내리지 못한다
  if (!hidden) await q('update reports set dismissed = true where connection_id = $1', [connectionId]);
  await logAdmin(hidden ? 'hide' : 'unhide', { adminId: admin.id, connectionId });
  revalidatePath('/admin');
}

/** 계정 막기: 로그인할 수 없고 그 학생의 글은 갤러리에서 모두 빠진다 */
export async function setBlocked(connectionId: string, blocked: boolean) {
  const admin = await must();
  if (!isUuid(connectionId)) return;
  const row = await one<{ id: string }>(
    `update users set blocked = $2, session_version = session_version + 1
      where id = (select user_id from connections where id = $1) returning id`,
    [connectionId, !!blocked],
  );
  if (row) await logAdmin(blocked ? 'block' : 'unblock', { adminId: admin.id, connectionId, userId: row.id });
  revalidatePath('/admin');
}

export async function setFeatured(connectionId: string, featured: boolean) {
  const admin = await must();
  if (!isUuid(connectionId)) return;
  const row = await one('update connections set featured = $2 where id = $1 and share and not hidden returning id', [connectionId, !!featured]);
  if (row) await logAdmin(featured ? 'feature' : 'unfeature', { adminId: admin.id, connectionId });
  revalidatePath('/admin');
}
