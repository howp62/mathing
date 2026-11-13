'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '@/app/actions/account';
import { saveConnection } from '@/app/actions/connect';
import { ExampleCardView, Rows } from '@/components/ui';
import { INTERESTS, MAX_ANSWER, STEP_QUESTIONS, josa, type ExampleCard } from '@/lib/constants';

type SetData = { id: string; subject: string; unit: string; concepts: string[]; thinkCards: string[]; examples: ExampleCard[] };
type Profile = { interests: string[]; career: string; careerUnknown: boolean };
type Rewrite = { answers: string[]; free: boolean; concepts: string[]; share: boolean; interest: string } | null;
type Step = 'pre' | 'intro' | 'interests' | 'examples' | 'think' | 'write' | 'save';
const FLOW: Step[] = ['pre', 'intro', 'interests', 'examples', 'think', 'write', 'save'];

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
  const [interest, setInterest] = useState(rewrite?.interest || profile.interests[0] || '');

  // 쓰던 글을 이 기기에 잠깐 보관한다(새로고침해도 사라지지 않게). 로그아웃하면 지운다
  // 키에 계정 표시를 넣어, 같은 기기를 다음 학생이 써도 앞 학생의 글이 채워지지 않게 한다
  const draftKey = `mathing-draft-${userKey}-${set.id}${rewrite ? '-re' : ''}`;
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw) as { answers?: string[]; freeText?: string; free?: boolean; concepts?: string[] };
      if (Array.isArray(d.answers) && d.answers.length === 3) setAnswers(d.answers.map(String));
      if (typeof d.freeText === 'string') setFreeText(d.freeText);
      if (typeof d.free === 'boolean') setFree(d.free);
      if (Array.isArray(d.concepts)) setConcepts(d.concepts.map(String));
    } catch { /* 보관한 글을 못 읽으면 새로 쓴다 */ }
  }, [draftKey]);
  useEffect(() => {
    if (!restored.current) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ answers, freeText, free, concepts })); } catch { /* 보관 못 해도 쓰기는 계속 */ }
  }, [draftKey, answers, freeText, free, concepts]);

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
      {!rewrite && <div className="progress" aria-hidden="true">{FLOW.map((f, i) => <i key={f} className={idx >= i ? 'on' : ''} />)}</div>}
    </>
  );
  const err = error && <p className="msg err" role="alert">{error}</p>;

  if (step === 'pre') return (
    <div>{header}
      <h1>시작하기 전에 하나만</h1>
      <p className="sub">&ldquo;{set.unit}&rdquo;{unitJ.slice(set.unit.length)} 나와 관련 있다고 느껴?</p>
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
      <p className="sub">옆으로 넘겨 봐.</p>
      <div className="deck">{intro.map((e) => <ExampleCardView key={e.id} card={e} />)}</div>
      <div className="foot"><button className="btn" onClick={() => go('interests')}>다음</button></div>
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
        <div className="foot">
          <button className="btn" onClick={() => go('examples')}>이대로 갈래</button>
          <button className="btn ghost" onClick={() => setEditProfile(true)}>바꿀래</button>
        </div>
      </div>
    );
    const customs = interests.filter((t) => !(INTERESTS as readonly string[]).includes(t));
    return (
      <div>{header}
        <h1>요즘 관심 있는 건?</h1>
        <p className="sub">여러 개 골라도 돼. 다음 단원부터는 기억해 둘게.</p>
        <div className="chips">
          {[...INTERESTS, ...customs].map((t) => (
            <button key={t} type="button" className={`chip ${interests.includes(t) ? 'on' : ''}`} aria-pressed={interests.includes(t)} onClick={() => setInterests(toggle(interests, t))}>{t}</button>
          ))}
        </div>
        <div className="row-btns" style={{ marginTop: 10 }}>
          <div className="field" style={{ flex: 1, margin: 0 }}><input aria-label="관심사 직접 쓰기" value={custom} maxLength={12} placeholder="직접 쓰기 (예: 천문학)" onChange={(e) => setCustom(e.target.value)} /></div>
          <button type="button" className="mini" onClick={() => { const t = custom.trim(); if (t && !interests.includes(t)) setInterests([...interests, t]); setCustom(''); }}>추가</button>
        </div>
        <h2>진로 (선택)</h2>
        <div className="field"><input aria-label="진로" value={career} maxLength={40} disabled={unknown} placeholder="예: 게임 기획자, 간호사, 건축가" onChange={(e) => setCareer(e.target.value)} /></div>
        <label className="check"><input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} /><span>아직 몰라요 (괜찮아!)</span></label>
        {err}
        <div className="foot"><button className="btn" disabled={!interests.length || pending} onClick={submitProfile}>{pending ? '저장 중…' : '다음'}</button></div>
      </div>
    );
  }

  if (step === 'examples') return (
    <div>{header}
      <h1>네 관심사로 보면</h1>
      <p className="sub">{picked.none ? <>아직 네 관심사에 맞는 카드가 없어. <b>네가 첫 번째로 연결해 볼래?</b> 대신 다른 예시를 보여 줄게.</> : `${interests.join(', ')}에서 찾은 예시야.`}</p>
      <div className="deck">{picked.cards.map((e) => <ExampleCardView key={e.id} card={e} />)}</div>
      <div className="foot"><button className="btn" onClick={() => go('think')}>다음</button></div>
    </div>
  );

  if (step === 'think') return (
    <div>{header}
      <h1>생각을 열어 보자</h1>
      <p className="sub">질문을 넘기면서 떠오르는 장면을 찾아 봐.</p>
      <div className="card think" aria-live="polite"><small>생각 열기 {thinkI + 1} / {set.thinkCards.length}</small>{set.thinkCards[thinkI]}</div>
      <div className="row-btns" style={{ marginTop: 12 }}>
        <button className="btn ghost" disabled={thinkI === 0} onClick={() => setThinkI(thinkI - 1)}>‹ 이전</button>
        <button className="btn ghost" disabled={thinkI >= set.thinkCards.length - 1} onClick={() => setThinkI(thinkI + 1)}>다음 질문 ›</button>
      </div>
      <div className="foot"><button className="btn" onClick={() => go('write')}>떠올랐어, 쓰러 가기</button></div>
    </div>
  );

  if (step === 'write') return (
    <div>{header}
      <h1>{rewrite ? '배우고 나서 다시 써 보자' : '나만의 연결 쓰기'}</h1>
      {rewrite && <p className="sub">처음 쓴 글을 불러왔어. 더 구체적으로 고쳐 봐. 처음 연결은 노트에 그대로 남아.</p>}
      <div className="chips" role="group" aria-label="쓰는 방식">
        <button type="button" className={`chip sm ${!free ? 'on' : ''}`} aria-pressed={!free} onClick={() => setFree(false)}>3단계로</button>
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
          <div className="field"><textarea aria-label={sq.q} maxLength={MAX_ANSWER} placeholder={sq.ph} value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} /></div>
        </div>
      )) : (
        <>
          <div className="stepq"><div className="q">{set.unit}{josa(set.unit, '과/와').slice(set.unit.length)} 네 관심사가 어떻게 이어지는지 자유롭게 써 봐.</div><div className="s">한두 문장이어도 충분해.</div></div>
          <div className="field"><textarea aria-label="자유롭게 쓰기" maxLength={MAX_ANSWER} style={{ minHeight: 160 }} value={freeText} onChange={(e) => setFreeText(e.target.value)} /></div>
        </>
      )}
      <p className="muted">쓰던 글은 이 기기에 잠깐 보관돼. 로그아웃하면 지워져.</p>
      <div className="foot"><button className="btn" disabled={!hasText} onClick={() => go('save')}>다 썼어</button></div>
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
      <h2>다 쓰고 나니, &ldquo;{set.unit}&rdquo;{unitJ.slice(set.unit.length)} 나와 관련 있다고 느껴?</h2>
      <Scale value={post} onChange={setPost} />
      {err}
      <div className="foot"><button className="btn" disabled={pending} onClick={submit}>{pending ? '저장 중…' : '저장하기'}</button></div>
    </div>
  );
}
