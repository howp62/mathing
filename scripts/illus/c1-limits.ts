/**
 * 미적분I '함수의 극한과 연속' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts c1-limits`로 content/sets/c1-limits.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 값이 다가가는 과정(양쪽 화살표 → 빈 점·채운 점 → 결과)만 차례로 나타난다. 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 공통 조각 ---- */

const dot = (x: number, y: number, c: string = K.a, r = 3.4) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${c}"/>`;
const hole = (x: number, y: number, c: string = K.p) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="3.4" fill="${W}" stroke="${c}" stroke-width="1.8"/>`;

/** 곡선을 a → b 방향으로 그리고, 끝에 화살촉(선이 거의 다 그려졌을 때 나타남) */
function curveArrow(f: (x: number) => number, a: number, b: number, X: (x: number) => number, Y: (y: number) => number, at: number, color: string, w = 2) {
  const e = (b - a) / 48;
  const x2 = X(b), y2 = Y(f(b)), ang = Math.atan2(y2 - Y(f(b - e)), x2 - X(b - e));
  const p = (t: number) => `${n1(x2 + 5 * Math.cos(ang + t))} ${n1(y2 + 5 * Math.sin(ang + t))}`;
  return dr(curve(f, a, b, X, Y), at, { color, w })
    + `<path class="pop" style="--d:${(at + 0.6).toFixed(2)}s" d="M${p(Math.PI * 0.8)}L${n1(x2)} ${n1(y2)}L${p(-Math.PI * 0.8)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* ---- 카드별 그림 ---- */

function scoreHole() {
  const X = (x: number) => 72 + 36 * x, Y = (y: number) => 106 - 12.5 * y;
  const f = (x: number) => x + 1;
  const vals = [1, 2, 5, 4, 5];
  const board = `<rect x="54" y="4" width="180" height="28" rx="4" fill="${K.ink}"/>`
    + vals.map((v, i) => `<rect x="${X(i) - 14}" y="8" width="28" height="20" rx="2" fill="${i === 2 ? K.a : K.p}"/>${tx(X(i), 23, String(v), { size: 13, bold: true, fill: i === 2 ? W : K.am })}`).join('');
  const joystick = `<rect x="8" y="88" width="44" height="16" rx="4" fill="${K.p}"/><path d="M30 90L23 62" stroke="${K.ink}" stroke-width="4" stroke-linecap="round"/><circle cx="22" cy="58" r="8" fill="${K.a}"/><circle cx="44" cy="84" r="3.5" fill="${K.am}"/><ellipse cx="30" cy="91" rx="7" ry="2.5" fill="${K.ink}"/>`;
  const marks = [0, 1, 3, 4].map((i) => dot(X(i), Y(f(i)), K.p, 2.2)).join('');
  return svg(
    board + tx(26, 22, '점수판', { size: 9.5, fill: K.ink }) + joystick
    + axes(72, 106, 232, 38) + [0, 1, 2, 3, 4].map((i) => tx(X(i), 117, String(i), { size: 9, fill: i === 2 ? K.a : K.m })).join('') + marks
    + arrow(X(0), Y(1), X(1.82), Y(2.82), 0.1, { color: K.p, w: 2 }) + arrow(X(4), Y(5), X(2.18), Y(3.18), 0.9, { color: K.p, w: 2 })
    + pop(1.7, hole(X(2), Y(3))) + tx(66, Y(3) + 3.5, '3', { size: 10, bold: true, fill: K.p, anchor: 'end', pop: 1.7 })
    + tx(152, 84, 'f(x) → 3', { math: true, size: 11, fill: K.p, anchor: 'start', pop: 1.8 })
    + pop(2.1, guide(`M${X(2)} 32V${Y(5) - 4}`, K.a) + dot(X(2), Y(5))) + tx(66, Y(5) + 3.5, '5', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.1 })
    + tx(136, Y(5) + 4, 'f(2) = 5', { math: true, size: 11, anchor: 'end', pop: 2.3 }),
  );
}

