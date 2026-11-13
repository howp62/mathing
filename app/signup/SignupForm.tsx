'use client';
import { useActionState, useEffect } from 'react';
import { clearDrafts } from '@/components/LogoutButton';
import { signup } from '@/app/actions/account';
import { RecoveryCode } from '@/components/RecoveryCode';

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  useEffect(clearDrafts, []);
  if (state?.code) return <RecoveryCode code={state.code} title="가입 완료" />;
  return (
    <form action={action}>
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
        <input id="password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="영문과 숫자를 섞어 8자 이상" />
      </div>
      <label className="check"><input type="checkbox" name="age" required /><span>만 14세 이상이에요</span></label>
      <label className="check"><input type="checkbox" name="agree" required /><span><a className="link" href="/privacy" target="_blank" rel="noopener">개인정보 처리방침</a>을 읽고 동의해요</span></label>
      {state?.error && <p className="msg err" role="alert">{state.error}</p>}
      <div className="foot"><button className="btn" disabled={pending}>{pending ? '만드는 중…' : '가입하기'}</button></div>
    </form>
  );
}
