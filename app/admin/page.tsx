import { renderSVG } from 'uqr';
import { currentAdmin, currentAdminPending, hasAdmin, readBackupCodes } from '@/lib/auth';
import { openText } from '@/lib/security';
import { otpauthUri } from '@/lib/totp';
import { q } from '@/lib/db';
import { getSet } from '@/lib/content';
import { withConcepts } from '@/lib/views';
import { Logo } from '@/components/ui';
import { adminLogout } from '@/app/actions/admin';
import { AdminCode, AdminLogin, AdminSetup, AdminTotpSetup, BackupCodes } from './Forms';
import { AdminLogView } from './Log';
import { RowActions, StarButton } from './Actions';
import { Stats } from './Stats';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'mathing 운영자' };

type Row = {
  id: string; unit_id: string; interest: string; answers: string[]; concepts: string[]; free: boolean;
  re_answers: string[] | null; re_concepts: string[] | null; re_free: boolean | null;
  hidden: boolean; hidden_reason: string | null; featured: boolean; nickname: string; blocked: boolean;
};

const text = (r: Row) => (r.re_answers ? withConcepts(r.re_answers, r.re_concepts ?? [], !!r.re_free) : withConcepts(r.answers, r.concepts, r.free)).filter(Boolean).join(' / ');
const unitName = (id: string) => getSet(id)?.unit ?? id;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  if (!(await hasAdmin())) return <div className="narrow"><AdminSetup needsCode={!!process.env.SETUP_CODE} /></div>;
  const admin = await currentAdmin();
  if (!admin) {
    // 비밀번호는 맞았고 2단계를 기다리는 중이면 그 단계 화면
    const pending = await currentAdminPending();
    if (pending?.stage === 'setup') {
      const secret = await openText(pending.totp_secret);
      if (secret) {
        const qr = `data:image/svg+xml;base64,${Buffer.from(renderSVG(otpauthUri(pending.name, secret))).toString('base64')}`;
        return <div className="narrow"><AdminTotpSetup qr={qr} secretKey={secret.match(/.{1,4}/g)!.join(' ')} /></div>;
      }
    }
    if (pending?.stage === 'code') return <div className="narrow"><AdminCode /></div>;
    return <div className="narrow"><AdminLogin /></div>;
  }
  // 새로 만든 예비 코드가 있으면 먼저 보여 준다(적어 두었다고 누를 때까지)
  const backup = await readBackupCodes(admin.id);
  if (backup) return <div className="narrow"><BackupCodes codes={backup} /></div>;
  const asked = (await searchParams).tab;
  const tab = asked === 'featured' || asked === 'stats' || asked === 'log' ? asked : 'reports';

  const reported = await q<Row & { reasons: Record<string, number>; n: number }>(
    `select c.id, c.unit_id, c.interest, c.answers, c.concepts, c.free, c.re_answers, c.re_concepts, c.re_free,
            c.hidden, c.hidden_reason, c.featured, u.nickname, u.blocked,
            (select jsonb_object_agg(reason, cnt) from (select reason, count(*) cnt from reports r where r.connection_id = c.id and not r.dismissed group by reason) x) as reasons,
            (select count(*)::int from reports r where r.connection_id = c.id and not r.dismissed) as n
       from connections c join users u on u.id = c.user_id
      where exists (select 1 from reports r where r.connection_id = c.id and not r.dismissed) or c.hidden or u.blocked
      order by c.hidden desc, n desc, c.updated_at desc limit 100`,
  );
  const recent = tab === 'featured'
    ? await q<Row>(
        `select c.id, c.unit_id, c.interest, c.answers, c.concepts, c.free, c.re_answers, c.re_concepts, c.re_free,
                c.hidden, c.hidden_reason, c.featured, u.nickname, u.blocked
           from connections c join users u on u.id = c.user_id
          where c.share and not c.hidden and not u.blocked
          order by c.featured desc, c.updated_at desc limit 100`,
      )
    : [];

  return (
    <div className="admin-page">
      <div className="admin">
        <div className="bar">
          <Logo /><b>운영자</b>
          <span className="seg">
            <a href="/admin" className={tab === 'reports' ? 'on' : ''}>신고함 {reported.length}</a>
            <a href="/admin?tab=featured" className={tab === 'featured' ? 'on' : ''}>추천 연결</a>
            <a href="/admin?tab=stats" className={tab === 'stats' ? 'on' : ''}>합계</a>
            <a href="/admin?tab=log" className={tab === 'log' ? 'on' : ''}>기록</a>
          </span>
          <form action={adminLogout}><button className="mini">로그아웃</button></form>
        </div>
        <div className="body">
          {tab === 'log' ? <AdminLogView adminId={admin.id} /> : tab === 'stats' ? <Stats /> : tab === 'reports' ? (
            <>
              <p className="muted" style={{ marginTop: 0 }}>숨겨진 글이 맨 위에 와요. 가입한 지 하루 지난 학생 3명이 신고하면 자동으로 숨겨지고, 새 계정의 신고는 여기에만 쌓여요. 운영자는 별명을 볼 수 있지만 비밀번호·복구 코드는 볼 수 없어요.</p>
              {reported.length === 0 ? <p className="muted">신고된 글이 없어요.</p> : (
                <table>
                  <thead><tr><th>글</th><th>신고 이유</th><th>상태</th><th>처리</th></tr></thead>
                  <tbody>
                    {reported.map((r) => (
                      <tr key={r.id}>
                        <td><div className="muted">{unitName(r.unit_id)} · <span className="tag">{r.interest}</span> · 별명 {r.nickname}</div><div className="txt">{text(r)}</div></td>
                        <td>{r.reasons ? Object.entries(r.reasons).map(([k, v]) => <div key={k} style={{ fontSize: 13 }}>{k} {v}</div>) : <span className="muted">없음</span>}</td>
                        <td>{r.blocked ? <span className="pill hide">계정 막힘</span> : r.hidden ? <span className="pill hide">숨김</span> : <span className="pill">보이는 중</span>}</td>
                        <td><RowActions id={r.id} hidden={r.hidden} blocked={r.blocked} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <>
              <p className="muted" style={{ marginTop: 0 }}>★를 달면 그 단원 갤러리 맨 위에 &ldquo;추천 연결&rdquo;로 보여요. 학생이 다시 쓰면 추천이 풀려요.</p>
              {recent.length === 0 ? <p className="muted">공유된 글이 아직 없어요.</p> : (
                <table>
                  <thead><tr><th>글</th><th>추천</th></tr></thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id}>
                        <td><div className="muted">{unitName(r.unit_id)} · <span className="tag">{r.interest}</span></div><div className="txt">{text(r)}</div></td>
                        <td><StarButton id={r.id} featured={r.featured} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
