import { one } from '@/lib/db';
import { getSet } from '@/lib/content';
import { ADMIN_ACTIONS, recentAdminLog, type AdminAction, type AdminLogRow } from '@/lib/adminlog';
import { RegenerateBackupForm, RelinkForm } from './Forms';

const when = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
const label = (a: string) => ADMIN_ACTIONS[a as AdminAction] ?? a;

function target(r: AdminLogRow) {
  if (r.target_connection) return r.unit_id ? `${getSet(r.unit_id)?.unit ?? r.unit_id} · ${r.nickname ?? ''}` : '지워진 글';
  if (r.target_user) return r.nickname ?? '지워진 계정';
  return '—';
}

/** 운영자 "기록" 탭: 2단계 인증 상태와 최근 활동 기록 */
export async function AdminLogView({ adminId }: { adminId: string }) {
  const sec = await one<{ on_at: Date | null; remaining: number }>(
    'select totp_on_at as on_at, jsonb_array_length(backup_hashes)::int as remaining from admins where id = $1',
    [adminId],
  );
  const rows = await recentAdminLog(200);
  return (
    <>
      <section className="sec" aria-label="2단계 인증">
        <div>
          <b>2단계 인증 켜짐</b>
          <span className="muted"> · {sec?.on_at ? `${when.format(sec.on_at)}에 켬` : ''} · 남은 예비 코드 {sec?.remaining ?? 0}개</span>
          {(sec?.remaining ?? 0) <= 3 && <p className="msg warn" style={{ margin: '8px 0 0' }}>예비 코드가 얼마 안 남았어요. 다시 만들어 두세요.</p>}
        </div>
        <RegenerateBackupForm />
        <RelinkForm />
        <p className="muted" style={{ margin: 0 }}>휴대폰을 바꿨으면 &lsquo;인증 앱 다시 연결&rsquo;을 눌러요. 휴대폰과 예비 코드를 모두 잃었다면 저장소 README의 &lsquo;2단계 초기화&rsquo;를 보세요.</p>
      </section>
      <p className="muted" style={{ marginTop: 0 }}>운영자 로그인·로그아웃과 숨기기·막기·추천을 최근 200개까지 보여 줘요. 2년 지나면 지워져요. 접속지는 그때의 인터넷 주소예요.</p>
      {rows.length === 0 ? <p className="muted">기록이 아직 없어요.</p> : (
        <table>
          <thead><tr><th>시각(한국)</th><th>한 일</th><th>대상</th><th>접속지</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="nowrap">{when.format(r.at)}</td>
                <td>{r.action.endsWith('-fail') ? <span className="pill hide">{label(r.action)}</span> : label(r.action)}</td>
                <td>{target(r)}</td>
                <td className="nowrap muted">{r.ip ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
