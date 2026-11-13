import { one } from '@/lib/db';
import { redirect } from 'next/navigation';
import { currentStudent, hasTeacher } from '@/lib/auth';
import { JoinForm } from './JoinForm';

export const dynamic = 'force-dynamic';

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  if (!(await hasTeacher())) redirect('/setup');
  const code = decodeURIComponent((await params).code).toUpperCase().slice(0, 10);
  const cls = await one<{ id: string; grade: number; class_no: number; student_from: number; student_to: number }>(
    'select id, grade, class_no, student_from, student_to from classes where join_code = $1',
    [code],
  );
  const me = await currentStudent();
  return (
    <JoinForm
      code={code}
      found={!!cls}
      label={cls ? `${cls.grade}학년 ${cls.class_no}반` : ''}
      range={cls ? `${cls.student_from}~${cls.student_to}` : ''}
      already={!!(cls && me && me.class_id === cls.id) ? me!.student_no : null}
    />
  );
}
