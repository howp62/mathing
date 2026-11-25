/**
 * 공통수학2 '함수와 그래프' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts cm2-functions`로 content/sets/cm2-functions.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 입력 → 출력 과정(화살표·점·칸)만 차례로 나타난다. 숫자는 카드 본문과 같다.
 */
import { K, tx as baseTx, dr } from '../../lib/illus.ts';

/** 수식 글자는 카드 아래 수식 칸(globals.css --math)과 같은 글꼴을 쓴다. 기본 serif는 한국어 화면에서 폭이 넓어져 선과 겹친다 */
const MATH_FONT = `font-family="'Times New Roman', 'STIX Two Text', Georgia, serif"`;
const tx: typeof baseTx = (...args) => baseTx(...args).replace('font-family="serif"', MATH_FONT);

const W = '#FFFFFF';
const svg = (body: string) => `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const pop = (at: number, inner: string) => `<g class="pop" style="--d:${at.toFixed(2)}s">${inner}</g>`;
const n1 = (v: number) => (Math.round(v * 10) / 10).toString();

/**
 * 화살표(선 + 머리). at이 있으면 그 시각에 선이 그려지고, 선이 거의 다 그려졌을 때 머리가 나타난다.
 * 머리를 같은 선(path)에 이어 붙이면 크롬이 조각마다 점선 무늬를 새로 시작해 머리가 먼저 보인다.
 */
function arrow(x1: number, y1: number, x2: number, y2: number, at: number | null, o: { color?: string; w?: number } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (t: number) => `${n1(x2 + 5 * Math.cos(a + t))} ${n1(y2 + 5 * Math.sin(a + t))}`;
  const color = o.color ?? K.p, w = o.w ?? 1.8;
  const head = `<path${at === null ? '' : ` class="pop" style="--d:${(at + 0.6).toFixed(2)}s"`} d="M${p(Math.PI * 0.8)}L${n1(x2)} ${n1(y2)}L${p(-Math.PI * 0.8)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const line = `M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}`;
  return (at === null ? `<path d="${line}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>` : dr(line, at, { color, w })) + head;
}

/** 좌표축(원점 ox, oy) */
const axes = (ox: number, oy: number, xEnd: number, yTop: number) =>
  `<path d="M${ox - 3} ${oy}H${xEnd}M${ox} ${oy + 3}V${yTop}" fill="none" stroke="${K.m}" stroke-width="1.2"/>`;

/** 함수 그래프를 꺾은선으로 */
function curve(f: (x: number) => number, x0: number, x1: number, X: (x: number) => number, Y: (y: number) => number, n = 48) {
  return 'M' + Array.from({ length: n + 1 }, (_, i) => x0 + ((x1 - x0) * i) / n).map((x) => `${n1(X(x))} ${n1(Y(f(x)))}`).join('L');
}

/** 점선 안내선 */
const guide = (d: string, color: string = K.m) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="3 3"/>`;

/* ---- 장면 조각 ---- */

const controller = (x: number, y: number) =>
  `<rect x="${x}" y="${y}" width="46" height="24" rx="12" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/><path d="M${x + 8} ${y + 12}h10M${x + 13} ${y + 7}v10" stroke="${K.p}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${x + 33}" cy="${y + 9}" r="2.6" fill="${K.a}"/><circle cx="${x + 38}" cy="${y + 15}" r="2.6" fill="${K.am}"/>`;

const vinyl = (cx: number, cy: number) =>
  `<circle cx="${cx}" cy="${cy}" r="10" fill="${K.ink}"/><circle cx="${cx}" cy="${cy}" r="6.5" fill="none" stroke="${K.m}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="3.2" fill="${K.am}"/>`;

function stopwatch(cx: number, cy: number, r: number) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `M${n1(cx + (r - 4) * Math.sin(a))} ${n1(cy - (r - 4) * Math.cos(a))}L${n1(cx + (r - 1.5) * Math.sin(a))} ${n1(cy - (r - 1.5) * Math.cos(a))}`;
  }).join('');
  return `<rect x="${cx - 4}" y="${cy - r - 7}" width="8" height="6" rx="1.5" fill="${K.p}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${W}" stroke="${K.p}" stroke-width="2.4"/><path d="${ticks}" stroke="${K.l}" stroke-width="1.4"/><path d="M${cx} ${cy}L${n1(cx + (r - 6) * Math.sin(Math.PI / 3))} ${n1(cy - (r - 6) * Math.cos(Math.PI / 3))}" stroke="${K.a}" stroke-width="2" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="2" fill="${K.p}"/>`;
}