function stageFader() {
  const X = (t: number) => 100 + 31 * t, Y = (v: number) => 106 - 16 * v;
  const ticks = [0, 1, 2, 3, 4, 5].map((v) => `M36 ${Y(v)}H40M48 ${Y(v)}H52`).join('');
  const panel = `<rect x="14" y="16" width="60" height="98" rx="5" fill="${K.f}" stroke="${K.m}" stroke-width="1.2"/><path d="${ticks}" stroke="${K.m}" stroke-width="1"/><rect x="42" y="${Y(5)}" width="4" height="${16 * 5}" rx="2" fill="${K.ink}"/>`
    + `<rect x="33" y="${Y(4) - 5}" width="22" height="10" rx="2" fill="${K.p}"/><path d="M36 ${Y(4)}H52" stroke="${W}" stroke-width="1.4"/><circle cx="64" cy="24" r="2.5" fill="${K.a}"/>`
    + tx(28, Y(0) + 3.5, '0', { size: 9, anchor: 'end' }) + tx(28, Y(4) + 3.5, '4', { size: 10, bold: true, fill: K.a, anchor: 'end' });
  return svg(
    tx(44, 11, '음량 설정값', { size: 9.5, fill: K.ink }) + panel
    + axes(100, 106, 232, 20) + tx(X(0), 117, '0', { size: 9 }) + tx(X(2), 117, '2', { size: 10, bold: true, fill: K.a }) + tx(X(4), 117, '4', { size: 9 }) + tx(232, 100, 't(초)', { size: 9, anchor: 'end' })
    + arrow(X(0), Y(0), X(1.85), Y(3.7), 0.1, { color: K.p, w: 2.2 }) + tx(148, 92, 't → 2−', { math: true, size: 10.5, fill: K.p, anchor: 'start', pop: 0.6 })
    + arrow(X(4), Y(4), X(2.15), Y(4), 0.9, { color: K.p, w: 2.2 }) + tx(200, 58, 't → 2+', { math: true, size: 10.5, fill: K.p, pop: 1.4 })
    + pop(1.8, dot(X(2), Y(4))) + pop(2.1, guide(`M56 ${Y(4)}H${X(2) - 5}`, K.a))
    + tx(X(2), 28, 'f(2) = 4', { math: true, size: 11, pop: 2.3 }),
  );
}

function runnerNear() {
  const S = (s: number) => 135 + 160 * (s - 4);
  const runner = (cx: number, c: string) =>
    `<g fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="${cx + 3}" cy="28" r="4.2" fill="${c}" stroke="none"/><path d="M${cx + 1} 34L${cx - 2} 45M${cx} 37L${cx + 7} 42L${cx + 11} 37M${cx} 37L${cx - 6} 40L${cx - 9} 45M${cx - 2} 45L${cx + 5} 51L${cx + 4} 58M${cx - 2} 45L${cx - 7} 52L${cx - 13} 52"/></g>`;
  const track = `<rect x="14" y="60" width="220" height="8" fill="${K.a}" fill-opacity=".35"/><path d="M14 60H234" stroke="${K.a}" stroke-width="1.2"/><path d="M${n1(S(3.61))} 60v8M${S(4)} 60v8M${n1(S(4.41))} 60v8" stroke="${W}" stroke-width="1.6"/>`;
  return svg(
    track
    + pop(0.1, runner(S(3.61), K.m)) + tx(S(3.61) + 2, 16, '1.9초', { size: 9.5, fill: K.ink, pop: 0.1 }) + tx(S(3.61), 80, '3.61', { size: 10, bold: true, fill: K.p, pop: 0.2 })
    + pop(0.5, runner(S(4.41), K.m)) + tx(S(4.41) + 2, 16, '2.1초', { size: 9.5, fill: K.ink, pop: 0.5 }) + tx(S(4.41), 80, '4.41', { size: 10, bold: true, fill: K.p, pop: 0.6 })
    + arrow(S(3.61), 92, S(4) - 6, 92, 0.9, { color: K.a, w: 2 }) + arrow(S(4.41), 92, S(4) + 6, 92, 0.9, { color: K.a, w: 2 })
    + pop(1.9, runner(S(4), K.p) + dot(S(4), 64)) + tx(S(4) + 2, 16, '2초', { size: 9.5, bold: true, fill: K.a, pop: 1.9 }) + tx(S(4), 80, '4 m', { size: 10, bold: true, fill: K.a, pop: 2.0 })
    + tx(120, 114, 's(t) = t²,  t → 2이면 s(t) → 4', { math: true, size: 11, pop: 2.3 }),
  );
}

