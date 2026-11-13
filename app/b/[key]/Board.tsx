'use client';
import { useEffect, useState, useTransition } from 'react';
import { setStageByBoard } from '@/app/actions/teacher';
import { BoardFit } from '@/components/BoardFit';
import { ExampleCardView, Heart, Logo, Rows } from '@/components/ui';
import { usePoll } from '@/components/usePoll';
import { STAGES, STAGE_LABELS, josa, type Stage } from '@/lib/constants';
import type { BoardData } from '@/lib/views';

export function Board({ initial, boardKey, qrSvg, joinUrl }: { initial: BoardData; boardKey: string; qrSvg: string; joinUrl: string }) {
  const { data, setData, refresh } = usePoll<BoardData>(`/api/b/${boardKey}`, initial, 3000);
  const [, start] = useTransition();
  const [think, setThink] = useState(0);
  useEffect(() => {
    if (data.stage !== 'write') return;
    const t = setInterval(() => setThink((v) => v + 1), 9000);
    return () => clearInterval(t);
  }, [data.stage]);

  const go = (stage: Stage) => {
    setData({ ...data, stage });
    start(async () => { await setStageByBoard(boardKey, stage); await refresh(); });
  };
  const idx = STAGES.indexOf(data.stage);
  const { joined, writing, submitted } = data.counts;
  const total = data.size || 30;
  const thinkIdx = data.thinkCards.length ? think % data.thinkCards.length : 0;

  return (
    <BoardFit>
      <div className="b-head">
        <Logo />
        <div className="b-unit"><b>{data.subject} · {data.unit}</b><span>{data.classLabel}</span></div>
        <nav className="steps" aria-label="수업 단계">
          {STAGES.map((s, i) => (
            <button key={s} className={i === idx ? 'on' : i < idx ? 'done' : ''} onClick={() => go(s)}>
              <i>{i < idx ? '✓' : i + 1}</i>{STAGE_LABELS[s]}
            </button>
          ))}
        </nav>
      </div>
      <div className="b-body">
        {data.stage === 'lobby' && (
          <div className="lobby">
            <div className="qrcard">
              <div dangerouslySetInnerHTML={{ __html: qrSvg }} style={{ width: 250, height: 250 }} />
              <div className="code">{data.joinCode}</div>
              <div className="url">{joinUrl}</div>
            </div>
            <div>
              <h1 className="b-title">휴대폰으로 QR을 찍고 들어와요</h1>
              <p className="b-sub">처음이라면 학번과 4자리 비밀번호를 정해요. 이름은 묻지 않아요.</p>
              <div className="dots">{Array.from({ length: Math.min(total, 45) }, (_, i) => <span key={i} className={i < joined ? 'in' : ''} />)}</div>
              <div className="bignum">{joined}<small>/ {total} 입장</small></div>
              <div style={{ marginTop: 30 }}><button className="cta" onClick={() => go('intro')}>도입 카드 보기 →</button></div>
            </div>
          </div>
        )}
        {data.stage === 'intro' && (
          <>
            <div className="b-top">
              <div><h1 className="b-title">이 단원은 어디서 나올까?</h1><p className="b-sub">{data.unit} · 도입 3분 · 학생 기기는 아직 쓰지 않아요</p></div>
              <button className="cta" onClick={() => go('write')}>쓰기 시작 →</button>
            </div>
            <div className="cards3">{data.introCards.map((c) => <ExampleCardView key={c.id} card={c} big />)}</div>
          </>
        )}
        {data.stage === 'write' && (
          <>
            <div className="b-top">
              <div><h1 className="b-title">{josa(data.unit, '과/와')} 나를 잇기</h1><p className="b-sub">각자 휴대폰에서 세 단계로 써요 · 15분</p></div>
              <button className="cta" onClick={() => go('gallery')}>갤러리 열기 →</button>
            </div>
            <div className="wgrid">
              <div className="prog">
                <div className="bignum">{submitted}<small>/ {total} 제출</small></div>
                <div className="bar"><i className="s" style={{ width: `${(submitted / total) * 100}%` }} /><i className="w" style={{ width: `${(writing / total) * 100}%` }} /></div>
                <div className="blegend">
                  <span style={{ ['--c' as string]: 'var(--primary)' }}>제출<b>{submitted}</b></span>
                  <span style={{ ['--c' as string]: 'var(--amber)' }}>쓰는 중<b>{writing}</b></span>
                  <span style={{ ['--c' as string]: 'var(--line-2)' }}>아직<b>{Math.max(0, total - submitted - writing)}</b></span>
                </div>
                <p className="caption">칠판에는 숫자만 보여요. 누가 아직인지는 교사 화면에서만 확인해요.</p>
                <div className="order"><div><i>1단계</i>어떤 장면을 떠올렸어?</div><div><i>2단계</i>무엇을 계산·비교·예측해?</div><div><i>3단계</i>어떤 개념이랑 닮았어?</div></div>
              </div>
              <div className="think">
                <div className="lbl">막히면 이 질문을 떠올려봐</div>
                <blockquote>{data.thinkCards[thinkIdx]}</blockquote>
                <div className="nav">
                  <div className="pips">{data.thinkCards.map((_, i) => <i key={i} className={i === thinkIdx ? 'on' : ''} />)}</div>
                  <button onClick={() => setThink((v) => v + 1)}>다음 질문</button>
                </div>
              </div>
            </div>
          </>
        )}
        {data.stage === 'gallery' && (
          <>
            <div className="b-top">
              <div><h1 className="b-title">우리 반의 연결</h1><p className="b-sub">이름 없이 보여요 · 공유된 글 {data.sharedCount}개 중 선생님이 고른 글</p></div>
            </div>
            {data.displayed.length ? (
              <div className="gal3">
                {data.displayed.map((p) => (
                  <article key={p.id} className={`pcard${p.liked ? ' liked' : ''}`}>
                    <div className="ptop"><span className="tag">{p.interest}</span><span className="heart" title="친구들이 공감했어요"><Heart size={26} /></span></div>
                    <Rows answers={p.answers} free={p.free} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">아직 칠판에 띄운 글이 없어요<small>교사 화면에서 &lsquo;칠판에 띄우기&rsquo;를 누르면 여기에 크게 보여요 (최대 3개)</small></div>
            )}
          </>
        )}
      </div>
      {data.closed && <div className="closed-banner">이 수업은 닫혔어요</div>}
    </BoardFit>
  );
}
