'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { one, q } from '@/lib/db';
import { hashPassword, safeEqual, verifyPassword } from '@/lib/security';
import { currentAdmin, endAdminSession, hasAdmin, isUuid, startAdminSession } from '@/lib/auth';
import { allow, clientIp, forget, purgeInactive } from '@/lib/rate';

export type FormState = { error?: string } | undefined;
const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

/** 운영자 계정은 한 번만 만든다. 인터넷에 배포한 사이트는 SETUP_CODE가 있어야 한다 */
export async function setupAdmin(_prev: FormState, form: FormData): Promise<FormState> {
  if (await hasAdmin()) return { error: '이미 운영자가 있어요. 로그인해 주세요.' };
  const required = process.env.SETUP_CODE;
  if (!required && process.env.NODE_ENV === 'production') return { error: '배포 설정에 SETUP_CODE가 없어요. Vercel 환경 변수에 넣고 다시 배포해 주세요.' };
  // 설정 코드 맞히기를 막는다: 한 곳에서 한 시간에 5번, 전체 합쳐 20번까지
  if (!(await allow('setup', await clientIp(), 5, 60)) || !(await allow('setup', 'all', 20, 60))) return { error: '시도가 너무 많아요. 한 시간쯤 뒤에 다시 해 주세요.' };
  if (required && !safeEqual(str(form.get('setupCode')), required)) return { error: '설정 코드가 맞지 않아요.' };
  const name = str(form.get('name'));
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  if (name.length < 2 || name.length > 30) return { error: '로그인 이름은 2~30자로 써 주세요.' };
  if (password.length < 10) return { error: '운영자 비밀번호는 10자 이상으로 정해 주세요.' };
  if (password !== form.get('confirm')) return { error: '두 비밀번호가 서로 달라요.' };
  const row = await one<{ id: string }>(
    `insert into admins (name, password_hash) select $1, $2 where not exists (select 1 from admins) returning id`,
    [name, await hashPassword(password)],
  );
  if (!row) return { error: '이미 운영자가 있어요.' };
  await startAdminSession(row.id, 0);
  redirect('/admin');
}

export async function adminLogin(_prev: FormState, form: FormData): Promise<FormState> {
  const name = str(form.get('name'));
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string) : '';
  // 잠금은 계정이 아니라 접속한 곳(인터넷 주소)마다 건다. 운영자 이름을 아는 사람이 일부러 틀려도
  // 자기만 막히고 운영자는 계속 로그인할 수 있다. 한 곳에서 15분에 5번, 10분에 20번까지.
  const ip = await clientIp();
  if (!(await allow('admin-login', ip, 20, 10)) || !(await allow('admin-try', ip, 5, 15))) return { error: '여러 번 틀려서 잠시 막혔어요. 15분쯤 뒤에 다시 해 주세요.' };
  const a = await one<{ id: string; password_hash: string; session_version: number }>('select id, password_hash, session_version from admins where name = $1', [name]);
  if (!a) {
    await hashPassword(password);
    return { error: '이름이나 비밀번호가 맞지 않아요.' };
  }
  if (!(await verifyPassword(password, a.password_hash))) return { error: '이름이나 비밀번호가 맞지 않아요.' };
  // 맞게 들어오면 이 곳의 시도 기록을 지운다
  await forget('admin-try', ip);
  await startAdminSession(a.id, a.session_version);
  await purgeInactive();
  redirect('/admin');
}

export async function adminLogout() {
  const admin = await currentAdmin();
  if (admin) await q('update admins set session_version = session_version + 1 where id = $1', [admin.id]);
  await endAdminSession();
  redirect('/admin');
}

async function must() {
  const admin = await currentAdmin();
  if (!admin) throw new Error('운영자 로그인이 필요해요.');
  return admin;
}

export async function setHidden(connectionId: string, hidden: boolean) {
  await must();
  if (!isUuid(connectionId)) return;
  await q(`update connections set hidden = $2, hidden_reason = case when $2 then coalesce(hidden_reason, '운영자 확인') else null end where id = $1`, [connectionId, !!hidden]);
  // 되살리면 쌓인 신고를 '처리함'으로 표시한다. 같은 계정은 다시 신고할 수 없어 같은 무리가 또 내리지 못한다
  if (!hidden) await q('update reports set dismissed = true where connection_id = $1', [connectionId]);
  revalidatePath('/admin');
}

/** 계정 막기: 로그인할 수 없고 그 학생의 글은 갤러리에서 모두 빠진다 */
export async function setBlocked(connectionId: string, blocked: boolean) {
  await must();
  if (!isUuid(connectionId)) return;
  await q(
    `update users set blocked = $2, session_version = session_version + 1
      where id = (select user_id from connections where id = $1)`,
    [connectionId, !!blocked],
  );
  revalidatePath('/admin');
}

export async function setFeatured(connectionId: string, featured: boolean) {
  await must();
  if (!isUuid(connectionId)) return;
  await q('update connections set featured = $2 where id = $1 and share and not hidden', [connectionId, !!featured]);
  revalidatePath('/admin');
}
