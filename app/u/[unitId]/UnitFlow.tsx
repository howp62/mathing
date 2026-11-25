'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '@/app/actions/account';
import { saveConnection } from '@/app/actions/connect';
import { ExampleCardView, Rows } from '@/components/ui';
import { FRAME_BLANK, FREE_FRAMES, INTERESTS, MAX_ANSWER, STEP_QUESTIONS, josa, type ExampleCard } from '@/lib/constants';

/** interestPrompts: 관심사 맞춤 생각 열기 질문. 서버가 검수 상태를 보고 공개할 것만 넘긴다 */
type SetData = { id: string; subject: string; unit: string; concepts: string[]; thinkCards: string[]; interestPrompts: Record<string, string>; examples: ExampleCard[] };
type Profile = { interests: string[]; career: string; careerUnknown: boolean };
type Rewrite = { answers: string[]; free: boolean; concepts: string[]; share: boolean; interest: string } | null;
type Step = 'pre' | 'intro' | 'interests' | 'examples' | 'think' | 'write' | 'save';
const FLOW: Step[] = ['pre', 'intro', 'interests', 'examples', 'think', 'write', 'save'];
const STEP_NAMES: Record<Step, string> = { pre: '시작 전', intro: '생활 속 예시', interests: '관심사', examples: '관심사 예시', think: '질문 고르기', write: '글쓰기', save: '저장' };

function Scale({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <>
      <div className="scale" role="radiogroup" aria-label="5점 척도">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} className={value === n ? 'on' : ''} onClick={() => onChange(n)}>{n}</button>
        ))}
      </div>
      <div className="scale-lbl"><span>전혀 아니다</span><span>매우 그렇다</span></div>
    </>
  );
}

