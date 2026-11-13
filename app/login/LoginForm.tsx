'use client';
import { useActionState } from 'react';
import { login } from '@/app/actions/teacher';
import { LogoMark } from '@/components/ui';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <main className="center-page">
      <form className="card-box" action={action}>
        <div className="biglogo"><LogoMark /></div>
        <h1>선생님 로그인</h1>
        <p className="lead">처음 설정할 때 정한 이름과 비밀번호를 넣어 주세요.</p>
        {state?.error && <p className="msg error" role="alert">{state.error}</p>}
        <div className="field"><label htmlFor="name">로그인 이름</label><input id="name" name="name" required autoComplete="username" /></div>
        <div className="field"><label htmlFor="password">비밀번호</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
        <button className="btn block" disabled={pending}>{pending ? '확인 중…' : '로그인'}</button>
        <p className="privacy" style={{ textAlign: 'center' }}><a href="/">처음 화면으로</a></p>
      </form>
    </main>
  );
}
