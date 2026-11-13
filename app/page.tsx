import { redirect } from 'next/navigation';
import { hasTeacher } from '@/lib/auth';
import { LogoMark } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Home() {
  if (!(await hasTeacher())) redirect('/setup');
  return (
    <main className="center-page">
      <div className="card-box" style={{ textAlign: 'center' }}>
        <div className="biglogo" style={{ margin: '0 auto' }}><LogoMark /></div>
        <h1>mathing</h1>
        <p className="lead">수학과 나를 잇는 시간</p>
        <div className="home-actions">
          <a className="btn block" href="/j">학생으로 입장하기</a>
          <a className="btn ghost block" href="/login">선생님 로그인</a>
        </div>
        <p className="site-foot"><a href="/privacy">개인정보 처리방침</a></p>
      </div>
    </main>
  );
}
