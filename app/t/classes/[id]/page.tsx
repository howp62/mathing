import { notFound } from 'next/navigation';
import { isUuid, requireTeacher } from '@/lib/auth';
import { one, q } from '@/lib/db';
import { getSet } from '@/lib/content';
import { RATING_LABELS } from '@/lib/constants';
import { Rows } from '@/components/ui';
import { ResetPinButton } from './ResetPinButton';

export const dynamic = 'force-dynamic';

export default async function ClassPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ no?: string }> }) {
  const teacher = await requireTeacher();
  const { id } = await params;
  const { no } = await searchParams;
  if (!isUuid(id)) notFound();
  const cls = await one<{ id: string; grade: number; class_no: number; school_year: number; join_code: string; student_from: number; student_to: number }>(
    'select id, grade, class_no, school_year, join_code, student_from, student_to from classes where id = $1 and teacher_id = $2',
    [id, teacher.id],
  );
  if (!cls) notFound();
  const students = await q<{ student_no: number; interests: string[]; career: string; career_unknown: boolean; locked_until: Date | null; has_pin: boolean; posts: number }>(
    `select st.student_no, st.interests, st.career, st.career_unknown, st.locked_until, (st.pin_hash is not null) as has_pin,
            (select count(*)::int from submissions s where s.student_id = st.id) as posts
       from students st where st.class_id = $1 order by st.student_no`,
    [id],
  );
  const selected = no ? Number(no) : null;
  const posts = selected
    ? await q<{ set_id: string; opened_at: Date; answers: string[]; free: boolean; interest: string; rating: number | null; relevance: number | null }>(
        `select a.set_id, a.opened_at, s.answers, s.free, s.interest, s.rating, s.relevance
           from submissions s join students st on st.id = s.student_id join activities a on a.id = s.activity_id
          where st.class_id = $1 and st.student_no = $2 order by a.opened_at`,
        [id, selected],
      )
    : [];
  return (
    <main className="tmain">
      <p style={{ margin: '0 0 6px' }}><a href="/t">← 반과 수업</a></p>
      <h1>{cls.grade}학년 {cls.class_no}반 학생 기록</h1>
      <p className="lead">{cls.school_year}학년도 · 학번 {cls.student_from}~{cls.student_to} · 입장 코드 <span className="code-chip">{cls.join_code}</span> · <a href={`/api/export/${cls.id}`}>엑셀 내보내기</a></p>
      <div className="console">
        <section className="panel-card">
          <h2>학생 목록</h2>
          {students.length === 0 ? <p className="muted">아직 들어온 학생이 없어요. 수업을 열고 입장 코드를 알려 주세요.</p> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>학번</th><th>관심사·진로</th><th>쓴 글</th><th></th></tr></thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.student_no}>
                      <td><a href={`?no=${s.student_no}`}><b>{s.student_no}</b></a></td>
                      <td>{(s.interests ?? []).join(', ') || <span className="muted">—</span>}{s.career ? ` · 진로: ${s.career}` : s.career_unknown ? ' · 진로: 아직 몰라요' : ''}</td>
                      <td>{s.posts}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {s.locked_until && new Date(s.locked_until).getTime() > Date.now() && <span className="pill danger" style={{ marginRight: 6 }}>잠김</span>}
                        <ResetPinButton classId={cls.id} studentNo={s.student_no} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="panel-card">
          <h2>{selected ? `${selected} 학생이 쓴 연결` : '학생별 모아보기'}</h2>
          {!selected && <p className="muted">왼쪽 목록에서 학번을 누르면 그 학생이 한 학기 동안 쓴 글을 모아 볼 수 있어요.</p>}
          {selected && posts.length === 0 && <p className="muted">아직 쓴 글이 없어요.</p>}
          <div className="stack">
            {posts.map((p, i) => {
              const set = getSet(p.set_id);
              return (
                <article key={i} className="prow">
                  <div className="prow-top"><b>{set?.subject} · {set?.unit}</b><span className="muted">{new Date(p.opened_at).toLocaleDateString('ko-KR')}</span><span className="tag sm">{p.interest}</span>
                    {p.rating !== null && <span className="pill">{RATING_LABELS[p.rating]}</span>}
                    {p.relevance && <span className="pill">관련성 {p.relevance}/5</span>}
                  </div>
                  <Rows answers={p.answers} free={p.free} />
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