function discountBoundary() {
  const X = (x: number) => 100 + 20 * x, Y = (y: number) => 106 - 15 * y;
  const tag = `<path d="M24 14H80V44H24L16 29Z" fill="${W}" stroke="${K.p}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="24" cy="29" r="2.2" fill="${K.p}"/>`;
  const bag = `<path d="M30 64Q30 50 42 50Q54 50 54 64" fill="none" stroke="${K.p}" stroke-width="2"/><path d="M18 64H66L72 110H12Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/><path d="M22 29Q10 40 34 52" fill="none" stroke="${K.m}" stroke-width="1"/>`;
  return svg(
    bag + tag + tx(52, 26, '3만원 이상', { size: 9.5, fill: K.ink }) + tx(52, 39, '1만원 할인', { size: 10, bold: true, fill: K.a })
    + axes(100, 106, 230, 18) + tx(104, 16, '결제액', { size: 9, anchor: 'start' }) + tx(232, 100, '구매액', { size: 9, anchor: 'end' })
    + tx(X(0), 117, '0', { size: 9 }) + tx(X(3), 117, '3', { size: 10, bold: true, fill: K.ink }) + tx(X(6), 117, '6', { size: 9 })
    + arrow(X(0), Y(0), X(2.82), Y(2.82), 0.1, { color: K.p, w: 2.2 }) + tx(150, 50, '왼쪽 → 3', { size: 10, bold: true, fill: K.p, anchor: 'end', pop: 0.8 })
    + arrow(X(6), Y(5), X(3.2), Y(2.2), 0.9, { color: K.a, w: 2.2 }) + tx(196, 90, '오른쪽 → 2', { size: 10, bold: true, fill: K.a, pop: 1.6 })
    + pop(1.8, guide(`M${X(3) - 4} ${Y(3)}H100`, K.p) + hole(X(3), Y(3))) + tx(96, Y(3) + 3.5, '3', { size: 10, bold: true, fill: K.p, anchor: 'end', pop: 1.8 })
    + pop(2.0, guide(`M${X(3) - 4} ${Y(2)}H100`, K.a) + dot(X(3), Y(2))) + tx(96, Y(2) + 3.5, '2', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.0 })
    + tx(180, 26, '3 ≠ 2', { math: true, size: 11, pop: 2.4 }),
  );
}

