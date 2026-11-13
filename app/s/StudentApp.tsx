'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { coachAsk, leave, markWriting, saveProfile, submitConnection, toggleLike } from '@/app/actions/student';
import { ExampleCardView, Heart, Logo, LogoMark, Rows } from '@/components/ui';
import { usePoll } from '@/components/usePoll';
import { INTERESTS, STEP_QUESTIONS, josa, type ExampleCard } from '@/lib/constants';
import type { StudentState } from '@/lib/studentView';

type Screen = 'profile' | 'wait' | 'examples' | 'write' | 'review' | 'after' | 'none';
type Draft = { answers: string[]; concepts: string[]; free: boolean; freeText: string };

const I_GAL = (<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>);
const I_NOTE = (<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h9l3.5 3.5v13.5H6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>);

/** 같은 기기를 다음 학생이 쓸 수 있으니, 나갈 때 이 기기에 남은 임시 저장 글을 모두 지운다 */
function clearDrafts() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith('mathing-draft-')) localStorage.removeItem(k);
  } catch { /* 저장소를 못 쓰면 지울 것도 없음 */ }
}

function firstScreen(s: StudentState): Screen {
  if (!s.activity) return 'none';
  const hasProfile = s.student.interests.length > 0 || !!s.student.career || s.student.careerUnknown;
  if (!hasProfile) return 'profile';
  if (s.activity.mine) return 'after';
  if (s.activity.stage === 'lobby' || s.activity.stage === 'intro') return 'wait';
  return 'examples';
}

function pickExamples(examples: ExampleCard[], interests: string[]) {
  const set = new Set(interests);
  const matched = examples.filter((e) => e.tags.some((t) => set.has(t)));
  const rest = examples.filter((e) => !matched.includes(e));
  const covered = new Set(examples.flatMap((e) => e.tags));
  return { cards: [...matched.slice(0, 3), ...rest].slice(0, 3), missing: interests.filter((t) => !covered.has(t)) };
}

