'use client';
import { useActionState } from 'react';
import { setupAdmin } from '@/app/actions/teacher';
import { LogoMark } from '@/components/ui';

export function SetupForm({ needsCode, localDb }: { needsCode: boolean; localDb: boolean }) {
  const [state, action, pending] = useActionState(setupAdmin, undefined);
  return (
    <main className="center-page">
      <form className="card-box" action={action}>
        <div className="biglogo"><LogoMark /></div>
        <h1>mathing 처음 설정</h1>
        <p className="lead">이 사이트를 관리할 선생님 계정을 만들어요. 한 번만 하면 돼요.</p>
        {state?.error && <p className="msg error" role="alert">{state.error}</p>}
        {needsCode && (
          <div className="field"><label htmlFor="setupCode">설정 코드</label><input id="setupCode" name="setupCode" required autoComplete="off" /><small>배포 설정(Vercel 환경 변수)이나 .env.local에 넣은 SETUP_CODE 값이에요. 학생 입장 코드와는 다른 코드예요.</small></div>
        )}
        <div className="field"><label htmlFor="name">로그인 이름</label><input id="name" name="name" required minLength={2} maxLength={30} autoComplete="username" placeholder="예: 김수학" /></div>
        <div className="field"><label htmlFor="password">비밀번호 (8자 이상)</label><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" /></div>
        <div className="field"><label htmlFor="confirm">비밀번호 한 번 더</label><input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" /></div>
        <button className="btn block" disabled={pending}>{pending ? '만드는 중…' : '계정 만들기'}</button>
        {localDb && <p className="note">지금은 이 컴퓨터 안의 연습용 데이터베이스를 쓰고 있어요. Supabase를 연결하면 실제 수업용으로 바뀌어요.</p>}
      </form>
    </main>
  );
}