const bowl = (cx: number, top: number, r: number) =>
  `<path d="M${cx - r} ${top}H${cx + r}A${r} ${r * 0.85} 0 0 1 ${cx - r} ${top}Z" fill="${W}" stroke="${K.p}" stroke-width="1.5" stroke-linejoin="round"/><path d="M${cx - r + 2} ${top + 2}H${cx + r - 2}" stroke="${K.am}" stroke-width="2" stroke-linecap="round"/>`;

/** 영상 썸네일(가운데 재생 표시) */
const thumb = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${K.p}"/><path d="M${x + w / 2 - 3} ${y + h / 2 - 4.5}l7.5 4.5-7.5 4.5Z" fill="${W}"/>`;

/** 그림 액자(산과 해), 가로만 w로 늘어난다 */
const frame = (x: number, y: number, w: number, h: number) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><path d="M${x + 2} ${y + h - 2}L${n1(x + w * 0.38)} ${n1(y + h * 0.4)}L${n1(x + w * 0.6)} ${n1(y + h * 0.7)}L${n1(x + w * 0.75)} ${n1(y + h * 0.5)}L${x + w - 2} ${y + h - 2}Z" fill="${K.p}" fill-opacity=".8"/><circle cx="${n1(x + w * 0.78)}" cy="${n1(y + h * 0.3)}" r="3" fill="${K.am}"/>`;

const sprout = (x: number, y: number) =>
  `<path d="M${x} ${y + 3}V${y - 1}M${x} ${y}q-3-3-5-1M${x} ${y - 1}q3-3 5-1" fill="none" stroke="${K.p}" stroke-width="1" stroke-linecap="round"/>`;

/** 정사각형 텃밭(한 변 n칸, 칸 크기 c) */
function plot(x: number, y: number, n: number, c: number) {
  let s = `<rect x="${x}" y="${y}" width="${n * c}" height="${n * c}" fill="${K.f}" stroke="${K.m}" stroke-width="1.2"/>`;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += sprout(x + c / 2 + j * c, y + c / 2 + i * c + 1);
  return s;
}

/* ---- 카드별 그림 ---- */

function gameConvert() {
  const row = (y: number, ops: [string, string][], mid: number, out: number, t0: number, hot: boolean) => {
    const box = (x: number, [name, op]: [string, string]) =>
      `<rect x="${x}" y="${y - 11}" width="30" height="22" rx="5" fill="${K.f}" stroke="${K.p}" stroke-width="1.5"/>${tx(x + 15, y + 4.5, op, { size: 11, bold: true, fill: K.p })}${tx(x + 15, y - 15, name, { math: true, size: 11 })}`;
    const ball = (cx: number, v: number, fill: string, ink: string) =>
      `<circle cx="${cx}" cy="${y}" r="10.5" fill="${fill}" stroke="${K.p}" stroke-width="1.5"/>${tx(cx, y + 4, String(v), { size: 10.5, bold: true, fill: ink })}`;
    return ball(72, 4, W, K.p) + arrow(84, y, 96, y, t0) + box(98, ops[0]) + arrow(130, y, 140, y, t0 + 0.3)
      + pop(t0 + 0.45, ball(152, mid, W, K.p)) + arrow(164, y, 176, y, t0 + 0.6) + box(178, ops[1]) + arrow(210, y, 217, y, t0 + 0.9)
      + pop(t0 + 1.05, ball(229, out, hot ? K.a : K.l, hot ? W : K.ink));
  };
  return svg(
    tx(31, 30, '원래 점수', { size: 9.5 }) + tx(31, 46, 'x = 4', { math: true, size: 12 }) + controller(8, 54)
    + row(34, [['f', '+2'], ['g', '×3']], 6, 18, 0.1, true) + tx(150, 59, 'g(f(4)) = 18', { math: true, size: 11, pop: 1.3 })
    + row(83, [['g', '×3'], ['f', '+2']], 12, 14, 1.5, false) + tx(150, 113, '순서를 바꾸면 f(g(4)) = 14', { size: 9.5, pop: 2.7 }),
  );
}

function musicMap() {
  const songs = ['곡 A', '곡 B', '곡 C'].map((s, i) => vinyl(26, 28 + i * 28) + tx(42, 32 + i * 28, s, { size: 10, anchor: 'start', fill: K.ink })).join('');
  const pill = (y: number, s: string) =>
    `<rect x="160" y="${y - 10}" width="58" height="20" rx="10" fill="${W}" stroke="${K.p}" stroke-width="1.5"/><circle cx="171" cy="${y}" r="5" fill="none" stroke="${K.p}" stroke-width="1.2"/><path d="M171 ${y - 3}V${y}H173.5" fill="none" stroke="${K.p}" stroke-width="1.1"/>${tx(197, y + 4, s, { size: 10, bold: true, fill: K.p })}`;
  return svg(
    `<ellipse cx="48" cy="56" rx="42" ry="46" fill="${K.f}"/><ellipse cx="189" cy="56" rx="42" ry="46" fill="${K.f}"/>`
    + songs + pill(38, '120초') + pill(76, '150초')
    + arrow(76, 28, 156, 37, 0.2) + arrow(76, 56, 156, 74, 0.6) + arrow(76, 84, 156, 42, 1.0, { color: K.a })
    + tx(120, 114, '곡마다 시간이 하나씩 · 같은 시간이어도 함수', { size: 9.5, pop: 1.5 }),
  );
}

function sportsInverse() {
  const X = (t: number) => 112 + 2.2 * t, Y = (s: number) => 100 - 0.84 * s;
  return svg(
    stopwatch(42, 52, 26) + tx(42, 102, '점수 80', { size: 11, bold: true, fill: K.a })
    + axes(112, 100, 230, 12) + tx(116, 12, '점수 s', { size: 9, anchor: 'start' }) + tx(108, Y(100) + 3.5, '100', { size: 9, anchor: 'end' })
    + tx(X(50), 112, '50', { size: 9 }) + tx(185, 112, '시간 t(초)', { size: 9 })
    + dr(`M${X(0)} ${Y(100)}L${X(50)} ${Y(0)}`, 0.1, { color: K.p, w: 2.2 })
    + tx(108, Y(80) + 3.5, '80', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 0.9 })
    + arrow(X(0), Y(80), X(10) - 4, Y(80), 1.0, { color: K.a, w: 2 })
    + pop(1.6, `<circle cx="${X(10)}" cy="${Y(80)}" r="3.4" fill="${K.a}"/>`)
    + arrow(X(10), Y(80) + 4, X(10), 97, 1.7, { color: K.a, w: 2 })
    + tx(X(10), 112, '10', { size: 10, bold: true, fill: K.a, pop: 2.5 })
    + tx(234, 28, 't = (100 − s) ÷ 2', { math: true, size: 11, anchor: 'end', pop: 2.7 }),
  );
}

function fashionArea() {
  const c = 11, x0 = 16, y0 = 28;
  let grid = '';
  for (let i = 1; i < 5; i++) grid += `M${x0 + i * c} ${y0}V${y0 + 5 * c}M${x0} ${y0 + i * c}H${x0 + 5 * c}`;
  const X = (x: number) => 110 + 3.3 * x, Y = (y: number) => 100 - 13 * y;
  return svg(
    `<rect x="${x0}" y="${y0}" width="55" height="55" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="${grid}" stroke="${K.l}" stroke-width=".9"/><rect x="${x0 + 3}" y="${y0 + 3}" width="49" height="49" fill="none" stroke="${K.am}" stroke-width="1.2" stroke-dasharray="3 2"/>`
    + tx(43, 20, '천 넓이 25 cm²', { size: 9.5 })
    + dr(`M${x0} ${y0 + 59}H${x0 + 55}`, 0.1, { w: 2.6 }) + tx(43, 100, '한 변 5 cm', { size: 10, bold: true, fill: K.a, pop: 0.6 })
    + axes(110, 100, 230, 14) + tx(114, 14, '한 변', { size: 9, anchor: 'start' }) + tx(230, 112, '넓이 x', { size: 9, anchor: 'end' })
    + dr(curve(Math.sqrt, 0, 36, X, Y), 0.7, { color: K.p, w: 2.2 })
    + pop(1.6, guide(`M${X(25)} 100V${Y(5)}H110`) + `<circle cx="${X(25)}" cy="${Y(5)}" r="3.4" fill="${K.a}"/>`)
    + tx(X(25), 112, '25', { size: 10, bold: true, fill: K.a, pop: 1.7 }) + tx(106, Y(5) + 3.5, '5', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.7 })
    + tx(186, 90, 'y = √x, x ≥ 0', { math: true, size: 11, anchor: 'end', pop: 1.9 }),
  );
}

function cookingShare() {
  const X = (n: number) => 118 + 14 * n, Y = (v: number) => 100 - 0.07 * v;
  const pot = `<path d="M9 30H59" stroke="${K.p}" stroke-width="2.4" stroke-linecap="round"/><rect x="13" y="30" width="42" height="24" rx="5" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/><path d="M13 36H8M55 36H60" stroke="${K.p}" stroke-width="2.4" stroke-linecap="round"/><path d="M24 24q-3-4 0-8M34 24q-3-4 0-8M44 24q-3-4 0-8" fill="none" stroke="${K.m}" stroke-width="1.3" stroke-linecap="round"/>`;
  const bowls = [14, 37, 60, 83].map((x, i) => bowl(x, 80, 9.5) + tx(x, 104, '300', { size: 9.5, bold: true, fill: K.a, pop: 0.7 + i * 0.1 })).join('');
  const pours = [14, 37, 60, 83].map((x, i) => dr(`M34 56Q${(34 + x) / 2} 60 ${x} 77`, 0.1 + i * 0.12, { w: 1.6, color: K.am })).join('');
  const dots = [1, 2, 3, 5, 6, 7, 8].map((n) => `<circle class="pop" style="--d:${(0.9 + n * 0.08).toFixed(2)}s" cx="${X(n)}" cy="${n1(Y(1200 / n))}" r="2.6" fill="${K.p}"/>`).join('');
  return svg(
    pot + tx(34, 46, '1200 mL', { size: 9.5, bold: true, fill: K.p }) + pours + bowls
    + axes(118, 100, 232, 10) + tx(122, 12, '한 그릇(mL)', { size: 9, anchor: 'start' }) + tx(232, 112, '그릇 수', { size: 9, anchor: 'end' })
    + dr(curve((x) => 1200 / x, 1, 8, X, Y), 0.5, { color: K.l, w: 1.6 }) + dots
    + pop(1.6, guide(`M${X(4)} 100V${Y(300)}H118`, K.a) + `<circle cx="${X(4)}" cy="${Y(300)}" r="4" fill="${K.a}"/>`)
    + tx(X(4), 112, '4', { size: 10, bold: true, fill: K.a, pop: 1.7 }) + tx(114, Y(300) + 3.5, '300', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 1.7 })
    + tx(232, 44, 'y = 1200 ÷ x', { math: true, size: 11, anchor: 'end', pop: 1.9 }),
  );
}

function videoCompose() {
  const h = 22;
  const framed = (x: number, y: number, w: number, m: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${K.am}" fill-opacity=".55" stroke="${K.am}" stroke-width="1"/>${thumb(x + m, y, w - 2 * m, h)}`;
  const label = (x: number, y: number, s: string, at: number) => tx(x, y, s, { size: 9.5, bold: true, fill: K.a, pop: at });
  const r1 = 14, r2 = 66;
  return svg(
    tx(4, r1 + 15, 'g(f(x))', { math: true, size: 10.5, anchor: 'start', fill: K.ink })
    + thumb(40, r1, 24, h) + arrow(67, r1 + 11, 80, r1 + 11, 0.1) + label(73.5, r1 - 3, '×2', 0.1)
    + pop(0.4, thumb(84, r1, 48, h)) + arrow(136, r1 + 11, 149, r1 + 11, 0.6) + label(142.5, r1 - 3, '+여백', 0.6)
    + pop(0.9, framed(153, r1, 60, 6)) + tx(183, r1 + 36, '2x + 20', { math: true, size: 11.5, pop: 1.1 })
    + tx(4, r2 + 15, 'f(g(x))', { math: true, size: 10.5, anchor: 'start', fill: K.ink })
    + thumb(40, r2, 24, h) + arrow(67, r2 + 11, 80, r2 + 11, 1.3) + label(73.5, r2 - 3, '+여백', 1.3)
    + pop(1.6, framed(84, r2, 36, 6)) + arrow(136, r2 + 11, 149, r2 + 11, 1.8) + label(142.5, r2 - 3, '×2', 1.8)
    + pop(2.1, framed(153, r2, 72, 12)) + tx(189, r2 + 36, '2x + 40', { math: true, size: 11.5, pop: 2.3 })
    + tx(4, 117, '뒤에 늘리면 여백까지 두 배', { size: 9, anchor: 'start', pop: 2.5 }),
  );
}

