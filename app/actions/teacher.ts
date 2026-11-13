'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { one, q } from '@/lib/db';
import { getSet } from '@/lib/content';
import crypto from 'node:crypto';
import { hashPassword, makeJoinCode, verifyPassword } from '@/lib/security';
import { boardActivity, currentTeacher, endTeacherSession, hasTeacher, isUuid, requireTeacher, startTeacherSession, teacherActivity } from '@/lib/auth';
import { saveAiSettings, type AiProvider } from '@/lib/ai';
import { MAX_DISPLAYED, STAGES, type Stage } from '@/lib/constants';

export type FormState = { error?: string; ok?: string } | undefined;

const str = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

/* ---------- 첫 설정과 로그인 ---------- */

export async function setupAdmin(_prev: FormState, form: FormData): Promise<FormState> {
  if (await hasTeacher()) return { error: '이미 설정이 끝났어요. 로그인해 주세요.' };
  const required = process.env.SETUP_CODE;
  // 인터넷에 배포한 사이트는 설정 코드가 없으면 첫 설정을 열지 않는다(먼저 온 사람이 관리자가 되는 것을 막음)
  if (!required && process.env.NODE_ENV === 'production') return { error: '배포 설정에 SETUP_CODE가 없어요. Vercel의 환경 변수에 SETUP_CODE를 넣고 다시 배포해 주세요.' };
  if (required && !safeEqual(str(form.get('setupCode')), required)) return { error: '설정 코드가 맞지 않아요.' };
  const name = str(form.get('name'));
  const password = str(form.get('password'));
  const confirm = str(form.get('confirm'));
  if (name.length < 2 || name.length > 30) return { error: '이름(로그인 아이디)은 2~30자로 써 주세요.' };
  if (password.length < 8) return { error: '비밀번호는 8자 이상으로 정해 주세요.' };
  if (password !== confirm) return { error: '두 비밀번호가 서로 달라요.' };
  const row = await one<{ id: string }>(
    `insert into teachers (name, password_hash, role)
     select $1, $2, 'admin' where not exists (select 1 from teachers) returning id`,
    [name, await hashPassword(password)],
  );
  if (!row) return { error: '이미 설정이 끝났어요. 로그인해 주세요.' };
  await startTeacherSession(row.id, 0);
  redirect('/t');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const name = str(form.get('name'));
  const password = str(form.get('password'));
  const t = await one<{ id: string; password_hash: string }>('select id, password_hash from teachers where name = $1', [name]);
  if (!t) return { error: '이름이나 비밀번호가 맞지 않아요.' };
  // 시도 한 번을 먼저 기록하고 나서 비밀번호를 확인한다(동시에 여러 번 보내도 5번에서 잠김)
  const attempt = await one(
    `update teachers set
       failed_attempts = case when locked_until is not null then 1 else failed_attempts + 1 end,
       locked_until = case when (case when locked_until is not null then 1 else failed_attempts + 1 end) >= 5
                           then now() + interval '15 minutes' else null end
     where id = $1 and (locked_until is null or locked_until <= now()) returning id`,
    [t.id],
  );
  if (!attempt) return { error: '여러 번 틀려서 15분 동안 잠겼어요. 잠시 뒤 다시 해 주세요.' };
  if (!(await verifyPassword(password, t.password_hash))) return { error: '이름이나 비밀번호가 맞지 않아요.' };
  const ok = await one<{ session_version: number }>(
    'update teachers set failed_attempts = 0, locked_until = null where id = $1 returning session_version',
    [t.id],
  );
  await startTeacherSession(t.id, ok!.session_version);
  redirect('/t');
}

export async function logout() {
  // 이 기기뿐 아니라 다른 곳에 남아 있을 수 있는 로그인까지 모두 끊는다
  const teacher = await currentTeacher();
  if (teacher) await q('update teachers set session_version = session_version + 1 where id = $1', [teacher.id]);
  await endTeacherSession();
  redirect('/');
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const current = str(form.get('current'));
  const next = str(form.get('next'));
  const row = await one<{ password_hash: string }>('select password_hash from teachers where id = $1', [teacher.id]);
  if (!row || !(await verifyPassword(current, row.password_hash))) return { error: '지금 비밀번호가 맞지 않아요.' };
  if (next.length < 8) return { error: '새 비밀번호는 8자 이상으로 정해 주세요.' };
  const row2 = await one<{ session_version: number }>(
    'update teachers set password_hash = $2, session_version = session_version + 1 where id = $1 returning session_version',
    [teacher.id, await hashPassword(next)],
  );
  await startTeacherSession(teacher.id, row2!.session_version);
  return { ok: '비밀번호를 바꿨어요. 다른 기기의 로그인은 모두 끊겼어요.' };
}

/* ---------- 반 ---------- */

