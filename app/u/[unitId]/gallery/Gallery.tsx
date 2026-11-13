'use client';
import { useEffect, useState, useTransition } from 'react';
import { loadGallery, report, toggleLike } from '@/app/actions/connect';
import { Heart, Rows } from '@/components/ui';
import { REPORT_REASONS } from '@/lib/constants';
import type { GalleryPost } from '@/lib/views';

export function Gallery({ unitId, initial, tags, saved }: { unitId: string; initial: { posts: GalleryPost[]; more: boolean }; tags: string[]; saved: boolean }) {
  const [posts, setPosts] = useState(initial.posts);
  const [more, setMore] = useState(initial.more);
  const [filter, setFilter] = useState<string | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(saved ? '저장했어! 이제 친구들의 연결을 볼 수 있어' : null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchPage = (offset: number, f: string | null, append: boolean) => start(async () => {
    const res = await loadGallery(unitId, offset, f);
    if ('error' in res) return setToast(res.error);
    setPosts(append ? [...posts, ...res.posts] : res.posts);
    setMore(res.more);
  });

  const choose = (f: string | null) => { setFilter(f); fetchPage(0, f, false); };

  const like = (id: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)));
    start(async () => {
      const res = await toggleLike(id);
      if (res.error) setToast(res.error);
    });
  };

  const sendReport = (reason: string) => {
    const id = sheet!;
    setSheet(null);
    start(async () => {
      const res = await report(id, reason);
      if (res.error) return setToast(res.error);
      setReported(new Set([...reported, id]));
      setToast('신고했어. 운영자가 확인할게.');
    });
  };

  const others = posts.filter((p) => !p.mine);
  return (
    <>
      <p className="sub" style={{ marginTop: 4 }}>같은 단원을 쓴 학생들의 연결이야. 이름은 보이지 않아.</p>
      {tags.length > 1 && (
        <div className="chips scroll" role="group" aria-label="관심사로 거르기">
          <button type="button" className={`chip sm ${!filter ? 'on' : ''}`} aria-pressed={!filter} onClick={() => choose(null)}>전체</button>
          {tags.map((t) => <button key={t} type="button" className={`chip sm ${filter === t ? 'on' : ''}`} aria-pressed={filter === t} onClick={() => choose(t)}>{t}</button>)}
        </div>
      )}
      {posts.map((p) => (
        <article key={p.id} className={`post ${p.featured ? 'rec' : ''}`}>
          <div className="head">
            {p.featured && <span className="pill star">★ 추천 연결</span>}
            {p.mine && <span className="pill mine">내 글</span>}
            {p.interest && <span className="tag">{p.interest}</span>}
            {!p.mine && p.mineInterest && <span className="muted" style={{ fontSize: 11 }}>내 관심사</span>}
          </div>
          <Rows answers={p.answers} free={p.free} />
          <div className="acts">
            {p.mine ? (
              <span className="muted">{p.gotLike ? '누군가 공감했어 ♥' : '아직 공감 없음'} · 나만 보여</span>
            ) : (
              <>
                <button type="button" className={`like ${p.liked ? 'on' : ''}`} aria-pressed={p.liked} onClick={() => like(p.id)}><Heart size={15} /> 오, 연결된다!</button>
                <button type="button" className="more" aria-label="신고하기" disabled={reported.has(p.id)} title={reported.has(p.id) ? '신고했어' : '신고하기'} onClick={() => setSheet(p.id)}>⋯</button>
              </>
            )}
          </div>
        </article>
      ))}
      {others.length === 0 && <p className="muted" style={{ textAlign: 'center', margin: '24px 0' }}>{filter ? '이 관심사로 쓴 연결은 아직 없어.' : '아직 공유된 연결이 없어. 네가 첫 번째야!'}</p>}
      {more && <button className="btn ghost" disabled={pending} onClick={() => fetchPage(posts.filter((p) => !p.mine).length, filter, true)}>{pending ? '불러오는 중…' : '더 보기'}</button>}

      {sheet && (
        <div className="sheet-bg" onClick={() => setSheet(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="신고하기" onClick={(e) => e.stopPropagation()}>
            <h3>어떤 문제가 있어?</h3>
            <p className="muted">신고는 이름 없이 운영자에게 가. 한 글에 한 번만 할 수 있어.</p>
            {REPORT_REASONS.map((r) => <button key={r} type="button" className="opt" onClick={() => sendReport(r)}>{r}</button>)}
            <button type="button" className="btn ghost" style={{ marginTop: 12 }} onClick={() => setSheet(null)}>취소</button>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
