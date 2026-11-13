'use client';
import { useActionState } from 'react';
import { createClass } from '@/app/actions/teacher';

export function CreateClassForm({ schoolYear }: { schoolYear: number }) {
  const [state, action, pending] = useActionState(createClass, undefined);
  return (
    <form action={action}>
      {state?.error && <p className="msg error" role="alert">{state.error}</p>}
      {state?.ok && <p className="msg ok" role="status">{state.ok}</p>}
      <div className="row">
        <div className="field"><label htmlFor="schoolYear">학년도</label><input id="schoolYear" name="schoolYear" type="number" defaultValue={schoolYear} required /></div>
        <div className="field"><label htmlFor="grade">학년</label>
          <select id="grade" name="grade" defaultValue="1"><option value="1">1학년</option><option value="2">2학년</option><option value="3">3학년</option></select>
        </div>
        <div className="field"><label htmlFor="classNo">반</label><input id="classNo" name="classNo" type="number" min={1} max={20} required placeholder="3" /></div>
        <div className="field"><label htmlFor="size">인원</label><input id="size" name="size" type="number" min={1} max={40} required placeholder="30" /></div>
      </div>
      <p className="muted" style={{ fontSize: 13, margin: '0 0 12px' }}>학번은 학년·반·번호로 자동으로 정해져요. 예) 1학년 3반 15번 → 10315</p>
      <button className="btn" disabled={pending}>{pending ? '만드는 중…' : '반 만들기'}</button>
    </form>
  );
}