export async function createClass(_prev: FormState, form: FormData): Promise<FormState> {
  const teacher = await requireTeacher();
  const grade = Number(str(form.get('grade')));
  const classNo = Number(str(form.get('classNo')));
  const size = Number(str(form.get('size')));
  const schoolYear = Number(str(form.get('schoolYear')));
  if (![1, 2, 3].includes(grade)) return { error: '학년은 1~3 중에서 골라 주세요.' };
  if (!Number.isInteger(classNo) || classNo < 1 || classNo > 20) return { error: '반은 1~20 사이로 써 주세요.' };
  if (!Number.isInteger(size) || size < 1 || size > 40) return { error: '인원은 1~40명 사이로 써 주세요.' };
  if (!Number.isInteger(schoolYear) || schoolYear < 2025 || schoolYear > 2100) return { error: '학년도를 확인해 주세요.' };
  const exists = await one('select 1 from classes where teacher_id = $1 and school_year = $2 and grade = $3 and class_no = $4', [teacher.id, schoolYear, grade, classNo]);
  if (exists) return { error: `${schoolYear}학년도 ${grade}학년 ${classNo}반은 이미 있어요.` };
  const base = grade * 10000 + classNo * 100;
  for (let i = 0; i < 5; i++) {
    const code = makeJoinCode();
    const row = await one<{ id: string }>(
      `insert into classes (teacher_id, school_year, grade, class_no, size, student_from, student_to, join_code)
       values ($1, $2, $3, $4, $5, $6, $7, $8) on conflict (join_code) do nothing returning id`,
      [teacher.id, schoolYear, grade, classNo, size, base + 1, base + size, code],
    );
    if (row) {
      revalidatePath('/t');
      return { ok: `${grade}학년 ${classNo}반을 만들었어요. 입장 코드는 ${code}예요.` };
    }
  }
  return { error: '입장 코드를 만들지 못했어요. 다시 눌러 주세요.' };
}

async function ownClass(teacherId: string, classId: unknown) {
  if (!isUuid(classId)) return null;
  return one<{ id: string }>('select id from classes where id = $1 and teacher_id = $2', [classId, teacherId]);
}

/* ---------- 수업(활동) ---------- */

export async function openActivity(form: FormData) {
  const teacher = await requireTeacher();
  const classId = str(form.get('classId'));
  const setId = str(form.get('setId'));
  if (!(await ownClass(teacher.id, classId))) return;
  const set = getSet(setId);
  if (!set) return;
  await q('update activities set closed_at = now() where class_id = $1 and closed_at is null', [classId]);
  const row = await one<{ id: string }>(
    `insert into activities (class_id, set_id, intro_cards, board_key) values ($1, $2, $3::text::jsonb, $4) returning id`,
    [classId, setId, JSON.stringify(set.examples.slice(0, 3).map((e) => e.id)), newBoardKey()],
  );
  redirect(`/t/activity/${row!.id}`);
}

export async function setStage(activityId: string, stage: Stage) {
  const teacher = await requireTeacher();
  if (!STAGES.includes(stage)) return { error: '알 수 없는 단계예요.' };
  const act = await teacherActivity(teacher.id, activityId);
  if (!act || act.closed_at) return { error: '닫힌 수업이에요.' };
  await q('update activities set stage = $2 where id = $1', [activityId, stage]);
  return { ok: true };
}

export async function closeActivity(activityId: string) {
  const teacher = await requireTeacher();
  const act = await teacherActivity(teacher.id, activityId);
  if (!act) return { error: '수업을 찾지 못했어요.' };
  await q('update activities set closed_at = now() where id = $1 and closed_at is null', [activityId]);
  return { ok: true };
}

export async function toggleDisplay(activityId: string, submissionId: string) {
  const teacher = await requireTeacher();
  const act = await teacherActivity(teacher.id, activityId);
  if (!act || !isUuid(submissionId)) return { error: '찾지 못했어요.' };
  const sub = await one<{ share_class: boolean }>('select share_class from submissions where id = $1 and activity_id = $2', [submissionId, activityId]);
  if (!sub) return { error: '찾지 못했어요.' };
  let list = act.displayed.filter((id) => id !== submissionId);
  if (list.length === act.displayed.length) {
    if (!sub.share_class) return { error: '학생이 반 공유를 꺼 둔 글이에요.' };
    list = [...list, submissionId].slice(-MAX_DISPLAYED);
  }
  await q(`update activities set displayed = $2::text::jsonb, stage = 'gallery' where id = $1`, [activityId, JSON.stringify(list)]);
  return { ok: true };
}

async function ownSubmission(teacherId: string, submissionId: unknown) {
  if (!isUuid(submissionId)) return null;
  return one<{ id: string; share_example: boolean }>(
    `select s.id, s.share_example from submissions s
       join activities a on a.id = s.activity_id join classes c on c.id = a.class_id
      where s.id = $1 and c.teacher_id = $2`,
    [submissionId, teacherId],
  );
}

export async function toggleStar(submissionId: string) {
  const teacher = await requireTeacher();
  const sub = await ownSubmission(teacher.id, submissionId);
  if (!sub) return { error: '찾지 못했어요.' };
  if (!sub.share_example) return { error: '학생이 예시 사용에 동의하지 않았어요.' };
  await q('update submissions set starred = not starred where id = $1', [submissionId]);
  return { ok: true };
}