function ovenMiddle() {
  const X = (t: number) => 112 + 13.5 * t, Y = (T: number) => 102 - 0.45 * T;
  const oven = `<rect x="6" y="30" width="66" height="72" rx="4" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/><path d="M6 44H72" stroke="${K.p}" stroke-width="1.4"/><circle cx="18" cy="37" r="3.2" fill="${K.p}"/><circle cx="30" cy="37" r="3.2" fill="${K.p}"/><rect x="50" y="34" width="16" height="6" rx="1" fill="${K.ink}"/>`
    + `<path d="M20 50H58" stroke="${K.p}" stroke-width="2.4" stroke-linecap="round"/><rect x="14" y="56" width="50" height="38" rx="3" fill="${K.ink}" fill-opacity=".85"/><path d="M18 84H60" stroke="${K.m}" stroke-width="1.2"/><path d="M22 90q4-4 8 0t8 0 8 0 8 0" fill="none" stroke="${K.a}" stroke-width="1.6"/><rect x="26" y="74" width="26" height="9" rx="3" fill="${K.am}"/>`;
  const thermo = `<rect x="100" y="14" width="6" height="84" rx="3" fill="${W}" stroke="${K.m}" stroke-width="1"/><circle cx="103" cy="100" r="5" fill="${K.a}"/>`;
  return svg(
    oven + thermo + dr(`M103 ${n1(Y(20))}V${n1(Y(180))}`, 0.1, { color: K.a, w: 3 })
    + axes(112, 102, 232, 14) + tx(116, 12, 'T(℃)', { size: 9, anchor: 'start' }) + tx(232, 96, 't(분)', { size: 9, anchor: 'end' })
    + tx(95, Y(20) + 3.5, '20', { size: 9, anchor: 'end' }) + tx(95, Y(180) + 3.5, '180', { size: 9, anchor: 'end' })
    + tx(X(0), 113, '0', { size: 9 }) + tx(X(8), 113, '8', { size: 9 })
    + dot(X(0), Y(20), K.p, 3) + dr(`M${X(0)} ${n1(Y(20))}L${X(8)} ${n1(Y(180))}`, 0.1, { color: K.p, w: 2.4 }) + pop(1.1, dot(X(8), Y(180), K.p, 3))
    + tx(116, 30, 'T = 20 + 20t', { math: true, size: 11, anchor: 'start', fill: K.p })
    + pop(1.3, guide(`M${X(0)} ${n1(Y(100))}H228`, K.a)) + tx(95, Y(100) + 3.5, '100', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.3 })
    + pop(1.7, dot(X(4), Y(100), K.a, 4)) + arrow(X(4), Y(100) + 5, X(4), 99, 1.8, { color: K.a, w: 2 })
    + tx(X(4), 113, '4분', { size: 10.5, bold: true, fill: K.a, pop: 2.5 }),
  );
}

function clipCut() {
  const X = (t: number) => 100 + 30 * t, Y = (x: number) => 104 - 11 * x;
  const clips = `<rect x="${X(0)}" y="4" width="59" height="14" rx="2" fill="${K.p}" fill-opacity=".25" stroke="${K.p}" stroke-width="1.2"/><rect x="${X(2) + 1}" y="4" width="59" height="14" rx="2" fill="${K.am}" fill-opacity=".35" stroke="${K.am}" stroke-width="1.2"/>`
    + tx(X(1), 14.5, '앞 영상', { size: 9, fill: K.ink }) + tx(X(3), 14.5, '뒤 영상', { size: 9, fill: K.ink })
    + `<path d="M${X(2)} 2V22" stroke="${K.a}" stroke-width="1.6"/>`;
  const R = (x: number) => 14 + 9 * x;
  const ball = (x: number, op: string) => `<circle cx="${R(x)}" cy="46" r="6" fill="${K.am}"${op}/><circle cx="${R(x) - 2}" cy="44" r="1.6" fill="${W}"${op}/>`;
  const screen = `<rect x="6" y="26" width="80" height="38" rx="3" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="M14 72H77" stroke="${K.p}" stroke-width="1.2"/><path d="${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `M${R(i)} 69V72`).join('')}" stroke="${K.p}" stroke-width="1"/>`
    + tx(46, 96, '물체의 가로 위치', { size: 9 });
  return svg(
    clips + screen
    + axes(100, 104, 232, 26) + tx(X(0), 115, '0', { size: 9 }) + tx(X(2), 115, '2', { size: 10, bold: true, fill: K.ink }) + tx(X(4), 115, '4', { size: 9 }) + tx(232, 98, 't(초)', { size: 9, anchor: 'end' })
    + arrow(X(0), Y(1), X(1.85), Y(2.85), 0.1, { color: K.p, w: 2.2 }) + tx(142, 96, 't + 1', { math: true, size: 10.5, fill: K.p, anchor: 'start' })
    + arrow(X(4), Y(7), X(2.15), Y(5.15), 0.8, { color: K.a, w: 2.2 }) + tx(206, 54, 't + 3', { math: true, size: 10.5, fill: K.a })
    + pop(1.6, hole(X(2), Y(3)) + dot(X(2), Y(5))) + tx(96, Y(3) + 3.5, '3', { size: 10, bold: true, fill: K.p, anchor: 'end', pop: 1.6 }) + tx(96, Y(5) + 3.5, '5', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.6 })
    + pop(1.9, ball(3, ' fill-opacity=".35"')) + tx(R(3), 84, '3', { size: 10, bold: true, fill: K.p, pop: 1.9 })
    + pop(2.1, ball(5, '')) + tx(R(5), 84, '5', { size: 10, bold: true, fill: K.a, pop: 2.1 })
    + arrow(R(3) + 3, 34, R(5) - 3, 34, 2.2, { color: K.a, w: 1.6 }) + tx(46, 110, '뚝 옮겨짐', { size: 9.5, bold: true, fill: K.a, pop: 2.8 }),
  );
}

