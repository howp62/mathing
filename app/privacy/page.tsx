import type { Metadata } from 'next';
import { Plain } from '@/components/ui';

export const metadata: Metadata = { title: '개인정보 처리방침 · mathing' };

const contact = process.env.PRIVACY_CONTACT || '(운영자 연락 메일을 준비하고 있어요)';
const effective = '2026년 11월 14일';

export default function PrivacyPage() {
  return (
    <Plain>
      <article className="doc">
        <div className="top"><a className="back" href="/" aria-label="처음 화면">‹</a><span className="ttl">개인정보 처리방침</span></div>
        <h1>mathing이 받는 정보</h1>
        <p className="muted">시행일: {effective}</p>
        <p>mathing은 고등학생이 수학 단원과 자기 관심사·진로의 연결을 글로 써 보고, 다른 학생들의 연결을 이름 없이 둘러보는 웹사이트예요. <b>이름, 학교, 학번, 이메일, 전화번호는 받지 않아요.</b></p>

        <h2>1. 받는 정보와 쓰는 곳</h2>
        <table>
          <thead><tr><th>받는 정보</th><th>쓰는 곳</th></tr></thead>
          <tbody>
            <tr><td>별명, 비밀번호(되돌릴 수 없게 섞어서 저장), 복구 코드(섞어서 저장)</td><td>로그인, 비밀번호 되찾기</td></tr>
            <tr><td>관심사, 진로(쓴 경우만)</td><td>관심사에 맞는 예시 보여 주기, 갤러리 순서</td></tr>
            <tr><td>쓴 연결 글, 고른 개념, 공유 여부, 관련성 점수(쓰기 전·후)</td><td>내 연결 노트, 다른 학생과 공유(켠 경우만)</td></tr>
            <tr><td>공감, 신고 기록</td><td>공감 표시, 부적절한 글 숨기기</td></tr>
            <tr><td>인터넷 주소(섞은 값)</td><td>장난 가입·도배 막기. 이틀 안에 지워요</td></tr>
          </tbody>
        </table>
        <p>로그인 상태를 담은 쿠키 하나만 써요. 방문 통계, 광고, 분석용 쿠키는 쓰지 않아요.</p>

        <h2>2. 누가 볼 수 있나요</h2>
        <ul>
          <li>공유를 켠 연결은 이 사이트를 쓰는 학생 누구나 볼 수 있어요. <b>별명은 보이지 않고</b>, 관심사 태그와 글만 보여요.</li>
          <li>운영자는 신고를 처리하려고 글과 별명을 볼 수 있어요. 비밀번호와 복구 코드는 운영자도 볼 수 없어요.</li>
          <li>글에 실명, 학교, 연락처를 쓰지 마세요. 전화번호·이메일·인터넷 주소·SNS 아이디처럼 보이는 글은 저장되지 않아요.</li>
        </ul>

        <h2>3. 맡기는 곳</h2>
        <table>
          <thead><tr><th>맡기는 곳</th><th>하는 일</th><th>위치</th></tr></thead>
          <tbody>
            <tr><td>Supabase</td><td>데이터베이스 저장</td><td>대한민국(서울)</td></tr>
            <tr><td>Vercel</td><td>사이트 실행</td><td>대한민국(서울)</td></tr>
          </tbody>
        </table>
        <p>AI 서비스나 다른 회사로 글을 보내지 않아요.</p>

        <h2>4. 보관 기간과 지우기</h2>
        <ul>
          <li><b>내 정보 → 계정 지우기</b>를 누르면 계정과 글, 공감, 신고가 바로 모두 지워져요.</li>
          <li>1년 동안 로그인하지 않으면 계정과 글을 자동으로 지워요.</li>
          <li>공유를 끄면 다른 학생에게 더는 보이지 않아요.</li>
        </ul>

        <h2>5. 내 권리</h2>
        <p>내가 쓴 글은 내 연결 노트에서 언제든 보고, 고쳐 쓰고, 공유를 끄고, 지울 수 있어요. 그 밖의 요청은 아래 연락처로 보내 주세요.</p>

        <h2>6. 안전하게 지키는 방법</h2>
        <ul>
          <li>모든 연결은 HTTPS로 암호화해요.</li>
          <li>비밀번호와 복구 코드는 되돌릴 수 없게 섞어서(scrypt) 저장하고, 5번 틀리면 잠가요.</li>
          <li>데이터베이스는 이 사이트 서버만 읽고 쓸 수 있게 막았어요(RLS).</li>
          <li>비밀번호를 바꾸거나 로그아웃하면 다른 기기의 로그인도 끊어요.</li>
        </ul>

        <h2>7. 만 14세 미만</h2>
        <p>mathing은 고등학생을 위한 사이트라 만 14세 이상만 가입할 수 있어요.</p>

        <h2>8. 연락처</h2>
        <p>mathing 운영자: {contact}</p>
      </article>
    </Plain>
  );
}
