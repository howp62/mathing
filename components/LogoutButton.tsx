'use client';
import { useState } from 'react';
import { logout } from '@/app/actions/account';

/** 같이 쓰는 기기를 위해, 로그아웃할 때 이 기기에 남은 쓰던 글도 지운다 */
export function clearDrafts() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('mathing-draft-')) localStorage.removeItem(k);
  } catch { /* 저장소를 못 쓰면 지울 것도 없음 */ }
}

export function LogoutButton({ className = 'link', label = '로그아웃' }: { className?: string; label?: string }) {
  const [ask, setAsk] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setAsk(true)} style={className === 'link' ? { fontSize: 14 } : undefined}>{label}</button>
      {ask && (
        <div className="sheet-bg" onClick={() => setAsk(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="로그아웃" onClick={(e) => e.stopPropagation()}>
            <h3>로그아웃할까?</h3>
            <p className="muted">이 기기에 잠깐 보관하던 쓰던 글도 지워져. 다른 기기의 로그인도 함께 끊겨.</p>
            <form action={logout} onSubmit={clearDrafts}><button className="btn">로그아웃</button></form>
            <button type="button" className="btn ghost" onClick={() => setAsk(false)}>취소</button>
          </div>
        </div>
      )}
    </>
  );
}