function designUndo() {
  const handles = [[168, 22], [232, 22], [168, 46], [232, 46]].map(([x, y]) => `<rect x="${x - 2.5}" y="${y - 2.5}" width="5" height="5" fill="${W}" stroke="${K.p}" stroke-width="1.2"/>`).join('');
  return svg(
    frame(10, 22, 30, 24) + tx(25, 15, '가로 x', { size: 9.5, fill: K.ink })
    + arrow(46, 34, 160, 34, 0.1) + tx(103, 28, 'y = 2x + 4', { math: true, size: 11, fill: K.p })
    + pop(0.9, frame(168, 22, 64, 24) + handles) + tx(200, 15, '가로 y', { size: 9.5, fill: K.ink, pop: 0.9 })
    + dr('M200 52V82H25V56', 1.3, { w: 2.2 }) + pop(2.0, `<path d="M20.5 61.5L25 56L29.5 61.5" fill="none" stroke="${K.a}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`)
    + tx(150, 76, '− 4', { size: 11, bold: true, fill: K.a, pop: 1.5 }) + tx(80, 76, '÷ 2', { size: 11, bold: true, fill: K.a, pop: 1.8 })
    + tx(112, 104, 'x = (y − 4) ÷ 2', { math: true, size: 12, pop: 2.1 }) + tx(232, 104, 'y > 4', { size: 9.5, anchor: 'end', pop: 2.1 }),
  );
}

