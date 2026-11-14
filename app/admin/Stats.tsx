import { one, q } from '@/lib/db';
import { CATALOG } from '@/lib/content';
import { openSet } from '@/lib/views';

/**
 * 운영자 합계: PRD 11장 성공 지표를 데이터베이스에 저장된 글에서 바로 센다.
 * 별명이나 글 내용은 쓰지 않고 개인을 알아볼 수 없는 합계만 보여 준다.
 */
type Totals = {
  students: number; active7: number; blocked: number;
  posts: number; rewritten: number; shared: number; hidden: number; waiting: number;
  writers: number; multi: number;
  paired: number; pre_avg: number | null; post_avg: number | null;
};
type UnitRow = { unit_id: string; posts: number; rewritten: number; shared: number; paired: number; pre_avg: number | null; post_avg: number | null };

// 관련성 전·후는 두 번 다 답한 글만 짝지어 비교한다
const PAIRED = 'pre is not null and post is not null';

const pct = (n: number, d: number) => (d ? `${Math.round((n * 100) / d)}%` : '–');
const avg = (v: number | null) => (v == null ? '–' : v.toFixed(1));

export async function Stats() {
  const t = (await one<Totals>(
    `select (select count(*)::int from users) as students,
            (select count(*)::int from users where last_login_at > now() - interval '7 days') as active7,
            (select count(*)::int from users where blocked) as blocked,
            count(*)::int as posts,
            count(*) filter (where re_answers is not null)::int as rewritten,
            count(*) filter (where share)::int as shared,
            count(*) filter (where hidden)::int as hidden,
            (select count(*)::int from connections c join users u on u.id = c.user_id
              where not c.hidden and not u.blocked
                and exists (select 1 from reports r where r.connection_id = c.id and not r.dismissed
                              and r.created_at < now() - interval '48 hours')) as waiting,
            count(distinct user_id)::int as writers,
            (select count(*)::int from (select user_id from connections group by user_id having count(*) >= 2) x) as multi,
            count(*) filter (where ${PAIRED})::int as paired,
            (avg(pre) filter (where ${PAIRED}))::float8 as pre_avg,
            (avg(post) filter (where ${PAIRED}))::float8 as post_avg
       from connections`,
  ))!;
  const rows = await q<UnitRow>(
    `select unit_id, count(*)::int as posts,
            count(*) filter (where re_answers is not null)::int as rewritten,
            count(*) filter (where share)::int as shared,
            count(*) filter (where ${PAIRED})::int as paired,
            (avg(pre) filter (where ${PAIRED}))::float8 as pre_avg,
            (avg(post) filter (where ${PAIRED}))::float8 as post_avg
       from connections group by unit_id`,
  );
  const byUnit = new Map(rows.map((r) => [r.unit_id, r]));
  // 열린 단원과 글이 있는 단원만, 과목 순서대로. '경우의 수'가 두 과목에 있어 과목 이름을 붙인다
  const units = CATALOG.flatMap((s) => s.units.map((u) => ({ ...u, subject: s.subject })))
    .filter((u) => openSet(u.id) || byUnit.has(u.id));

  const tiles = [
    { k: '자기 말로 연결', v: `${t.posts}개`, s: `다시 쓴 글 ${t.rewritten}개 (${pct(t.rewritten, t.posts)})`, goal: '다시 쓴 비율 20% 이상' },
    { k: '관련성 체감 (5점)', v: `${avg(t.pre_avg)} → ${avg(t.post_avg)}`, s: `전·후 모두 답한 글 ${t.paired}개 기준`, goal: '후가 전보다 높음' },
    { k: '공유', v: pct(t.shared, t.posts), s: `공유 켜진 글 ${t.shared}개`, goal: '60% 이상' },
    { k: '이어 쓰기', v: pct(t.multi, t.writers), s: `글 쓴 학생 ${t.writers}명 중 두 단원 이상 ${t.multi}명`, goal: '40% 이상' },
    { k: '안전', v: pct(t.hidden, t.posts), s: `숨긴 글 ${t.hidden}개 · 48시간 넘게 기다리는 신고 ${t.waiting}개`, goal: '숨긴 비율 2% 이하, 신고는 48시간 안' },
  ];

  return (
    <>
      <p className="muted" style={{ marginTop: 0 }}>
        가입 학생 {t.students}명 · 최근 7일 접속 {t.active7}명 · 막힌 계정 {t.blocked}명.
        1년 넘게 접속하지 않은 계정은 글과 함께 지워지므로 합계도 그만큼 줄어요. 목표는 처음 세운 가설이에요.
      </p>
      <div className="stats">
        {tiles.map((x) => (
          <div className="stat" key={x.k}>
            <div className="k">{x.k}</div>
            <div className="v">{x.v}</div>
            <div className="s">{x.s}</div>
            <div className="s muted">목표: {x.goal}</div>
          </div>
        ))}
      </div>
      <table>
        <thead><tr><th>단원</th><th>글</th><th>다시 쓴 비율</th><th>공유</th><th>관련성 전 → 후</th></tr></thead>
        <tbody>
          {units.map((u) => {
            const r = byUnit.get(u.id);
            return (
              <tr key={u.id}>
                <td><span className="muted">{u.subject}</span> {u.unit}</td>
                <td>{r?.posts ?? 0}</td>
                <td>{r ? pct(r.rewritten, r.posts) : '–'}</td>
                <td>{r ? pct(r.shared, r.posts) : '–'}</td>
                <td>{r?.paired ? `${avg(r.pre_avg)} → ${avg(r.post_avg)} (${r.paired}개)` : '–'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
