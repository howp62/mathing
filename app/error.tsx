'use client';

import { LogoMark } from '@/components/ui';

/** 서버가 데이터베이스와 잠깐 끊겼을 때 보여주는 화면. 다시 시도 버튼으로 바로 회복할 수 있다. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="center-page">
      <div className="card-box">
        <div className="biglogo"><LogoMark /></div>
        <h1>잠깐 연결이 끊겼어요</h1>
        <p className="lead">서버가 데이터베이스와 연결하는 중에 문제가 생겼어요. 인터넷 연결을 확인하고 다시 시도해 주세요. 쓰던 글은 이 기기에 임시로 저장돼 있어요.</p>
        <button className="btn block" onClick={() => reset()}>다시 시도</button>
        <p className="privacy" style={{ textAlign: 'center' }}><a href="/">처음 화면으로</a></p>
      </div>
    </main>
  );
}