function lineJoin() {
  const X = (x: number) => 34 + 30 * x, Y = (y: number) => 108 - 30 * y;
  let grid = '';
  for (let i = 0; i <= 6; i++) grid += `M${22 + i * 15} 4V108`;
  for (let j = 0; j <= 6; j++) grid += `M22 ${13 + j * 15}H112`;
  const paper = `<rect x="22" y="4" width="90" height="104" fill="${W}"/><path d="${grid}" stroke="${K.l}" stroke-width=".6"/>`;
  const pen = `<path d="M${X(2)} ${Y(3)}L${X(2) + 2} ${Y(3) - 6}L${X(2) + 6} ${Y(3) - 2}Z" fill="${K.ink}"/><path d="M${X(2) + 2} ${Y(3) - 6}L${X(2) + 14} ${Y(3) - 18}L${X(2) + 18} ${Y(3) - 14}L${X(2) + 6} ${Y(3) - 2}Z" fill="${K.am}" stroke="${K.p}" stroke-width="1" stroke-linejoin="round"/>`;
  return svg(
    paper + `<path d="M${X(0)} ${Y(0)}H112M${X(0)} ${Y(0)}V8" stroke="${K.m}" stroke-width="1.1"/>` + tx(X(1), 117, '1', { size: 9 }) + tx(X(2), 117, '2', { size: 9 }) + tx(30, Y(1) + 3.5, '1', { size: 9, anchor: 'end' }) + tx(30, Y(3) + 3.5, '3', { size: 9, anchor: 'end' })
    + dr(curve((x) => x * x, 0, 1, X, Y, 24), 0.1, { color: K.p, w: 2.6 })
    + tx(124, 26, 'y = x²', { math: true, size: 11.5, fill: K.p, anchor: 'start' }) + tx(124, 39, '0 ≤ x ≤ 1', { size: 9.5, anchor: 'start' })
    + pen + dr(`M${X(2)} ${Y(3)}L${X(1)} ${Y(1)}`, 0.9, { color: K.a, w: 2.6 })
    + tx(124, 60, 'y = 2x − 1', { math: true, size: 11.5, fill: K.a, anchor: 'start' }) + tx(124, 73, '1 &lt; x ≤ 2', { size: 9.5, anchor: 'start' })
    + pop(1.8, guide(`M${X(1)} ${Y(1)}V${Y(0)}M${X(1)} ${Y(1)}H${X(0)}`, K.ink) + `<circle cx="${X(1)}" cy="${Y(1)}" r="4" fill="${K.ink}"/>`)
    + tx(124, 96, '양쪽 높이 → 1', { size: 10, bold: true, fill: K.ink, anchor: 'start', pop: 2.0 })
    + tx(124, 111, 'y(1) = 1 cm', { math: true, size: 11, anchor: 'start', pop: 2.3 }),
  );
}

