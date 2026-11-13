'use server';

import { one, q } from '@/lib/db';
import { checkText } from '@/lib/filter';
import { allow } from '@/lib/rate';
import { isUuid, requireUser } from '@/lib/auth';
import { galleryPage, openSet, type GalleryPost } from '@/lib/views';
import { HIDE_AFTER_REPORTS, MAX_ANSWER, REPORTS_PER_DAY, REPORT_REASONS, SAVES_PER_DAY } from '@/lib/constants';

export type SaveInput = {
  unitId: string;
  answers: string[];
  concepts: string[];
  free: boolean;
  interest: string;
  share: boolean;
  pre: number | null;
  post: number | null;
  rewrite: boolean;
};

const score = (n: unknown) => (typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5 ? n : null);

/** 연결 글 저장. 처음이면 새로 만들고, 다시 쓰기면 "다시 쓴 연결"에 넣는다 */
export async function saveConnection(input: SaveInput): Promise<{ error?: string }> {
  const user = await requireUser();
  const set = openSet(String(input.unitId));
  if (!set) return { error: '아직 열리지 않은 단원이야.' };

  const free = !!input.free;
  const raw = Array.isArray(input.answers) ? input.answers.map((a) => String(a ?? '').trim()) : [];
  const answers = free ? [raw[0] ?? ''] : [raw[0] ?? '', raw[1] ?? '', raw[2] ?? ''];
  if (!answers.join('').trim()) return { error: '한 줄이라도 써 줘.' };
  if (answers.some((a) => a.length > MAX_ANSWER)) return { error: `한 칸에 ${MAX_ANSWER}자까지 쓸 수 있어.` };
  const concepts = (Array.isArray(input.concepts) ? input.concepts : []).map(String).filter((c) => set.concepts.includes(c)).slice(0, 6);
  const why = checkText(answers.join('\n'));
  if (why) return { error: `${why} 고친 다음 저장해 줘.` };
  const interest = user.interests.includes(String(input.interest)) ? String(input.interest) : (user.interests[0] ?? '');

  if (!(await allow('save', user.id, SAVES_PER_DAY, 24 * 60))) return { error: '오늘은 저장을 많이 했어. 내일 다시 해 줘.' };

  if (input.rewrite) {
    // 다시 쓰면 갤러리에는 새 글이 보이고, 받은 공감은 그대로, 추천은 운영자가 다시 보도록 푼다
    const row = await one(
      `update connections set re_answers = $3::text::jsonb, re_concepts = $4::text::jsonb, re_free = $5,
              share = $6, post = coalesce($7::smallint, post), featured = false, updated_at = now()
        where user_id = $1 and unit_id = $2 returning id`,
      [user.id, set.id, JSON.stringify(answers), JSON.stringify(concepts), free, !!input.share, score(input.post)],
    );
    if (!row) return { error: '처음 쓴 연결을 찾지 못했어.' };
    return {};
  }

  const row = await one(
    `insert into connections (user_id, unit_id, interest, answers, concepts, free, share, pre, post)
     values ($1, $2, $3, $4::text::jsonb, $5::text::jsonb, $6, $7, $8::smallint, $9::smallint)
     on conflict (user_id, unit_id) do nothing returning id`,
    [user.id, set.id, interest, JSON.stringify(answers), JSON.stringify(concepts), free, !!input.share, score(input.pre), score(input.post)],
  );
  if (!row) return { error: '이 단원은 이미 썼어. 노트에서 다시 써 볼 수 있어.' };
  return {};
}

export async function setShare(connectionId: string, share: boolean): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!isUuid(connectionId)) return { error: '잘못된 요청이야.' };
  await q('update connections set share = $3 where id = $1 and user_id = $2', [connectionId, user.id, !!share]);
  return {};
}

/** 공감: 내 글이 아니고, 볼 수 있는 글에만 */
export async function toggleLike(connectionId: string): Promise<{ liked?: boolean; error?: string }> {
  const user = await requireUser();
  if (!isUuid(connectionId)) return { error: '잘못된 요청이야.' };
  const target = await visibleTo(user.id, connectionId);
  if (!target) return { error: '볼 수 없는 글이야.' };
  const removed = await one('delete from likes where connection_id = $1 and user_id = $2 returning 1', [connectionId, user.id]);
  if (removed) return { liked: false };
  await q('insert into likes (connection_id, user_id) values ($1, $2) on conflict do nothing', [connectionId, user.id]);
  return { liked: true };
}

/** 신고: 한 글에 한 번. 서로 다른 학생 3명이면 바로 숨긴다 */
export async function report(connectionId: string, reason: string): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!isUuid(connectionId)) return { error: '잘못된 요청이야.' };
  if (!(REPORT_REASONS as readonly string[]).includes(reason)) return { error: '신고 이유를 골라 줘.' };
  const target = await visibleTo(user.id, connectionId);
  if (!target) return { error: '볼 수 없는 글이야.' };
  if (!(await allow('report', user.id, REPORTS_PER_DAY, 24 * 60))) return { error: '오늘은 신고를 많이 했어. 급한 일이면 운영자에게 알려 줘.' };
  await q('insert into reports (connection_id, user_id, reason) values ($1, $2, $3) on conflict do nothing', [connectionId, user.id, reason]);
  // 자동 숨김은 가입한 지 하루가 지난 계정의 신고만 센다(새로 만든 계정 여러 개로 남의 글을 내리는 것을 막음).
  // 운영자가 되살린 글의 예전 신고(dismissed)는 세지 않는다. 그 밖의 신고는 운영자 신고함에 그대로 쌓인다.
  await q(
    `update connections c set hidden = true,
            hidden_reason = (select reason from reports r where r.connection_id = c.id and not r.dismissed group by reason order by count(*) desc, reason limit 1)
      where c.id = $1 and not c.hidden
        and (select count(*) from reports r join users ru on ru.id = r.user_id
              where r.connection_id = c.id and not r.dismissed and ru.created_at < now() - interval '1 day') >= $2`,
    [connectionId, HIDE_AFTER_REPORTS],
  );
  return {};
}

export async function loadGallery(unitId: string, offset: number, filter: string | null): Promise<{ posts: GalleryPost[]; more: boolean } | { error: string }> {
  const user = await requireUser();
  const set = openSet(String(unitId));
  if (!set) return { error: '아직 열리지 않은 단원이야.' };
  const off = Math.min(Math.max(0, Math.floor(Number(offset) || 0)), 5000);
  const page = await galleryPage(user, set.id, off, filter ? String(filter).slice(0, 12) : null);
  if (!page) return { error: '내 연결을 먼저 저장해야 볼 수 있어.' };
  return page;
}

/** 다른 학생의 글 중 지금 갤러리에서 보이는 글인지, 그리고 그 단원에 나도 썼는지 확인한다 */
async function visibleTo(userId: string, connectionId: string) {
  return one(
    `select c.id from connections c join users u on u.id = c.user_id
      where c.id = $1 and c.user_id <> $2 and c.share and not c.hidden and not u.blocked
        and exists (select 1 from connections m where m.user_id = $2 and m.unit_id = c.unit_id)`,
    [connectionId, userId],
  );
}
