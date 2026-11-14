import { requireUser } from '@/lib/auth';
import { homeView } from '@/lib/views';
import { Logo, Shell } from '@/components/ui';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await requireUser();
  const { subjects, next, wroteAny } = await homeView(user.id);
  return (
    <Shell tab="units">
      <div className="top"><Logo /><span className="right"><LogoutButton /></span></div>
      <h1>{user.nickname}, 어떤 단원을 시작해?</h1>
      <p className="sub">새 단원을 배우기 전에 5분만 써 보자.</p>

      {/* 다음 단원 추천: 순서대로 하나를 권하고, 아래 목록에서 다른 단원도 고를 수 있다 */}
      <section className="next" aria-label="다음 단원 추천">
        {next ? (
          <>
            <div className="k">{wroteAny ? '순서대로 보면 다음은' : '처음이라면 여기서 시작해'}</div>
            <div className="v">{next.unit}</div>
            <div className="s">{next.subject} · 5~10분</div>
            <a className="go" href={`/u/${next.id}`}>연결 쓰러 가기 ›</a>
            <a className="other" href="#units">다른 단원 고르기 ↓</a>
          </>
        ) : (
          <>
            <div className="k">열린 단원은 다 썼어</div>
            <div className="v">배우고 나서 다시 써 보자</div>
            <div className="s">새 단원은 준비되는 대로 열려.</div>
            <a className="go" href="/notes">내 노트에서 다시 쓰기 ›</a>
          </>
        )}
      </section>

      <div id="units">
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
      </div>
    </Shell>
  );
}