function pondRange() {
  const X = (t: number) => 120 + 26 * t, Y = (h: number) => 104 - 11 * h;
  const h = (t: number) => 3 + (t - 2) ** 2;
  const xl = (y: number) => n1(6 + ((y - 24) * 12) / 80), xr = (y: number) => n1(104 - ((y - 24) * 12) / 80);
  const water = `<path d="M${xl(Y(3))} ${Y(3)}L18 104H92L${xr(Y(3))} ${Y(3)}Z" fill="${K.p}" fill-opacity=".3"/>`;
  const band = pop(1.9, `<path d="M${xl(Y(7))} ${Y(7)}L${xl(Y(3))} ${Y(3)}H${xr(Y(3))}L${xr(Y(7))} ${Y(7)}Z" fill="${K.am}" fill-opacity=".3"/><path d="M${xl(Y(7))} ${Y(7)}H${xr(Y(7))}M${xl(Y(3))} ${Y(3)}H${xr(Y(3))}" stroke="${K.a}" stroke-width="1.4"/>`);
  const fish = `<path d="M44 92q10-8 20 0q-10 8-20 0ZM44 92l-7-5v10Z" fill="${K.am}"/><circle cx="59" cy="91" r="1.2" fill="${K.ink}"/>`;
  const basin = `<path d="M2 24H6L18 104H92L104 24H110" fill="none" stroke="${K.m}" stroke-width="1.8" stroke-linejoin="round"/><path d="M2 22q2-5 4 0M106 22q2-5 4 0" fill="none" stroke="${K.p}" stroke-width="1.2"/>`;
  return svg(
    water + band + fish + basin
    + tx(55, Y(7) - 4, '최고 7 cm', { size: 9.5, bold: true, fill: K.a, pop: 2.1 }) + tx(55, Y(3) + 12, '최저 3 cm', { size: 9.5, bold: true, fill: K.p, pop: 2.1 })
    + axes(120, 104, 232, 16) + tx(124, 14, 'h(cm)', { size: 9, anchor: 'start' })
    + tx(X(0), 115, '0', { size: 9 }) + tx(X(2), 115, '2', { size: 9 }) + tx(X(4), 115, '4', { size: 9 }) + tx(232, 98, 't(시간)', { size: 9, anchor: 'end' })
    + dr(curve(h, 0, 4, X, Y), 0.1, { color: K.p, w: 2.4 })
    + pop(1.2, dot(X(0), Y(7)) + dot(X(4), Y(7)) + guide(`M${X(0)} ${Y(7)}H${X(4)}`, K.a)) + tx(116, Y(7) + 3.5, '7', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.2 })
    + pop(1.5, dot(X(2), Y(3), K.p) + guide(`M${X(2) - 4} ${Y(3)}H${X(0)}`, K.p)) + tx(116, Y(3) + 3.5, '3', { size: 10, bold: true, fill: K.p, anchor: 'end', pop: 1.5 })
    + tx(X(2), 92, '3 ≤ h(t) ≤ 7', { math: true, size: 11, pop: 2.4 }),
  );
}

