import 'server-only';
import { one, q } from './db';
import { getSet } from './content';
import type { ExampleCard, PostView, Stage } from './constants';

/* 화면마다 필요한 데이터만 골라 만든다. 칠판 데이터에는 학번이 들어가지 않는다. */

type ClassRow = { id: string; grade: number; class_no: number; size: number; student_from: number; student_to: number; join_code: string };

export function classLabel(c: { grade: number; class_no: number }) {
  return `${c.grade}학년 ${c.class_no}반`;
}

export async function getClass(classId: string) {
  return one<ClassRow>('select id, grade, class_no, size, student_from, student_to, join_code from classes where id = $1', [classId]);
}

async function presenceCounts(activityId: string) {
  const rows = await q<{ state: string; n: number }>(
    'select state, count(*)::int as n from presence where activity_id = $1 group by state',
    [activityId],
  );
  const by = Object.fromEntries(rows.map((r) => [r.state, r.n])) as Record<string, number>;
  const joined = by.joined ?? 0, writing = by.writing ?? 0, submitted = by.submitted ?? 0;
  return { joined: joined + writing + submitted, writing, submitted };
}

function pickCards(all: ExampleCard[], ids: string[]): ExampleCard[] {
  const picked = ids.map((id) => all.find((e) => e.id === id)).filter(Boolean) as ExampleCard[];
  return picked.length ? picked : all.slice(0, 3);
}

type SubRow = {
  id: string; student_no: number; interest: string; answers: string[]; concepts: string[]; free: boolean;
  share_class: boolean; share_example: boolean; starred: boolean; rating: number | null; relevance: number | null;
  likes: number; flagged: boolean; created_at: Date;
};

async function submissionRows(activityId: string): Promise<SubRow[]> {
  return q<SubRow>(
    `select s.id, st.student_no, s.interest, s.answers, s.concepts, s.free, s.share_class, s.share_example,
            s.starred, s.rating, s.relevance, s.created_at,
            (select count(*)::int from reactions r where r.submission_id = s.id) as likes,
            exists (select 1 from coach_turns ct where ct.activity_id = s.activity_id and ct.student_id = s.student_id and ct.flagged) as flagged
       from submissions s join students st on st.id = s.student_id
      where s.activity_id = $1
      order by s.created_at desc`,
    [activityId],
  );
}

export async function boardView(activity: { id: string; class_id: string; set_id: string; stage: string; intro_cards: string[]; displayed: string[]; closed_at: Date | null; board_key?: string | null }) {
  const cls = await getClass(activity.class_id);
  const set = getSet(activity.set_id);
  const counts = await presenceCounts(activity.id);
  const subs = await submissionRows(activity.id);
  // 닫힌 수업의 칠판 주소로는 글을 더 보여주지 않는다
  const displayed: (PostView & { liked: boolean })[] = (activity.closed_at ? [] : activity.displayed)
    .map((id) => subs.find((s) => s.id === id && s.share_class))
    .filter(Boolean)
    .map((s) => ({ id: s!.id, interest: s!.interest, answers: s!.answers, free: s!.free, liked: s!.likes > 0 }));
  return {
    id: activity.id,
    stage: activity.stage as Stage,
    closed: !!activity.closed_at,
    subject: set?.subject ?? '',
    unit: set?.unit ?? '',
    classLabel: cls ? classLabel(cls) : '',
    size: cls?.size ?? 0,
    joinCode: cls?.join_code ?? '',
    counts,
    introCards: set ? pickCards(set.examples, activity.intro_cards) : [],
    thinkCards: set?.thinkCards ?? [],
    displayed,
    sharedCount: subs.filter((s) => s.share_class).length,
  };
}

export async function consoleView(activity: Parameters<typeof boardView>[0]) {
  const board = await boardView(activity);
  const cls = (await getClass(activity.class_id))!;
  const set = getSet(activity.set_id);
  const students = await q<{ id: string; student_no: number; locked_until: Date | null; state: string | null }>(
    `select st.id, st.student_no, st.locked_until, p.state
       from students st left join presence p on p.student_id = st.id and p.activity_id = $2
      where st.class_id = $1`,
    [activity.class_id, activity.id],
  );
  const subs = await submissionRows(activity.id);
  const flaggedNos = new Set(subs.filter((s) => s.flagged).map((s) => s.student_no));
  const seats = [];
  for (let no = cls.student_from; no <= cls.student_to; no++) {
    const st = students.find((s) => s.student_no === no);
    seats.push({
      no,
      state: (st?.state ?? (st ? 'registered' : 'absent')) as string,
      locked: !!(st?.locked_until && new Date(st.locked_until).getTime() > Date.now()),
      flagged: flaggedNos.has(no),
    });
  }
  return {
    ...board,
    classId: activity.class_id,
    boardKey: activity.board_key ?? null,
    setStatus: set?.status ?? null,
    allExamples: set?.examples ?? [],
    introIds: board.introCards.map((c) => c.id),
    seats,
    posts: subs.map((s) => ({
      id: s.id,
      studentNo: s.student_no,
      interest: s.interest,
      answers: s.answers,
      concepts: s.concepts,
      free: s.free,
      shareClass: s.share_class,
      shareExample: s.share_example,
      starred: s.starred,
      rating: s.rating,
      relevance: s.relevance,
      displayed: activity.displayed.includes(s.id),
      liked: s.likes > 0,
      flagged: s.flagged,
      createdAt: new Date(s.created_at).toISOString(),
    })),
  };
}

export type BoardData = Awaited<ReturnType<typeof boardView>>;
export type ConsoleData = Awaited<ReturnType<typeof consoleView>>;