export function UnitFlow({ set, profile, rewrite, userKey }: { set: SetData; profile: Profile; rewrite: Rewrite; userKey: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(rewrite ? 'write' : 'pre');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [pre, setPre] = useState<number | null>(null);
  const [post, setPost] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [career, setCareer] = useState(profile.career);
  const [unknown, setUnknown] = useState(profile.careerUnknown);
  const [custom, setCustom] = useState('');
  const [editProfile, setEditProfile] = useState(profile.interests.length === 0);
  const [thinkI, setThinkI] = useState(0);

  const [free, setFree] = useState(rewrite?.free ?? false);
  const [answers, setAnswers] = useState<string[]>(rewrite && !rewrite.free ? [...rewrite.answers] : ['', '', '']);
  const [freeText, setFreeText] = useState(rewrite?.free ? rewrite.answers[0] ?? '' : '');
  const [concepts, setConcepts] = useState<string[]>(rewrite?.concepts ?? []);
  const [share, setShare] = useState(rewrite?.share ?? true);
  const [interest, setInterest] = useState(rewrite && profile.interests.includes(rewrite.interest) ? rewrite.interest : profile.interests[0] || '');

  // 질문의 문장으로 기억해 두면 질문 순서가 바뀌어도 고른 것을 다시 찾을 수 있다.
  const thinkList = useMemo(() => [
    ...interests.filter((t) => set.interestPrompts[t]).slice(0, 3).map((t) => ({ mine: `${josa(t, '을/를')} 고른 너에게` as string | null, text: set.interestPrompts[t] })),
    ...set.thinkCards.map((text) => ({ mine: null as string | null, text })),
  ], [interests, set.interestPrompts, set.thinkCards]);
  const ti = Math.min(thinkI, thinkList.length - 1);
  const hasMine = thinkList.some((t) => t.mine);
  const writingQuestion = thinkList[ti];

  // 쓰던 글을 이 기기에 잠깐 보관한다(새로고침해도 사라지지 않게). 로그아웃하면 지운다
  // 키에 계정 표시를 넣어, 같은 기기를 다음 학생이 써도 앞 학생의 글이 채워지지 않게 한다
  const draftKey = `mathing-draft-${userKey}-${set.id}${rewrite ? '-re' : ''}`;
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw) as { answers?: string[]; freeText?: string; free?: boolean; concepts?: string[]; share?: boolean; interest?: string; pre?: number | null; post?: number | null; question?: string };
      if (Array.isArray(d.answers) && d.answers.length === 3) setAnswers(d.answers.map(String));
      if (typeof d.freeText === 'string') setFreeText(d.freeText);
      if (typeof d.free === 'boolean') setFree(d.free);
      if (Array.isArray(d.concepts)) setConcepts(d.concepts.map(String));
      if (typeof d.share === 'boolean') setShare(d.share);
      if (typeof d.interest === 'string' && profile.interests.includes(d.interest)) setInterest(d.interest);
      if (typeof d.question === 'string') {
        const found = thinkList.findIndex((q) => q.text === d.question);
        if (found >= 0) setThinkI(found);
      }
      for (const [value, update] of [[d.pre, setPre], [d.post, setPost]] as const) {
        if (value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5)) update(value);
      }
    } catch { /* 보관한 글을 못 읽으면 새로 쓴다 */ }
    finally { setRestored(true); }
  }, [draftKey]);
  useEffect(() => {
    // 복원이 끝난 렌더부터 저장해, 처음 화면의 기본값으로 기존 선택을 덮어쓰지 않는다.
    if (!restored) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ answers, freeText, free, concepts, share, interest, pre, post, question: writingQuestion?.text })); } catch { /* 보관 못 해도 쓰기는 계속 */ }
  }, [draftKey, restored, answers, freeText, free, concepts, share, interest, pre, post, writingQuestion]);

  const go = (s: Step) => { setError(null); setStep(s); window.scrollTo(0, 0); };
  const idx = FLOW.indexOf(step);
  const back = rewrite ? (step === 'save' ? 'write' : null) : idx > 0 ? FLOW[idx - 1] : null;
  const unitJ = josa(set.unit, '이/가');

  const intro = set.examples.slice(0, 3);
  const picked = useMemo(() => {
    const has = (e: ExampleCard) => e.tags.some((t) => interests.includes(t));
    const notIntro = set.examples.filter((e) => !intro.includes(e));
    const matched = [...notIntro.filter(has), ...intro.filter(has)];
    return matched.length ? { cards: matched.slice(0, 3), none: false } : { cards: notIntro.slice(0, 3), none: true };
  }, [interests, set.examples]); // eslint-disable-line react-hooks/exhaustive-deps

  const finalAnswers = free ? [freeText] : answers;
  const hasText = finalAnswers.join('').trim().length > 0;

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const changeInterests = (next: string[]) => {
    setInterests(next);
    setThinkI(0);
  };

  // 문장 틀: 칸 끝에 붙이고 첫 빈칸을 선택해 바로 타이핑하면 채워지게 한다. slot 0~2는 3단계 칸, 3은 자유 쓰기 칸
  const areas = useRef<(HTMLTextAreaElement | null)[]>([]);
  // 넣은 틀의 빈칸 위치. 화면에 새 글이 그려진 바로 뒤에 그 칸을 골라 둔다
  const pendingSel = useRef<{ slot: number; start: number; end: number } | null>(null);
  useLayoutEffect(() => {
    const p = pendingSel.current;
    if (!p) return;
    pendingSel.current = null;
    const ta = areas.current[p.slot];
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(p.start, p.end);
  });
  const insertFrame = (slot: number, frame: string) => {
    const cur = slot === 3 ? freeText : answers[slot];
    const sep = cur && !/\s$/.test(cur) ? ' ' : '';
    const next = cur + sep + frame;
    if (next.length > MAX_ANSWER) return;
    if (slot === 3) setFreeText(next);
    else setAnswers(answers.map((a, j) => (j === slot ? next : a)));
    const at = cur.length + sep.length + frame.indexOf(FRAME_BLANK);
    pendingSel.current = frame.includes(FRAME_BLANK) ? { slot, start: at, end: at + FRAME_BLANK.length } : { slot, start: next.length, end: next.length };
  };
  const frames = (slot: number, list: readonly string[]) => (
    <div className="frames" role="group" aria-label="문장 틀">
      <span className="lbl">이렇게 시작해 봐</span>
      {list.map((f) => <button key={f} type="button" onClick={() => insertFrame(slot, f)}>{f.split(FRAME_BLANK).join('…')}</button>)}
    </div>
  );
  const finishWriting = () => {
    if (finalAnswers.some((a) => a.includes(FRAME_BLANK))) return setError(`아직 채우지 않은 빈칸 ${FRAME_BLANK}이 있어. 채우거나 지워 줘.`);
    go('save');
  };

  const submitProfile = () => start(async () => {
    const res = await saveProfile({ interests, career, careerUnknown: unknown });
    if (res.error) return setError(res.error);
    if (!interests.includes(interest)) setInterest(interests[0] ?? '');
    setEditProfile(false);
    go('examples');
  });

  const submit = () => start(async () => {
    const res = await saveConnection({ unitId: set.id, answers: finalAnswers, concepts: free ? [] : concepts, free, interest, share, pre, post, rewrite: !!rewrite });
    if (res.error) return setError(res.error);
    try { localStorage.removeItem(draftKey); } catch { /* 없음 */ }
    router.push(rewrite ? '/notes?saved=re' : `/u/${set.id}/gallery?saved=1`);
  });

  const header = (
    <>
      <div className="top">
        {back ? <button type="button" className="back" onClick={() => go(back)} aria-label="뒤로">‹</button> : <a className="back" href={rewrite ? '/notes' : '/home'} aria-label="나가기">‹</a>}
        <span className="ttl">{set.subject} · {set.unit}{rewrite ? ' · 다시 쓰기' : ''}</span>
      </div>
      {!rewrite && (
        <>
          {/* 단계 표시: 지난 단계 › 지금 단계 › 다음 단계 (단계가 많아 지금 어디인지 헷갈리지 않게) */}
          <nav className="crumb" aria-label="단계">
            {idx > 0 && <><span>{STEP_NAMES[FLOW[idx - 1]]}</span><span className="sep" aria-hidden="true">›</span></>}
            <b aria-current="step">{STEP_NAMES[step]}</b>
            {idx < FLOW.length - 1 && <><span className="sep" aria-hidden="true">›</span><span>{STEP_NAMES[FLOW[idx + 1]]}</span></>}
            <span className="count">{idx + 1}/{FLOW.length}</span>
          </nav>
          <div className="progress" aria-hidden="true">{FLOW.map((f, i) => <i key={f} className={i < idx ? 'on' : i === idx ? 'now' : ''} />)}</div>
        </>
      )}
    </>
  );
  const err = error && <p className="msg err" role="alert">{error}</p>;
  // 아래쪽 버튼 줄: 이전 단계로 가는 버튼(어디로 가는지 이름까지)과 이 단계의 버튼. 쓰던 글은 그대로 남는다
  const foot = (children: ReactNode) => (
    <div className="foot">
      {back ? (
        <div className="foot-row">
          <button type="button" className="btn prev" onClick={() => go(back)} aria-label={`이전 단계: ${STEP_NAMES[back]}`}>
            <span aria-hidden="true">‹ 이전</span><small aria-hidden="true">{STEP_NAMES[back]}</small>
          </button>
          <div className="main">{children}</div>
        </div>
      ) : children}
    </div>
  );
  const recall = (
    <details className="recall">
      <summary>예시와 다른 질문 더 보기<small>예시 하나를 골라 네 이야기로 바꿔 써도 돼.</small></summary>
      <div className="in">
        <h3>{picked.none ? '예시 카드' : '네 관심사 예시'}</h3>
        <div className="deck">{picked.cards.map((e) => <ExampleCardView key={e.id} card={e} />)}</div>
        <h3>생각 열기 질문</h3>
        <ol>{thinkList.map((t, i) => <li key={i}>{t.mine && <b>{t.mine}</b>}{t.text}</li>)}</ol>
      </div>
    </details>
  );

  if (step === 'pre') return (
    <div>{header}
      <h1>시작하기 전에 하나만</h1>
      <p className="sub">&ldquo;{set.unit}&rdquo;{unitJ.slice(set.unit.length)} 내 생활과 이어져 있다고 느껴?</p>
      <Scale value={pre} onChange={setPre} />
      <p className="muted" style={{ marginTop: 14 }}>정답은 없어. 다 쓰고 나서 한 번 더 물어볼게.</p>
      <div className="foot">
        <button className="btn" disabled={!pre} onClick={() => go('intro')}>다음</button>
        <button type="button" className="linkbtn" onClick={() => { setPre(null); go('intro'); }}>건너뛰기</button>
      </div>
    </div>
  );

  if (step === 'intro') return (
    <div>{header}
      <h1>{set.unit}{josa(set.unit, '은/는').slice(set.unit.length)} 어디서 나올까?</h1>
      <p className="sub">아래로 내려 봐.</p>
      <div className="deck">{intro.map((e) => <ExampleCardView key={e.id} card={e} />)}</div>
      {foot(<button className="btn" onClick={() => go('interests')}>다음</button>)}
    </div>
  );

  if (step === 'interests') {
    if (!editProfile) return (
      <div>{header}
        <h1>관심사는 이대로 갈까?</h1>
        <p className="sub">지난번에 고른 걸 기억해 뒀어.</p>
        <div className="card">
          <div className="chips">{interests.map((t) => <span key={t} className="chip on">{t}</span>)}</div>
          <p className="muted" style={{ margin: '10px 0 0' }}>진로: {unknown ? '아직 몰라요' : career || '안 적음'}</p>
        </div>
        {foot(<>
          <button className="btn" onClick={() => go('examples')}>이대로 갈래</button>
          <button className="btn ghost" onClick={() => setEditProfile(true)}>바꿀래</button>
        </>)}
      </div>
    );
    const customs = interests.filter((t) => !(INTERESTS as readonly string[]).includes(t));
    return (
      <div>{header}
        <h1>요즘 관심 있는 건?</h1>
        <p className="sub">좋아하는 걸 골라 줘. 여러 개 골라도 되고, 다음에도 쓸 수 있게 기억해 둘게.</p>
        <div className="chips">
          {[...INTERESTS, ...customs].map((t) => (
            <button key={t} type="button" className={`chip ${interests.includes(t) ? 'on' : ''}`} aria-pressed={interests.includes(t)} onClick={() => changeInterests(toggle(interests, t))}>{t}</button>
          ))}
        </div>
        <div className="row-btns" style={{ marginTop: 10 }}>
          <div className="field" style={{ flex: 1, margin: 0 }}><input aria-label="관심사 직접 쓰기" value={custom} maxLength={12} placeholder="직접 쓰기 (예: 천문학)" onChange={(e) => setCustom(e.target.value)} /></div>
          <button type="button" className="mini" onClick={() => { const t = custom.trim(); if (t && !interests.includes(t)) changeInterests([...interests, t]); setCustom(''); }}>추가</button>
        </div>
        <h2>진로 (선택)</h2>
        <div className="field"><input aria-label="진로" value={career} maxLength={40} disabled={unknown} placeholder="예: 게임 기획자, 간호사, 건축가" onChange={(e) => setCareer(e.target.value)} /></div>
        <label className="check"><input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} /><span>아직 몰라요 (괜찮아!)</span></label>
        {err}
        {foot(<button className="btn" disabled={!interests.length || pending} onClick={submitProfile}>{pending ? '저장 중…' : '다음'}</button>)}
      </div>
    );
  }

  if (step === 'examples') return (
    <div>{header}
      <h1>네 관심사로 보면</h1>
      <p className="sub">{picked.none ? <>네가 고른 관심사의 예시는 아직 없어. 다른 예시에서 힌트를 찾아보자.</> : `${interests.join(', ')}에 수학이 어떻게 쓰이는지 살펴보자.`}</p>
      <div className="deck">{picked.cards.map((e) => <ExampleCardView key={e.id} card={e} />)}</div>
      {foot(<button className="btn" onClick={() => go('think')}>다음</button>)}
    </div>
  );

  if (step === 'think') return (
    <div>{header}
      <h1>어떤 질문으로 써 볼까?</h1>
      <p className="sub">{hasMine ? '네 관심사에 맞는 질문부터 볼게. ' : ''}질문을 넘겨 보고, 써 보고 싶은 질문을 골라 줘. 고른 질문은 글을 쓰는 동안에도 보여 줄게.</p>
      <div className="card think" aria-live="polite">
        <small className={thinkList[ti].mine ? 'mine' : ''}>{thinkList[ti].mine ?? '생각 열기'} · {ti + 1} / {thinkList.length}</small>{thinkList[ti].text}
      </div>
      <div className="row-btns" style={{ marginTop: 12 }}>
        <button className="btn ghost" disabled={ti === 0} onClick={() => setThinkI(ti - 1)}>‹ 이전 질문</button>
        <button className="btn ghost" disabled={ti >= thinkList.length - 1} onClick={() => setThinkI(ti + 1)}>다음 질문 ›</button>
      </div>
      {foot(<button className="btn" onClick={() => go('write')}>이 질문으로 글쓰기</button>)}
    </div>
  );

  if (step === 'write') return (
    <div className="write-flow">{header}
      <h1>{rewrite ? '배우고 나서 다시 써 보자' : '나만의 연결 쓰기'}</h1>
      {rewrite && <p className="sub">처음 쓴 글을 불러왔어. 더 구체적으로 고쳐 봐. 처음 연결은 노트에 그대로 남아.</p>}
      {writingQuestion && (
        <aside className="writing-question" aria-label="글쓰기 질문">
          <div className="writing-question-head">
            <b>이 질문을 보며 써 보자</b>
            <button type="button" onClick={() => go('think')}>질문 바꾸기</button>
          </div>
          <p>{writingQuestion.text}</p>
        </aside>
      )}
      {recall}
      <div className="chips" role="group" aria-label="쓰는 방식">
        <button type="button" className={`chip sm ${!free ? 'on' : ''}`} aria-pressed={!free} onClick={() => setFree(false)}>세 질문에 나눠 쓰기</button>
        <button type="button" className={`chip sm ${free ? 'on' : ''}`} aria-pressed={free} onClick={() => setFree(true)}>한 칸에 자유롭게</button>
      </div>
      {!free ? STEP_QUESTIONS.map((sq, i) => (
        <div key={i}>
          <div className="stepq"><div className="lbl">{sq.label}</div><div className="q">{sq.q}</div><div className="s">{sq.sub}</div></div>
          {i === 2 && (
            <div className="chips" style={{ margin: '8px 0' }} role="group" aria-label="개념 고르기">
              {set.concepts.map((c) => <button key={c} type="button" className={`chip sm ${concepts.includes(c) ? 'on' : ''}`} aria-pressed={concepts.includes(c)} onClick={() => setConcepts(toggle(concepts, c))}>{c}</button>)}
            </div>
          )}
          {frames(i, sq.frames)}
          <div className="field"><textarea ref={(el) => { areas.current[i] = el; }} aria-label={sq.q} maxLength={MAX_ANSWER} placeholder={sq.ph} value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} /></div>
        </div>
      )) : (
        <>
          <div className="stepq"><div className="q">{set.unit}{josa(set.unit, '과/와').slice(set.unit.length)} 네 관심사가 어떻게 이어지는지 자유롭게 써 봐.</div><div className="s">한두 문장이어도 충분해.</div></div>
          {frames(3, FREE_FRAMES)}
          <div className="field"><textarea ref={(el) => { areas.current[3] = el; }} aria-label="자유롭게 쓰기" maxLength={MAX_ANSWER} style={{ minHeight: 160 }} value={freeText} onChange={(e) => setFreeText(e.target.value)} /></div>
        </>
      )}
      <p className="muted">쓰던 글은 이 기기에 잠깐 보관돼. 로그아웃하면 지워져.</p>
      {err}
      {foot(<button className="btn" disabled={!hasText} onClick={finishWriting}>다 썼어</button>)}
    </div>
  );

  // 저장
  const preview = free ? [freeText] : answers.map((a, i) => (i === 2 && concepts.length ? (a ? `${a} (${concepts.join(', ')})` : concepts.join(', ')) : a));
  return (
    <div>{header}
      <h1>이렇게 저장할게</h1>
      <div className="post"><div className="head"><span className="tag">{interest || '관심사'}</span></div><Rows answers={preview} free={free} /></div>
      {interests.length > 1 && (
        <>
          <p className="muted" style={{ margin: '4px 0 6px' }}>어떤 관심사로 쓴 연결이야?</p>
          <div className="chips">{interests.map((t) => <button key={t} type="button" className={`chip sm ${interest === t ? 'on' : ''}`} aria-pressed={interest === t} onClick={() => setInterest(t)}>{t}</button>)}</div>
        </>
      )}
      <label className="switch">
        <span className="t"><b>다른 학생들에게 공유</b>이름 없이, 사이트를 쓰는 모든 학생이 볼 수 있어. 나중에 노트에서 끌 수 있어.</span>
        <input type="checkbox" className="tg" checked={share} onChange={(e) => setShare(e.target.checked)} />
      </label>
      <h2>다 쓰고 나니, &ldquo;{set.unit}&rdquo;{unitJ.slice(set.unit.length)} 내 생활과 이어져 있다고 느껴?</h2>
      <p className="muted">지금 느끼는 대로 골라 줘. 고르지 않고 저장해도 돼.</p>
      <Scale value={post} onChange={setPost} />
      {err}
      {foot(<button className="btn" disabled={pending} onClick={submit}>{pending ? '저장 중…' : '저장하기'}</button>)}
    </div>
  );
}