function carMissing() {
  const X = (s: number) => 30 + 48 * (s - 2);
  const car = (cx: number) =>
    `<rect x="${cx - 9}" y="48" width="5" height="3" fill="${K.ink}"/><rect x="${cx + 4}" y="48" width="5" height="3" fill="${K.ink}"/><rect x="${cx - 9}" y="65" width="5" height="3" fill="${K.ink}"/><rect x="${cx + 4}" y="65" width="5" height="3" fill="${K.ink}"/>`
    + `<rect x="${cx - 13}" y="50" width="26" height="16" rx="4" fill="${K.p}"/><rect x="${cx + 3}" y="52" width="5" height="12" rx="1.5" fill="${W}" fill-opacity=".75"/><rect x="${cx - 10}" y="53" width="3" height="10" rx="1" fill="${W}" fill-opacity=".5"/>`;
  const road = `<rect x="4" y="42" width="232" height="32" fill="${K.l}"/><path d="M4 42H236M4 74H236" stroke="${K.m}" stroke-width="1.2"/>`;
  const ghost = `<rect x="${X(4) - 13}" y="50" width="26" height="16" rx="4" fill="none" stroke="${K.a}" stroke-width="1.4" stroke-dasharray="3 2"/>${tx(X(4), 62, '?', { size: 11, bold: true, fill: K.a })}`;
  const times = [0, 1, 2, 3, 4].map((t) => tx(X(t + 2), 37, `${t}초`, { size: 9.5, bold: t === 2, fill: t === 2 ? K.a : K.ink })).join('');
  const pos = [2, 3, 5, 6].map((s) => tx(X(s), 86, `${s} m`, { size: 9.5 })).join('');
  return svg(
    tx(120, 16, 's(t) = (t² − 4) ÷ (t − 2)', { math: true, size: 11, fill: K.p }) + tx(X(4), 26, '2초는 분모 0 · 값 없음', { size: 9, fill: K.a })
    + road + times + [2, 3, 5, 6].map((s) => car(X(s))).join('') + ghost + pos
    + arrow(X(3), 97, X(4) - 7, 97, 0.2, { color: K.p, w: 2 }) + arrow(X(5), 97, X(4) + 7, 97, 0.7, { color: K.p, w: 2 })
    + pop(1.5, dot(X(4), 97)) + tx(X(4), 86, '4 m', { size: 10, bold: true, fill: K.a, pop: 1.5 })
    + tx(120, 116, 't ≠ 2이면 s(t) = t + 2 → 4', { math: true, size: 11, pop: 1.9 }),
  );
}

function practiceDisplay() {
  const X = (t: number) => 112 + 36 * t, Y = (p: number) => 104 - 8.5 * (p - 60);
  const p = (t: number) => 60 + t * t;
  const watch = `<rect x="26" y="8" width="26" height="104" rx="6" fill="${K.p}" fill-opacity=".55"/><rect x="12" y="44" width="54" height="52" rx="11" fill="${K.ink}" stroke="${K.p}" stroke-width="2"/><rect x="66" y="62" width="3" height="10" rx="1" fill="${K.p}"/>`
    + tx(39, 57, '연습 표시', { size: 9, fill: K.l }) + tx(39, Y(64) + 6, '64', { size: 18, bold: true, fill: K.am });
  return svg(
    watch
    + axes(112, 104, 232, 20) + `<path d="M108 98l8-3M108 94l8-3" stroke="${K.m}" stroke-width="1"/>` + tx(108, 115, '60', { size: 9, anchor: 'end' })
    + tx(X(2), 115, '2', { size: 10, bold: true, fill: K.a }) + tx(X(3), 115, '3', { size: 9 })
    + tx(116, 16, 'p(t) = 60 + t²', { math: true, size: 11, fill: K.p, anchor: 'start' })
    + curveArrow(p, 0, 1.86, X, Y, 0.1, K.p, 2.2) + curveArrow(p, 3, 2.12, X, Y, 0.9, K.p, 2.2)
    + pop(1.8, dot(X(2), Y(64), K.a, 4)) + pop(2.0, guide(`M${X(2) - 5} ${Y(64)}H70`, K.a))
    + tx(116, 34, '극한 = p(2) = 64', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.3 }),
  );
}

