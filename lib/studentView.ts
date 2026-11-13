import 'server-only';
import { one, q } from './db';
import { getSet } from './content';
import { aiReady } from './ai';
import { classLabel, getClass } from './views';
import { COACH_LIMIT, type Stage } from './constants';
import type { Student } from './auth';

export async function openActivityFor(classId: string) {
  return one<{ id: string; set_id: string; stage: string; class_id: string }>(
    `select id, set_id, stage, class_id from activities
      where class_id = $1 and closed_at is null order by opened_at desc limit 1`,
    [classId],
  );
}

export async function studentState(student: Student) {
  const cls = await getClass(student.class_id);
  const act = await openActivityFor(student.class_id);
  let activity = null;
  if (act) {
    const set = getSet(act.set_id);
    const mine = await one<{ id: string; interest: string; answers: string[]; concepts: string[]; free: boolean; share_class: boolean; share_example: boolean; relevance: number | null }>(
      `select id, interest, answers, concepts, free, share_class, share_example, relevance
         from submissions where activity_id = $1 and student_id = $2`,
      [act.id, student.id],
    );
    const turns = await q<{ step: number; question: string }>(
      `select step, question from coach_turns where activity_id = $1 and student_id = $2 and question <> '' order by created_at`,
      [act.id, student.id],
    );
    const showGallery = !!mine || act.stage === 'gallery';
    const gallery = showGallery
      ? await q<{ id: string; interest: string; answers: string[]; free: boolean; mine: boolean; liked: boolean }>(
          `select s.id, s.interest, s.answers, s.free, (s.student_id = $2) as mine,
                  exists (select 1 from reactions r where r.submission_id = s.id and r.student_id = $2) as liked
             from submissions s
            where s.activity_id = $1 and (s.share_class or s.student_id = $2)
            order by (s.student_id = $2) desc, s.created_at desc`,
          [act.id, student.id],
        )
      : [];
    activity = {
      id: act.id,
      stage: act.stage as Stage,
      subject: set?.subject ?? '',
      unit: set?.unit ?? '',
      concepts: set?.concepts ?? [],
      thinkCards: set?.thinkCards ?? [],
      examples: set?.examples ?? [],
      mine: mine
        ? { interest: mine.interest, answers: mine.answers, concepts: mine.concepts, free: mine.free, shareClass: mine.share_class, shareExample: mine.share_example, relevance: mine.relevance }
        : null,
      coach: { enabled: await aiReady(), used: turns.length, limit: COACH_LIMIT, turns },
      gallery,
    };
  }
  const notebook = await q<{ answers: string[]; free: boolean; interest: string; set_id: string; created_at: Date }>(
    `select s.answers, s.free, s.interest, a.set_id, s.created_at
       from submissions s join activities a on a.id = s.activity_id
      where s.student_id = $1 order by s.created_at`,
    [student.id],
  );
  return {
    student: {
      no: student.student_no,
      interests: student.interests,
      career: student.career,
      careerUnknown: student.career_unknown,
      classLabel: cls ? classLabel(cls) : '',
    },
    activity,
    notebook: notebook.map((n) => {
      const set = getSet(n.set_id);
      return { unit: set?.unit ?? '', subject: set?.subject ?? '', answers: n.answers, free: n.free, interest: n.interest, date: new Date(n.created_at).toISOString() };
    }),
  };
}

export type StudentState = Awaited<ReturnType<typeof studentState>>;
