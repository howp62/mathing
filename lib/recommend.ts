/**
 * 홈의 "다음 단원" 추천. 데이터베이스나 화면과 떨어진 순수 함수라 따로 확인할 수 있다.
 *
 * - 학생이 가장 최근에 처음 쓴 단원의 다음 칸부터 순서대로, 열렸고 아직 안 쓴 첫 단원을 고른다.
 *   (고2 학생이 대수 단원을 쓰면 다음 추천도 대수로 이어진다)
 * - 뒤에 없으면 맨 앞부터 다시 찾는다. 쓴 글이 없으면 맨 앞부터.
 * - 열린 단원을 모두 썼으면 null.
 * 추천일 뿐이고, 학생은 홈의 단원 목록에서 아무 단원이나 고를 수 있다.
 */
export function nextUnit<T extends { id: string }>(
  order: T[],
  isOpen: (unit: T) => boolean,
  done: ReadonlySet<string>,
  lastWritten: string | null,
): T | null {
  const start = lastWritten ? order.findIndex((u) => u.id === lastWritten) + 1 : 0;
  for (let k = 0; k < order.length; k++) {
    const u = order[(start + k) % order.length];
    if (isOpen(u) && !done.has(u.id)) return u;
  }
  return null;
}

// `node lib/recommend.ts`로 실행하면 규칙을 확인한다(Node 22.18 이상은 타입을 지우고 바로 실행).
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('recommend.ts')) {
  const order = ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'c1', 'c2'].map((id) => ({ id }));
  const open = new Set(['a1', 'a2', 'a3', 'a4', 'c1', 'c2']); // b는 준비 중
  const isOpenUnit = (u: { id: string }) => open.has(u.id);
  const check = (name: string, done: string[], last: string | null, want: string | null) => {
    const got = nextUnit(order, isOpenUnit, new Set(done), last)?.id ?? null;
    console.log(got === want ? '통과' : '실패', name, '→', got);
    if (got !== want) process.exitCode = 1;
  };
  check('처음이면 맨 앞', [], null, 'a1');
  check('첫 단원 다음', ['a1'], 'a1', 'a2');
  check('목록에서 고른 단원 다음', ['a3'], 'a3', 'a4');
  check('준비 중은 건너뜀', ['a4'], 'a4', 'c1');
  check('고2 과목을 쓰면 그 과목으로 이어짐', ['c1'], 'c1', 'c2');
  check('끝까지 갔으면 앞에서 안 쓴 단원', ['c1', 'c2'], 'c2', 'a1');
  check('이미 쓴 단원은 건너뜀', ['a1', 'a2', 'a3'], 'a1', 'a4');
  check('열린 단원을 다 썼으면 없음', ['a1', 'a2', 'a3', 'a4', 'c1', 'c2'], 'a2', null);
  check('지금 목록에 없는 단원이면 맨 앞부터', [], 'zz', 'a1');
}
