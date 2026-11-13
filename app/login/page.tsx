import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { Plain } from '@/components/ui';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await currentUser()) redirect('/home');
  return <Plain><LoginForm /></Plain>;
}
