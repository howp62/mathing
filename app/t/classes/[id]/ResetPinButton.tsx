'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { resetStudentPin } from '@/app/actions/teacher';

export function ResetPinButton({ classId, studentNo }: { classId: string; studentNo: number }) {
  const [ask, setAsk] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (pin) return <span className="pill hot" title="학생에게만 알려 주세요">임시 비밀번호 {pin}</span>;
  if (!ask) return <button className="mini" onClick={() => setAsk(true)}>비밀번호 초기화</button>;
  return (
    <span className="prow-act">
      <span style={{ fontSize: 12 }}>임시 비밀번호를 만들고, 이 학번으로 들어와 있던 기기는 모두 로그아웃돼요.</span>
      <button className="mini on" disabled={pending} onClick={() => start(async () => { const r = await resetStudentPin(classId, studentNo); if ('pin' in r && r.pin) setPin(r.pin); setAsk(false); router.refresh(); })}>초기화</button>
      <button className="mini" onClick={() => setAsk(false)}>취소</button>
    </span>
  );
}
