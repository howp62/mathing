import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { one } from './db';
import { readToken, signToken } from './security';

const TEACHER_COOKIE = 'm_t';
const STUDENT_COOKIE = 'm_s';
const TEACHER_TTL = 12 * 60 * 60 * 1000;
const STUDENT_TTL = 30 * 24 * 60 * 60 * 1000;
const secure = process.env.NODE_ENV === 'production';

export type Teacher = { id: string; name: string; role: string };
export type Student = {
  id: string;
  class_id: string;
  student_no: number;
  interests: string[];
  career: string;
  career_unknown: boolean;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);

export async function hasTeacher(): Promise<boolean> {
  const row = await one<{ n: number }>('select count(*)::int as n from teachers');
  return (row?.n ?? 0) > 0;
}

export async function startTeacherSession(teacherId: string, version: number) {
  const token = await signToken({ t: teacherId, v: version, exp: Date.now() + TEACHER_TTL });
  (await cookies()).set(TEACHER_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: TEACHER_TTL / 1000 });
}

export async function endTeacherSession() {
  (await cookies()).delete(TEACHER_COOKIE);
}

export async function currentTeacher(): Promise<Teacher | null> {
  const token = (await cookies()).get(TEACHER_COOKIE)?.value;
  const payload = await readToken<{ t: string; v: number; exp: number }>(token);
  if (!payload || !isUuid(payload.t) || typeof payload.v !== 'number') return null;
  // 비밀번호 변경·로그아웃으로 번호가 올라가면 예전 로그인은 통하지 않는다
  return one<Teacher>('select id, name, role from teachers where id = $1 and session_version = $2', [payload.t, payload.v]);
}

export async function requireTeacher(): Promise<Teacher> {
  const teacher = await currentTeacher();
  if (!teacher) redirect('/login');
  return teacher;
}

export async function startStudentSession(studentId: string, classId: string, version: number) {
  const token = await signToken({ s: studentId, c: classId, v: version, exp: Date.now() + STUDENT_TTL });
  (await cookies()).set(STUDENT_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: STUDENT_TTL / 1000 });
}

export async function endStudentSession() {
  (await cookies()).delete(STUDENT_COOKIE);
}

export async function currentStudent(): Promise<Student | null> {
  const token = (await cookies()).get(STUDENT_COOKIE)?.value;
  const payload = await readToken<{ s: string; c: string; v: number; exp: number }>(token);
  if (!payload || !isUuid(payload.s) || typeof payload.v !== 'number') return null;
  // 선생님이 비밀번호를 초기화하면 번호가 올라가 예전 기기의 로그인이 끊긴다
  return one<Student>(
    'select id, class_id, student_no, interests, career, career_unknown from students where id = $1 and class_id = $2 and session_version = $3',
    [payload.s, payload.c, payload.v],
  );
}

/** 이 교사의 반에 속한 활동만 돌려준다. */
export async function teacherActivity(teacherId: string, activityId: unknown) {
  if (!isUuid(activityId)) return null;
  return one<ActivityRow>(
    `select a.id, a.class_id, a.set_id, a.stage, a.intro_cards, a.displayed, a.closed_at, a.board_key
       from activities a join classes c on c.id = a.class_id
      where a.id = $1 and c.teacher_id = $2`,
    [activityId, teacherId],
  );
}

export type ActivityRow = { id: string; class_id: string; set_id: string; stage: string; intro_cards: string[]; displayed: string[]; closed_at: Date | null; board_key: string | null };

/** 칠판 주소의 열쇠로 수업을 찾는다. 교사 로그인 없이 전자칠판에서 연다. */
export async function boardActivity(key: unknown) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{24,64}$/.test(key)) return null;
  return one<ActivityRow>(
    'select id, class_id, set_id, stage, intro_cards, displayed, closed_at, board_key from activities where board_key = $1',
    [key],
  );
}
