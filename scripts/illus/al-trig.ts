/**
 * 대수 '삼각함수' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts al-trig`로 content/sets/al-trig.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 각이 돌아가거나 한 주기가 그려지는 부분만 차례로 나타난다. 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 공통 ---- */

/** 원 위의 점(수학 각: 오른쪽에서 반시계, 화면 y는 아래로) */
const at = (cx: number, cy: number, r: number, a: number) => [n1(cx + r * Math.cos(a)), n1(cy - r * Math.sin(a))] as const;
/** a0 → a1(반시계) 원호 하나 */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = at(cx, cy, r, a0), [x1, y1] = at(cx, cy, r, a1);
  return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${x1} ${y1}`;
}
/** 지속시간을 바꾼 그리기 선 */
const drs = (d: string, start: number, secs: number, o: { color?: string; w?: number; linear?: boolean } = {}) =>
  `<path class="draw" pathLength="1" style="--d:${start.toFixed(2)}s;animation-duration:${secs}s${o.linear ? ';animation-timing-function:linear' : ''}" d="${d}" fill="none" stroke="${o.color ?? K.a}" stroke-width="${o.w ?? 2.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x: number | string, y: number | string, r: number, fill: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

/* ---- 장면 조각 ---- */

/** 게임 캐릭터(발끝이 (x, y)) */
const hero = (x: number, y: number, ghost = false) =>
  `<g${ghost ? ' fill-opacity=".35" stroke-opacity=".35"' : ''}><rect x="${x - 5}" y="${y - 11}" width="10" height="9" rx="2" fill="${K.a}" stroke="${K.p}" stroke-width="1.2"/><circle cx="${x}" cy="${y - 15}" r="4.5" fill="${K.f}" stroke="${K.p}" stroke-width="1.2"/><path d="M${x - 3} ${y - 2}V${y}M${x + 3} ${y - 2}V${y}" stroke="${K.p}" stroke-width="1.6" stroke-linecap="round"/></g>`;

/** 별 스티커 */
function star(cx: number, cy: number, r: number, ghost = false) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    return `${n1(cx + rr * Math.cos(a))} ${n1(cy + rr * Math.sin(a))}`;
  });
  return `<path d="M${pts.join('L')}Z" fill="${K.am}"${ghost ? ' fill-opacity=".45"' : ''} stroke="${K.ink}" stroke-width="1" stroke-linejoin="round"${ghost ? ' stroke-opacity=".45"' : ''}/>`;
}

/** 운동장 위 선수 */
const player = (x: number, y: number, n: string, fill: string) =>
  `<circle cx="${x}" cy="${y}" r="7.5" fill="${fill}" stroke="${K.ink}" stroke-width="1.2"/>${tx(x, y + 3.5, n, { size: 9, bold: true, fill: W })}`;

/** 조명 기구(위에서 본 모습) */
const fixture = (x: number, y: number) =>
  `<rect x="${x - 7}" y="${y - 5}" width="14" height="10" rx="2" fill="${K.ink}"/><circle cx="${x}" cy="${y}" r="3" fill="${K.am}"/><path d="M${x - 9} ${y - 5}V${y + 5}M${x + 9} ${y - 5}V${y + 5}" stroke="${K.m}" stroke-width="1.6" stroke-linecap="round"/>`;

/** 장난감 바퀴 */
const wheel = (cx: number, cy: number, r: number, ghost = false) => {
  const sp = [0, 1, 2].map((i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / 3; return `M${cx} ${cy}L${n1(cx + (r - 4) * Math.cos(a))} ${n1(cy - (r - 4) * Math.sin(a))}`; }).join('');
  return `<g${ghost ? ' opacity=".35"' : ''}><circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="${W}" stroke="${K.ink}" stroke-width="4"/><path d="${sp}" stroke="${K.p}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="${K.p}"/></g>`;
};

/** 앉은 고양이(오른쪽을 봄) */
const cat = `<path d="M8 112Q4 92 16 88Q28 86 30 100L31 112Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 108Q0 106 3 98" fill="none" stroke="${K.p}" stroke-width="1.6" stroke-linecap="round"/><path d="M20 82L21 73L26 78L31 74L32 83Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="26" cy="85" r="7" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><circle cx="29" cy="84" r="1.3" fill="${K.ink}"/>`;

/* ---- 카드별 그림 ---- */

