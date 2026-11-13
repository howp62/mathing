import 'server-only';
import { one, q } from './db';
import { CATALOG, getSet } from './content';
import { PAGE_SIZE } from './constants';
import type { User } from './auth';

/* 화면마다 필요한 데이터만 골라 만든다. 갤러리 데이터에는 별명·계정 번호가 들어가지 않는다. */

type ConnRow = {
  id: string; unit_id: string; interest: string; answers: string[]; concepts: string[]; free: boolean;
  re_answers: string[] | null; re_concepts: string[] | null; re_free: boolean | null;
  share: boolean; pre: number | null; post: number | null; hidden: boolean; hidden_reason: string | null;
  featured: boolean; created_at: Date; updated_at: Date;
};

/** 갤러리에 보일 글: 다시 쓴 연결이 있으면 그것 */
function shown(c: Pick<ConnRow, 'answers' | 'free' | 'concepts' | 're_answers' | 're_free' | 're_concepts'>) {
  return c.re_answers
    ? { answers: withConcepts(c.re_answers, c.re_concepts ?? [], !!c.re_free), free: !!c.re_free }
    : { answers: withConcepts(c.answers, c.concepts, c.free), free: c.free };
}

/** 3단계 글의 마지막 칸에 고른 개념 이름을 붙여 보여 준다 */
export function withConcepts(answers: string[], concepts: string[], free: boolean) {
  if (free || !concepts.length) return answers;
  const a = [...answers];
  a[2] = a[2] ? `${a[2]} (${concepts.join(', ')})` : concepts.join(', ');
  return a;
}

export type GalleryPost = {
  id: string;
  interest: string;
  answers: string[];
  free: boolean;
  featured: boolean;
  liked: boolean;
  mine: boolean;
  gotLike: boolean;
  mineInterest: boolean;
};

export async function myConnection(userId: string, unitId: string) {
  return one<ConnRow>('select * from connections where user_id = $1 and unit_id = $2', [userId, unitId]);
}

/**
 * 같은 단원의 공유된 글. 내 글을 저장한 학생만 볼 수 있다.
 * 순서: 운영자 추천 → 내 관심사와 같은 글 → 최신순. 내 글은 첫 쪽 맨 위에 따로 붙인다.
 */
export async function galleryPage(user: User, unitId: string, offset: number, filter: string | null) {
  const mine = await myConnection(user.id, unitId);
  if (!mine) return null;
  const rows = await q<ConnRow & { liked: boolean }>(
    `select c.*, exists (select 1 from likes l where l.connection_id = c.id and l.user_id = $2) as liked
       from connections c join users u on u.id = c.user_id
      where c.unit_id = $1 and c.user_id <> $2 and c.share and not c.hidden and not u.blocked
        and ($4::text is null or c.interest = $4)
      order by c.featured desc,
               (c.interest in (select jsonb_array_elements_text($3::text::jsonb))) desc,
               c.updated_at desc, c.id
      limit $5 offset $6`,
    [unitId, user.id, JSON.stringify(user.interests), filter, PAGE_SIZE + 1, offset],
  );
  const posts: GalleryPost[] = rows.slice(0, PAGE_SIZE).map((c) => ({
    id: c.id, interest: c.interest, ...shown(c), featured: c.featured, liked: c.liked,
    mine: false, gotLike: false, mineInterest: user.interests.includes(c.interest),
  }));
  if (offset === 0 && (!filter || filter === mine.interest)) {
    const got = await one('select 1 from likes where connection_id = $1 limit 1', [mine.id]);
    posts.unshift({
      id: mine.id, interest: mine.interest, ...shown(mine), featured: false, liked: false,
      mine: true, gotLike: !!got, mineInterest: true,
    });
  }
  return { posts, more: rows.length > PAGE_SIZE };
}

/** 갤러리 위쪽 관심사 거르기 버튼에 쓸, 이 단원에 실제로 있는 관심사 */
export async function galleryInterests(unitId: string) {
  const rows = await q<{ interest: string }>(
    `select c.interest from connections c join users u on u.id = c.user_id
      where c.unit_id = $1 and c.share and not c.hidden and not u.blocked and c.interest <> ''
      group by c.interest order by count(*) desc limit 15`,
    [unitId],
  );
  return rows.map((r) => r.interest);
}

/** 단원 목록: 열린 단원과 내가 쓴 단원 표시 */
export async function homeView(userId: string) {
  const done = new Set((await q<{ unit_id: string }>('select unit_id from connections where user_id = $1', [userId])).map((r) => r.unit_id));
  return CATALOG.map((s) => ({
    subject: s.subject,
    units: s.units.map((u) => {
      const set = getSet(u.id);
      return { id: u.id, unit: u.unit, open: !!set && isOpen(set.status), done: done.has(u.id) };
    }),
  }));
}

/**
 * 학생에게 여는 세트: 검수를 마친 세트만. 검수 전 세트를 미리 보려면 환경 변수 SHOW_DRAFT_SETS=1
 * (내 컴퓨터에서 개발할 때는 기본으로 보인다)
 */
export function isOpen(status: string) {
  return status === 'reviewed' || process.env.SHOW_DRAFT_SETS === '1' || process.env.NODE_ENV !== 'production';
}

export type NoteItem = {
  id: string; unitId: string; unit: string; subject: string; interest: string;
  first: { answers: string[]; free: boolean; concepts: string[] };
  re: { answers: string[]; free: boolean; concepts: string[] } | null;
  share: boolean; pre: number | null; post: number | null; hidden: boolean; hiddenReason: string | null;
};

/** 내 연결 노트: 과목·단원 순서대로 */
export async function notebook(userId: string): Promise<NoteItem[]> {
  const rows = await q<ConnRow>('select * from connections where user_id = $1', [userId]);
  const order = CATALOG.flatMap((s) => s.units.map((u) => ({ id: u.id, unit: u.unit, subject: s.subject })));
  return order
    .map((o) => {
      const c = rows.find((r) => r.unit_id === o.id);
      if (!c) return null;
      return {
        id: c.id, unitId: o.id, unit: o.unit, subject: o.subject, interest: c.interest,
        first: { answers: c.answers, free: c.free, concepts: c.concepts },
        re: c.re_answers ? { answers: c.re_answers, free: !!c.re_free, concepts: c.re_concepts ?? [] } : null,
        share: c.share, pre: c.pre, post: c.post, hidden: c.hidden, hiddenReason: c.hidden_reason,
      };
    })
    .filter((x): x is NoteItem => !!x);
}

/** 학생에게 열린 세트만 돌려준다. 쓰기·갤러리·서버 동작 모두 이 검사를 쓴다 */
export function openSet(id: string) {
  const set = getSet(id);
  return set && isOpen(set.status) ? set : null;
}

export function catalogUnits() {
  return CATALOG.map((s) => ({ subject: s.subject, units: s.units.map((u) => ({ id: u.id, unit: u.unit })) }));
}
