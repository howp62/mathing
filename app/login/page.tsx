import { redirect } from 'next/navigation';
import { currentTeacher, hasTeacher } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (!(await hasTeacher())) redirect('/setup');
  if (await currentTeacher()) redirect('/t');
  return <LoginForm />;
}
