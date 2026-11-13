'use client';
import { useTransition } from 'react';
import { setBlocked, setFeatured, setHidden } from '@/app/actions/admin';

export function RowActions({ id, hidden, blocked }: { id: string; hidden: boolean; blocked: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="btns">
      {hidden
        ? <button className="mini" disabled={pending} onClick={() => start(() => setHidden(id, false))}>되살리기</button>
        : <button className="mini" disabled={pending} onClick={() => start(() => setHidden(id, true))}>숨기기</button>}
      {blocked
        ? <button className="mini" disabled={pending} onClick={() => start(() => setBlocked(id, false))}>계정 풀기</button>
        : <button className="mini" disabled={pending} onClick={() => { if (confirm('이 학생의 계정을 막을까요? 로그인할 수 없고 모든 글이 갤러리에서 빠져요.')) start(() => setBlocked(id, true)); }}>계정 막기</button>}
    </div>
  );
}

export function StarButton({ id, featured }: { id: string; featured: boolean }) {
  const [pending, start] = useTransition();
  return <button className={`mini ${featured ? 'pri' : ''}`} disabled={pending} onClick={() => start(() => setFeatured(id, !featured))}>{featured ? '★ 추천 중' : '☆ 추천'}</button>;
}
