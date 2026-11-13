'use client';
import { useEffect, useState, useTransition } from 'react';
import { setShare } from '@/app/actions/connect';
import { Rows } from '@/components/ui';
import { STEP_LABELS } from '@/lib/constants';

type Version = { answers: string[]; free: boolean };
type Item = {
  id: string; unitId: string; unit: string; subject: string; interest: string;
  first: Version; re: Version | null; share: boolean; pre: number | null; post: number | null;
  hidden: boolean; hiddenReason: string | null;
};
type Catalog = { subject: string; units: { id: string; unit: string }[] }[];

function textOf(item: Item, v: Version) {
  const body = v.free ? v.answers[0] : v.answers.map((a, i) => (a ? `${STEP_LABELS[i]}: ${a}` : '')).filter(Boolean).join('\n');
  return `[${item.subject} · ${item.unit}] 관심사: ${item.interest}\n${body}`;
}

/** 글을 카드 모양 그림(PNG)으로 만들어 내려받는다. 서버로는 아무것도 보내지 않는다 */
function saveImage(item: Item, v: Version) {
  const W = 1080, pad = 72, lineH = 50;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const font = (w: number, s: number) => `${w} ${s}px "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  const wrap = (text: string, size: number, weight: number) => {
    ctx.font = font(weight, size);
    const out: string[] = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const ch of para) {
        if (ctx.measureText(line + ch).width > W - pad * 2) { out.push(line); line = ch; } else line += ch;
      }
      out.push(line);
    }
    return out;
  };
  const blocks = (v.free ? [['', v.answers[0]]] : v.answers.map((a, i) => [STEP_LABELS[i], a]).filter(([, a]) => a)) as [string, string][];
  const measured = blocks.map(([l, a]) => ({ l, lines: wrap(a, 34, 500) }));
  const H = pad * 2 + 140 + measured.reduce((s, b) => s + (b.l ? 40 : 0) + b.lines.length * lineH + 28, 0) + 60;
  c.width = W; c.height = H;
  ctx.fillStyle = '#FBF9F5'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2D6A5C'; ctx.font = font(800, 30); ctx.fillText('mathing', pad, pad + 10);
  ctx.fillStyle = '#1D2129'; ctx.font = font(800, 46); ctx.fillText(`${item.unit}`, pad, pad + 80);
  ctx.fillStyle = '#9A4420'; ctx.font = font(700, 28); ctx.fillText(`${item.subject} · ${item.interest}`, pad, pad + 128);
  let y = pad + 200;
  for (const b of measured) {
    if (b.l) { ctx.fillStyle = '#6E737C'; ctx.font = font(800, 24); ctx.fillText(b.l, pad, y); y += 40; }
    ctx.fillStyle = '#1D2129'; ctx.font = font(500, 34);
    for (const line of b.lines) { ctx.fillText(line, pad, y); y += lineH; }
    y += 28;
  }
  ctx.fillStyle = '#6E737C'; ctx.font = font(500, 22); ctx.fillText('수학과 나를 잇는 시간', pad, H - pad + 20);
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = `mathing-${item.unit}.png`;
  a.click();
}

function MapPath({ items, catalog }: { items: Item[]; catalog: Catalog }) {
  const all = catalog.flatMap((s) => s.units.map((u) => ({ ...u, subject: s.subject })));
  const W = 340, step = W / (all.length + 1);
  const pts = all.map((u, i) => ({ ...u, x: step * (i + 1), y: 80 + Math.sin(i * 0.9) * 18, d: items.find((n) => n.unitId === u.id) }));
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} 150`} role="img" aria-label={`연결 지도: ${items.map((n) => `${n.unit}-${n.interest}`).join(', ') || '아직 없음'}`}>
      <path d={path} fill="none" stroke="#D6CFC2" strokeWidth="2" strokeDasharray="4 4" />
      {pts.map((p) => p.d ? (
        <g key={p.id}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 38} stroke="#DD7448" strokeWidth="1.5" />
          <rect x={p.x - 28} y={p.y - 58} width="56" height="20" rx="10" fill="#FBE7DC" />
          <text x={p.x} y={p.y - 44} textAnchor="middle" fontSize="10" fontWeight="700" fill="#9A4420">{p.d.interest.slice(0, 6)}</text>
          <circle cx={p.x} cy={p.y} r="7" fill="#2D6A5C" />
          <text x={p.x} y={p.y + 22} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1D2129">{p.unit.length > 7 ? p.unit.slice(0, 6) + '…' : p.unit}</text>
        </g>
      ) : <circle key={p.id} cx={p.x} cy={p.y} r="3.5" fill="#D6CFC2" />)}
    </svg>
  );
}

function MapBoard({ items, catalog }: { items: Item[]; catalog: Catalog }) {
  return (
    <div className="grid16">
      {catalog.map((s) => (
        <div key={s.subject} style={{ display: 'contents' }}>
          <div className="s">{s.subject}</div>
          {s.units.map((u) => {
            const d = items.find((n) => n.unitId === u.id);
            return <div key={u.id} className={`t ${d ? 'd' : ''}`}>{u.unit}{d && <em>{d.interest}</em>}</div>;
          })}
        </div>
      ))}
    </div>
  );
}

