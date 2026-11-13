import { ILLUS, safeSvg } from '@/lib/illus';
import { STEP_LABELS, type ExampleCard } from '@/lib/constants';

export function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 25C9 6 23 27 26 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="6" cy="25" r="3.6" fill="#DD7448" />
      <circle cx="26" cy="7" r="3.6" fill="#2D6A5C" />
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

export function Illus({ card }: { card: ExampleCard }) {
  const svg = card.illus ? ILLUS[card.illus] : safeSvg(card.svg);
  if (!svg) return null;
  return <div className="illus" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function ExampleCardView({ card, big }: { card: ExampleCard; big?: boolean }) {
  return (
    <article className={big ? 'ecard' : 'mcard'}>
      <div className="tags">{card.tags.map((t) => <span key={t} className={big ? 'tag' : 'tag sm'}>{t}</span>)}</div>
      <Illus card={card} />
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      <div className="formula">{card.formula}</div>
      <div className="concept">{card.concept}</div>
    </article>
  );
}

export function Rows({ answers, free }: { answers: string[]; free: boolean }) {
  if (free) {
    return (
      <div className="rows"><div className="row-item"><i>자유롭게 쓴 연결</i><p>{answers[0]}</p></div></div>
    );
  }
  return (
    <div className="rows">
      {answers.map((a, i) => (a ? <div className="row-item" key={i}><i>{STEP_LABELS[i]}</i><p>{a}</p></div> : null))}
    </div>
  );
}