function gameOrbit() {
  const O = [62, 62] as const, c = 10;
  let grid = '';
  for (let i = -4; i <= 4; i++) grid += `M${O[0] + i * c} ${O[1] - 40}V${O[1] + 40}M${O[0] - 40} ${O[1] + i * c}H${O[0] + 40}`;
  return svg(
    `<rect x="18" y="18" width="88" height="88" rx="4" fill="${K.f}"/><path d="${grid}" stroke="${K.l}" stroke-width=".8"/>`
    + `<path d="M22 62H102M62 102V22" stroke="${K.m}" stroke-width="1.1"/><circle cx="62" cy="62" r="30" fill="none" stroke="${K.l}" stroke-width="2"/>`
    + `<path d="M92 106V108M14 32H18" stroke="${K.m}" stroke-width="1.2"/>` + tx(92, 116.5, '3', { size: 9.5 }) + tx(11, 35.5, '3', { size: 9.5, anchor: 'end' }) + tx(174, 116, '반지름 3칸인 원', { size: 9 })
    + hero(92, 62, true)
    + drs(arc(62, 62, 30, 0, Math.PI / 2), 0.1, 1.1, { w: 3 })
    + dr(arc(62, 62, 9, 0, Math.PI / 2), 0.1, { color: K.p, w: 1.4 }) + tx(70, 56, 'θ', { math: true, size: 10, fill: K.p, anchor: 'start' })
    + dr('M62 62V32', 1.2, { color: K.p, w: 2 })
    + pop(1.3, hero(62, 32) + dot(62, 32, 2.6, K.ink))
    + tx(174, 24, 'θ = π/2', { math: true, size: 12.5, fill: K.p })
    + tx(174, 50, 'x = 3cos(π/2) = 0', { math: true, size: 11, pop: 1.6 })
    + tx(174, 70, 'y = 3sin(π/2) = 3', { math: true, size: 11, pop: 1.9 })
    + tx(174, 98, '위치 (0, 3)칸', { size: 11, bold: true, fill: K.a, pop: 2.3 }),
  );
}