export async function setRating(submissionId: string, rating: number | null) {
  const teacher = await requireTeacher();
  if (rating !== null && ![0, 1, 2].includes(rating)) return { error: '잘못된 값이에요.' };
  if (!(await ownSubmission(teacher.id, submissionId))) return { error: '찾지 못했어요.' };
  await q('update submissions set rating = $2 where id = $1', [submissionId, rating]);
  return { ok: true };
}

export async function setIntroCards(activityId: string, ids: string[]) {
  const teacher = await requireTeacher();
  const act = await teacherActivity(teacher.id, activityId);
  const set = act ? getSet(act.set_id) : null;
  if (!act || !set) return { error: '찾지 못했어요.' };
  const valid = ids.filter((id) => set.examples.some((e) => e.id === id)).slice(0, 3);
  await q('update activities set intro_cards = $2::text::jsonb where id = $1', [activityId, JSON.stringify(valid)]);
  return { ok: true };
}

export async function resetStudentPin(classId: string, studentNo: number) {
  const teacher = await requireTeacher();
  if (!(await ownClass(teacher.id, classId))) return { error: '찾지 못했어요.' };
  // 비밀번호를 비워 두면 먼저 들어온 사람이 그 학번을 차지할 수 있어서, 임시 비밀번호를 정해 선생님께 보여준다.
  // 이 학번으로 들어와 있던 다른 기기의 로그인은 모두 끊는다.
  const pin = String(crypto.randomInt(0, 10000)).padStart(4, '0');
  const row = await one(
    `update students set pin_hash = $3, failed_attempts = 0, locked_until = null, session_version = session_version + 1
      where class_id = $1 and student_no = $2 returning id`,
    [classId, studentNo, await hashPassword(pin)],
  );
  if (!row) return { error: '아직 이 학번으로 들어온 학생이 없어요.' };
  return { ok: true, pin };
}

/* ---------- 설정 ---------- */

export async function updateAiSettings(_prev: FormState, form: FormData): Promise<FormState> {
  await requireTeacher();
  const provider = str(form.get('provider')) as AiProvider;
  if (!['none', 'anthropic', 'openai', 'google'].includes(provider)) return { error: '회사를 다시 골라 주세요.' };
  const model = str(form.get('model')).slice(0, 80);
  if (model && !/^[\w.\-:/]+$/.test(model)) return { error: '모델 이름에는 영문, 숫자, 점, 하이픈만 쓸 수 있어요.' };
  const apiKey = str(form.get('apiKey'));
  if (apiKey && apiKey.length > 300) return { error: '키가 너무 길어요. 다시 확인해 주세요.' };
  const dailyCap = Number(str(form.get('dailyCap')) || '300');
  if (!Number.isInteger(dailyCap) || dailyCap < 0 || dailyCap > 5000) return { error: '하루 상한은 0~5000 사이로 써 주세요.' };
  await saveAiSettings({ provider, model, apiKey, dailyCap, freeTier: form.get('freeTier') === 'on', clearKey: form.get('clearKey') === 'on' });
  revalidatePath('/t/settings');
  return { ok: '저장했어요.' };
}

/* ---------- 리허설 (내 컴퓨터의 연습용 데이터베이스에서만) ---------- */

export async function addRehearsalStudents(activityId: string) {
  const { rehearsalAllowed, seedRehearsal } = await import('@/lib/rehearsal');
  if (!rehearsalAllowed()) return { error: '리허설 학생은 연습용 데이터베이스에서만 쓸 수 있어요.' };
  const teacher = await requireTeacher();
  const act = await teacherActivity(teacher.id, activityId);
  if (!act || act.closed_at) return { error: '열린 수업에서만 쓸 수 있어요.' };
  const n = await seedRehearsal(act.id, act.class_id);
  return { ok: true, added: n };
}

/* ---------- 전자칠판 (칠판 주소의 열쇠로만) ---------- */

function newBoardKey() {
  return crypto.randomBytes(24).toString('base64url');
}

/** 칠판 주소가 없는 예전 수업에 주소를 만들어 준다 */
export async function ensureBoardKey(activityId: string) {
  const teacher = await requireTeacher();
  const act = await teacherActivity(teacher.id, activityId);
  if (!act) return null;
  if (act.board_key) return act.board_key;
  const row = await one<{ board_key: string }>(
    'update activities set board_key = coalesce(board_key, $2) where id = $1 returning board_key',
    [activityId, newBoardKey()],
  );
  return row?.board_key ?? null;
}

export async function setStageByBoard(boardKey: string, stage: Stage) {
  if (!STAGES.includes(stage)) return { error: '알 수 없는 단계예요.' };
  const act = await boardActivity(boardKey);
  if (!act || act.closed_at) return { error: '닫힌 수업이에요.' };
  await q('update activities set stage = $2 where id = $1', [act.id, stage]);
  return { ok: true };
}