function fileCost() {
  const B = (v: number) => 66 + 42 * v;
  const doc = (x: number, y: number) => `<path d="M${x} ${y - 8}H${x + 8}L${x + 12} ${y - 4}V${y + 8}H${x}Z" fill="${W}" stroke="${K.p}" stroke-width="1.3" stroke-linejoin="round"/><path d="M${x + 3} ${y}H${x + 9}M${x + 3} ${y + 4}H${x + 9}" stroke="${K.m}" stroke-width="1"/>`;
  const rows = [[1, '3'], [2, '2.5'], [4, '2.25'], [8, '2.125']] as const;
  const body = rows.map(([x, s], i) => {
    const y = 24 + 18 * i, v = 2 + 1 / x;
    return doc(8, y) + tx(26, y + 3.5, `${x}MB`, { size: 9.5, anchor: 'start', fill: K.ink })
      + dr(`M66 ${y}H${B(2)}`, 0.1 + 0.4 * i, { color: K.p, w: 8 }) + dr(`M${B(2)} ${y}H${n1(B(v))}`, 0.6 + 0.4 * i, { color: K.a, w: 8 })
      + tx(+n1(B(v) + 8), y + 3.5, s, { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 1.2 + 0.4 * i });
  }).join('');
  return svg(
    tx(108, 11, '1MB당 처리 시간(초)', { size: 9.5, fill: K.ink })
    + `<path d="M${B(2)} 15V96" stroke="${K.ink}" stroke-width="1.2" stroke-dasharray="3 3"/>` + `<path d="M66 15V96" stroke="${K.m}" stroke-width="1.2"/>`
    + body
    + arrow(200, 96, B(2) + 6, 96, 2.4, { color: K.a, w: 1.8 }) + tx(206, 100, 'x → ∞', { math: true, size: 10.5, anchor: 'start', pop: 2.4 })
    + tx(B(2) - 6, 100, '2', { size: 10.5, bold: true, fill: K.ink, anchor: 'end', pop: 3.0 })
    + tx(120, 116, '(2x + 1) ÷ x = 2 + 1/x', { math: true, size: 11, pop: 3.0 }),
  );
}

function roofPeak() {
  const X = (x: number) => 60 + 60 * x, Y = (h: number) => 106 - 34 * h;
  const h = (x: number) => 2 - (x - 1) ** 2;
  const roofLine = curve(h, 0, 2, X, Y, 32);
  const house = `<path d="${roofLine}Z" fill="${K.am}" fill-opacity=".35"/><rect x="${X(0)}" y="${Y(1)}" width="120" height="${106 - Y(1)}" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/>`
    + `<rect x="72" y="80" width="18" height="14" fill="${W}" stroke="${K.p}" stroke-width="1.2"/><rect x="156" y="80" width="18" height="14" fill="${W}" stroke="${K.p}" stroke-width="1.2"/><rect x="132" y="86" width="14" height="20" fill="${K.p}"/>`
    + `<path d="M24 106H216" stroke="${K.m}" stroke-width="1.6"/>`;
  return svg(
    house + tx(6, 18, 'h(x) = 2 − (x − 1)²', { math: true, size: 11, fill: K.p, anchor: 'start' })
    + tx(X(0), 117, '0', { size: 9 }) + tx(X(1), 117, '1', { size: 9 }) + tx(X(2), 117, '2', { size: 9 }) + tx(222, 117, 'x(m)', { size: 9, anchor: 'end' })
    + dr(roofLine, 0.1, { color: K.a, w: 2.6 })
    + pop(1.1, dot(X(1), Y(2))) + arrow(X(1), 104, X(1), Y(2) + 4, 1.2, { color: K.a, w: 1.6 })
    + tx(X(1) - 4, 62, '최대 2 m', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.9 })
    + pop(1.6, dot(X(0), Y(1), K.p) + dot(X(2), Y(1), K.p)) + arrow(196, 104, 196, Y(1) + 2, 1.7, { color: K.p, w: 1.6 })
    + tx(202, 80, '최소', { size: 9.5, bold: true, fill: K.p, anchor: 'start', pop: 2.3 }) + tx(202, 93, '1 m', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 2.3 })
    + tx(212, 34, '1 ≤ h ≤ 2', { math: true, size: 11, pop: 2.6 }),
  );
}

const drawings: Record<string, string> = {
  'score-hole': scoreHole(),
  'stage-fader': stageFader(),
  'runner-near': runnerNear(),
  'discount-boundary': discountBoundary(),
  'oven-middle': ovenMiddle(),
  'clip-cut': clipCut(),
  'line-join': lineJoin(),
  'pond-range': pondRange(),
  'car-missing': carMissing(),
  'practice-display': practiceDisplay(),
  'file-cost': fileCost(),
  'roof-peak': roofPeak(),
};
export default drawings;
