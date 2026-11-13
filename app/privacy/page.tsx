import type { Metadata } from 'next';
import { Logo } from '@/components/ui';

export const metadata: Metadata = { title: '개인정보 처리방침 · mathing' };

// 각 교사가 자기 사이트를 운영하므로, 운영자 정보는 배포 설정(환경 변수)에서 넣는다.
const operator = process.env.PRIVACY_OPERATOR || '이 사이트를 운영하는 수학 선생님';
const contact = process.env.PRIVACY_CONTACT || '수업 시간이나 학교 안내 방법으로 담당 선생님께 직접 연락';
const dbLocation = process.env.PRIVACY_DB_LOCATION || '대한민국(서울)';
const effective = '2026년 11월 13일';

export default function PrivacyPage() {
  return (
    <main className="doc">
      <p><Logo href="/" /></p>
      <h1>개인정보 처리방침</h1>
      <p className="muted">시행일: {effective}</p>
      <p>
        mathing은 고등학생이 수학 단원과 자기 관심사·진로의 연결을 글로 써 보는 수업 활동 도구예요.
        이 사이트는 <b>{operator}</b>이(가) 수업을 위해 운영하며, 학생 이름은 받지 않아요.
      </p>

      <h2>1. 모으는 정보와 쓰는 곳</h2>
      <table className="table">
        <thead><tr><th>누구</th><th>모으는 정보</th><th>쓰는 곳</th></tr></thead>
        <tbody>
          <tr><td>학생</td><td>학번, 4자리 비밀번호(되돌릴 수 없게 섞어서 저장), 고른 관심사, 진로(쓴 경우만)</td><td>수업 입장, 관심사에 맞는 예시 보여주기</td></tr>
          <tr><td>학생</td><td>수업에서 쓴 연결 글, 고른 개념, 공유·예시 동의 여부, 관련성 한 문항 답, 공감 기록</td><td>수업 활동, 반 갤러리(이름 없이), 교사의 수업 기록·세특 근거</td></tr>
          <tr><td>교사</td><td>로그인 이름, 비밀번호(섞어서 저장), AI 키(켠 경우, 암호화해 저장)</td><td>사이트 관리</td></tr>
        </tbody>
      </table>
      <p>사이트가 제대로 돌아가도록 로그인 상태를 담은 쿠키를 써요. 광고나 방문 분석용 쿠키는 쓰지 않아요.</p>

      <h2>2. 누가 볼 수 있나요</h2>
      <ul>
        <li><b>학번과 글을 함께 볼 수 있는 사람은 담당 선생님뿐</b>이에요.</li>
        <li>같은 반 친구들은 공유에 동의한 글만, 이름과 학번 없이 볼 수 있어요.</li>
        <li>전자칠판에는 선생님이 고른 글만 이름 없이 떠요. 학번은 칠판으로 보내지 않아요.</li>
        <li>다른 반·다음 해·다른 학교의 예시로 쓰는 것은 학생이 따로 동의하고 선생님이 고른 글만, 이름 없이 써요.</li>
      </ul>

      <h2>3. 맡기는 곳과 국외 이전</h2>
      <table className="table">
        <thead><tr><th>맡기는 곳</th><th>하는 일</th><th>위치</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>데이터베이스 저장</td><td>{dbLocation} 서버</td></tr>
          <tr><td>Vercel</td><td>사이트 실행</td><td>대한민국(서울) 서버에서 실행</td></tr>
          <tr><td>AI 회사(Anthropic, OpenAI, Google 중 선생님이 고른 곳)</td><td>AI 코치 질문 만들기 — <b>선생님이 AI 코치를 켠 경우에만</b></td><td>미국 등 국외</td></tr>
        </tbody>
      </table>
      <p>
        AI 코치를 켜면, 학생이 &lsquo;코치에게 물어보기&rsquo;를 누를 때 <b>단원 이름, 관심사, 그때 쓰던 글만</b> AI 회사로 보내요.
        학번·비밀번호·반 정보는 보내지 않아요. AI 코치를 끄면 아무것도 보내지 않아요. 지금 켜져 있는지는 선생님께 물어보세요.
      </p>

      <h2>4. 보관 기간과 파기</h2>
      <p>
        학년도가 끝나면 선생님이 기록을 엑셀로 내보내 학교 규정에 따라 보관하고, 사이트의 학생 기록은 지워요.
        예시로 쓰기로 한 글은 이름·학번 없이 남을 수 있어요. 사이트 안의 일괄 삭제 기능은 준비 중이라, 그 전까지는 선생님이 데이터베이스에서 직접 지워요.
      </p>

      <h2>5. 학생의 권리</h2>
      <p>
        내가 쓴 글과 관심사는 &lsquo;내 연결 노트&rsquo;에서 볼 수 있어요. 고치거나 지워 달라고 하거나, 처리를 멈춰 달라고 할 수 있어요.
        요청은 담당 선생님께 하면 돼요. 비밀번호를 잊으면 선생님이 임시 비밀번호로 바꿔 줘요.
      </p>

      <h2>6. 안전하게 지키는 방법</h2>
      <ul>
        <li>모든 연결은 HTTPS로 암호화해요.</li>
        <li>비밀번호는 되돌릴 수 없게 섞어서(scrypt) 저장하고, 5번 틀리면 잠가요.</li>
        <li>데이터베이스는 이 사이트 서버만 읽고 쓸 수 있게 막았어요(RLS).</li>
        <li>교사가 넣은 AI 키는 암호화해 저장해요.</li>
        <li>비밀번호를 바꾸거나 초기화하면 다른 기기의 로그인을 모두 끊어요.</li>
      </ul>

      <h2>7. 만 14세 미만</h2>
      <p>이 사이트는 고등학생 수업용이에요. 만 14세 미만 학생이 쓰는 경우에는 학교가 법정대리인의 동의를 받아야 해요.</p>

      <h2>8. 개인정보 보호 담당</h2>
      <p>운영: {operator}<br />연락: {contact}</p>
      <p className="muted">
        이 방침은 mathing 오픈소스가 제공하는 기본 문서예요. 학교마다 개인정보 처리 절차가 다르니,
        수업에 쓰기 전에 학교 개인정보 담당자와 확인해 주세요.
      </p>
    </main>
  );
}
