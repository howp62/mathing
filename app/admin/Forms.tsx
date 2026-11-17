'use client';
import { useActionState } from 'react';
import { adminLogin, cancelAdminPending, dismissBackupCodes, regenerateBackupCodes, relinkTotp, setupAdmin, verifyAdminCode } from '@/app/actions/admin';
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

/** 2단계 처음 연결: QR(또는 키)을 인증 앱에 넣고 지금 6자리로 확인 */
export function AdminTotpSetup({ qr, secretKey }: { qr: string; secretKey: string }) {
  const [state, action, pending] = useActionState(verifyAdminCode, undefined);
  return (
    <div className="card">
      <Logo />
      <h1>인증 앱 연결하기</h1>
      <p className="sub">운영자 화면은 비밀번호 다음에 휴대폰 인증 앱의 6자리를 한 번 더 확인해요. 처음 한 번만 연결하면 돼요.</p>
      <ol className="steps-list">
        <li>휴대폰 인증 앱(구글 OTP, 아이폰 &lsquo;암호&rsquo; 앱 등)에서 <b>QR 코드 스캔</b>을 고르고 아래 QR을 찍어요.</li>
        <li>찍을 수 없으면 &lsquo;설정 키 입력&rsquo;으로 아래 키를 넣어요.</li>
        <li>앱에 생긴 <b>mathing</b>의 6자리를 넣으면 끝이에요.</li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="qr" src={qr} alt="인증 앱 연결용 QR 코드" width={208} height={208} />
      <div className="secret-key" aria-label="설정 키">{secretKey}</div>
      <form action={action} style={{ marginTop: 16 }}>
        <div className="field"><label htmlFor="code">인증 앱의 6자리</label><input id="code" name="code" className="code-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} required /></div>
        {state?.error && <p className="msg err" role="alert">{state.error}</p>}
        <button className="btn" disabled={pending}>{pending ? '확인 중…' : '연결하고 들어가기'}</button>
      </form>
      <form action={cancelAdminPending}><button className="linkbtn">그만두기</button></form>
    </div>
  );
}

/** 2단계: 인증 앱 6자리 또는 예비 코드 */
export function AdminCode() {
  const [state, action, pending] = useActionState(verifyAdminCode, undefined);
  return (
    <div className="card">
      <Logo />
      <h1>2단계 확인</h1>
      <p className="sub">휴대폰 인증 앱의 <b>mathing</b> 6자리를 넣어 주세요. 휴대폰이 없으면 예비 코드(XXXX-XXXX-XXXX)를 넣어도 돼요.</p>
      <form action={action}>
        <div className="field"><label htmlFor="code">6자리 또는 예비 코드</label><input id="code" name="code" className="code-input" autoComplete="one-time-code" maxLength={16} required autoFocus /></div>
        {state?.error && <p className="msg err" role="alert">{state.error}</p>}
        <button className="btn" disabled={pending}>{pending ? '확인 중…' : '확인'}</button>
      </form>
      <form action={cancelAdminPending}><button className="linkbtn">처음으로</button></form>
    </div>
  );
}

/** 새 예비 코드: 이 화면에서만 보인다 */
export function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="card">
      <Logo />
      <h1>예비 코드 {codes.length}개</h1>
      <p className="sub">휴대폰을 잃거나 바꿨을 때 6자리 대신 넣는 코드예요. <b>하나씩 한 번만</b> 쓸 수 있어요. 종이에 적거나 안전한 곳에 저장해 두세요. 이 화면을 닫으면 다시 볼 수 없어요.</p>
      <ul className="backup-list">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
      <form action={dismissBackupCodes}><button className="btn">적어 두었어요</button></form>
    </div>
  );
}

/** 예비 코드 다시 만들기(지금 6자리 필요) */
export function RegenerateBackupForm() {
  const [state, action, pending] = useActionState(regenerateBackupCodes, undefined);
  return (
    <form action={action}>
      <label htmlFor="regen-code" className="sr">인증 앱의 6자리</label>
      <input id="regen-code" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="지금 6자리" maxLength={7} required />
      <button className="mini" disabled={pending}>{pending ? '만드는 중…' : '예비 코드 다시 만들기'}</button>
      {state?.error && <p className="msg err" role="alert" style={{ width: '100%' }}>{state.error}</p>}
    </form>
  );
}

/** 인증 앱 다시 연결(휴대폰을 바꾸거나 잃었을 때). 비밀번호 확인 */
export function RelinkForm() {
  const [state, action, pending] = useActionState(relinkTotp, undefined);
  return (
    <form action={action} onSubmit={(e) => { if (!confirm('2단계 인증을 껐다가 새 휴대폰으로 다시 연결해요. 지금 로그인과 예전 예비 코드는 모두 못 쓰게 돼요. 계속할까요?')) e.preventDefault(); }}>
      <label htmlFor="relink-pw" className="sr">운영자 비밀번호</label>
      <input id="relink-pw" name="password" type="password" autoComplete="current-password" placeholder="운영자 비밀번호" required />
      <button className="mini" disabled={pending}>{pending ? '확인 중…' : '인증 앱 다시 연결'}</button>
      {state?.error && <p className="msg err" role="alert" style={{ width: '100%' }}>{state.error}</p>}
    </form>
  );
}
