import { redirect } from 'next/navigation';
import { hasTeacher } from '@/lib/auth';
import { EnterCode } from './EnterCode';

export const dynamic = 'force-dynamic';

export default async function EnterCodePage() {
  // 선생님 계정이 아직 없으면 학생이 들어올 반도 없으니 처음 설정으로 보낸다
  if (!(await hasTeacher())) redirect('/setup');
  return <EnterCode />;
}
