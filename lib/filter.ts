/**
 * 저장 전에 걸러내기. 공개 갤러리에 개인정보나 욕설이 올라가지 않게 막는다.
 * 완벽하지 않으므로 신고·운영자 숨김과 함께 쓴다. 학생에게 이유를 알려 주고 고치게 한다.
 */

// 평범한 말과 겹치는 낱말(씹다, 새끼손가락, 불이 꺼져, 시바견, 등신대, 한남동 등)은 넣지 않는다.
// 띄어쓰기·기호를 끼워 넣어 피하는 것을 줄이려고, 검사할 때는 공백과 기호를 뺀 글도 함께 본다
const PROFANITY = [
  '시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '씨빨', '병신', 'ㅂㅅ', '븅신', '좆', 'ㅈ같', '존나', 'ㅈㄴ', '개새', 'ㅅㄲ',
  '미친놈', '미친년', '닥쳐', '지랄', 'ㅈㄹ', '느금', '니애미', '애미', '애비', '엠창', '찐따', '장애인같', '틀딱', '김치녀',
  '자살해', '죽여버', 'fuck', 'shit', 'bitch',
];

const RULES: { test: (raw: string, squeezed: string) => boolean; why: string }[] = [
  { test: (r, s) => /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/.test(r) || /01[016789]\d{7,8}/.test(s), why: '전화번호처럼 보이는 부분이 있어요.' },
  { test: (r) => /[\w.+-]+@[\w-]+\.[A-Za-z.]{2,}/.test(r), why: '이메일 주소처럼 보이는 부분이 있어요.' },
  { test: (r) => /https?:\/\/|www\.|\b[\w-]+\.(com|net|kr|co|io|me|gg|ly|org)\b/i.test(r), why: '인터넷 주소는 넣을 수 없어요.' },
  { test: (r) => /(^|[\s(])@[A-Za-z0-9_.]{3,}/.test(r) || /(인스타|카톡|카카오톡|디엠|dm|틱톡|페메)\s*(아이디|id|주소)?\s*[:：]?\s*[A-Za-z0-9_.]{4,}/i.test(r), why: 'SNS 아이디처럼 보이는 부분이 있어요.' },
  { test: (_r, s) => PROFANITY.some((w) => s.includes(w)), why: '고운 말이 아닌 표현이 있어요.' },
];

/** 문제가 없으면 null, 있으면 학생에게 보여 줄 이유 */
export function checkText(text: string): string | null {
  const raw = text.normalize('NFC');
  const squeezed = raw.toLowerCase().replace(/[\s.\-_*~!@#$%^&()+=|\\/,'"`?<>[\]{}:;]+/g, '');
  for (const rule of RULES) if (rule.test(raw, squeezed)) return rule.why;
  return null;
}
