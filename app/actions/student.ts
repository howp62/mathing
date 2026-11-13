'use server';

import { one, q } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/security';
import { currentStudent, endStudentSession, isUuid, startStudentSession } from '@/lib/auth';
import { openActivityFor } from '@/lib/studentView';
import { getSet } from '@/lib/content';
import { aiReady, askCoach, takeDailyQuota } from '@/lib/ai';
import { COACH_LIMIT, MAX_ANSWER, STEP_LABELS } from '@/lib/constants';

type Result = { ok?: boolean; error?: string };

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '');

async function bumpPresence(activityId: string, studentId: string, state: 'joined' | 'writing' | 'submitted') {
  const rank = { joined: 1, writing: 2, submitted: 3 } as const;
  await q(
    `insert into presence (activity_id, student_id, state) values ($1, $2, $3)
     on conflict (activity_id, student_id) do update
       set state = case
         when (case presence.state when 'submitted' then 3 when 'writing' then 2 else 1 end) >= $4 then presence.state
         else excluded.state end,
           updated_at = now()`,
    [activityId, studentId, state, rank[state]],
  );
}

export async function joinClass(input: { code: string; studentNo: string; pin: string }): Promise<Result> {
  const code = clean(input.code, 10).toUpperCase();
  const studentNo = Number(clean(input.studentNo, 6));
  const pin = clean(input.pin, 4);
  if (!/^\d{4}$/.test(pin)) return { error: '비밀번호는 숫자 4자리예요.' };
  const cls = await one<{ id: string; student_from: number; student_to: number }>(
    'select id, student_from, student_to from classes where join_code = $1',
    [code],
  );
  if (!cls) return { error: '입장 코드를 다시 확인해 줘.' };
  if (!Number.isInteger(studentNo) || studentNo < cls.student_from || studentNo > cls.student_to) {
    return { error: `학번은 ${cls.student_from}부터 ${cls.student_to} 사이야.` };
  }
  let st = await one<{ id: string; pin_hash: string | null; session_version: number }>(
    'select id, pin_hash, session_version from students where class_id = $1 and student_no = $2',
    [cls.id, studentNo],
  );
  if (!st) {
    // 처음 들어오는 학번: 지금 넣은 숫자가 비밀번호가 된다
    st = await one(
      'insert into students (class_id, student_no, pin_hash) values ($1, $2, $3) on conflict (class_id, student_no) do nothing returning id, pin_hash, session_version',
      [cls.id, studentNo, await hashPassword(pin)],
    );
    if (!st) return { error: '잠시 뒤 다시 해 줘.' };
  } else {
    // 시도 한 번을 먼저 기록하고 확인한다(동시에 여러 번 보내도 5번에서 잠김)
    const attempt = await one(
      `update students set
         failed_attempts = case when locked_until is not null then 1 else failed_attempts + 1 end,
         locked_until = case when (case when locked_until is not null then 1 else failed_attempts + 1 end) >= 5
                             then now() + interval '10 minutes' else null end
       where id = $1 and (locked_until is null or locked_until <= now()) returning id`,
      [st.id],
    );
    if (!attempt) return { error: '여러 번 틀려서 10분 동안 잠겼어. 잊었다면 선생님께 초기화를 부탁해.' };
    if (!st.pin_hash || !(await verifyPassword(pin, st.pin_hash))) {
      return { error: '비밀번호가 맞지 않아. 잊었다면 선생님께 초기화를 부탁해.' };
    }
    await q('update students set failed_attempts = 0, locked_until = null where id = $1', [st.id]);
  }
  await startStudentSession(st.id, cls.id, st.session_version);
  const act = await openActivityFor(cls.id);
  if (act) await bumpPresence(act.id, st.id, 'joined');
  return { ok: true };
}

export async function leave(): Promise<Result> {
  await endStudentSession();
  return { ok: true };
}

export async function saveProfile(input: { interests: string[]; career: string; careerUnknown: boolean }): Promise<Result> {
  const me = await currentStudent();
  if (!me) return { error: '다시 입장해 줘.' };
  const interests = Array.isArray(input.interests)
    ? [...new Set(input.interests.map((t) => clean(t, 20)).filter(Boolean))].slice(0, 15)
    : [];
  const unknown = input.careerUnknown === true;
  const career = unknown ? '' : clean(input.career, 40);
  await q('update students set interests = $2::text::jsonb, career = $3, career_unknown = $4 where id = $1', [me.id, JSON.stringify(interests), career, unknown]);
  return { ok: true };
}

export async function markWriting(): Promise<Result> {
  const me = await currentStudent();
  if (!me) return { error: '다시 입장해 줘.' };
  const act = await openActivityFor(me.class_id);
  if (act) await bumpPresence(act.id, me.id, 'writing');
  return { ok: true };
}

