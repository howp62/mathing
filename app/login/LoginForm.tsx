'use client';
import { useActionState, useEffect } from 'react';
import { clearDrafts } from '@/components/LogoutButton';
import { login } from '@/app/actions/account';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  // 같은 기기를 앞 사람이 로그아웃 없이 떠났을 수 있으니, 남은 쓰던 글을 지운다
  useEffect(clearDrafts, []);
  return (
    <form action={action}>
      <div className="top"><a className="back" href="/" aria-label="뒤로">‹</a><span className="ttl">로그인</span></div>
      <h1>다시 왔구나!</h1>
      <div className="field"><label htmlFor="nickname">별명</label><input id="nickname" name="nickname" required autoComplete="username" /></div>
      <div className="field"><label htmlFor="password">비밀번호</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
      {state?.error && <p className="msg err" role="alert">{state.error}</p>}
      <p className="muted">5번 틀리면 10분 동안 잠겨. <a className="link" href="/recover">비밀번호를 잊었어</a></p>
      <div className="foot"><button className="btn" disabled={pending}>{pending ? '확인 중…' : '로그인'}</button></div>
    </form>
  );
}