export function Notes({ items: initial, catalog, saved }: { items: Item[]; catalog: Catalog; saved: boolean }) {
  const [items, setItems] = useState(initial);
  const [map, setMap] = useState<'path' | 'board'>('path');
  const [view, setView] = useState<Record<string, 'first' | 're'>>({});
  const [toast, setToast] = useState<string | null>(saved ? '다시 쓴 연결을 저장했어' : null);
  const [, start] = useTransition();

  useEffect(() => {
    try { const m = localStorage.getItem('mathing-map'); if (m === 'board' || m === 'path') setMap(m); } catch { /* 기본값 */ }
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const pickMap = (m: 'path' | 'board') => { setMap(m); try { localStorage.setItem('mathing-map', m); } catch { /* 괜찮음 */ } };
  const toggleShare = (id: string, share: boolean) => {
    setItems(items.map((n) => (n.id === id ? { ...n, share } : n)));
    start(async () => {
      const res = await setShare(id, share);
      setToast(res.error ?? (share ? '다시 공유했어' : '공유를 껐어'));
    });
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setToast('글을 복사했어'); } catch { setToast('복사하지 못했어. 길게 눌러 직접 복사해 줘.'); }
  };

  return (
    <>
      <div className="map">
        <div className="mh">
          <h3>연결 지도</h3>
          <span className="seg" role="group" aria-label="지도 보기">
            <button type="button" className={map === 'path' ? 'on' : ''} aria-pressed={map === 'path'} onClick={() => pickMap('path')}>길</button>
            <button type="button" className={map === 'board' ? 'on' : ''} aria-pressed={map === 'board'} onClick={() => pickMap('board')}>판</button>
          </span>
        </div>
        <p className="muted" style={{ margin: 0 }}>{map === 'path' ? '지나온 단원과 이어 본 관심사. 점수는 없어.' : '16개 단원 중 이어 본 칸. 빈칸은 앞으로 만날 단원이야.'}</p>
        {!items.length && <p className="muted" style={{ margin: '6px 0 0' }}>아직 비어 있어. 단원을 하나 쓰면 여기에 첫 연결이 생겨.</p>}
        {map === 'path' ? <MapPath items={items} catalog={catalog} /> : <MapBoard items={items} catalog={catalog} />}
      </div>

      {!items.length && <p className="sub">아직 쓴 연결이 없어. <a className="link" href="/home">단원 탭</a>에서 시작해 봐.</p>}
      {items.some((n) => !n.re) && <div className="nudge">단원을 다 배웠다면, 처음 쓴 연결을 <b>다시 써 보자.</b> 배우고 나면 더 잘 보이는 게 있어.</div>}

      {items.map((n) => {
        const v = view[n.id] ?? (n.re ? 're' : 'first');
        const cur = v === 're' && n.re ? n.re : n.first;
        const up = n.pre && n.post && n.post > n.pre;
        return (
          <article key={n.id} className="nitem">
            <div className="h"><b>{n.unit}</b><span className="muted">{n.subject}</span>{n.hidden && <span className="pill hide">숨겨졌어</span>}</div>
            <span className="rel">관련성 쓰기 전 {n.pre ?? '–'} → 쓰고 나서 <span className="up">{n.post ?? '–'}</span>{up ? ' ↑' : ''}</span>
            {n.re ? (
              <div className="vtabs" role="group" aria-label="버전">
                <button type="button" className={`chip sm ${v === 'first' ? 'on' : ''}`} aria-pressed={v === 'first'} onClick={() => setView({ ...view, [n.id]: 'first' })}>처음 연결</button>
                <button type="button" className={`chip sm ${v === 're' ? 'on' : ''}`} aria-pressed={v === 're'} onClick={() => setView({ ...view, [n.id]: 're' })}>다시 쓴 연결</button>
              </div>
            ) : <div style={{ height: 10 }} />}
            <div className="post dashed"><div className="head"><span className="tag">{n.interest}</span></div><Rows answers={cur.answers} free={cur.free} /></div>
            {n.hidden && <p className="msg err" style={{ marginBottom: 0 }}>신고가 쌓여 다른 학생에게는 숨겨졌어. 이유: {n.hiddenReason ?? '운영자 확인'}. 운영자가 확인하고 있어.</p>}
            <label className="switch sm">
              <span className="t"><b>다른 학생들에게 공유</b></span>
              <input type="checkbox" className="tg" checked={n.share} onChange={(e) => toggleShare(n.id, e.target.checked)} />
            </label>
            <div className="nacts">
              {!n.re && <a className="mini pri" href={`/u/${n.unitId}?re=1`}>다시 써 보기</a>}
              {n.re && <a className="mini" href={`/u/${n.unitId}?re=1`}>다시 쓴 연결 고치기</a>}
              <button type="button" className="mini" onClick={() => copy(textOf(n, cur))}>글 복사</button>
              <button type="button" className="mini" onClick={() => { saveImage(n, cur); setToast('카드 이미지를 저장했어'); }}>이미지로 저장</button>
              <a className="mini" href={`/u/${n.unitId}/gallery`}>친구들의 연결</a>
            </div>
          </article>
        );
      })}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
