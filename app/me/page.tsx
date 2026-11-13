import { requireUser } from '@/lib/auth';
import { Shell } from '@/components/ui';
import { MeForms } from './MeForms';

export const dynamic = 'force-dynamic';

export default async function MePage() {
  const user = await requireUser();
  return (
    <Shell tab="me">
      <div className="top"><span className="ttl" style={{ fontSize: 18 }}>내 정보</span></div>
      <div className="card">
        <div className="muted">별명</div>
        <b style={{ fontSize: 17 }}>{user.nickname}</b>
        <p className="muted" style={{ margin: '6px 0 0' }}>다른 학생에게는 보이지 않아.</p>
      </div>
      <h2>관심사와 진로</h2>
      <div className="card">
        <div className="chips">{(user.interests.length ? user.interests : ['아직 안 골랐어']).map((t) => <span key={t} className="chip sm on">{t}</span>)}</div>
        <p className="muted" style={{ margin: '8px 0 0' }}>진로: {user.career_unknown ? '아직 몰라요' : user.career || '안 적음'} · 단원을 시작할 때 바꿀 수 있어</p>
      </div>
      <h2>계정</h2>
      <MeForms nickname={user.nickname} />
      <p className="muted" style={{ marginTop: 24 }}><a className="link" href="/privacy">개인정보 처리방침</a></p>
    </Shell>
  );
}