function musicWave() {
  const X = (t: number) => 44 + 84 * t, Y = (y: number) => 66 - 22 * y;
  const f = (t: number) => Math.sin(2 * Math.PI * t);
  const ticks = [0, 0.25, 1, 2].map((t) => `M${n1(X(t))} 95V101`).join('');
  return svg(
    `<rect x="4" y="4" width="232" height="112" rx="6" fill="${W}" stroke="${K.l}" stroke-width="1.4"/><path d="M4 18V10a6 6 0 0 1 6-6h220a6 6 0 0 1 6 6V18Z" fill="${K.f}"/>`
    + `<circle cx="13" cy="11" r="2.2" fill="${K.a}"/><circle cx="21" cy="11" r="2.2" fill="${K.am}"/>` + tx(30, 14.5, '트랙 1 · 파형 편집', { size: 9, anchor: 'start', fill: K.ink })
    + `<path d="M16 30V96" stroke="${K.l}" stroke-width="3" stroke-linecap="round"/><rect x="10" y="52" width="12" height="7" rx="2" fill="${K.p}"/>`
    + `<path d="M44 40V92M40 66H230" stroke="${K.l}" stroke-width="1.2"/>` + tx(39, Y(1) + 3.5, '1', { size: 9.5, anchor: 'end' }) + tx(39, Y(-1) + 3.5, '−1', { size: 9.5, anchor: 'end' })
    + `<path d="M44 98H216" stroke="${K.m}" stroke-width="1.2"/><path d="${ticks}" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(X(0), 111, '0', { size: 9.5 }) + tx(X(1), 111, '1', { size: 9.5 }) + tx(X(2), 111, '2', { size: 9.5 }) + tx(234, 111, 't(초)', { size: 9, anchor: 'end' })
    + tx(226, 29, 'y = sin(2πt)', { math: true, size: 11.5, anchor: 'end' })
    + dr(curve(f, 0, 1, X, Y), 0.1, { color: K.a, w: 2.4 })
    + dr(curve(f, 1, 2, X, Y), 1.1, { color: K.p, w: 2.4 })
    + dr(`M${X(0)} 37V33H${X(1)}V37`, 2.0, { color: K.a, w: 1.6 }) + tx((X(0) + X(1)) / 2, 29, '주기 1초', { size: 10, bold: true, fill: K.a, pop: 2.3 })
    + pop(2.4, guide(`M${n1(X(0.25))} ${Y(1)}V98`, K.a) + dot(n1(X(0.25)), Y(1), 3.4, K.a))
    + tx(X(0.25), 111, '1/4', { size: 9.5, bold: true, fill: K.a, pop: 2.5 }),
  );
}

function sportsPasses() {
  const O = [28, 96] as const, P1 = [88, 96] as const, P2 = [58, 44] as const;
  const u = [0.5, -Math.sqrt(3) / 2];
  return svg(
    `<rect x="4" y="4" width="124" height="112" rx="6" fill="${K.f}"/><path d="M10 10H122V110H10Z" fill="none" stroke="${W}" stroke-width="1.6"/>`
    + `<path d="M${O[0] - 5} ${O[1] + 4}L${O[0]} ${O[1] - 7}L${O[0] + 5} ${O[1] + 4}Z" fill="${K.am}" stroke="${K.ink}" stroke-width="1"/>`
    + arrow(O[0] + 7, O[1], P1[0] - 10, P1[1], 0.1, { color: K.p, w: 2 }) + pop(0.8, player(P1[0], P1[1], '7', K.p))
    + arrow(O[0] + 4 * u[0], O[1] + 4 * u[1] - 3, P2[0] - 10 * u[0], P2[1] - 10 * u[1], 0.5, { color: K.p, w: 2 }) + pop(1.2, player(P2[0], P2[1], '10', K.p))
    + tx(58, 109, '3 m', { size: 9.5, fill: K.ink }) + tx(36, 70, '3 m', { size: 9.5, fill: K.ink, anchor: 'end' })
    + dr(arc(O[0], O[1], 14, 0, Math.PI / 3), 1.3, { color: K.a, w: 1.6 }) + tx(50, 89, 'π/3', { math: true, size: 10.5, anchor: 'start', pop: 1.5 })
    + dr(`M${P1[0] - 4} ${P1[1] - 7}L${P2[0] + 4} ${P2[1] + 7}`, 1.7, { color: K.a, w: 2.4 })
    + tx(80, 66, 'd = 3 m', { size: 10.5, bold: true, fill: K.a, anchor: 'start', pop: 2.5 })
    + tx(185, 28, 'd² = 3² + 3²', { math: true, size: 11.5, fill: K.p, pop: 1.9 })
    + tx(185, 47, '−2×3×3cos(π/3)', { math: true, size: 11.5, fill: K.p, pop: 1.9 })
    + tx(185, 68, '= 18 − 9 = 9', { math: true, size: 11.5, pop: 2.3 })
    + tx(185, 94, 'd = 3 m', { size: 13, bold: true, fill: K.a, pop: 2.6 }),
  );
}

function fashionArc() {
  const C = [60, 54] as const, r = 38;
  const pearls = [Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75].map((a) => { const [x, y] = at(C[0], C[1], r - 9, a); return dot(x, y, 2, K.l); }).join('');
  return svg(
    `<rect x="22" y="96" width="76" height="9" rx="4.5" fill="${K.l}" stroke="${K.m}" stroke-width="1.2"/><path d="M30 100.5H90" stroke="${K.m}" stroke-width="1"/>`
    + `<circle cx="${C[0]}" cy="${C[1]}" r="${r}" fill="${K.f}" stroke="${K.l}" stroke-width="6"/>` + pearls
    + dr(`M${C[0]} ${C[1]}H${C[0] + r}`, 0.1, { color: K.p, w: 1.6 }) + tx(74, 64, 'r = 2 cm', { size: 9, fill: K.ink })
    + dr(`M${C[0]} ${C[1]}V${C[1] - r}`, 0.4, { color: K.p, w: 1.6 })
    + pop(0.7, `<path d="M${C[0]} ${C[1] - 8}H${C[0] + 8}V${C[1]}" fill="none" stroke="${K.p}" stroke-width="1.2"/>`) + tx(80, 44, 'π/2', { math: true, size: 11, fill: K.p, pop: 0.7 })
    + drs(arc(C[0], C[1], r, 0, Math.PI / 2), 1.0, 1.1, { w: 6 })
    + tx(100, 18, 'π cm', { size: 10.5, bold: true, fill: K.a, pop: 2.0 })
    + tx(178, 26, '90° = π/2 rad', { math: true, size: 11.5, fill: K.p, pop: 0.8 })
    + tx(178, 50, 's = rθ', { math: true, size: 11.5, pop: 1.6 })
    + tx(178, 70, '= 2 × π/2 = π cm', { math: true, size: 11.5, pop: 2.1 })
    + tx(178, 98, '둘레 4π cm의 4분의 1', { size: 9.5, fill: K.ink, pop: 2.4 }),
  );
}

function cookingTurn() {
  const C = [54, 62] as const, total = 2.5 * Math.PI;
  const R = (a: number) => 32 + 14 * (a / total);
  const spiral = 'M' + Array.from({ length: 121 }, (_, i) => { const a = (total * i) / 120; const [x, y] = at(C[0], C[1], R(a), a); return `${x} ${y}`; }).join('L');
  const end = at(C[0], C[1], R(total), total);
  const head = `<path class="pop" style="--d:1.65s" d="M${n1(+end[0] + 5)} ${n1(+end[1] - 5)}L${end[0]} ${end[1]}L${n1(+end[0] + 5)} ${n1(+end[1] + 5)}" fill="none" stroke="${K.a}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return svg(
    `<circle cx="${C[0]}" cy="${C[1]}" r="22" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><circle cx="${C[0]}" cy="${C[1]}" r="15" fill="${K.f}"/>`
    + dot(48, 58, 4, K.am) + dot(59, 57, 3.5, K.a) + dot(55, 68, 4, K.am) + dot(62, 66, 2.5, K.p)
    + `<rect x="76" y="59" width="9" height="6" rx="2" fill="none" stroke="${K.m}" stroke-width="1.2" stroke-dasharray="2 2"/>`
    + drs(spiral, 0.1, 1.6, { w: 2 }) + head
    + pop(1.7, `<rect x="51" y="31" width="6" height="9" rx="2" fill="${K.a}"/>`)
    + tx(178, 22, '한 바퀴 + 90°', { size: 10, bold: true, fill: K.ink })
    + tx(178, 43, '2π + π/2 = 5π/2', { math: true, size: 12, pop: 1.8 })
    + tx(178, 61, '돌린 양은 2π 더 많음', { size: 9.5, fill: K.ink, pop: 2.0 })
    + `<circle cx="134" cy="98" r="7" fill="${W}" stroke="${K.p}" stroke-width="1.4"/><rect x="132" y="88" width="4" height="5" rx="1" fill="${K.a}"/>`
    + dr(arc(134, 98, 13, 0, Math.PI / 2), 2.2, { color: K.p, w: 1.6 })
    + `<path class="pop" style="--d:3.00s" d="M138 81L134 85L138 89" fill="none" stroke="${K.p}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
    + tx(156, 96, 'π/2만 돌려도', { size: 9.5, anchor: 'start', fill: K.ink, pop: 2.4 }) + tx(156, 110, '끝 방향은 같음', { size: 9.5, anchor: 'start', fill: K.a, bold: true, pop: 2.8 }),
  );
}

function snsSticker() {
  const X = (t: number) => 66 + 40 * t, Y = (y: number) => 16 + (y - 30) * 1.5;
  const f = (t: number) => 50 + 20 * Math.sin(Math.PI * t);
  const lines = [30, 50, 70].map((v) => `M64 ${Y(v)}H230`).join('');
  const ticks = [0, 1, 2, 3, 4].map((t) => `M${X(t)} 85V91`).join('');
  return svg(
    `<rect x="6" y="4" width="30" height="84" rx="5" fill="${K.p}"/><path d="${lines}" stroke="${K.l}" stroke-width="1" stroke-dasharray="3 3"/>`
    + star(21, Y(50), 8) + tx(40, 8, 'y(px)↓', { size: 9, anchor: 'start' })
    + tx(60, Y(30) + 3.5, '30', { size: 9.5, bold: true, fill: K.a, anchor: 'end' }) + tx(60, Y(50) + 3.5, '50', { size: 9.5, anchor: 'end' }) + tx(60, Y(70) + 3.5, '70', { size: 9.5, bold: true, fill: K.a, anchor: 'end' })
    + `<path d="M${X(0)} 88H${X(4)}" stroke="${K.m}" stroke-width="1.2"/><path d="${ticks}" stroke="${K.m}" stroke-width="1.2"/>`
    + [0, 1, 2, 3, 4].map((t) => tx(X(t), 100, String(t), { size: 9.5 })).join('') + tx(21, 100, 't(초)', { size: 9 })
    + tx(236, 10, 'y = 50 + 20sin(πt)', { math: true, size: 11, anchor: 'end' })
    + dr(curve(f, 0, 2, X, Y, 64), 0.1, { color: K.a, w: 2.4 })
    + pop(0.3, star(21, Y(70), 6, true)) + pop(0.6, star(21, Y(30), 6, true))
    + dr(curve(f, 2, 4, X, Y, 64), 1.2, { color: K.p, w: 2.4 })
    + dr(`M${X(0)} 104V108H${X(2)}V104`, 2.2, { color: K.a, w: 1.6 }) + tx(152, 112, '주기 2초', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.5 }),
  );
}

function designArea() {
  const A = [14, 100] as const, B = [134, 100] as const, C = [n1(14 + 80 * Math.cos(Math.PI / 6)), 60] as const;
  let dots = '';
  for (let x = 14; x <= 134; x += 20) for (let y = 20; y <= 100; y += 20) dots += `<circle cx="${x}" cy="${y}" r="1.2"/>`;
  return svg(
    `<rect x="4" y="4" width="140" height="112" rx="4" fill="${W}" stroke="${K.l}" stroke-width="1.2"/><g fill="${K.l}">${dots}</g>` + tx(10, 15, '1칸 = 1 cm', { size: 9, anchor: 'start' })
    + pop(1.6, `<path d="M${A[0]} ${A[1]}L${B[0]} ${B[1]}L${C[0]} ${C[1]}Z" fill="${K.am}" fill-opacity=".35"/>`)
    + dr(`M${A[0]} ${A[1]}H${B[0]}`, 0.1, { color: K.p, w: 2.6 }) + tx(74, 112, '6 cm', { size: 10, bold: true, fill: K.ink, pop: 0.5 })
    + dr(`M${A[0]} ${A[1]}L${C[0]} ${C[1]}`, 0.5, { color: K.p, w: 2.6 }) + tx(44, 74, '4 cm', { size: 10, bold: true, fill: K.ink, anchor: 'end', pop: 0.9 })
    + dr(arc(A[0], A[1], 18, 0, Math.PI / 6), 1.0, { color: K.a, w: 1.6 }) + tx(46, 98, 'π/6', { math: true, size: 10.5, pop: 1.2 })
    + dr(`M${B[0]} ${B[1]}L${C[0]} ${C[1]}`, 1.2, { color: K.p, w: 1.6 })
    + pop(1.9, guide(`M${C[0]} ${C[1]}V100`, K.a) + `<path d="M${C[0]} 94h6v6" fill="none" stroke="${K.a}" stroke-width="1"/>`) + tx(89, 92, '2 cm', { size: 9.5, fill: K.a, anchor: 'start', pop: 1.9 })
    + tx(190, 30, 'S = (1/2) × 6 × 4', { math: true, size: 11, fill: K.p, pop: 2.1 })
    + tx(190, 48, '× sin(π/6)', { math: true, size: 11, fill: K.p, pop: 2.1 })
    + tx(190, 72, '= 6 cm²', { size: 13, bold: true, fill: K.a, pop: 2.4 })
    + tx(190, 100, '높이 = 4 × sin(π/6)', { size: 9, fill: K.ink, pop: 2.6 }),
  );
}

function animalToy() {
  const Y = (h: number) => 112 - 2.5 * h, X = (a: number) => 124 + (100 * a) / (2 * Math.PI);
  const h = (a: number) => 30 + 10 * Math.sin(a);
  const C = [78, Y(30)] as const, r = 25;
  const yarn = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="5" fill="${K.a}" stroke="${K.ink}" stroke-width="1"/><path d="M${x - 3} ${y - 2}Q${x} ${y + 1} ${x + 3} ${y - 3}M${x - 4} ${y + 2}Q${x} ${y + 4} ${x + 4} ${y}" fill="none" stroke="${W}" stroke-width=".8"/>`;
  return svg(
    `<path d="M4 112H112" stroke="${K.l}" stroke-width="2"/>` + cat
    + `<path d="M46 112V12" stroke="${K.m}" stroke-width="1.2"/><path d="M43 ${Y(20)}H49M43 ${Y(30)}H49M43 ${Y(40)}H49" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(42, Y(40) + 3.5, '40', { size: 9.5, anchor: 'end' }) + tx(42, Y(30) + 3.5, '30', { size: 9.5, anchor: 'end' }) + tx(42, Y(20) + 3.5, '20', { size: 9.5, anchor: 'end' }) + tx(50, 10, 'h(cm)', { size: 9, anchor: 'start' })
    + guide(`M49 ${Y(40)}H226M49 ${Y(20)}H226`, K.l)
    + `<circle cx="${C[0]}" cy="${C[1]}" r="${r}" fill="none" stroke="${K.l}" stroke-width="1.6"/>` + dot(C[0], C[1], 1.8, K.m)
    + `<g opacity=".35">${yarn(C[0] + r, C[1])}</g>`
    + `<path d="M124 ${Y(30)}H228M124 ${Y(40) - 4}V${Y(20) + 4}" stroke="${K.m}" stroke-width="1.1"/>`
    + tx(124, 74, '0', { size: 9 }) + tx(X(1.5 * Math.PI), 74, '3π/2', { size: 9.5, bold: true, fill: K.a }) + tx(232, 74, '2π', { size: 9, anchor: 'end' })
    + drs(arc(C[0], C[1], r, 0, 1.5 * Math.PI), 0.1, 1.2, { w: 2.4, linear: true })
    + drs(curve(h, 0, 1.5 * Math.PI, X, Y), 0.1, 1.2, { w: 2.4, linear: true })
    + pop(1.3, yarn(C[0], C[1] + r) + dot(n1(X(1.5 * Math.PI)), Y(20), 3.4, K.a))
    + dr(`M${C[0] + 7} ${Y(20)}H${n1(X(1.5 * Math.PI) - 5)}`, 1.5, { color: K.a, w: 1.4 })
    + drs(arc(C[0], C[1], r, 1.5 * Math.PI, 2 * Math.PI), 2.2, 0.5, { color: K.p, w: 2, linear: true })
    + drs(curve(h, 1.5 * Math.PI, 2 * Math.PI, X, Y, 16), 2.2, 0.5, { color: K.p, w: 2, linear: true })
    + tx(176, 92, 'h = 30 + 10sinθ', { math: true, size: 11.5 })
    + tx(176, 108, 'θ = 3π/2일 때 최저 20 cm', { size: 9.5, bold: true, fill: K.a, pop: 2.0 }),
  );
}

function travelTriangle() {
  const A = [20, 100] as const, B = [165, 100] as const, C = [112, 47] as const;
  return svg(
    `<rect x="4" y="4" width="232" height="112" rx="6" fill="${K.f}"/><path d="M4 44Q30 30 46 4M184 116Q200 92 236 94" fill="none" stroke="${W}" stroke-width="4"/>`
    + `<path d="M${A[0]} ${A[1]}H${B[0]}" stroke="${K.p}" stroke-width="1.8"/>`
    + dr(arc(A[0], A[1], 16, 0, Math.PI / 6), 0.1, { color: K.p, w: 1.5 }) + tx(47, 97, '30°', { size: 10, fill: K.ink, pop: 0.3 })
    + dr(arc(B[0], B[1], 16, (3 * Math.PI) / 4, Math.PI), 0.4, { color: K.p, w: 1.5 }) + tx(138, 97, '45°', { size: 10, fill: K.ink, pop: 0.6 })
    + dr(`M${B[0]} ${B[1]}L${C[0]} ${C[1]}`, 0.7, { color: K.p, w: 2.6 }) + tx(146, 70, 'a = 10 m', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 1.2 })
    + tx(C[0], 38, '105°', { size: 10, fill: K.ink, pop: 1.4 })
    + tx(236, 18, 'b/sin45° = 10/sin30°', { math: true, size: 11.5, anchor: 'end', pop: 1.6 })
    + dr(`M${A[0]} ${A[1]}L${C[0]} ${C[1]}`, 1.9, { color: K.a, w: 2.6 })
    + tx(60, 64, 'b = 10√2 m', { size: 10.5, bold: true, fill: K.a, anchor: 'end', pop: 2.7 })
    + [[A, 'A', 0, 14], [B, 'B', 0, 14], [C, 'C', -12, 2]].map(([p, s, dx, dy]) => {
      const [x, y] = p as readonly [number, number];
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="${W}" stroke="${K.ink}" stroke-width="1.4"/>${tx(x + (dx as number), y + (dy as number), s as string, { size: 10, bold: true, fill: K.ink })}`;
    }).join(''),
  );
}

