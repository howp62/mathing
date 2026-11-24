'use client';

/** 복구 코드는 이 화면에서 한 번만 보여 준다. 서버에는 섞어서(해시)만 남는다 */
export function RecoveryCode({ code, title }: { code: string; title: string }) {
  return (
    <div>
      <div className="top"><span className="ttl">{title}</span></div>
      <h1>복구 코드를 꼭 저장해 둬</h1>
      <p className="sub">비밀번호를 잊으면 이 코드와 별명으로 다시 정할 수 있어. <b>지금 한 번만</b> 보여 줘.</p>
      <div className="code" aria-label="복구 코드">{code}</div>
      <p className="msg warn">화면을 캡처하거나 공책에 적어 둬. 잃어버리면 비밀번호를 되찾을 수 없어.</p>
      <div className="foot"><a className="btn" href="/home">코드 보관했어, 시작하기</a></div>
    </div>
  );
}