function animalFeed() {
  const sack = `<path d="M14 34Q12 28 18 26L22 22H40L44 26Q50 28 48 34L52 88Q52 94 46 94H16Q10 94 10 88Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/><path d="M22 22Q31 28 40 22" fill="none" stroke="${K.p}" stroke-width="1.4"/>`;
  const paw = `<g fill="${K.am}"><ellipse cx="31" cy="76" rx="6" ry="4.8"/><circle cx="24" cy="68" r="2.3"/><circle cx="29" cy="65" r="2.3"/><circle cx="34" cy="65" r="2.3"/><circle cx="38.5" cy="68" r="2.3"/></g>`;
  const rows: [number, number, number][] = [[20, 30, 5.5], [30, 20, 7], [60, 10, 9.5]];
  const body = rows.map(([g, d, r], i) => {
    const y = 26 + i * 30, hot = g === 30, color = hot ? K.a : K.p;
    return bowl(68, y - 3, r) + tx(82, y + 3.5, `하루 ${g} g`, { size: 9.5, anchor: 'start', fill: K.ink, bold: hot })
      + dr(`M134 ${y}H${134 + d * 2.4}`, 0.2 + i * 0.35, { color, w: 9 })
      + tx(134 + d * 2.4 + 8, y + 3.5, `${d}일`, { size: 10, bold: true, fill: color, anchor: 'start', pop: 0.8 + i * 0.35 });
  }).join('');
  return svg(
    sack + tx(31, 48, '먹이', { size: 9.5, fill: K.p }) + tx(31, 60, '600 g', { size: 10, bold: true, fill: K.p }) + paw + body
    + tx(150, 114, '하루 양 × 기간 = 600 (늘 같음)', { size: 9.5, fill: K.a, bold: true, pop: 1.9 }),
  );
}