function carWheel() {
  const r = 14, fy = 90, x0 = 24, x1 = x0 + 3 * Math.PI * r;
  const cyc = 'M' + Array.from({ length: 97 }, (_, i) => { const t = (3 * Math.PI * i) / 96; return `${n1(x0 + r * (t - Math.sin(t)))} ${n1(fy - r * (1 - Math.cos(t)))}`; }).join('L');
  return svg(
    `<path d="M4 ${fy}H236" stroke="${K.l}" stroke-width="2"/><path d="M${x0} ${fy - 3}V${fy + 4}M${n1(x0 + 2 * Math.PI * r)} ${fy - 3}V${fy + 4}M${n1(x1)} ${fy - 3}V${fy + 4}" stroke="${K.m}" stroke-width="1.2"/>`
    + wheel(x0, fy - r, r, true) + dot(x0, fy, 3, K.a) + tx(x0, 54, 'r = 10 cm', { size: 9.5, fill: K.ink })
    + tx(8, 18, 'θ = 3π rad', { math: true, size: 12, anchor: 'start', fill: K.p })
    + drs(`M${x0} ${fy}H${n1(x1)}`, 0.1, 1.6, { w: 4, linear: true })
    + drs(cyc, 0.1, 1.6, { color: K.am, w: 1.6, linear: true })
    + tx(x0, 102, '0', { size: 9.5 }) + tx(+n1(x0 + 2 * Math.PI * r), 102, '20π', { size: 9.5, fill: K.ink, pop: 1.1 }) + tx(+n1(x0 + 2 * Math.PI * r), 114, '한 바퀴', { size: 9, pop: 1.1 })
    + pop(1.6, wheel(Number(n1(x1)), fy - r, r) + dot(n1(x1), fy - 2 * r, 3, K.a))
    + tx(+n1(x1), 102, '30π cm', { size: 10, bold: true, fill: K.a, pop: 1.8 }) + tx(+n1(x1), 114, '한 바퀴 반', { size: 9, fill: K.a, pop: 1.8 })
    + tx(236, 18, 's = rθ = 10 × 3π = 30π cm', { math: true, size: 11.5, anchor: 'end', pop: 2.1 })
    + tx(236, 56, '끝 모습은', { size: 9, anchor: 'end', pop: 2.5 }) + tx(236, 69, '반 바퀴와 같음', { size: 9, anchor: 'end', pop: 2.5 }),
  );
}