export function StudentApp({ initial }: { initial: StudentState }) {
  const router = useRouter();
  const { data, refresh } = usePoll<StudentState>('/api/s/state', initial, 4000);
  const act = data.activity;
  const [screen, setScreen] = useState<Screen>(() => firstScreen(initial));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // 프로필
  const [interests, setInterests] = useState<string[]>(initial.student.interests);
  const [custom, setCustom] = useState<string[]>(initial.student.interests.filter((t) => !(INTERESTS as readonly string[]).includes(t)));
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [career, setCareer] = useState(initial.student.career);
  const [unknown, setUnknown] = useState(initial.student.careerUnknown);

  // 쓰기
  const mine = act?.mine;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(mine && !mine.free ? [...mine.answers] : ['', '', '']);
  const [concepts, setConcepts] = useState<string[]>(mine?.concepts ?? []);
  const [free, setFree] = useState(mine?.free ?? false);
  const [freeText, setFreeText] = useState(mine?.free ? mine.answers[0] : '');
  const [thinkIdx, setThinkIdx] = useState(-1);
  const [localCoach, setLocalCoach] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [shareClass, setShareClass] = useState(mine?.shareClass ?? true);
  const [shareEx, setShareEx] = useState(mine?.shareExample ?? false);
  const [pulse, setPulse] = useState<number>(mine?.relevance ?? 0);
  const [tab, setTab] = useState<'gallery' | 'note'>('gallery');
  const [toast, setToast] = useState(false);

  // 쓰던 글을 이 기기에 임시 저장 (연결이 끊겨도 잃지 않게)
  const draftKey = act ? `mathing-draft-${act.id}-${initial.student.no}` : null;
  const restored = useRef(false);
  useEffect(() => {
    if (!draftKey || restored.current || mine) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        setAnswers(d.answers ?? ['', '', '']); setConcepts(d.concepts ?? []); setFree(!!d.free); setFreeText(d.freeText ?? '');
      }
    } catch { /* 저장소를 못 쓰면 그냥 넘어감 */ }
  }, [draftKey, mine]);
  useEffect(() => {
    if (!draftKey) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ answers, concepts, free, freeText } satisfies Draft)); } catch { /* 무시 */ }
  }, [draftKey, answers, concepts, free, freeText]);

  // 선생님이 '쓰기'로 넘기면 기다리던 화면이 저절로 열린다
  useEffect(() => {
    if (screen === 'wait' && act && (act.stage === 'write' || act.stage === 'gallery')) setScreen('examples');
    if (screen !== 'none' && !act) setScreen('none');
    if (screen === 'none' && act) setScreen(firstScreen(data));
  }, [act, screen, data]);

  const allInterests = useMemo(() => [...INTERESTS, ...custom.filter((c) => !(INTERESTS as readonly string[]).includes(c))], [custom]);
  const examples = useMemo(() => (act ? pickExamples(act.examples, interests) : { cards: [], missing: [] }), [act, interests]);
  const finalAnswers = free ? [freeText.trim(), '', ''] : [answers[0].trim(), answers[1].trim(), (() => {
    const c = concepts.join(', '), t = answers[2].trim();
    return c && t ? `${c} — ${t}` : c || t;
  })()];
  const hasText = finalAnswers.some(Boolean);
  const coachStep = free ? 0 : step;
  const serverTurns = act?.coach.turns.filter((t) => t.step === coachStep).map((t) => t.question) ?? [];
  const coachLeft = act ? act.coach.limit - act.coach.used : 0;

  const head = (
    <header className="s-head">
      <Logo />
      {act && <span className="unit">{act.subject} · {act.unit}</span>}
      <button className="linkbtn" style={{ marginLeft: act ? 8 : 'auto', fontSize: 12 }} onClick={() => start(async () => { clearDrafts(); await leave(); router.push('/j'); })}>나가기</button>
    </header>
  );

  const go = (s: Screen) => { setError(null); setScreen(s); window.scrollTo({ top: 0 }); };

  /* ---------- 화면들 ---------- */

  if (screen === 'none') {
    return (
      <div className="sapp">{head}
        <div className="s-body">
          <div className="wait"><div className="biglogo" style={{ margin: '0 auto 14px' }}><LogoMark /></div>
            <div className="h1">지금 열린 수업이 없어</div>
            <p className="lead-s">선생님이 수업을 열면 여기서 바로 시작할 수 있어. 아래에서 지금까지 쓴 연결을 볼 수 있어.</p>
          </div>
          <Notebook data={data} />
        </div>
      </div>
    );
  }

  if (screen === 'profile') {
    const canNext = interests.length > 0 || career.trim().length > 0;
    return (
      <div className="sapp">{head}
        <div className="s-body">
          <div className="h1">요즘 뭐에 관심 있어?</div>
          <p className="lead-s">여러 개 골라도 돼. 언제든 바꿀 수 있어.</p>
          <div className="chips">
            {allInterests.map((t) => (
              <button key={t} className={`chip${interests.includes(t) ? ' on' : ''}`} aria-pressed={interests.includes(t)}
                onClick={() => setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}>{t}</button>
            ))}
            <button className="chip add" onClick={() => setCustomOpen(true)}>+ 직접 입력</button>
          </div>
          {customOpen && (
            <form className="field" style={{ marginTop: 10 }} onSubmit={(e) => {
              e.preventDefault();
              const t = customText.trim().slice(0, 20);
              if (t) { setCustom((prev) => (prev.includes(t) || (INTERESTS as readonly string[]).includes(t) ? prev : [...prev, t])); setInterests((prev) => (prev.includes(t) ? prev : [...prev, t])); }
              setCustomText(''); setCustomOpen(false);
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input aria-label="관심사 직접 입력" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="예: 보드게임, 천문학" maxLength={20} autoFocus />
                <button className="btn" style={{ flex: 'none' }}>추가</button>
              </div>
            </form>
          )}
          <div className="sec-l">꿈꾸는 진로가 있다면 (선택)</div>
          <div className="field" style={{ marginBottom: 10 }}>
            <input aria-label="진로" value={career} onChange={(e) => setCareer(e.target.value)} disabled={unknown} placeholder="예: 간호사, 게임 기획자, 건축가" maxLength={40} />
          </div>
          <button className={`chip soft${unknown ? ' on' : ''}`} aria-pressed={unknown} onClick={() => { setUnknown(!unknown); if (!unknown) setCareer(''); }}>아직 몰라요</button>
          {unknown && <p className="note">괜찮아! 관심사만으로도 충분히 연결할 수 있어. 연결을 쌓다 보면 진로의 실마리가 보일지도 몰라.</p>}
          {error && <p className="msg error" style={{ marginTop: 12 }}>{error}</p>}
        </div>
        <div className="s-foot">
          <button className="btn" disabled={!canNext || pending} onClick={() => start(async () => {
            const res = await saveProfile({ interests, career, careerUnknown: unknown });
            if (res.error) { setError(res.error); return; }
            await refresh();
            go(act && (act.stage === 'lobby' || act.stage === 'intro') && !act.mine ? 'wait' : act?.mine ? 'after' : 'examples');
          })}>다음</button>
        </div>
      </div>
    );
  }

  if (!act) return null;

  if (screen === 'wait') {
    return (
      <div className="sapp">{head}
        <div className="s-body">
          <div className="wait">
            <div className="biglogo" style={{ margin: '0 auto 14px' }}><LogoMark /></div>
            <div className="h1">들어왔어! 칠판을 봐줘</div>
            <p className="lead-s">선생님이 &lsquo;쓰기&rsquo;를 시작하면 이 화면이 저절로 바뀌어.</p>
            <button className="linkbtn" onClick={() => go('examples')}>예시 카드 먼저 보기</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'examples') {
    return (
      <div className="sapp">{head}
        <div className="s-body">
          <div className="qlabel">오늘의 연결</div>
          <div className="h1">오늘은 무엇과 연결해볼까?</div>
          <div className="chips" style={{ margin: '6px 0 2px' }}>
            {interests.map((t) => <span key={t} className="chip sm on">{t}</span>)}
            {career && !unknown && <span className="chip sm on">진로: {career}</span>}
            <button className="chip sm" onClick={() => go('profile')}>바꾸기</button>
          </div>
          <div className="sec-l">이 단원은 여기서도 나와</div>
          <div className="hs">{examples.cards.map((c) => <ExampleCardView key={c.id} card={c} />)}</div>
          <p className="hint-s">옆으로 넘겨서 더 볼 수 있어</p>
          {examples.missing.length > 0 && (
            <p className="note idea">{examples.missing.join(', ')} 카드는 아직 없어. 네가 첫 번째로 연결해볼래? 좋은 연결은 다음 친구들의 예시가 될 수 있어.</p>
          )}
        </div>
        <div className="s-foot">
          <button className="btn" onClick={() => { void markWriting(); go('write'); }}>내 연결 쓰러 가기</button>
        </div>
      </div>
    );
  }

  const coachBlock = act.coach.enabled ? (
    <div>
      {[...serverTurns, ...localCoach].map((m, i) => (
        <div className="coachmsg" key={i}><span className="av"><LogoMark /></span><div className="bub">{m}</div></div>
      ))}
      {typing && <div className="coachmsg"><span className="av"><LogoMark /></span><div className="bub"><span className="typing"><i /><i /><i /></span></div></div>}
      <button className="helpbtn coach" disabled={coachLeft <= 0 || typing} onClick={() => {
        setTyping(true);
        const payload = free ? [freeText, '', ''] : answers;
        start(async () => {
          const res = await coachAsk({ step: coachStep, answers: payload, free });
          setTyping(false);
          if (res.error) setLocalCoach((l) => [...l, res.error!]);
          else if (res.fallback && res.question) setLocalCoach((l) => [...l, res.question!]);
          await refresh();
        });
      }}>{coachLeft > 0 ? `코치에게 물어보기 · 남은 질문 ${coachLeft}번` : '오늘 코치 질문은 다 썼어. 이제 네 생각대로 써봐!'}</button>
      <p className="privacy">코치는 답을 대신 써주지 않고 질문만 해. 학번 없이 글만 전달돼.</p>
    </div>
  ) : thinkIdx < 0 ? (
    <button className="helpbtn" onClick={() => setThinkIdx(0)}>막히면? 생각 열기 질문 보기</button>
  ) : (
    <div className="tcard">{act.thinkCards[thinkIdx]}
      <div className="tc-row"><span>생각 열기 질문 {thinkIdx + 1} / {act.thinkCards.length}</span><button onClick={() => setThinkIdx((thinkIdx + 1) % act.thinkCards.length)}>다른 질문</button></div>
    </div>
  );

  if (screen === 'write') {
    if (free) {
      return (
        <div className="sapp">{head}
          <div className="s-body">
            <div className="qlabel">자유롭게 쓰기</div>
            <div className="h1" style={{ fontSize: 21 }}>{josa(act.unit, '과/와')} 나의 연결을 자유롭게 써봐</div>
            <p className="lead-s" style={{ marginBottom: 12 }}>장면, 계산, 개념 순서가 아니어도 괜찮아.</p>
            <textarea className="tall" aria-label="자유롭게 쓰기" value={freeText} maxLength={600} onChange={(e) => setFreeText(e.target.value)} />
            {coachBlock}
            <div className="wlinks"><button className="linkbtn" onClick={() => setFree(false)}>세 단계로 돌아가기</button></div>
          </div>
          <div className="s-foot">
            <button className="btn ghost" onClick={() => go('examples')}>예시</button>
            <button className="btn" onClick={() => go('review')}>다 썼어</button>
          </div>
        </div>
      );
    }
    const st = STEP_QUESTIONS[step];
    return (
      <div className="sapp">{head}
        <div className="s-body">
          <div className="stepper" aria-label={`3단계 중 ${step + 1}단계`}>{[0, 1, 2].map((i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
          <div className="qlabel">{st.label}</div>
          <div className="h1" style={{ fontSize: 21 }}>{step === 2 ? `그게 ${act.unit}의 어떤 개념이랑 닮았어?` : st.q}</div>
          <p className="lead-s" style={{ marginBottom: 12 }}>{st.sub}</p>
          {step === 2 && (
            <div className="chips" style={{ marginBottom: 10 }}>
              {act.concepts.map((c) => (
                <button key={c} className={`chip sm${concepts.includes(c) ? ' on' : ''}`} aria-pressed={concepts.includes(c)}
                  onClick={() => setConcepts((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}>{c}</button>
              ))}
            </div>
          )}
          <textarea aria-label={st.q} value={answers[step]} maxLength={600} placeholder={st.ph}
            onChange={(e) => { const v = e.target.value; setAnswers((prev) => { const next = [...prev]; next[step] = v; return next; }); }} />
          {coachBlock}
          <div className="wlinks"><button className="linkbtn" onClick={() => { if (!freeText) setFreeText(answers.filter(Boolean).join(' ')); setFree(true); }}>자유롭게 쓰기로 바꾸기</button></div>
        </div>
        <div className="s-foot">
          {step > 0 ? <button className="btn ghost" onClick={() => setStep(step - 1)}>이전</button> : <button className="btn ghost" onClick={() => go('examples')}>예시</button>}
          <button className="btn" onClick={() => { if (step < 2) { setStep(step + 1); window.scrollTo({ top: 0 }); } else go('review'); }}>{step < 2 ? '다음' : '다 썼어'}</button>
        </div>
      </div>
    );
  }

  if (screen === 'review') {
    return (
      <div className="sapp">{head}
        <div className="s-body">
          <div className="h1">이렇게 연결했어</div>
          <p className="lead-s">제출하기 전에 한 번 읽어봐.</p>
          <div className="mine-card">
            <div className="chips">{interests.slice(0, 3).map((t) => <span key={t} className="tag sm">{t}</span>)}</div>
            {hasText ? <Rows answers={finalAnswers} free={free} /> : <p className="muted" style={{ margin: 0 }}>아직 비어 있어</p>}
          </div>
          {!hasText && <p className="note warn">한 줄이라도 써볼래? 짧아도 괜찮아.</p>}
          <div className="sec-l">공유 설정</div>
          <label className="check"><input type="checkbox" checked={shareClass} onChange={(e) => setShareClass(e.target.checked)} /><span><b>반 갤러리에 이름 없이 공유할래</b><small>언제든 끌 수 있어</small></span></label>
          <label className="check"><input type="checkbox" checked={shareEx} onChange={(e) => setShareEx(e.target.checked)} /><span><b>다른 반·다음 해·다른 학교의 예시로 써도 돼</b><small>선생님이 고른 글만, 이름 없이 쓰여</small></span></label>
          <div className="sec-l">한 가지만 물어볼게</div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>오늘 활동을 하고 나니, {josa(act.unit, '이/가')} 나와 관련 있다고 느껴져?</p>
          <div className="likert" role="radiogroup" aria-label="관련성">
            {[1, 2, 3, 4, 5].map((v) => <button key={v} role="radio" aria-checked={pulse === v} className={pulse === v ? 'on' : ''} onClick={() => setPulse(v)}>{v}</button>)}
          </div>
          <div className="likert-l"><span>전혀 아니야</span><span>정말 그래</span></div>
          {error && <p className="msg error" style={{ marginTop: 12 }}>{error}</p>}
        </div>
        <div className="s-foot">
          <button className="btn ghost" onClick={() => go('write')}>고치기</button>
          <button className="btn" disabled={!hasText || pending} onClick={() => start(async () => {
            const res = await submitConnection({ answers: finalAnswers, concepts, free, shareClass, shareExample: shareEx, relevance: pulse || null, interest: interests[0] ?? (career || '일상') });
            if (res.error) { setError(res.error); return; }
            try { if (draftKey) localStorage.removeItem(draftKey); } catch { /* 무시 */ }
            await refresh();
            setTab('gallery'); setToast(true); go('after');
          })}>{pending ? '보내는 중…' : mine ? '고친 내용 제출' : '제출하기'}</button>
        </div>
      </div>
    );
  }

  // after: 갤러리 / 내 연결 노트
  return (
    <div className="sapp">{head}
      {toast && <div className="toast" onAnimationEnd={() => setToast(false)}>제출했어! 칠판과 우리 반 갤러리를 봐봐</div>}
      <div className="s-body">
        {tab === 'note' ? <Notebook data={data} /> : (
          <>
            <div className="h1">우리 반의 연결</div>
            <p className="lead-s">이름 없이 보여요. 마음에 드는 연결에 공감을 보내봐.</p>
            {act.gallery.length === 0 && <p className="muted">아직 공유된 글이 없어.</p>}
            {act.gallery.map((p) => (
              <div key={p.id} className={`gpost${p.mine ? ' mine' : ''}`}>
                <div className="gtop"><span className="tag sm">{p.interest}</span>{p.mine && <span className="pill hot">내 글{act.mine?.shareClass === false ? ' · 나만 보여' : ''}</span>}
                  {p.mine && <button className="linkbtn" style={{ marginLeft: 'auto' }} onClick={() => go('write')}>고치기</button>}
                </div>
                <Rows answers={p.answers} free={p.free} />
                {!p.mine && (
                  <button className={`like${p.liked ? ' on' : ''}`} aria-pressed={p.liked} onClick={() => start(async () => { await toggleLike(p.id); await refresh(); })}>
                    <Heart /> 오, 연결된다!
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <nav className="tabbar">
        <button className={tab === 'gallery' ? 'on' : ''} onClick={() => setTab('gallery')}>{I_GAL}우리 반 갤러리</button>
        <button className={tab === 'note' ? 'on' : ''} onClick={() => setTab('note')}>{I_NOTE}내 연결 노트</button>
      </nav>
    </div>
  );
}

function Notebook({ data }: { data: StudentState }) {
  return (
    <>
      <div className="h1">내 연결 노트</div>
      <p className="lead-s">{data.student.classLabel} · {data.student.no}<br />집에서도 같은 코드·학번·비밀번호로 열 수 있어요.</p>
      <div className="tl">
        {data.notebook.length === 0 && <div className="tli future"><div className="when">첫 연결</div><div className="box">아직 쓴 연결이 없어요</div></div>}
        {data.notebook.map((n, i) => (
          <div className="tli" key={i}>
            <div className="when">{new Date(n.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} · {n.unit}</div>
            <div className="box"><Rows answers={n.answers} free={n.free} /></div>
          </div>
        ))}
        <div className="tli future"><div className="when">학기 말</div><div className="box">한 학기 동안 쓴 연결 중 하나를 골라 다듬어요</div></div>
      </div>
    </>
  );
}