export async function submitConnection(input: {
  answers: string[]; concepts: string[]; free: boolean; shareClass: boolean; shareExample: boolean; relevance: number | null; interest: string;
}): Promise<Result> {
  const me = await currentStudent();
  if (!me) return { error: '다시 입장해 줘.' };
  const act = await openActivityFor(me.class_id);
  if (!act) return { error: '지금 열린 수업이 없어.' };
  const set = getSet(act.set_id);
  const answers = [0, 1, 2].map((i) => clean(input.answers?.[i], MAX_ANSWER));
  if (input.free) { answers[1] = ''; answers[2] = ''; }
  if (!answers.some(Boolean)) return { error: '한 줄이라도 써 줘.' };
  const concepts = Array.isArray(input.concepts) ? input.concepts.filter((c) => set?.concepts.includes(c)).slice(0, 6) : [];
  const relevance = Number.isInteger(input.relevance) && input.relevance! >= 1 && input.relevance! <= 5 ? input.relevance : null;
  const interest = clean(input.interest, 40) || '일상';
  const before = await one<{ id: string; answers: string[] }>('select id, answers from submissions where activity_id = $1 and student_id = $2', [act.id, me.id]);
  await q(
    `insert into submissions (activity_id, student_id, interest, answers, concepts, free, share_class, share_example, relevance)
     values ($1, $2, $3, $4::text::jsonb, $5::text::jsonb, $6, $7, $8, $9)
     on conflict (activity_id, student_id) do update set
       interest = excluded.interest, answers = excluded.answers, concepts = excluded.concepts, free = excluded.free,
       share_class = excluded.share_class, share_example = excluded.share_example, relevance = excluded.relevance, updated_at = now()`,
    [act.id, me.id, interest, JSON.stringify(answers), JSON.stringify(concepts), !!input.free, input.shareClass !== false, input.shareExample === true, relevance],
  );
  const edited = !!before && JSON.stringify(before.answers) !== JSON.stringify(answers);
  if (edited) {
    // 선생님이 고른 뒤에 글이 바뀌면 칠판에서 내리고 예시 후보 별표도 지운다(다시 고르게)
    await q('update submissions set starred = false where id = $1', [before!.id]);
  }
  if (input.shareClass === false || edited) {
    // 공유를 끄거나 글을 고치면 칠판에서 내린다
    const mine = await one<{ id: string }>('select id from submissions where activity_id = $1 and student_id = $2', [act.id, me.id]);
    if (mine) {
      await q(
        `update activities set displayed = coalesce((select jsonb_agg(x) from jsonb_array_elements_text(displayed) x where x <> $2), '[]'::jsonb) where id = $1`,
        [act.id, mine.id],
      );
    }
  }
  await bumpPresence(act.id, me.id, 'submitted');
  return { ok: true };
}

export async function toggleLike(submissionId: string): Promise<Result> {
  const me = await currentStudent();
  if (!me || !isUuid(submissionId)) return { error: '다시 입장해 줘.' };
  const sub = await one<{ student_id: string }>(
    `select s.student_id from submissions s join activities a on a.id = s.activity_id
      where s.id = $1 and a.class_id = $2 and s.share_class`,
    [submissionId, me.class_id],
  );
  if (!sub || sub.student_id === me.id) return { error: '공감할 수 없는 글이야.' };
  const removed = await q('delete from reactions where submission_id = $1 and student_id = $2 returning 1', [submissionId, me.id]);
  if (!removed.length) await q('insert into reactions (submission_id, student_id) values ($1, $2) on conflict do nothing', [submissionId, me.id]);
  return { ok: true };
}

export async function coachAsk(input: { step: number; answers: string[]; free: boolean }): Promise<{ question?: string; error?: string; fallback?: boolean }> {
  const me = await currentStudent();
  if (!me) return { error: '다시 입장해 줘.' };
  const act = await openActivityFor(me.class_id);
  if (!act) return { error: '지금 열린 수업이 없어.' };
  const step = input.free ? 0 : Math.max(0, Math.min(2, Number(input.step) || 0));
  const answers = [0, 1, 2].map((i) => clean(input.answers?.[i], MAX_ANSWER));
  if (!answers[step]) return { question: '먼저 한 줄만 적어볼래? 짧아도 괜찮아. 그걸 보고 질문할게.', fallback: true };
  if (!(await aiReady())) return { error: 'AI 코치가 꺼져 있어. 생각 열기 질문 카드를 써봐!' };
  // 사용 칸(1번, 2번)을 먼저 차지한다. 동시에 눌러도 칸이 두 개뿐이라 2번을 넘지 못한다.
  let slotId: string | null = null;
  for (let slot = 1; slot <= COACH_LIMIT && !slotId; slot++) {
    const r = await one<{ id: string }>(
      `insert into coach_turns (activity_id, student_id, step, question, slot) values ($1, $2, $3, '', $4)
       on conflict (activity_id, student_id, slot) do nothing returning id`,
      [act.id, me.id, step, slot],
    );
    slotId = r?.id ?? null;
  }
  if (!slotId) return { error: '오늘 코치 질문은 다 썼어. 이제 네 생각대로 써봐!' };
  const release = () => q('delete from coach_turns where id = $1', [slotId]);
  if (!(await takeDailyQuota(me.class_id))) {
    await release();
    return { error: '오늘 반 전체 코치 사용량이 다 찼어. 생각 열기 질문 카드를 써봐!' };
  }
  const previous = await q<{ question: string }>(
    `select question from coach_turns where activity_id = $1 and student_id = $2 and question <> '' order by created_at`,
    [act.id, me.id],
  );
  const set = getSet(act.set_id);
  try {
    const { question, concern } = await askCoach({
      subject: set?.subject ?? '',
      unit: set?.unit ?? '',
      interests: me.interests,
      stepLabel: input.free ? '자유 쓰기' : STEP_LABELS[step],
      answers,
      previous: previous.map((t) => t.question),
    });
    await q('update coach_turns set question = $2, flagged = $3 where id = $1', [slotId, question, concern]);
    return { question };
  } catch (err) {
    await release();
    console.error('[coach]', err instanceof Error ? err.message : 'unknown error');
    return { error: '코치가 지금 답하지 못했어. 생각 열기 질문 카드를 써봐!' };
  }
}