function healthDisplay() {
  const X = (t: number) => 18 + 25 * t, Y = (y: number) => 50 - 27 * y;
  const f = (t: number) => Math.sin((Math.PI * t) / 2);
  return svg(
    `<rect x="6" y="5" width="228" height="88" rx="3" fill="${K.p}" stroke="${K.am}" stroke-width="4"/><path d="M12 50H228" stroke="${W}" stroke-opacity=".3" stroke-width="1"/>`
    + tx(226, 20, 'y = sin(πt/2)', { math: true, size: 11.5, anchor: 'end', fill: K.am })
    + dr(curve(f, 0, 4, X, Y), 0.1, { color: K.a, w: 2.6 })
    + pop(0.45, dot(X(1), Y(1), 3.4, W)) + tx(50, 20, 'y(1) = 1', { math: true, size: 11, anchor: 'start', fill: W, pop: 0.5 })
    + pop(0.85, dot(X(3), Y(-1), 3.4, W)) + tx(102, 87, 'y(3) = −1', { math: true, size: 11, anchor: 'start', fill: W, pop: 0.9 })
    + dr(curve(f, 4, 8, X, Y), 1.2, { color: K.am, w: 2.6 })
    + dr(`M${X(0)} 99V104H${X(4)}V99`, 2.2, { color: K.a, w: 1.6 }) + tx(X(2), 116, '주기 4초', { size: 10, bold: true, fill: K.a, pop: 2.5 })
    + tx(X(4) + 6, 112, '0 ≤ t ≤ 8', { math: true, size: 10.5, anchor: 'start', fill: K.ink }),
  );
}

