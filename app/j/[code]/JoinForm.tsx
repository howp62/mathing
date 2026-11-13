'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { joinClass } from '@/app/actions/student';
import { LogoMark } from '@/components/ui';

export function JoinForm({ code, found, label, range, already }: { code: string; found: boolean; label: string; range: string; already: number | null }) {
  const [studentNo, setStudentNo] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!found) {
    return (
      <main className="center-page"><div className="card-box">
        <div className="biglogo"><LogoMark /></div>
        <h1>입장 코드를 찾지 못했어</h1>
        <p className="lead">&lsquo;{code}&rsquo;로 열린 반이 없어. 칠판의 코드를 다시 확인해 줘.</p>
        <a className="btn block" href="/j">코드 다시 넣기</a>
        <p className="privacy" style={{ textAlign: 'center', marginTop: 14 }}>선생님이세요? 학생 입장 코드가 아니라 <a href="/login">선생님 로그인</a>으로 들어가세요.</p>
      </div></main>
    );
  }
  return (
    <main className="center-page">
      <form className="card-box" onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await joinClass({ code, studentNo, pin });
          if (res.error) setError(res.error); else router.push('/s');
        });
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="biglogo" style={{ margin: '0 auto' }}><LogoMark /></div>
          <h1>mathing</h1>
          <p className="lead" style={{ marginBottom: 6 }}>수학과 나를 잇는 시간</p>
          <p className="muted" style={{ margin: '0 0 18px', fontSize: 14 }}>{label} · 입장 코드 {code}</p>
        </div>
        {already && <p className="note" style={{ marginTop: 0, marginBottom: 14 }}>{already}번으로 이미 들어와 있어. <a href="/s">이어서 하기</a></p>}
        {error && <p className="msg error" role="alert">{error}</p>}
        <div className="field">
          <label htmlFor="sno">학번</label>
          <input id="sno" inputMode="numeric" pattern="\d*" maxLength={5} value={studentNo} onChange={(e) => setStudentNo(e.target.value.replace(/\D/g, ''))} placeholder={`${range.split('~')[0]}`} required autoComplete="off" />
          <small>이 반의 학번은 {range}이야.</small>
        </div>
        <div className="field">
          <label htmlFor="pin">비밀번호 4자리</label>
          <input id="pin" type="password" inputMode="numeric" pattern="\d{4}" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="처음이면 지금 정해" required autoComplete="off" />
          <small>잊어버리면 선생님이 초기화해줄 수 있어.</small>
        </div>
        <p className="privacy">이름은 묻지 않아. 학번은 선생님만 볼 수 있어. <a href="/privacy" target="_blank" rel="noopener">개인정보 처리 안내</a></p>
        <button className="btn block" disabled={pending} style={{ marginTop: 12 }}>{pending ? '확인 중…' : '입장하기'}</button>
      </form>
    </main>
  );
}
