import 'server-only';
import { q } from './db';
import { clientIp } from './rate';

/**
 * 운영자 활동 기록: 접속(로그인·로그아웃·2단계)과 바꾼 것(숨기기·막기·추천).
 * 별명이나 글 내용은 적지 않고 번호만 둔다. 2년 지나면 purgeInactive()가 지운다.
 */
export const ADMIN_ACTIONS = {
  'login-fail': '로그인 실패(비밀번호)',
  'password-ok': '비밀번호 맞음(2단계 전)',
  'code-fail': '로그인 실패(2단계 코드)',
  login: '로그인(인증 앱)',
  'login-backup': '로그인(예비 코드)',
  logout: '로그아웃',
  'admin-created': '운영자 계정 만듦',
  'totp-on': '2단계 인증 켬',
  'backup-new': '예비 코드 다시 만듦',
  'totp-reset': '인증 앱 다시 연결 시작',
  hide: '글 숨김',
  unhide: '글 되살림',
  block: '계정 막음',
  unblock: '계정 풀어 줌',
  feature: '추천함',
  unfeature: '추천 풂',
} as const;
export type AdminAction = keyof typeof ADMIN_ACTIONS;

export async function logAdmin(action: AdminAction, t: { adminId?: string | null; connectionId?: string | null; userId?: string | null } = {}) {
  await q(
    'insert into admin_log (admin_id, action, target_connection, target_user, ip) values ($1, $2, $3, $4, $5)',
    [t.adminId ?? null, action, t.connectionId ?? null, t.userId ?? null, (await clientIp()).slice(0, 64)],
  );
}

export type AdminLogRow = { id: string; action: string; ip: string | null; at: Date; unit_id: string | null; nickname: string | null; target_connection: string | null; target_user: string | null };

/** 최근 기록. 대상 글·계정이 아직 있으면 단원과 별명을 붙인다(지워졌으면 비어 있음) */
export async function recentAdminLog(limit = 200) {
  return q<AdminLogRow>(
    `select l.id::text as id, l.action, l.ip, l.at, l.target_connection, l.target_user, c.unit_id, coalesce(u.nickname, u2.nickname) as nickname
       from admin_log l
       left join connections c on c.id = l.target_connection
       left join users u on u.id = c.user_id
       left join users u2 on u2.id = l.target_user
      order by l.at desc, l.id desc limit $1`,
    [limit],
  );
}
