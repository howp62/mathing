/**
 * 예시 그림 원본(scripts/illus/<세트ID>.ts)이 함께 쓰는 도우미. 기준은 docs/CONTENT-STANDARDS.md '그림 수준'.
 * - 캔버스는 240×120, 색은 K(사이트 팔레트)와 W(흰색)만.
 * - 움직임: dr(선이 그려짐)·pop(나타남)·arrow(선 다음 머리). --d는 시작 시각(초).
 * - 수식 글자(tx의 math)는 카드 아래 수식 칸과 같은 글꼴을 쓴다.
 */
import { K, tx as baseTx, dr, ring } from '../../lib/illus.ts';

export { K, dr, ring };

/** 수식 글자는 카드 아래 수식 칸(globals.css --math)과 같은 글꼴을 쓴다. 기본 serif는 한국어 화면에서 폭이 넓어져 선과 겹친다 */
export const MATH_FONT = `font-family="'Times New Roman', 'STIX Two Text', Georgia, serif"`;
export const tx: typeof baseTx = (...args) => baseTx(...args).replace('font-family="serif"', MATH_FONT);

export const W = '#FFFFFF';
export const svg = (body: string) => `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
export const pop = (at: number, inner: string) => `<g class="pop" style="--d:${at.toFixed(2)}s">${inner}</g>`;
export const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/**
 * 화살표(선 + 머리). at이 있으면 그 시각에 선이 그려지고, 선이 거의 다 그려졌을 때 머리가 나타난다.
 * 머리를 같은 선(path)에 이어 붙이면 크롬이 조각마다 점선 무늬를 새로 시작해 머리가 먼저 보인다.
 */
export function arrow(x1: number, y1: number, x2: number, y2: number, at: number | null, o: { color?: string; w?: number } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (t: number) => `${n1(x2 + 5 * Math.cos(a + t))} ${n1(y2 + 5 * Math.sin(a + t))}`;
  const color = o.color ?? K.p, w = o.w ?? 1.8;
  const head = `<path${at === null ? '' : ` class="pop" style="--d:${(at + 0.6).toFixed(2)}s"`} d="M${p(Math.PI * 0.8)}L${n1(x2)} ${n1(y2)}L${p(-Math.PI * 0.8)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const line = `M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}`;
  return (at === null ? `<path d="${line}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>` : dr(line, at, { color, w })) + head;
}

/** 좌표축(원점 ox, oy) */
export const axes = (ox: number, oy: number, xEnd: number, yTop: number) =>
  `<path d="M${ox - 3} ${oy}H${xEnd}M${ox} ${oy + 3}V${yTop}" fill="none" stroke="${K.m}" stroke-width="1.2"/>`;

/** 함수 그래프를 꺾은선으로 */
export function curve(f: (x: number) => number, x0: number, x1: number, X: (x: number) => number, Y: (y: number) => number, n = 48) {
  return 'M' + Array.from({ length: n + 1 }, (_, i) => x0 + ((x1 - x0) * i) / n).map((x) => `${n1(X(x))} ${n1(Y(f(x)))}`).join('L');
}

/** 점선 안내선 */
export const guide = (d: string, color: string = K.m) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3 3"/>`;

