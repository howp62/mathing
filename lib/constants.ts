export const INTERESTS = [
  '게임', '음악', '스포츠', '패션·뷰티', '요리', '영상·SNS', '그림·디자인', '동물',
  '여행', '자동차', '건강·의학', '환경', '컴퓨터·AI', '건축', '공연·아이돌',
] as const;

export const STAGES = ['lobby', 'intro', 'write', 'gallery'] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABELS: Record<Stage, string> = { lobby: '수업 열기', intro: '도입', write: '쓰기', gallery: '갤러리' };

export const STEP_LABELS = ['장면', '계산·비교·예측', '닮은 개념'] as const;
export const STEP_QUESTIONS = [
  { label: '1단계 · 장면', q: '어떤 장면을 떠올렸어?', sub: '네 관심사에서 떠오르는 순간이면 뭐든 좋아.', ph: '예: 게임에서 레벨이 오를수록 다음 레벨까지 필요한 경험치가 확 늘어나는 장면' },
  { label: '2단계 · 계산·비교·예측', q: '그 장면에서 무엇을 계산하거나, 비교하거나, 예측해?', sub: '정확한 숫자가 아니어도 괜찮아.', ph: '예: 레벨이 하나 오를 때마다 경험치가 얼마나 더 필요해지는지' },
  { label: '3단계 · 닮은 개념', q: '그게 이 단원의 어떤 개념이랑 닮았어?', sub: '골라도 되고, 직접 써도 돼.', ph: '예: 레벨 n을 넣으면 경험치가 나오는 식이라서' },
] as const;

export const RATING_LABELS = ['막연함', '구체적', '자기 삶'] as const;
export const MAX_DISPLAYED = 3;
export const COACH_LIMIT = 2;
export const MAX_ANSWER = 600;

export type ExampleCard = {
  id: string;
  tags: string[];
  illus: string | null;
  svg?: string | null;
  title: string;
  body: string;
  formula: string;
  concept: string;
};

export type ContentSet = {
  id: string;
  subject: string;
  unit: string;
  order: number;
  status: 'draft' | 'reviewed';
  topics: string[];
  concepts: string[];
  thinkCards: string[];
  examples: ExampleCard[];
};

export type PostView = {
  id: string;
  interest: string;
  answers: string[];
  free: boolean;
  liked?: boolean;
  mine?: boolean;
};

/** 받침에 따라 조사를 붙인다. josa('다항식', '과/와') → '다항식과', josa('경우의 수', '과/와') → '경우의 수와' */
export function josa(word: string, pair: '과/와' | '이/가' | '은/는' | '을/를') {
  const code = word.charCodeAt(word.length - 1);
  const hasFinal = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  const [withFinal, without] = pair.split('/');
  return word + (hasFinal ? withFinal : without);
}
