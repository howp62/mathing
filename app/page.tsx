import type { Viewport } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { Logo } from '@/components/ui';
import { LandingIntro } from '@/components/LandingIntro';

export const dynamic = 'force-dynamic';
export const viewport: Viewport = { themeColor: '#FAF7F0' };

// 관심사(벽돌색 점)와 수학 개념(남색 점)이 이어지는 그림.
const INTERESTS = [
  { l: '게임', x: 58, y: 64, lx: 34, ly: 46 }, { l: '음악', x: 292, y: 48, lx: 278, ly: 30 },
  { l: '축구', x: 320, y: 168, lx: 306, ly: 150 }, { l: '요리', x: 46, y: 196, lx: 18, ly: 222 },
  { l: '사진', x: 160, y: 272, lx: 120, ly: 290 },
];
const CONCEPTS = [
  { l: '함수', x: 176, y: 112, lx: 188, ly: 104 }, { l: '확률', x: 250, y: 232, lx: 262, ly: 236 },
  { l: '방정식', x: 116, y: 238, lx: 72, ly: 262 }, { l: '행렬', x: 206, y: 176, lx: 218, ly: 172 },
];
const LINKS: [number, number][] = [[0, 0], [1, 0], [2, 1], [3, 2], [4, 3], [0, 3]];

function Network() {
  return (
    <svg className="net" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g className="lines">
        {LINKS.map(([i, c]) => <line key={`${i}-${c}`} x1={INTERESTS[i].x} y1={INTERESTS[i].y} x2={CONCEPTS[c].x} y2={CONCEPTS[c].y} />)}
      </g>
      <g className="dots">
        {INTERESTS.map((n) => <circle key={n.l} className="i" cx={n.x} cy={n.y} r="5.5" />)}
        {CONCEPTS.map((n) => <circle key={n.l} className="c" cx={n.x} cy={n.y} r="6.5" />)}
      </g>
      <g>
        {INTERESTS.map((n) => <text key={n.l} x={n.lx} y={n.ly}>{n.l}</text>)}
        {CONCEPTS.map((n) => <text key={n.l} className="c" x={n.lx} y={n.ly}>{n.l}</text>)}
      </g>
    </svg>
  );
}

export default async function Welcome({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  if (await currentUser()) redirect('/home');
  const { deleted } = await searchParams;
  return (
    <main className="landing">
      <div className="landing-in">
        <Logo />
        <div className="kicker">새 단원 시작 전 5분</div>
        <h1>수학과<br /><em>나를</em> 잇는 시간</h1>
        <p className="lead">내 관심사와 이번 단원이 어떻게 이어지는지 써 보고, 다른 학생들의 연결을 이름 없이 둘러봐요.</p>
        <LandingIntro><Network /></LandingIntro>
        <div className="landing-actions" id="landing-actions">
          {deleted && <p className="msg ok">계정과 글을 모두 지웠어.</p>}
          <a id="landing-signup" className="cta" href="/signup">가입하고 시작하기</a>
          <p className="login">이미 계정이 있어요</p>
          <a id="landing-login" className="cta cta-secondary" href="/login">로그인</a>
          <p className="tiny">이름·학교·이메일은 받지 않아요 · <a href="/privacy">개인정보 처리방침</a></p>
        </div>
      </div>
    </main>
  );
}
