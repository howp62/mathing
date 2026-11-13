import { requireTeacher } from '@/lib/auth';
import { q } from '@/lib/db';
import { catalogWithAvailability, getSet } from '@/lib/content';
import { openActivity } from '@/app/actions/teacher';
import { CreateClassForm } from './CreateClassForm';

export const dynamic = 'force-dynamic';

function currentSchoolYear() {
  const now = new Date();
  return now.getMonth() + 1 >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

export default async function TeacherHome() {
  const teacher = await requireTeacher();
  const classes = await q<{
    id: string; school_year: number; grade: number; class_no: number; size: number; join_code: string;
    students: number; open_id: string | null; open_set: string | null; open_stage: string | null; activities: number;
  }>(
    `select c.id, c.school_year, c.grade, c.class_no, c.size, c.join_code,
            (select count(*)::int from students s where s.class_id = c.id) as students,
            (select count(*)::int from activities a where a.class_id = c.id) as activities,
            oa.id as open_id, oa.set_id as open_set, oa.stage as open_stage
       from classes c
       left join lateral (select id, set_id, stage from activities a where a.class_id = c.id and a.closed_at is null order by opened_at desc limit 1) oa on true
      where c.teacher_id = $1
      order by c.school_year desc, c.grade, c.class_no`,
    [teacher.id],
  );
  const catalog = catalogWithAvailability();
  return (
    <main className="tmain">
      <h1>반과 수업</h1>
      <p className="lead">반을 만들고, 대단원마다 한 번씩 수업을 열어요. 수업을 열면 칠판 화면과 교사 화면을 따로 띄울 수 있어요.</p>
      <div className="grid2">
        {classes.map((c) => (
          <section className="panel-card class-card" key={c.id} aria-label={`${c.grade}학년 ${c.class_no}반`}>
            <div className="top">
              <b>{c.grade}학년 {c.class_no}반</b>
              <span className="muted">{c.school_year}학년도 · {c.size}명</span>
              <span className="code-chip" title="학생 입장 코드">{c.join_code}</span>
            </div>
            {c.open_id ? (
              <div className="live">
                <span>지금 열린 수업: <b>{getSet(c.open_set!)?.unit ?? c.open_set}</b></span>
                <a className="btn sm" href={`/t/activity/${c.open_id}`}>교사 화면</a>
              </div>
            ) : null}
            <form action={openActivity} className="unit-select">
              <input type="hidden" name="classId" value={c.id} />
              <label className="sr" htmlFor={`set-${c.id}`}>대단원 고르기</label>
              <select id={`set-${c.id}`} name="setId" defaultValue="cm1-polynomial">
                {catalog.map((s) => (
                  <optgroup key={s.subject} label={s.subject}>
                    {s.units.map((u) => (
                      <option key={u.id} value={u.id} disabled={!u.available}>
                        {u.unit}{!u.available ? ' (준비 중)' : u.status === 'draft' ? ' (검수 전)' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button className="btn sm" type="submit">{c.open_id ? '새 수업 열기' : '수업 열기'}</button>
            </form>
            <div className="row" style={{ alignItems: 'center' }}>
              <a href={`/t/classes/${c.id}`}>학생 기록 보기 ({c.students}명 등록 · 수업 {c.activities}번)</a>
              <a href={`/api/export/${c.id}`} style={{ marginLeft: 'auto' }}>엑셀 내보내기</a>
            </div>
          </section>
        ))}
        <section className="panel-card">
          <h2>반 만들기</h2>
          <CreateClassForm schoolYear={currentSchoolYear()} />
        </section>
      </div>
    </main>
  );
}
