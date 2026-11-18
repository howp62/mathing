import { Illus } from './Illus';
import { STEP_LABELS, type ExampleCard } from '@/lib/constants';

export function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 25C9 6 23 27 26 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="6" cy="25" r="3.6" fill="#C8553D" />
      <circle cx="26" cy="7" r="3.6" fill="#2F4D7A" />
    </svg>
  );
}

export function Logo({ href }: { href?: string }) {
  const inner = (<><LogoMark /><span>mathing</span></>);
  return href ? <a className="logo" href={href}>{inner}</a> : <span className="logo">{inner}</span>;
}

export function Heart({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.6-9.2C.9 7.9 3 4.5 6.5 4.5c2.2 0 3.6 1.2 4.5 2.6.9-1.4 2.3-2.6 4.5-2.6 3.5 0 5.6 3.4 4.1 6.8-2.1 4.6-9.6 9.2-9.6 9.2z" fill="currentColor" />
    </svg>
  );
}

export function ExampleCardView({ card }: { card: ExampleCard }) {
  return (
    <article className="mcard">
      <div className="tags">{card.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      <Illus card={card} />
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      <div className="formula">{card.formula}</div>
      <div className="concept">{card.concept}</div>
    </article>
  );
}

export function Rows({ answers, free }: { answers: string[]; free: boolean }) {
  if (free) return <div className="rows"><div><p>{answers[0]}</p></div></div>;
  return (
    <div className="rows">
      {answers.map((a, i) => (a ? <div key={i}><i>{STEP_LABELS[i]}</i><p>{a}</p></div> : null))}
    </div>
  );
}

const I_UNITS = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></svg>);
const I_NOTE = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7" /></svg>);
const I_ME = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>);

/** 아래 탭이 있는 학생 화면 틀 */
export function Shell({ tab, children }: { tab: 'units' | 'notes' | 'me'; children: React.ReactNode }) {
  return (
    <div className="app tabbed">
      <main className="page">{children}</main>
      <nav className="tabs" aria-label="메뉴">
        <a href="/home" className={tab === 'units' ? 'on' : ''} aria-current={tab === 'units' ? 'page' : undefined}>{I_UNITS}단원</a>
        <a href="/notes" className={tab === 'notes' ? 'on' : ''} aria-current={tab === 'notes' ? 'page' : undefined}>{I_NOTE}내 노트</a>
        <a href="/me" className={tab === 'me' ? 'on' : ''} aria-current={tab === 'me' ? 'page' : undefined}>{I_ME}내 정보</a>
      </nav>
    </div>
  );
}

/** 탭 없는 화면 틀(가입, 단원 활동 등) */
export function Plain({ children }: { children: React.ReactNode }) {
  return <div className="app"><main className="page">{children}</main></div>;
}