function travelSpeed() {
  const lane = (y: number, color: string, secs: number, end: string) =>
    `<path d="M44 ${y}H200" stroke="${K.l}" stroke-width="1.2" stroke-dasharray="3 3"/><path class="draw" pathLength="1" style="--d:.3s;animation-duration:${secs}s;animation-timing-function:linear" d="M44 ${y}H200" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`
    + tx(205, y + 4, end, { size: 10, bold: true, fill: color, anchor: 'start', pop: 0.3 + secs });
  const bus = `<rect x="6" y="57" width="30" height="14" rx="3" fill="${K.f}" stroke="${K.p}" stroke-width="1.5"/><path d="M10 61h6v4h-6zM19 61h6v4h-6zM28 61h5v4h-5z" fill="${K.p}" fill-opacity=".7"/><circle cx="13" cy="72" r="2.6" fill="${K.ink}"/><circle cx="29" cy="72" r="2.6" fill="${K.ink}"/>`;
  const car = `<path d="M6 100V94L11 89H25L31 94H36V100Z" fill="${K.a}" fill-opacity=".85" stroke="${K.p}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="13" cy="101" r="2.6" fill="${K.ink}"/><circle cx="29" cy="101" r="2.6" fill="${K.ink}"/>`;
  return svg(
    `<path d="M44 22H200" stroke="${K.l}" stroke-width="8" stroke-linecap="round"/><path d="M50 22H194" stroke="${W}" stroke-width="1.2" stroke-dasharray="5 4"/>`
    + `<path d="M44 26V8" stroke="${K.p}" stroke-width="1.5"/><path d="M44 8h9l-2.5 3 2.5 3h-9z" fill="${K.a}"/><path d="M200 22c-3-4-6-7-6-10a6 6 0 1 1 12 0c0 3-3 6-6 10z" fill="${K.p}"/>`
    + tx(122, 13, '120 km', { size: 10, bold: true, fill: K.ink }) + tx(44, 40, '출발', { size: 9 }) + tx(200, 40, '도착', { size: 9 })
    + tx(21, 53, '40 km/h', { size: 9, fill: K.ink }) + bus + lane(64, K.p, 3, '3시간')
    + tx(21, 86, '80 km/h', { size: 9, fill: K.ink }) + car + lane(96, K.a, 1.5, '1.5시간')
    + tx(122, 116, '속력이 두 배면 시간은 절반 · t = 120 ÷ x', { size: 9.5, pop: 3.4 }),
  );
}

