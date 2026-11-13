import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { LogoMark, Plain } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Welcome({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  if (await currentUser()) redirect('/home');
  const { deleted } = await searchParams;
  return (
    <Plain>
      <div className="hero">
        <div className="biglogo"><LogoMark /></div>
        <div className="name">mathing</div>
        <div className="slogan">수학과 나를 잇는 시간</div>
        {deleted && <p className="msg ok">계정과 글을 모두 지웠어.</p>}
        <ol>
          <li>새 단원을 시작할 때 열어요 (5~10분)</li>
          <li>내 관심사와 그 단원의 연결을 써요</li>
          <li>다른 학생들의 연결을 이름 없이 둘러봐요</li>
        </ol>
        <a className="btn" href="/signup">처음이에요 · 가입하기</a>
        <a className="btn ghost" href="/login">로그인</a>
        <p className="muted" style={{ marginTop: 18 }}>이름·학교·이메일은 받지 않아요 · <a className="link" href="/privacy">개인정보 처리방침</a></p>
      </div>
    </Plain>
  );
}
