import { requireUser } from '@/lib/auth';
import { homeView } from '@/lib/views';
import { Logo, Shell } from '@/components/ui';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await requireUser();
  const subjects = await homeView(user.id);
  return (
    <Shell tab="units">
      <div className="top"><Logo /><span className="right"><LogoutButton /></span></div>
      <h1>{user.nickname}, 어떤 단원을 시작해?</h1>
      <p className="sub">새 단원을 배우기 전에 5분만 써 보자.</p>
      {subjects.map((s) => (
        <section key={s.subject}>
          <div className="subj">{s.subject}</div>
          {s.units.map((u) => {
            if (!u.open) return <div key={u.id} className="unit locked" aria-disabled="true"><span className="dot" /><b>{u.unit}</b><span className="st">준비 중</span></div>;
            return (
              <a key={u.id} className={`unit ${u.done ? 'done' : 'open'}`} href={u.done ? `/u/${u.id}/gallery` : `/u/${u.id}`}>
                <span className="dot" /><b>{u.unit}</b><span className="st">{u.done ? '썼어요 ✓' : '시작하기 ›'}</span>
              </a>
            );
          })}
        </section>
      ))}
    </Shell>
  );
}