function environmentShadow() {
  const X = (a: number) => 120 + (80 / (Math.PI / 2)) * a, Y = (h: number) => 100 - 25 * h;
  const sunRays = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i * Math.PI) / 4; return `M${n1(12 + 10 * Math.cos(a))} ${n1(22 + 10 * Math.sin(a))}L${n1(12 + 13 * Math.cos(a))} ${n1(22 + 13 * Math.sin(a))}`; }).join('');
  return svg(
    `<path d="M4 100H112" stroke="${K.m}" stroke-width="1.6"/><rect x="40" y="100" width="50" height="4" fill="${K.ink}" fill-opacity=".55"/>`
    + `<circle cx="12" cy="22" r="7" fill="${K.am}"/><path d="${sunRays}" stroke="${K.am}" stroke-width="1.4" stroke-linecap="round"/>`
    + `<path d="M40 100V50" stroke="${K.p}" stroke-width="4" stroke-linecap="round"/>`
    + drs('M19 29L90 100', 0.1, 1, { color: K.am, w: 1.6 })
    + dr('M74 100A16 16 0 0 1 78.7 88.7', 0.9, { color: K.a, w: 1.6 }) + tx(70, 95, 'π/4', { math: true, size: 10.5, anchor: 'end', pop: 1.0 })
    + tx(65, 115, '그림자 2 m', { size: 9.5, fill: K.ink }) + tx(35, 78, 'h = 2 m', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.0 })
    + axes(120, 100, 234, 8) + tx(124, 10, 'h(m)', { size: 9, anchor: 'start' })
    + dr(curve((a) => 2 * Math.tan(a), 0, Math.atan(1.8), X, Y), 1.2, { color: K.p, w: 2.2 })
    + tx(112, 22, 'h = 2tanθ', { math: true, size: 11.5, anchor: 'end', pop: 1.4 })
    + pop(1.9, guide(`M44 ${Y(2)}H${X(Math.PI / 4)}V100`, K.a) + dot(X(Math.PI / 4), Y(2), 3.4, K.a))
    + tx(X(Math.PI / 4), 112, 'π/4', { math: true, size: 10.5, fill: K.a, pop: 2.0 }) + tx(124, Y(2) - 4, '2', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.0 })
    + pop(2.3, guide(`M${X(Math.PI / 2)} 8V100`, K.a)) + tx(X(Math.PI / 2), 112, 'π/2', { math: true, size: 10.5, pop: 2.3 })
    + tx(220, 52, '정의', { size: 9, fill: K.ink, pop: 2.4 }) + tx(220, 64, '안 됨', { size: 9, fill: K.ink, pop: 2.4 }),
  );
}

