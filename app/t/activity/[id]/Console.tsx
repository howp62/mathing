'use client';
import { useState, useTransition } from 'react';
import { addRehearsalStudents, closeActivity, resetStudentPin, setIntroCards, setRating, setStage, toggleDisplay, toggleStar } from '@/app/actions/teacher';
import { Rows } from '@/components/ui';
import { usePoll } from '@/components/usePoll';
import { MAX_DISPLAYED, RATING_LABELS, STAGES, STAGE_LABELS, type Stage } from '@/lib/constants';
import type { ConsoleData } from '@/lib/views';

const SEAT_LABEL: Record<string, string> = { absent: '미입장', registered: '미입장', joined: '입장', writing: '쓰는 중', submitted: '제출' };

export function Console({ initial, rehearsal }: { initial: ConsoleData; rehearsal: boolean }) {
  const { data, setData, refresh } = usePoll<ConsoleData>(`/api/console/${initial.id}`, initial, 3000);
  const [pending, start] = useTransition();
  const [rate, setRate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [seatAsk, setSeatAsk] = useState<number | null>(null);
  const [tempPin, setTempPin] = useState<{ no: number; pin: string } | null>(null);

  const run = (fn: () => Promise<{ error?: string } | unknown>) =>
    start(async () => {
      const res = (await fn()) as { error?: string } | undefined;
      setNotice(res && typeof res === 'object' && 'error' in res && res.error ? res.error : null);
      await refresh();
    });

  const goStage = (stage: Stage) => { setData({ ...data, stage }); run(() => setStage(data.id, stage)); };
  const idx = STAGES.indexOf(data.stage);
  const counts = data.seats.reduce<Record<string, number>>((m, s) => { m[s.state] = (m[s.state] ?? 0) + 1; return m; }, {});
  const flaggedCount = data.posts.filter((p) => p.flagged).length;

  return (
    <main className="tmain">
      <p style={{ margin: '0 0 6px' }}><a href="/t">← 반과 수업</a></p>
      <div className="row" style={{ alignItems: 'center', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 style={{ marginBottom: 2 }}>{data.classLabel} · {data.unit}</h1>
          <p className="muted" style={{ margin: 0 }}>교사 화면이에요. 학번과 평가가 보이니 전자칠판이 아니라 선생님 기기에서 보세요.
            {data.setStatus === 'draft' && <> <span className="pill warn">예시 카드 검수 전</span></>}
          </p>
        </div>
        {data.boardKey && <a className="btn" href={`/b/${data.boardKey}`} target="_blank" rel="noopener" title="전자칠판에서 이 주소를 여세요. 선생님 로그인 없이 열려요.">칠판 화면 열기 ↗</a>}
        {!data.closed && (confirmClose
          ? <span className="prow-act"><span style={{ fontSize: 13 }}>수업을 닫으면 더는 제출할 수 없어요.</span>
              <button className="mini on" onClick={() => { setConfirmClose(false); run(() => closeActivity(data.id)); }}>닫기</button>
              <button className="mini" onClick={() => setConfirmClose(false)}>취소</button></span>
          : <button className="btn danger" onClick={() => setConfirmClose(true)}>수업 닫기</button>)}
      </div>
      {data.closed && <p className="msg ok">이 수업은 닫혔어요. 기록은 학생 기록과 엑셀 내보내기에서 볼 수 있어요.</p>}
      {notice && <p className="msg error" role="alert">{notice}</p>}

      <div className="panel-card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ alignItems: 'center' }}>
          <nav className="stage-bar" aria-label="수업 단계">
            {STAGES.map((s, i) => (
              <button key={s} className={i === idx ? 'on' : ''} disabled={data.closed || pending} onClick={() => goStage(s)}>
                <i>{i + 1}</i>{STAGE_LABELS[s]}
              </button>
            ))}
          </nav>
          <span className="muted" style={{ marginLeft: 'auto', fontSize: 14 }}>
            입장 {data.counts.joined} · 쓰는 중 {data.counts.writing} · 제출 {data.counts.submitted} / {data.size}명 · 입장 코드 <span className="code-chip">{data.joinCode}</span>
          </span>
        </div>
      </div>

      <div className="console">
        <section className="panel-card">
          <div className="row" style={{ alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>제출된 글 {data.posts.length}</h2>
            {flaggedCount > 0 && <span className="pill danger">확인 필요 {flaggedCount}</span>}
            <label className="tgl" style={{ marginLeft: 'auto' }}><input type="checkbox" checked={rate} onChange={(e) => setRate(e.target.checked)} /> 연결 수준 평가</label>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>칠판에는 최대 {MAX_DISPLAYED}개까지 이름 없이 띄울 수 있어요. ★는 다른 반·다음 해 예시 후보예요.</p>
          {data.posts.length === 0 && <p className="muted">아직 제출된 글이 없어요. 칠판에서 &lsquo;쓰기&rsquo; 단계로 넘어가면 학생들이 쓰기 시작해요.</p>}
          <div className="plist">
            {data.posts.map((p) => (
              <article key={p.id} className={`prow${p.flagged ? ' flagged' : ''}`}>
                <div className="prow-top">
                  <span className="sid">{p.studentNo}</span>
                  <span className="tag sm">{p.interest}</span>
                  {p.flagged && <span className="pill danger" title="AI 코치가 위기 신호를 발견했어요. 학생과 직접 이야기해 보세요.">확인 필요</span>}
                  {!p.shareClass && <span className="pill">반 공유 안 함</span>}
                  {p.liked && <span className="pill hot">공감 받음</span>}
                  {p.relevance && <span className="pill">관련성 {p.relevance}/5</span>}
                  {p.concepts.length > 0 && <span className="muted" style={{ fontSize: 12 }}>고른 개념: {p.concepts.join(', ')}</span>}
                </div>
                <Rows answers={p.answers} free={p.free} />
                <div className="prow-act">
                  <button className={`mini${p.displayed ? ' on' : ''}`} disabled={!p.shareClass || data.closed || pending}
                    title={p.shareClass ? '' : '학생이 반 공유를 꺼 뒀어요'}
                    onClick={() => run(() => toggleDisplay(data.id, p.id))}>{p.displayed ? '칠판에서 내리기' : '칠판에 띄우기'}</button>
                  <button className={`mini star${p.starred ? ' on' : ''}`} disabled={!p.shareExample || pending}
                    title={p.shareExample ? '' : '학생이 예시 사용에 동의하지 않았어요'}
                    onClick={() => run(() => toggleStar(p.id))}>{p.shareExample ? (p.starred ? '★ 예시 후보' : '☆ 예시 후보') : '예시 동의 없음'}</button>
                  {rate && (
                    <span className="seg" role="group" aria-label="연결 수준">
                      {RATING_LABELS.map((l, i) => (
                        <button key={l} className={p.rating === i ? 'on' : ''} onClick={() => run(() => setRating(p.id, p.rating === i ? null : i))}>{l}</button>
                      ))}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="stack">
          <section className="panel-card">
            <h2>학번별 현황</h2>
            <div className="seats">
              {data.seats.map((s) => (
                <button key={s.no} className={`seat ${s.state}`} title={`${s.no} · ${SEAT_LABEL[s.state] ?? s.state}${s.locked ? ' · 잠김' : ''}`}
                  onClick={() => setSeatAsk(seatAsk === s.no ? null : s.no)}>
                  {String(s.no).slice(-2)}
                  {s.flagged && <span className="flag" />}
                  {s.locked && <span className="lock" aria-hidden="true">🔒</span>}
                </button>
              ))}
            </div>
            <div className="legend">
              <span style={{ ['--c' as string]: 'var(--paper)', ['--b' as string]: 'var(--line-2)' }}>미입장</span>
              <span style={{ ['--c' as string]: '#fff', ['--b' as string]: 'var(--line-2)' }}>입장</span>
              <span style={{ ['--c' as string]: 'var(--amber-soft)', ['--b' as string]: 'var(--amber)' }}>쓰는 중</span>
              <span style={{ ['--c' as string]: 'var(--primary)' }}>제출</span>
            </div>
            {seatAsk !== null && (
              <div className="note" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <b>{seatAsk}</b> 학생의 비밀번호를 초기화할까요? 임시 비밀번호가 나오고, 이 학번으로 들어와 있던 기기는 모두 로그아웃돼요.
                <button className="mini on" onClick={() => { const no = seatAsk; setSeatAsk(null); start(async () => { const r = await resetStudentPin(data.classId, no); if ('pin' in r && r.pin) setTempPin({ no, pin: r.pin }); else if (r.error) setNotice(r.error); await refresh(); }); }}>초기화</button>
                <button className="mini" onClick={() => setSeatAsk(null)}>취소</button>
              </div>
            )}
            {tempPin && <p className="note warn"><b>{tempPin.no}</b> 학생의 임시 비밀번호는 <b>{tempPin.pin}</b>이에요. 학생에게만 알려 주세요. <button className="mini" onClick={() => setTempPin(null)}>닫기</button></p>}
            <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>입장 {counts.joined ?? 0} · 쓰는 중 {counts.writing ?? 0} · 제출 {counts.submitted ?? 0}</p>
          </section>

          {rehearsal && !data.closed && (
            <section className="panel-card">
              <h2>리허설</h2>
              <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>연습용 데이터베이스에서만 보이는 기능이에요. 가상 학생들이 들어와 글을 낸 상태를 만들어 칠판과 이 화면을 미리 볼 수 있어요. 15번 자리는 비워 두니, 다른 기기나 탭에서 학생으로 직접 들어와 보세요.</p>
              <button className="btn ghost" disabled={pending} onClick={() => run(() => addRehearsalStudents(data.id))}>가상 학생 채우기</button>
            </section>
          )}

          <section className="panel-card">
            <h2>도입 카드 고르기 <span className="muted" style={{ fontSize: 13, fontWeight: 500 }}>(최대 3장)</span></h2>
            <div className="intro-pick">
              {data.allExamples.map((e) => {
                const on = data.introIds.includes(e.id);
                return (
                  <label key={e.id}>
                    <input type="checkbox" checked={on} disabled={pending || (!on && data.introIds.length >= 3)}
                      onChange={() => {
                        const next = on ? data.introIds.filter((x) => x !== e.id) : [...data.introIds, e.id];
                        setData({ ...data, introIds: next });
                        run(() => setIntroCards(data.id, next));
                      }} />
                    <span>{e.title}</span><span className="tag sm" style={{ marginLeft: 'auto' }}>{e.tags[0]}</span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
