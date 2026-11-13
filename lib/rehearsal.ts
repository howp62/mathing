import 'server-only';
import { one, q } from './db';
import { usingLocalDb } from './db';

/**
 * 리허설용 가상 학생. 내 컴퓨터의 연습용 데이터베이스에서 개발 서버로 켰을 때만 쓸 수 있다.
 * 실제 수업(Supabase 연결)이나 배포된 사이트에서는 아무것도 하지 않는다.
 */
export function rehearsalAllowed() {
  return process.env.NODE_ENV === 'development' && usingLocalDb();
}

const POOL: { i: string; a: [string, string, string]; sc: boolean; se: boolean }[] = [
  { i: '게임', a: ['레벨이 오를수록 다음 레벨까지 필요한 경험치가 확 늘어나는 장면', '레벨이 하나 오를 때마다 필요한 경험치가 얼마나 빨리 커지는지', '레벨 n을 넣으면 경험치가 나오는 다항식의 값. 차수가 높으면 더 빨리 커져'], sc: true, se: true },
  { i: '요리', a: ['엄마랑 케이크 만들 때 틀을 한 치수 큰 걸로 바꾼 장면', '틀 반지름이 2cm 커지면 반죽이 얼마나 더 필요한지', '(r+2)²을 펼치는 거랑 닮았어. 생각보다 훨씬 많이 필요해'], sc: true, se: true },
  { i: '스포츠', a: ['농구 자유투에서 공이 올라갔다가 내려오는 장면', '몇 초 뒤에 공이 림 높이에 오는지', '시간을 대입하면 높이가 나와. 나머지정리에서 P(a)를 구하는 거랑 같아'], sc: true, se: true },
  { i: '영상·SNS', a: ['썸네일 만들 때 사진 앱 커브로 어두운 부분만 밝히는 장면', '어느 밝기를 얼마나 올릴지', '커브가 3차 다항식 조각이라는 게 신기해'], sc: true, se: false },
  { i: '공연·아이돌', a: ['친구들이랑 콘서트 굿즈를 나눠서 사는 장면', '응원봉 a개, 포토카드 b세트 묶음 가격 비교', '같은 종류끼리 묶어서 더하는 거라 동류항 정리랑 닮았어'], sc: true, se: true },
  { i: '건축', a: ['내 방 벽지를 새로 바르는 장면', '벽 넓이에서 창문 넓이를 빼는 계산', '(x+3)(x+2)에서 창문 넓이를 빼는 다항식의 곱셈과 뺄셈'], sc: true, se: true },
  { i: '동물', a: ['강아지 몸무게에 따라 사료 양을 정하는 장면', '몸무게가 늘면 사료가 얼마나 늘어나는지', '식에 값을 넣는 거? 아직 잘 모르겠어'], sc: true, se: false },
  { i: '컴퓨터·AI', a: ['파일 받다가 "파일이 손상되었습니다"가 뜬 장면', '받은 파일이 원래 파일과 똑같은지 검사', '나눠서 나머지가 맞는지 보는 것. 다항식의 나눗셈!'], sc: true, se: true },
  { i: '패션·뷰티', a: ['옷 패턴 종이에 소매 곡선을 그리는 장면', '곡선이 얼마나 둥글어야 팔이 편한지', '곡선을 식으로 나타내는 것. 3차 다항식일까?'], sc: true, se: true },
  { i: '일상', a: ['편의점에서 1+1 행사 고르는 장면', '어느 쪽이 더 이득인지', '다항식의 덧셈?'], sc: true, se: false },
  { i: '자동차', a: ['내비게이션이 급커브 경고를 하는 장면', '앞으로 길이 얼마나 휘는지', '곡선을 ax²+bx+c로 나타내고 계수를 보는 것'], sc: true, se: true },
  { i: '음악', a: ['밴드부에서 기타 디스토션 페달을 밟는 장면', '소리를 얼마나 찌그러뜨릴지', '소리 신호를 다항식에 넣는다니. 다항식의 값'], sc: true, se: true },
  { i: '환경', a: ['학교 텃밭에 빗물통을 놓는 장면', '통을 키우면 빗물이 얼마나 더 모이는지', '가로·세로·높이를 모두 1씩 늘린 부피 식을 전개하는 것'], sc: true, se: false },
  { i: '건강·의학', a: ['보건실에서 키와 몸무게를 재는 장면', '작년보다 얼마나 자랐는지 비교', '빼서 비교하는 거라 다항식의 뺄셈이랑 비슷해'], sc: false, se: false },
  { i: '여행', a: ['여행 경비를 친구들이랑 나누는 장면', '사람 수가 바뀌면 1인당 얼마인지', '식에 값 넣기'], sc: false, se: false },
  { i: '게임', a: ['랭크 점수가 오르는 장면', '다음 티어까지 남은 점수', '뺄셈'], sc: false, se: false },
];

export async function seedRehearsal(activityId: string, classId: string) {
  const cls = await one<{ student_from: number; student_to: number }>('select student_from, student_to from classes where id = $1', [classId]);
  if (!cls) return 0;
  const seats: number[] = [];
  for (let no = cls.student_from; no <= cls.student_to; no++) seats.push(no);
  // 15번은 선생님이 직접 학생으로 들어와 볼 수 있게 비워 두고, 두 명은 결석으로 둔다
  const absent = new Set([seats[6], seats[21], seats[14]]);
  const pool = seats.filter((n) => !absent.has(n));
  let added = 0;
  for (let k = 0; k < pool.length; k++) {
    const no = pool[k];
    const st = await one<{ id: string }>(
      `insert into students (class_id, student_no, interests) values ($1, $2, $3::text::jsonb)
       on conflict (class_id, student_no) do update set student_no = excluded.student_no returning id`,
      [classId, no, JSON.stringify([POOL[k % POOL.length].i])],
    );
    if (!st) continue;
    const already = await one('select 1 from submissions where activity_id = $1 and student_id = $2', [activityId, st.id]);
    if (already) continue;
    if (k < POOL.length) {
      const p = POOL[k];
      await q(
        `insert into submissions (activity_id, student_id, interest, answers, free, share_class, share_example, relevance)
         values ($1, $2, $3, $4::text::jsonb, false, $5, $6, $7) on conflict do nothing`,
        [activityId, st.id, p.i, JSON.stringify(p.a), p.sc, p.se, 2 + (k % 4)],
      );
      await q(`insert into presence (activity_id, student_id, state) values ($1, $2, 'submitted') on conflict (activity_id, student_id) do update set state = 'submitted'`, [activityId, st.id]);
      added++;
    } else {
      await q(`insert into presence (activity_id, student_id, state) values ($1, $2, $3) on conflict (activity_id, student_id) do nothing`, [activityId, st.id, k % 2 ? 'writing' : 'joined']);
    }
  }
  // 몇몇 글에 공감
  const shared = await q<{ id: string; student_id: string }>('select id, student_id from submissions where activity_id = $1 and share_class order by created_at limit 6', [activityId]);
  const voters = await q<{ id: string }>('select id from students where class_id = $1 order by student_no limit 5', [classId]);
  for (let i = 0; i < shared.length; i += 2) {
    for (const v of voters) {
      if (v.id !== shared[i].student_id) await q('insert into reactions (submission_id, student_id) values ($1, $2) on conflict do nothing', [shared[i].id, v.id]);
    }
  }
  return added;
}