function carDistance() {
  const X = (i: number) => 36 + 40 * i;
  const car = `<path d="M194 26V19L199 13H213L219 19H224V26Z" fill="${K.a}" fill-opacity=".85" stroke="${K.p}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="200" cy="27" r="2.6" fill="${K.ink}"/><circle cx="218" cy="27" r="2.6" fill="${K.ink}"/>`;
  const ticks = (y: number) => [0, 1, 2, 3, 4].map((i) => `M${X(i)} ${y - 3}V${y + 3}`).join('');
  const maps = [0, 1, 2, 3, 4].map((i) => arrow(X(i), 64, X(i), 91, 0.7 + i * 0.18, { color: K.a, w: 1.5 })).join('');
  return svg(
    `<path d="M24 30H230" stroke="${K.l}" stroke-width="5" stroke-linecap="round"/>` + dr(`M${X(0)} 36H${X(4)}`, 0.1, { color: K.am, w: 2 }) + car
    + tx(X(0), 22, '출발', { size: 9 }) + tx(120, 22, '매초 2 m', { size: 9, fill: K.ink })
    + `<path d="M${X(0)} 58H${X(4)}M${X(0)} 96H${X(4)}" stroke="${K.p}" stroke-width="1.4"/><path d="${ticks(58)}${ticks(96)}" stroke="${K.p}" stroke-width="1.4"/>`
    + tx(4, 61, 't(초)', { size: 9, anchor: 'start' }) + tx(4, 99, 'd(m)', { size: 9, anchor: 'start' })
    + [0, 1, 2, 3, 4].map((i) => tx(X(i), 52, String(i), { size: 10, fill: K.ink })).join('') + maps
    + [0, 1, 2, 3, 4].map((i) => tx(X(i), 110, String(2 * i), { size: 10, bold: true, fill: K.a, pop: 0.9 + i * 0.18 })).join('')
    + tx(236, 81, 'd = 2t', { math: true, size: 11.5, anchor: 'end', pop: 1.8 }),
  );
}

function healthStep() {
  const X = (n: number) => 108 + 11 * n, Y = (s: number) => 100 - 1.6 * s;
  const person = `<g fill="none" stroke="${K.p}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="38" r="6" fill="${K.f}"/><path d="M40 44V70M40 52L28 40M40 52L52 40M40 70L31 88M40 70L49 88"/></g><path d="M24 90H56" stroke="${K.l}" stroke-width="2"/>`;
  const dots = Array.from({ length: 11 }, (_, n) => n === 8 ? '' : `<circle class="pop" style="--d:${(0.1 + n * 0.06).toFixed(2)}s" cx="${X(n)}" cy="${Y(5 * n)}" r="2.6" fill="${K.p}"/>`).join('');
  return svg(
    tx(40, 22, '몇 회 했을까?', { size: 9.5, fill: K.ink }) + person + tx(40, 108, '40점', { size: 12, bold: true, fill: K.a })
    + axes(108, 100, 228, 12) + tx(112, 12, '점수 s', { size: 9, anchor: 'start' }) + tx(232, 112, '횟수 n', { size: 9, anchor: 'end' })
    + dots + pop(1.6, `<circle cx="${X(8)}" cy="${Y(40)}" r="4" fill="${K.a}"/>`)
    + tx(104, Y(40) + 3.5, '40', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 0.8 })
    + arrow(108, Y(40), X(8) - 5, Y(40), 1.0, { color: K.a, w: 1.8 }) + arrow(X(8), Y(40) + 5, X(8), 97, 1.7, { color: K.a, w: 1.8 })
    + tx(X(8), 112, '8', { size: 10.5, bold: true, fill: K.a, pop: 2.5 })
    + tx(150, 26, '정수만 → 점으로', { size: 9, pop: 0.8 }) + tx(190, 90, 'n = s ÷ 5', { math: true, size: 11, anchor: 'end', pop: 2.7 }),
  );
}

