'use client';
import { useActionState, useEffect, useRef } from 'react';
import { clearDrafts } from '@/components/LogoutButton';
import { signup } from '@/app/actions/account';
import { RecoveryCode } from '@/components/RecoveryCode';

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const password = useRef<HTMLInputElement>(null);
  useEffect(clearDrafts, []);
  useEffect(() => {
    if (state?.error && password.current) password.current.value = '';
  }, [state]);
  if (state?.code) return <RecoveryCode code={state.code} title="가입 완료" />;
  return (
    // React는 서버 동작이 끝나면 양식을 초기화한다. 오류 때 별명과 동의는 남기고 비밀번호만 위에서 비운다.
    <form action={action} onReset={(event) => event.preventDefault()}>
      <div className="top"><a className="back" href="/" aria-label="뒤로">‹</a><span className="ttl">가입하기</span></div>
      <h1>별명과 비밀번호만 있으면 돼</h1>
      <p className="sub">친구들에게는 별명도 보이지 않아. 로그인할 때만 써.</p>
      <div className="field">
        <label htmlFor="nickname">별명</label>
        <input id="nickname" name="nickname" required minLength={2} maxLength={12} autoComplete="username" placeholder="예: 수학하는고양이" />
        <small>2~12자, 한글·영문·숫자·밑줄(_). 실명이나 학교 이름은 쓰지 마.</small>
      </div>
      <div className="field">
        <label htmlFor="password">비밀번호</label>
        <input ref={password} id="password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="영문과 숫자를 섞어 8자 이상" />
      </div>
      <label className="check"><input type="checkbox" name="age" required /><span>만 14세 이상이에요</span></label>
      <label className="check"><input type="checkbox" name="agree" required /><span><a className="link" href="/privacy" target="_blank" rel="noopener">개인정보 처리방침</a>을 읽고 동의해요</span></label>
      {state?.error && <p className="msg err" role="alert">{state.error}</p>}
      <div className="foot"><button className="btn" disabled={pending}>{pending ? '만드는 중…' : '가입하기'}</button></div>
    </form>
  );
}
