import { currentTeacher, isUuid } from '@/lib/auth';
import { one, q } from '@/lib/db';
import { getSet } from '@/lib/content';
import { RATING_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// 엑셀에서 수식으로 실행되지 않도록 =,+,-,@ 로 시작하는 칸 앞에 ' 를 붙인다
function cell(v: unknown) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ classId: string }> }) {
  const teacher = await currentTeacher();
  if (!teacher) return new Response('로그인이 필요해요', { status: 401 });
  const { classId } = await ctx.params;
  if (!isUuid(classId)) return new Response('찾지 못했어요', { status: 404 });
  const cls = await one<{ grade: number; class_no: number; school_year: number }>(
    'select grade, class_no, school_year from classes where id = $1 and teacher_id = $2',
    [classId, teacher.id],
  );
  if (!cls) return new Response('찾지 못했어요', { status: 404 });
  const rows = await q<{
    student_no: number; set_id: string; opened_at: Date; interest: string; answers: string[]; concepts: string[];
    free: boolean; relevance: number | null; rating: number | null; share_class: boolean; share_example: boolean; starred: boolean; created_at: Date;
  }>(
    `select st.student_no, a.set_id, a.opened_at, s.interest, s.answers, s.concepts, s.free, s.relevance, s.rating,
            s.share_class, s.share_example, s.starred, s.created_at
       from submissions s join students st on st.id = s.student_id join activities a on a.id = s.activity_id
      where a.class_id = $1 order by st.student_no, a.opened_at`,
    [classId],
  );
  const header = ['학번', '과목', '단원', '수업 날짜', '관심사', '장면', '계산·비교·예측', '닮은 개념', '고른 개념', '자유 쓰기', '관련성(1~5)', '연결 수준', '반 공유', '예시 동의', '예시 후보'];
  const lines = [header.map(cell).join(',')];
  for (const r of rows) {
    const set = getSet(r.set_id);
    lines.push([
      r.student_no, set?.subject ?? '', set?.unit ?? '', new Date(r.opened_at).toISOString().slice(0, 10), r.interest,
      r.answers[0] ?? '', r.answers[1] ?? '', r.answers[2] ?? '', (r.concepts ?? []).join(' / '), r.free ? '예' : '',
      r.relevance ?? '', r.rating === null ? '' : RATING_LABELS[r.rating], r.share_class ? '예' : '아니오', r.share_example ? '예' : '아니오', r.starred ? '★' : '',
    ].map(cell).join(','));
  }
  const name = `mathing-${cls.school_year}-${cls.grade}-${cls.class_no}.csv`;
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}
