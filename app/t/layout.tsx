import { requireTeacher } from '@/lib/auth';
import { usingLocalDb } from '@/lib/db';
import { logout } from '@/app/actions/teacher';
import { Logo } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const teacher = await requireTeacher();
  return (
    <div className="tshell">
      <header className="thead">
        <div className="thead-in">
          <Logo href="/t" />
          {usingLocalDb() && <span className="pill warn" title="Supabase를 연결하기 전이에요">연습용 데이터베이스</span>}
          <nav aria-label="교사 메뉴">
            <a href="/t">반과 수업</a>
            <a href="/t/settings">설정</a>
            <span className="muted" style={{ fontSize: 13, padding: '0 6px' }}>{teacher.name} 선생님</span>
            <form action={logout}><button type="submit">로그아웃</button></form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
