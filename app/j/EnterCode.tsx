'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark } from '@/components/ui';

export function EnterCode() {
  const [code, setCode] = useState('');
  const router = useRouter();
  return (
    <main className="center-page">
      <form className="card-box" onSubmit={(e) => { e.preventDefault(); const c = code.trim().toUpperCase(); if (c) router.push(`/j/${encodeURIComponent(c)}`); }}>
        <div className="biglogo"><LogoMark /></div>
        <h1>mathing 입장</h1>
        <p className="lead">칠판에 보이는 입장 코드를 넣어 줘. QR을 찍었다면 이 화면은 건너뛰어.</p>
        <div className="field">
          <label htmlFor="code">입장 코드</label>
          <input id="code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={10} autoCapitalize="characters" autoComplete="off" placeholder="예: K7M2Q" style={{ letterSpacing: '.14em', fontWeight: 700 }} required />
        </div>
        <button className="btn block">다음</button>
      </form>
    </main>
  );
}