function aiCircle() {
  const C = [56, 60] as const, r = 40;
  const data = Array.from({ length: 8 }, (_, i) => { const [x, y] = at(C[0], C[1], r, (i * Math.PI) / 4); return i % 4 === 0 ? '' : dot(x, y, 2.6, K.m); }).join('');
  const row = (y: number, a: string, v: string, at0: number, hot: boolean) =>
    pop(at0, `<rect x="134" y="${y - 13}" width="98" height="19" rx="3" fill="${hot ? K.f : W}" stroke="${K.l}" stroke-width="1"/>`)
    + tx(150, y, a, { math: true, size: 11.5, fill: K.p, pop: at0 }) + tx(196, y, v, { math: true, size: 11.5, fill: hot ? K.a : K.ink, pop: at0 });
  return svg(
    `<path d="M10 60H102M56 14V106" stroke="${K.l}" stroke-width="1.1"/><circle cx="${C[0]}" cy="${C[1]}" r="${r}" fill="none" stroke="${K.l}" stroke-width="1.4"/>` + data
    + tx(10, 14, 'AI 그림판', { size: 9, anchor: 'start' })
    + dot(96, 60, 4, K.p) + tx(100, 74, '(1, 0)', { math: true, size: 10.5, fill: K.p, anchor: 'start' })
    + dr(arc(C[0], C[1], r, 0, Math.PI), 0.3, { color: K.a, w: 2.6 }) + tx(41, 42, 'θ = π', { math: true, size: 10, pop: 1.0 })
    + pop(1.2, dot(16, 60, 4, K.a)) + tx(22, 56, '(−1, 0)', { math: true, size: 10.5, fill: K.a, anchor: 'start', pop: 1.2 })
    + dr(arc(C[0], C[1], r, Math.PI, 2 * Math.PI), 1.6, { color: K.p, w: 2.2 })
    + `<path d="M134 12h98v18h-98z" fill="${K.p}"/>` + tx(183, 25, 'θ → (cosθ, sinθ)', { math: true, size: 11, fill: W })
    + row(48, '0', '(1, 0)', 0.1, false) + row(72, 'π', '(−1, 0)', 1.3, true) + row(96, '2π', '(1, 0)', 2.5, false)
    + tx(183, 116, '한 바퀴 돌아도 같은 점', { size: 9, fill: K.ink, pop: 2.7 }),
  );
}

