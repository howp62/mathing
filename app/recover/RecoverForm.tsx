'use client';
import { useActionState } from 'react';
import { recover } from '@/app/actions/account';
import { RecoveryCode } from '@/components/RecoveryCode';

export function RecoverForm() {
  const [state, action, pending] = useActionState(recover, undefined);
  if (state?.code) return <RecoveryCode code={state.code} title="비밀번호를 다시 정했어" />;
  return (
    <form action={action}>
      <div className="top"><a className="back" href="/login" aria-label="뒤로">‹</a><span className="ttl">비밀번호 다시 정하기</span></div>
      <h1>복구 코드가 있으면 돼</h1>
      <p className="sub">가입할 때 받은 코드야. 다시 정하면 새 복구 코드를 줄게.</p>
      <div className="field"><label htmlFor="nickname">별명</label><input id="nickname" name="nickname" required autoComplete="username" /></div>
      <div className="field"><label htmlFor="code">복구 코드</label><input id="code" name="code" required autoComplete="off" placeholder="예: K7QM-24WX-9PDA" /></div>
      <div className="field"><label htmlFor="password">새 비밀번호</label><input id="password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="영문과 숫자를 섞어 8자 이상" /></div>
      {state?.error && <p className="msg err" role="alert">{state.error}</p>}
      <p className="muted">복구 코드를 잃어버렸다면 새로 가입해야 해.</p>
      <div className="foot"><button className="btn" disabled={pending}>{pending ? '확인 중…' : '다시 정하기'}</button></div>
    </form>
  );
}
