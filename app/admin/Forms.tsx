'use client';
import { useActionState } from 'react';
import { adminLogin, setupAdmin } from '@/app/actions/admin';
import { Logo } from '@/components/ui';

export function AdminSetup({ needsCode }: { needsCode: boolean }) {
  const [state, action, pending] = useActionState(setupAdmin, undefined);
  return (
    <form action={action} className="card">
      <Logo />
      <h1>운영자 계정 만들기</h1>
      <p className="sub">한 번만 만들 수 있어요. 신고된 글을 처리하는 데 써요.</p>
      {needsCode && <div className="field"><label htmlFor="setupCode">설정 코드</label><input id="setupCode" name="setupCode" required autoComplete="off" /><small>Vercel 환경 변수(또는 .env.local)에 넣은 SETUP_CODE 값</small></div>}
      <div className="field"><label htmlFor="name">로그인 이름</label><input id="name" name="name" required minLength={2} maxLength={30} autoComplete="username" /></div>
      <div className="field"><label htmlFor="password">비밀번호 (10자 이상)</label><input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" /></div>
      <div className="field"><label htmlFor="confirm">비밀번호 한 번 더</label><input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" /></div>
      {state?.error && <p className="msg err" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? '만드는 중…' : '만들기'}</button>
    </form>
  );
}

export function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, undefined);
  return (
    <form action={action} className="card">
      <Logo />
      <h1>운영자 로그인</h1>
      <div className="field"><label htmlFor="name">로그인 이름</label><input id="name" name="name" required autoComplete="username" /></div>
      <div className="field"><label htmlFor="password">비밀번호</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
      {state?.error && <p className="msg err" role="alert">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? '확인 중…' : '로그인'}</button>
    </form>
  );
}
