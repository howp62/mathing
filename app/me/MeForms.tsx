'use client';
import { useActionState, useState } from 'react';
import { changePassword, deleteAccount } from '@/app/actions/account';
import { LogoutButton, clearDrafts } from '@/components/LogoutButton';

export function MeForms({ nickname }: { nickname: string }) {
  const [pwState, pwAction, pwPending] = useActionState(changePassword, undefined);
  const [delState, delAction, delPending] = useActionState(deleteAccount, undefined);
  const [openPw, setOpenPw] = useState(false);
  const [confirm, setConfirm] = useState('');
  return (
    <>
      {!openPw ? <button type="button" className="btn ghost" onClick={() => setOpenPw(true)}>비밀번호 바꾸기</button> : (
        <form action={pwAction} className="card" style={{ marginBottom: 10 }}>
          <div className="field"><label htmlFor="current">지금 비밀번호</label><input id="current" name="current" type="password" required autoComplete="current-password" /></div>
          <div className="field"><label htmlFor="next">새 비밀번호</label><input id="next" name="next" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="영문과 숫자를 섞어 8자 이상" /></div>
          {pwState?.error && <p className="msg err" role="alert">{pwState.error}</p>}
          {pwState?.ok && <p className="msg ok" role="status">{pwState.ok}</p>}
          <button className="btn" disabled={pwPending}>{pwPending ? '바꾸는 중…' : '바꾸기'}</button>
          <p className="muted" style={{ marginBottom: 0 }}>바꾸면 다른 기기의 로그인은 모두 끊겨.</p>
        </form>
      )}
      <div style={{ height: 10 }} />
      <LogoutButton className="btn ghost" />
      <p className="muted" style={{ margin: '10px 0' }}>같이 쓰는 기기(학교 크롬북 등)에서는 쓰고 나서 꼭 로그아웃해 줘.</p>

      <form action={delAction} onSubmit={clearDrafts} style={{ marginTop: 28 }}>
        <h2 style={{ color: 'var(--danger)' }}>계정 지우기</h2>
        <p className="muted">계정과 지금까지 쓴 연결, 공감, 신고가 모두 지워져. 되돌릴 수 없어.</p>
        <div className="field"><input name="confirm" aria-label="확인을 위해 별명 입력" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="확인을 위해 별명을 입력해 줘" autoComplete="off" /></div>
        {delState?.error && <p className="msg err" role="alert">{delState.error}</p>}
        <button className="btn danger" disabled={confirm !== nickname || delPending}>{delPending ? '지우는 중…' : '계정과 글 모두 지우기'}</button>
      </form>
      <div style={{ height: 24 }} />
    </>
  );
}