function environmentPlot() {
  const quads = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j], k) =>
    `<rect class="pop" style="--d:${(0.5 + k * 0.25).toFixed(2)}s" x="${100 + i * 36}" y="${24 + j * 36}" width="36" height="36" fill="none" stroke="${K.a}" stroke-width="2"/>`).join('');
  return svg(
    plot(12, 46, 3, 12) + tx(30, 40, '9 m²', { size: 10, bold: true, fill: K.ink }) + tx(30, 96, '한 변 3 m', { size: 9.5 })
    + arrow(54, 64, 92, 64, 0.1) + tx(73, 58, '넓이 ×4', { size: 9, fill: K.ink })
    + plot(100, 24, 6, 12) + quads + tx(136, 18, '36 m²', { size: 10, bold: true, fill: K.ink })
    + dr('M100 103H172', 1.5, { w: 2.6 }) + tx(136, 116, '한 변 6 m', { size: 10, bold: true, fill: K.a, pop: 1.7 })
    + tx(206, 62, '한 변 ×2', { size: 10.5, bold: true, fill: K.a, pop: 1.8 })
    + tx(206, 86, '√36 = 2√9', { math: true, size: 11.5, pop: 2.0 }),
  );
}

function computerOneOutput() {
  const panel = (x: number, title: string) =>
    `<rect x="${x}" y="8" width="110" height="98" rx="6" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><path d="M${x} 24V14a6 6 0 0 1 6-6h98a6 6 0 0 1 6 6V24Z" fill="${K.p}"/>${tx(x + 55, 20, title, { size: 9, fill: W, bold: true })}`;
  const node = (cx: number, cy: number, s: string, fill: string) => `<circle cx="${cx}" cy="${cy}" r="10" fill="${fill}" stroke="${K.p}" stroke-width="1.5"/>${tx(cx, cy + 4, s, { size: 11, bold: true, fill: K.p })}`;
  return svg(
    panel(6, 'f(x) = x + 1') + node(26, 56, '3', K.f) + arrow(38, 56, 78, 56, 0.2) + pop(0.6, node(92, 56, '4', W))
    + dr('M24 92l5 5 9-10', 0.9, { color: K.p, w: 2.6 }) + tx(44, 96, '출력 하나: 함수', { size: 9.5, anchor: 'start', fill: K.ink, pop: 1.0 })
    + panel(124, '규칙 없이 4 또는 7') + node(144, 56, '3', K.f)
    + arrow(155, 52, 196, 40, 1.2) + pop(1.5, node(210, 38, '4', W)) + arrow(155, 60, 196, 72, 1.6, { color: K.a }) + pop(1.9, node(210, 74, '7', W))
    + dr('M140 87l9 9M149 87l-9 9', 2.1, { w: 2.6 }) + tx(156, 96, '출력 둘: 함수 아님', { size: 9.5, anchor: 'start', fill: K.ink, pop: 2.2 }),
  );
}

function architectureSide() {
  const c = 13, x0 = 12, y0 = 22;
  let grid = '';
  for (let i = 1; i < 5; i++) grid += `M${x0 + i * c} ${y0}V${y0 + 5 * c}M${x0} ${y0 + i * c}H${x0 + 5 * c}`;
  const X = (x: number) => 112 + 4 * x, Y = (y: number) => 100 - 13 * y;
  return svg(
    `<rect x="${x0}" y="${y0 + c}" width="${4 * c}" height="${4 * c}" fill="${K.f}"/>`
    + pop(0.3, `<path d="M${x0} ${y0}H${x0 + 5 * c}V${y0 + 5 * c}H${x0 + 4 * c}V${y0 + c}H${x0}Z" fill="${K.am}" fill-opacity=".45"/>`)
    + `<path d="${grid}" stroke="${K.l}" stroke-width=".8"/><path d="M${x0} ${y0}H${x0 + 5 * c}V${y0 + 5 * c}H${x0 + 30}M${x0 + 17} ${y0 + 5 * c}H${x0}Z" fill="none" stroke="${K.p}" stroke-width="3" stroke-linejoin="round"/><path d="M${x0 + 17} ${y0 + 5 * c}V${y0 + 5 * c - 13}A13 13 0 0 1 ${x0 + 30} ${y0 + 5 * c}" fill="none" stroke="${K.p}" stroke-width="1"/>`
    + `<rect x="${x0 + 2 * c - 15}" y="${y0 + 3 * c - 7}" width="30" height="13" rx="3" fill="${K.f}"/>` + tx(x0 + 2 * c, y0 + 3 * c + 3, '16 m²', { size: 9.5, bold: true, fill: K.p }) + tx(x0 + 2.5 * c, y0 - 5, '+9 m²', { size: 9.5, bold: true, fill: K.a, pop: 0.5 })
    + tx(44, 104, '한 변 4 m → 5 m', { size: 9.5, fill: K.ink })
    + axes(112, 100, 232, 12) + tx(116, 12, '한 변', { size: 9, anchor: 'start' })
    + dr(curve(Math.sqrt, 0, 30, X, Y), 0.6, { color: K.p, w: 2.2 })
    + pop(1.2, guide(`M${X(16)} 100V${Y(4)}H112M${X(25)} 100V${Y(5)}H112`) + `<circle cx="${X(16)}" cy="${Y(4)}" r="3.2" fill="${K.p}"/><circle cx="${X(25)}" cy="${Y(5)}" r="3.2" fill="${K.p}"/>`)
    + tx(X(16), 112, '16', { size: 9.5, pop: 1.2 }) + tx(X(25), 112, '25', { size: 9.5, pop: 1.2 })
    + tx(108, Y(4) + 3.5, '4', { size: 9.5, anchor: 'end', pop: 1.2 }) + tx(108, Y(5) + 3.5, '5', { size: 9.5, anchor: 'end', pop: 1.2 })
    + dr(`M${X(16)} ${Y(4)}H${X(25)}`, 1.5, { w: 2.4 }) + dr(`M${X(25)} ${Y(4)}V${Y(5)}`, 1.9, { w: 2.4 })
    + tx((X(16) + X(25)) / 2, Y(4) + 12, '+9', { size: 10, bold: true, fill: K.a, pop: 1.8 }) + tx(X(25) + 5, Y(4.5) + 3.5, '+1', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.2 })
    + tx(140, 30, 'y = √x', { math: true, size: 11, anchor: 'start', pop: 2.3 }),
  );
}

