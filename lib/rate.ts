import 'server-only';
import { headers } from 'next/headers';
import { one, q } from './db';
import { keyedHash } from './security';

/** 요청한 곳의 인터넷 주소. Vercel이 앞에 붙여 주는 값을 쓴다 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'local').trim();
}

/**
 * 정해진 시간 안의 횟수를 센다. 먼저 기록하고 세기 때문에 동시에 보내도 한도를 넘지 못한다.
 * 한도 안이면 true. 값은 섞어서(해시) 저장한다.
 */
export async function allow(kind: string, rawKey: string, limit: number, windowMinutes: number): Promise<boolean> {
  const key = await keyedHash(`${kind}:${rawKey}`);
  await q('insert into rate_events (kind, key) values ($1, $2)', [kind, key]);
  const row = await one<{ n: number }>(
    `select count(*)::int as n from rate_events where kind = $1 and key = $2 and at > now() - make_interval(mins => $3::int)`,
    [kind, key, windowMinutes],
  );
  // 오래된 기록은 가끔 정리한다
  if (Math.random() < 0.05) await q(`delete from rate_events where at < now() - interval '2 days'`);
  return (row?.n ?? 0) <= limit;
}

/** 1년 동안 로그인하지 않은 계정과 그 글을 지운다(글·공감·신고는 함께 지워진다) */
export async function purgeInactive() {
  await q(`delete from users where last_login_at < now() - interval '1 year'`);
}
