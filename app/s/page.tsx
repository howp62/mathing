import { redirect } from 'next/navigation';
import { currentStudent } from '@/lib/auth';
import { studentState } from '@/lib/studentView';
import { StudentApp } from './StudentApp';

export const dynamic = 'force-dynamic';

export default async function StudentPage() {
  const me = await currentStudent();
  if (!me) redirect('/j');
  return <StudentApp initial={await studentState(me)} />;
}
