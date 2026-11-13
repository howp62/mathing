import { redirect } from 'next/navigation';
import { hasTeacher } from '@/lib/auth';
import { usingLocalDb } from '@/lib/db';
import { SetupForm } from './SetupForm';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  if (await hasTeacher()) redirect('/login');
  if (!process.env.SETUP_CODE && process.env.NODE_ENV === 'production') {
    return (
      <main className="center-page"><div className="card-box">
        <h1>설정 코드가 필요해요</h1>
        <p className="lead">인터넷에 배포한 사이트는 아무나 관리자 계정을 만들지 못하게, 배포 설정(Vercel 환경 변수)에 SETUP_CODE를 넣어야 처음 설정을 열 수 있어요. 넣은 뒤 다시 배포해 주세요.</p>
      </div></main>
    );
  }
  return <SetupForm needsCode={!!process.env.SETUP_CODE} localDb={usingLocalDb()} />;
}