function buildingRoof() {
  const s = 16, A = [24, 70] as const, h = 6 * s * Math.tan(Math.PI / 6), T = [120, n1(70 - h)] as const;
  return svg(
    `<rect x="14" y="106" width="116" height="6" rx="2" fill="${K.am}"/><rect x="24" y="70" width="96" height="36" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/>`
    + `<rect x="32" y="88" width="14" height="11" fill="${W}" stroke="${K.p}" stroke-width="1.2"/><rect x="56" y="88" width="14" height="11" fill="${W}" stroke="${K.p}" stroke-width="1.2"/><rect x="96" y="86" width="12" height="20" fill="${K.l}" stroke="${K.p}" stroke-width="1.2"/>`
    + `<path d="M${A[0]} ${A[1]}L${T[0]} ${T[1]}L120 70Z" fill="${K.l}" fill-opacity=".6"/>`
    + dr(`M${A[0]} 70H120`, 0.1, { color: K.a, w: 2.6 }) + tx(62, 82, '6 cm', { size: 10, bold: true, fill: K.a, pop: 0.6 })
    + dr(arc(A[0], A[1], 30, 0, Math.PI / 6), 0.6, { color: K.p, w: 1.4 }) + tx(64, 67, 'π/6', { math: true, size: 10.5, fill: K.p, pop: 0.9 })
    + dr(`M${A[0]} ${A[1]}L${T[0]} ${T[1]}`, 1.0, { color: K.p, w: 3 }) + tx(58, 30, '경사면 ≠ h', { size: 9.5, anchor: 'end', fill: K.ink, pop: 1.6 })
    + dr(`M120 70V${T[1]}`, 1.8, { color: K.a, w: 2.6 }) + pop(2.2, `<path d="M112 70V62H120" fill="none" stroke="${K.a}" stroke-width="1.2"/>`)
    + tx(126, 46, 'h', { math: true, size: 13, anchor: 'start', pop: 2.2 })
    + tx(190, 30, 'h = 6tan(π/6)', { math: true, size: 11.5, fill: K.p, pop: 2.0 })
    + tx(190, 52, '= 6/√3', { math: true, size: 11.5, fill: K.p, pop: 2.4 })
    + tx(190, 76, '= 2√3 cm', { size: 13, bold: true, fill: K.a, pop: 2.8 }),
  );
}

function stageLights() {
  const O = [77, 98] as const, L = 60;
  const L1 = at(O[0], O[1], L, Math.PI / 6).map(Number), L2 = at(O[0], O[1], L, (5 * Math.PI) / 6).map(Number);
  const curtain = 'M4 6' + Array.from({ length: 12 }, (_, i) => `q6 6 12 0`).join('') + 'V14' + Array.from({ length: 12 }, () => 'q-6 4 -12 0').join('') + 'Z';
  return svg(
    `<rect x="4" y="6" width="146" height="108" rx="4" fill="${K.f}"/><path d="${curtain}" fill="${K.a}" fill-opacity=".8"/>`
    + `<path d="M${O[0] - 5} ${O[1] - 5}l10 10M${O[0] + 5} ${O[1] - 5}l-10 10" stroke="${K.am}" stroke-width="2.4" stroke-linecap="round"/>` + tx(O[0], 112, '무대 중심', { size: 9 })
    + fixture(L1[0], L1[1]) + fixture(L2[0], L2[1])
    + dr(`M${O[0]} ${O[1]}L${n1(L1[0] - 8)} ${n1(L1[1] + 4.6)}`, 0.1, { color: K.p, w: 1.8 }) + tx(110, 96, '5 m', { size: 9.5, fill: K.ink, anchor: 'start', pop: 0.5 })
    + dr(`M${O[0]} ${O[1]}L${n1(L2[0] + 8)} ${n1(L2[1] + 4.6)}`, 0.4, { color: K.p, w: 1.8 }) + tx(44, 96, '5 m', { size: 9.5, fill: K.ink, anchor: 'end', pop: 0.8 })
    + dr(arc(O[0], O[1], 10, Math.PI / 6, (5 * Math.PI) / 6), 0.9, { color: K.a, w: 1.6 }) + tx(O[0], 84, '2π/3', { math: true, size: 10.5, pop: 1.1 })
    + dr(`M${n1(L2[0] + 11)} ${L2[1]}H${n1(L1[0] - 11)}`, 1.4, { color: K.a, w: 2.6 })
    + tx(O[0], 61, 'd = 5√3 m', { size: 10.5, bold: true, fill: K.a, pop: 2.3 })
    + tx(195, 28, 'd² = 25 + 25', { math: true, size: 11.5, fill: K.p, pop: 1.6 })
    + tx(195, 46, '− 50 × (−1/2)', { math: true, size: 11.5, fill: K.p, pop: 1.6 })
    + tx(195, 66, '= 75', { math: true, size: 11.5, pop: 2.0 })
    + tx(195, 92, 'd = 5√3 m', { size: 13, bold: true, fill: K.a, pop: 2.4 }),
  );
}

const drawings: Record<string, string> = {
  'game-orbit': gameOrbit(),
  'music-wave': musicWave(),
  'sports-passes': sportsPasses(),
  'fashion-arc': fashionArc(),
  'cooking-turn': cookingTurn(),
  'sns-sticker': snsSticker(),
  'design-area': designArea(),
  'animal-toy': animalToy(),
  'travel-triangle': travelTriangle(),
  'car-wheel': carWheel(),
  'health-display': healthDisplay(),
  'environment-shadow': environmentShadow(),
  'ai-circle': aiCircle(),
  'building-roof': buildingRoof(),
  'stage-lights': stageLights(),
};
export default drawings;
