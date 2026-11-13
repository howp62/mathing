import { requireTeacher } from '@/lib/auth';
import { getAiSettings, PROVIDERS, DEFAULT_MODELS } from '@/lib/ai';
import { usingLocalDb } from '@/lib/db';
import { AiForm, PasswordForm } from './Forms';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireTeacher();
  const ai = await getAiSettings();
  return (
    <main className="tmain">
      <h1>설정</h1>
      <p className="lead">AI 코치와 계정을 관리해요.</p>
      <div className="stack">
        <section className="panel-card">
          <h2>AI 코치</h2>
          <p className="muted" style={{ marginTop: 0 }}>기본은 꺼져 있어요(비용 0원). 켜면 학생이 막혔을 때 &lsquo;코치에게 물어보기&rsquo;로 질문을 하나씩 받아요. 학생 한 명이 한 수업에서 최대 2번 쓰고, 선생님 키로 쓴 만큼 요금이 나와요.</p>
          <AiForm current={ai} providers={PROVIDERS} defaults={DEFAULT_MODELS} />
        </section>
        <section className="panel-card">
          <h2>비밀번호 바꾸기</h2>
          <PasswordForm />
        </section>
        <section className="panel-card">
          <h2>데이터베이스</h2>
          {usingLocalDb()
            ? <p className="note warn" style={{ marginTop: 0 }}>지금은 이 컴퓨터 안의 연습용 데이터베이스(.data 폴더)를 쓰고 있어요. 실제 수업에 쓰려면 Supabase를 연결하세요. 방법은 docs/SUPABASE-SETUP.md에 있어요.</p>
            : <p className="note" style={{ marginTop: 0 }}>Supabase 데이터베이스에 연결되어 있어요.</p>}
        </section>
      </div>
    </main>
  );
}