function performanceBudget() {
  const stage = `<path d="M10 12L2 84H24ZM44 12L32 84H54Z" fill="${K.am}" fill-opacity=".3"/><circle cx="10" cy="10" r="4" fill="${K.am}"/><circle cx="44" cy="10" r="4" fill="${K.am}"/><rect x="2" y="84" width="52" height="8" rx="1.5" fill="${K.p}"/><circle cx="28" cy="54" r="5" fill="${K.ink}"/><path d="M28 59V73M28 63L21 56M28 63L35 68M28 73L23 84M28 73L33 84" fill="none" stroke="${K.ink}" stroke-width="2.2" stroke-linecap="round"/><path d="M21 56l-2-3" stroke="${K.a}" stroke-width="3" stroke-linecap="round"/>`;
  const bar = (y: number, n: number, t0: number) => {
    const w = 168 / n;
    const cuts = Array.from({ length: n - 1 }, (_, i) => `<path class="pop" style="--d:${(t0 + i * 0.04).toFixed(2)}s" d="M${n1(64 + w * (i + 1))} ${y}v16" stroke="${K.p}" stroke-width="1.2"/>`).join('');
    return `<rect x="64" y="${y}" width="168" height="16" fill="${K.f}"/>${cuts}<rect class="pop" style="--d:${(t0 + n * 0.04 + 0.1).toFixed(2)}s" x="64" y="${y}" width="${n1(w)}" height="16" fill="${K.a}"/><rect x="64" y="${y}" width="168" height="16" fill="none" stroke="${K.p}" stroke-width="1.6"/>`;
  };
  return svg(
    stage + tx(148, 14, '준비비 180000원', { size: 10, bold: true, fill: K.ink })
    + bar(22, 10, 0.2) + tx(148, 52, '10명 → 한 명 18000원', { size: 9.5, fill: K.ink, pop: 0.8 })
    + bar(62, 15, 1.0) + tx(148, 92, '15명 → 한 명 12000원', { size: 9.5, fill: K.ink, pop: 1.8 })
    + tx(148, 112, 'y = 180000 ÷ x', { math: true, size: 11, pop: 2.0 }),
  );
}

const drawings: Record<string, string> = {
  'game-convert': gameConvert(),
  'music-map': musicMap(),
  'sports-inverse': sportsInverse(),
  'fashion-area': fashionArea(),
  'cooking-share': cookingShare(),
  'video-compose': videoCompose(),
  'design-undo': designUndo(),
  'animal-feed': animalFeed(),
  'travel-speed': travelSpeed(),
  'car-distance': carDistance(),
  'health-step': healthStep(),
  'environment-plot': environmentPlot(),
  'computer-one-output': computerOneOutput(),
  'architecture-side': architectureSide(),
  'performance-budget': performanceBudget(),
};
export default drawings;
