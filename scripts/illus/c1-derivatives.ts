/**
 * 미적분I '미분' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts c1-derivatives`로 content/sets/c1-derivatives.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 그래프 → 할선·접선 → 기울기 → 결과 순서로 나타난다. 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 공통 조각 ---- */

const dot = (x: number, y: number, c: string = K.a, r = 3.4) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${c}"/>`;
const seg = (x1: number, y1: number, x2: number, y2: number) => `M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}`;

/** x=a에서 기울기 m인 접선을 a−l ~ a+r 구간으로(그래프 좌표) */
const tangent = (f: (x: number) => number, m: number, a: number, l: number, r: number, X: (x: number) => number, Y: (y: number) => number) =>
  seg(X(a - l), Y(f(a) - m * l), X(a + r), Y(f(a) + m * r));

/* ---- 카드별 그림 ---- */

function avatarSpeed() {
  const X = (t: number) => 112 + 70 * t, Y = (s: number) => 106 - 14 * s;
  const s = (t: number) => t * t + 2 * t;
  const lane = `<rect x="86" y="14" width="18" height="${Y(0) - 14}" fill="${K.l}"/><path d="M95 14V${Y(0)}" stroke="${W}" stroke-width="1.2" stroke-dasharray="4 4"/>`;
  const px = (x: number, y: number, c: string) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${c}"/>`;
  const avatar = (cx: number, cy: number) =>
    px(cx - 4, cy - 16, K.am) + px(cx, cy - 16, K.am) + px(cx - 2, cy - 12, K.ink) + px(cx - 6, cy - 8, K.a) + px(cx - 2, cy - 8, K.a) + px(cx + 2, cy - 8, K.a) + px(cx - 2, cy - 4, K.a) + px(cx - 6, cy, K.p) + px(cx + 2, cy, K.p);
  return svg(
    lane + avatar(95, Y(3) + 1) + tx(82, Y(0) + 3.5, '0 m', { size: 9, anchor: 'end' }) + tx(82, Y(3) + 3.5, '3 m', { size: 9.5, bold: true, fill: K.ink, anchor: 'end' }) 
    + tx(36, 52, '캐릭터 위치', { size: 9.5, fill: K.ink }) + tx(36, 66, 's = t² + 2t', { math: true, size: 11, fill: K.p })
    + axes(112, 106, 232, 14) + tx(X(1), 117, '1', { size: 10, bold: true, fill: K.ink }) + tx(232, 100, 't(초)', { size: 9, anchor: 'end' })
    + dr(curve(s, 0, 1.6, X, Y), 0.1, { color: K.m, w: 2 })
    + pop(1.0, guide(`M104 ${Y(3)}H${X(1) - 4}`, K.ink) + dot(X(1), Y(3), K.ink))
    + dr(seg(X(0), Y(0), X(1), Y(3)), 1.2, { color: K.p, w: 2.4 }) + tx(146, 100, '평균 3 m/s', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 1.8 })
    + dr(tangent(s, 4, 1, 0.45, 0.6, X, Y), 1.9, { color: K.a, w: 2.4 }) + tx(196, 30, '순간 4 m/s', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.5 })
    + tx(232, 82, 's′(1) = 4', { math: true, size: 11, anchor: 'end', pop: 2.7 }),
  );
}

function stagePeak() {
  const X = (t: number) => 108 + 28 * t, Y = (v: number) => 106 - 15 * v;
  const f = (t: number) => -t * t + 4 * t + 1;
  const cols = [0, 1, 2, 3, 4].map((t) => Array.from({ length: f(t) }, (_, k) =>
    `<rect x="${X(t) - 6}" y="${Y(k + 1) + 1.5}" width="12" height="12" rx="1.5" fill="${k === f(t) - 1 ? K.am : K.l}" fill-opacity="${k === f(t) - 1 ? '.6' : '1'}"/>`).join('')).join('');
  const mic = `<path d="M30 26a14 14 0 0 1 28 0v6a14 14 0 0 1-28 0Z" fill="${K.m}"/><path d="M33 22h22M32 29h24M33 36h22" stroke="${K.f}" stroke-width="1.2"/><path d="M36 45L40 92H48L52 45Z" fill="${K.ink}"/><rect x="38" y="64" width="12" height="4" fill="${K.a}"/>`
    + `<path d="M66 18q6 10 0 20M72 13q9 15 0 30" fill="none" stroke="${K.am}" stroke-width="1.8" stroke-linecap="round"/>`;
  return svg(
    mic + cols + axes(100, 106, 232, 16) + tx(X(2), 117, '2', { size: 10, bold: true, fill: K.ink })
    + tx(48, 112, 'f(t) = −t² + 4t + 1', { math: true, size: 10, fill: K.p })
    + dr(curve(f, 0, 4, X, Y), 0.1, { color: K.p, w: 2.4 })
    + dr(tangent(f, 2, 1, 0.45, 0.45, X, Y), 1.1, { color: K.p, w: 2.2 }) + tx(126, 117, 'f′ > 0', { math: true, size: 10.5, fill: K.p, pop: 1.5 })
    + dr(tangent(f, -2, 3, 0.45, 0.45, X, Y), 1.6, { color: K.a, w: 2.2 }) + tx(206, 117, 'f′ &lt; 0', { math: true, size: 10.5, fill: K.a, pop: 2.0 })
    + dr(tangent(f, 0, 2, 0.6, 0.6, X, Y), 2.1, { color: K.ink, w: 2 }) + pop(2.4, dot(X(2), Y(5)))
    + tx(X(2) + 20, Y(5) - 4, '최댓값 5', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.6 }),
  );
}

function runnerAccel() {
  const panels: [string, (t: number) => number, number, string, string][] = [
    ['s = t³', (t) => t ** 3, 8, '1 m', K.p],
    ['v = 3t²', (t) => 3 * t * t, 12, '3 m/s', K.am],
    ['a = 6t', (t) => 6 * t, 12, '6 m/s²', K.a],
  ];
  const ox = [12, 92, 172];
  const body = panels.map(([name, f, top, val, c], i) => {
    const o = ox[i], X = (t: number) => o + 28 * t, Y = (y: number) => 82 - (50 * y) / top, at = 0.1 + 0.8 * i;
    return axes(o, 82, o + 60, 28) + tx(o + 30, 18, name, { math: true, size: 11, fill: c })
      + dr(curve(f, 0, 2, X, Y, 24), at, { color: c, w: 2.2 })
      + pop(at + 0.6, guide(`M${X(1)} 82V${n1(Y(f(1)))}`) + dot(X(1), Y(f(1)), c))
      + tx(o + 30, 96, val, { size: 10.5, bold: true, fill: c, pop: at + 0.7 });
  }).join('');
  const steps = [0, 1].map((i) => arrow(ox[i] + 62, 54, ox[i + 1] - 6, 54, 0.6 + 0.8 * i, { color: K.m, w: 1.6 }) + tx(ox[i] + 70, 47, '미분', { size: 9, fill: K.ink })).join('');
  const shoe = `<path d="M6 116V108Q6 104 10 104L16 106L26 110Q30 112 30 116Z" fill="${K.p}"/><path d="M6 116H30" stroke="${K.ink}" stroke-width="2"/><path d="M9 116v2M15 116v2M21 116v2" stroke="${K.ink}" stroke-width="1.2"/>`;
  return svg(body + steps + shoe + tx(36, 113, 't = 1초에서 값과 단위가 달라요', { size: 9.5, anchor: 'start', fill: K.ink, pop: 2.5 }));
}

function shirtPrint() {
  const X = (x: number) => 124 + 17 * x, Y = (A: number) => 106 - 9 * A;
  const A = (x: number) => x * (6 - x);
  const shirt = `<path d="M44 10Q55 22 66 10L86 16L104 34L92 48L86 44V112H24V44L18 48L6 34L24 16Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/>`;
  const rect = (k: number, at: number, hot: boolean) => {
    const w = 8 * k, h = 8 * (6 - k);
    return `<rect class="pop" style="--d:${at.toFixed(2)}s" x="${55 - w / 2}" y="${70 - h / 2}" width="${w}" height="${h}" fill="${hot ? K.a : 'none'}" fill-opacity="${hot ? '.3' : '1'}" stroke="${hot ? K.a : K.m}" stroke-width="${hot ? 2 : 1.2}"/>`;
  };
  return svg(
    shirt + tx(55, 40, 'x × (6 − x)', { math: true, size: 10, fill: K.ink })
    + axes(124, 106, 232, 14) + tx(128, 14, 'A', { math: true, size: 10, fill: K.m, anchor: 'start' }) + tx(X(3), 117, '3', { size: 10, bold: true, fill: K.ink }) + tx(X(6), 117, '6', { size: 9 }) + tx(118, 117, '0', { size: 9 })
    + rect(1, 0.1, false) + pop(0.2, dot(X(1), Y(5), K.p, 3))
    + rect(2, 0.6, false) + pop(0.7, dot(X(2), Y(8), K.p, 3))
    + rect(3, 1.1, true) + pop(1.2, dot(X(3), Y(9), K.a, 3.6)) + tx(55, 102, '3 × 3 = 9', { size: 9.5, bold: true, fill: K.a, pop: 1.2 })
    + dr(curve(A, 0, 6, X, Y), 1.5, { color: K.p, w: 2 })
    + dr(seg(X(2), Y(9), X(4), Y(9)), 2.3, { color: K.ink, w: 1.8 }) + tx(120, Y(9) + 3.5, '9', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.5 })
    + tx(X(3), 70, 'A′ = 6 − 2x', { math: true, size: 10.5, fill: K.p, pop: 2.6 }) + tx(X(3), 96, 'x = 3에서 0', { size: 9.5, fill: K.ink, pop: 2.8 }),
  );
}

function sauceFlow() {
  const X = (t: number) => 112 + 27 * t, Y = (v: number) => 106 - 3 * v;
  const V = (t: number) => t * t + 3 * t;
  const cup = `<path d="M44 ${Y(10)}H84L82 106H46Z" fill="${K.a}" fill-opacity=".55"/><path d="M42 40L46 106H82L86 40" fill="none" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/><path d="M44 48q-12 0-12 14t12 14" fill="none" stroke="${K.p}" stroke-width="1.8"/>`
    + `<path d="M78 ${Y(10)}H85M78 ${Y(20)}H86" stroke="${K.p}" stroke-width="1.2"/>` + tx(76, Y(20) + 3.5, '20', { size: 9, anchor: 'end' });
  const bottle = `<g transform="rotate(115 24 22)"><rect x="12" y="10" width="24" height="34" rx="5" fill="${K.a}"/><rect x="19" y="2" width="10" height="9" rx="2" fill="${K.am}"/><rect x="14" y="20" width="20" height="12" fill="${K.f}"/></g>`;
  return svg(
    bottle + `<path d="M48 26Q56 34 58 72" fill="none" stroke="${K.a}" stroke-width="2.4" stroke-linecap="round"/>` + cup
    + tx(64, 98, '10 mL', { size: 9.5, bold: true, fill: K.ink })
    + axes(112, 106, 232, 16) + tx(X(2), 117, '2', { size: 10, bold: true, fill: K.ink }) + tx(X(4), 117, '4', { size: 9 }) + tx(232, 100, 't(초)', { size: 9, anchor: 'end' })
    + dr(curve(V, 0, 4, X, Y), 0.1, { color: K.p, w: 2.2 })
    + pop(1.1, guide(`M88 ${Y(10)}H${X(2) - 4}`, K.ink) + dot(X(2), Y(10), K.ink))
    + dr(tangent(V, 7, 2, 1, 1, X, Y), 1.4, { color: K.a, w: 2.2 })
    + dr(`M${X(2)} ${Y(10)}H${X(3)}V${Y(17)}`, 2.1, { color: K.am, w: 2 })
    + tx((X(2) + X(3)) / 2, Y(10) + 12, '1초', { size: 9.5, bold: true, fill: K.am, pop: 2.6 }) + tx(X(3) + 4, Y(13.5) + 3.5, '7 mL', { size: 9.5, bold: true, fill: K.am, anchor: 'start', pop: 2.8 })
    + tx(164, 14, 'V′(2) = 7 mL/s', { math: true, size: 11, pop: 3.0 }),
  );
}

function videoTurn() {
  const P = (x: number) => 70 + 30 * x, T = (t: number) => 70 + 40 * t;
  const screen = `<rect x="6" y="4" width="228" height="62" rx="6" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="M${P(0)} 46H${P(4)}" stroke="${K.p}" stroke-width="1.2"/><path d="${[0, 1, 2, 3, 4].map((i) => `M${P(i)} 43V49`).join('')}" stroke="${K.p}" stroke-width="1.2"/>`
    + [0, 1, 2, 3, 4].map((i) => tx(P(i), 59, String(i), { size: 9 })).join('') + tx(214, 59, 'cm', { size: 9 })
    + `<circle cx="${P(4)}" cy="46" r="5" fill="${K.am}"/>`;
  return svg(
    screen
    + arrow(P(4), 20, P(0) + 2, 20, 0.2, { color: K.p, w: 2 }) + tx(38, 24, '0~2초', { size: 9.5, bold: true, fill: K.p, pop: 0.2 })
    + pop(1.2, `<circle cx="${P(0)}" cy="46" r="5" fill="${K.p}"/>`) + tx(38, 50, '2초 0 cm', { size: 9.5, bold: true, fill: K.ink, pop: 1.2 })
    + arrow(P(0), 33, P(4) - 2, 33, 1.4, { color: K.a, w: 2 }) + tx(210, 37, '2~3초', { size: 9.5, bold: true, fill: K.a, pop: 1.4 })
    + `<path d="M${T(0)} 90H${T(3)}" stroke="${K.m}" stroke-width="1.2"/>` + [0, 2, 3].map((t) => tx(T(t), 104, String(t), { size: 9.5, bold: t === 2, fill: t === 2 ? K.ink : K.m })).join('') + tx(T(3) + 8, 93, 't', { math: true, size: 10.5, fill: K.m, anchor: 'start' })
    + dr(`M${T(0)} 90H${T(2)}`, 0.2, { color: K.p, w: 5 }) + tx(T(1), 82, 'x′ &lt; 0', { math: true, size: 10.5, fill: K.p, pop: 0.8 })
    + dr(`M${T(2)} 90H${T(3)}`, 1.4, { color: K.a, w: 5 }) + tx(T(2.5), 82, 'x′ > 0', { math: true, size: 10.5, fill: K.a, pop: 2.0 })
    + tx(6, 116, 'x′ = 3t(t − 2)', { math: true, size: 10.5, fill: K.ink, anchor: 'start' }) + tx(234, 116, '2초에 방향 바꿈 · 최소 0', { size: 9.5, bold: true, fill: K.ink, anchor: 'end', pop: 2.6 }),
  );
}

function logoTangent() {
  const X = (x: number) => 136 + 38 * x, Y = (y: number) => 92 - 24 * y;
  const badge = `<rect x="98" y="4" width="138" height="112" rx="14" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="M104 ${Y(0)}H230M${X(0)} 112V10" stroke="${K.l}" stroke-width="1"/>`;
  return svg(
    badge + `<path d="${curve((x) => x * x, -0.85, 1.75, X, Y)}" fill="none" stroke="${K.p}" stroke-width="5" stroke-linecap="round"/>`
    + tx(6, 18, '로고 곡선 y = x²', { size: 9.5, fill: K.ink, anchor: 'start' })
    + pop(0.2, dot(X(1), Y(1), K.ink, 3.6)) + tx(6, 38, '높이 1', { size: 10, bold: true, fill: K.ink, anchor: 'start', pop: 0.3 })
    + tx(6, 56, "기울기 y′ = 2", { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 0.6 })
    + dr(seg(X(0.3), Y(-0.4), X(2.1), Y(3.2)), 0.8, { color: K.a, w: 2.4 })
    + dr(`M${X(1)} ${Y(1)}H${X(2)}V${Y(3)}`, 1.7, { color: K.am, w: 1.8 })
    + tx((X(1) + X(2)) / 2, Y(1) + 12, '1', { size: 10, bold: true, fill: K.am, pop: 2.3 }) + tx(X(2) + 4, Y(2) + 3.5, '2', { size: 10, bold: true, fill: K.am, anchor: 'start', pop: 2.4 })
    + tx(6, 84, 'y − 1 = 2(x − 1)', { math: true, size: 10.5, anchor: 'start', pop: 2.6 }) + tx(6, 102, 'y = 2x − 1', { math: true, size: 11.5, anchor: 'start', pop: 2.8 }),
  );
}

function pondRise() {
  const X = (t: number) => 124 + 33 * t, Y = (r: number) => 104 - 6.5 * r;
  const rate = (t: number) => -3 * t * t + 12 * t;
  const scene = `<path d="M0 18H30Q38 18 38 26V30" fill="none" stroke="${K.m}" stroke-width="6"/><path d="M38 34V60" stroke="${K.p}" stroke-width="2" stroke-dasharray="4 3"/>`
    + `<ellipse cx="58" cy="80" rx="52" ry="22" fill="${K.p}" fill-opacity=".25" stroke="${K.p}" stroke-width="1.4"/><ellipse cx="78" cy="80" rx="18" ry="7" fill="${K.am}" fill-opacity=".55"/>`
    + `<ellipse cx="78" cy="74" rx="8" ry="5.5" fill="${K.p}"/><circle cx="74" cy="68" r="2.8" fill="${K.p}"/><circle cx="82" cy="68" r="2.8" fill="${K.p}"/><circle cx="74" cy="68" r="1.2" fill="${W}"/><circle cx="82" cy="68" r="1.2" fill="${W}"/>`;
  return svg(
    scene + arrow(22, 92, 22, 70, 1.9, { color: K.a, w: 2 }) + tx(58, 116, '물의 양 V는 줄지 않음', { size: 9.5, bold: true, fill: K.a, pop: 2.5 })
    + axes(124, 104, 232, 18) + tx(X(2), 115, '2', { size: 10, bold: true, fill: K.ink }) + tx(X(3), 115, '3', { size: 9 }) + tx(232, 98, 't(시간)', { size: 9, anchor: 'end' })
    + tx(176, 14, 'V′(t) = 3t(4 − t)', { math: true, size: 11, fill: K.p })
    + dr(curve(rate, 0, 3, X, Y), 0.1, { color: K.p, w: 2.4 })
    + pop(1.2, guide(`M${X(2)} 104V${Y(12) + 4}M${X(2) - 4} ${Y(12)}H124`, K.a) + dot(X(2), Y(12))) + tx(120, Y(12) + 3.5, '12', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.2 })
    + tx(X(2) - 6, 86, '12 L/시간', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.5 })
    + tx(214, 80, 'V′ ≥ 0', { math: true, size: 11, pop: 2.1 }),
  );
}

function carMean() {
  const X = (t: number) => 120 + 50 * t, Y = (s: number) => 104 - 20 * s;
  const s = (t: number) => t * t;
  const cx = 56, cy = 70, r = 40;
  const ang = (v: number) => Math.PI - (v / 4) * Math.PI;
  const P = (v: number, rr: number) => `${n1(cx + rr * Math.cos(ang(v)))} ${n1(cy - rr * Math.sin(ang(v)))}`;
  const dial = `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/>`
    + `<path d="${[0, 1, 2, 3, 4].map((v) => `M${P(v, r - 2)}L${P(v, r - 8)}`).join('')}" stroke="${K.p}" stroke-width="1.6"/>`
    + [0, 2, 4].map((v) => tx(+n1(cx + (r + 8) * Math.cos(ang(v))), +n1(cy - (r + 8) * Math.sin(ang(v)) + 3.5), String(v), { size: 9.5, fill: K.ink })).join('')
    + tx(cx, cy + 12, 'm/s', { size: 9 });
  return svg(
    dial
    + axes(120, 104, 232, 16) + tx(X(1), 115, '1', { size: 10, bold: true, fill: K.ink }) + tx(X(2), 115, '2', { size: 9 }) + tx(116, Y(4) + 3.5, '4', { size: 9, anchor: 'end' }) + tx(232, 98, 't(초)', { size: 9, anchor: 'end' })
    + tx(124, 14, 's = t²', { math: true, size: 11, fill: K.p, anchor: 'start' })
    + dr(curve(s, 0, 2, X, Y), 0.1, { color: K.p, w: 2.2 })
    + dr(seg(X(0), Y(0), X(2), Y(4)), 1.0, { color: K.am, w: 2 }) + tx(176, 40, '평균 2 m/s', { size: 10, bold: true, fill: K.am, anchor: 'end', pop: 1.6 })
    + dr(tangent(s, 2, 1, 0.5, 0.75, X, Y), 1.8, { color: K.a, w: 2.2 }) + pop(2.4, dot(X(1), Y(1)))
    + tx(232, 88, '순간 2 m/s', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.4 })
    + pop(2.6, `<path d="M${cx} ${cy}L${P(2, r - 10)}" stroke="${K.a}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="${K.ink}"/>`)
    + tx(cx, 104, "s′(1) = 2", { math: true, size: 11, pop: 2.8 }),
  );
}

function practiceCorner() {
  const X = (t: number) => 100 + 58 * t, Y = (x: number) => 96 - 56 * x;
  const tablet = `<rect x="64" y="4" width="172" height="112" rx="9" fill="${W}" stroke="${K.p}" stroke-width="2"/><circle cx="229" cy="60" r="2.5" fill="${K.l}"/>`
    + `<path d="M84 ${Y(1)}V${Y(0)}" stroke="${K.m}" stroke-width="2"/><path d="M81 ${Y(1)}H87M81 ${Y(0)}H87" stroke="${K.m}" stroke-width="1.4"/>`
    + tx(78, Y(1) + 3.5, '1', { size: 9, anchor: 'end' }) + tx(78, Y(0) + 3.5, '0', { size: 9, anchor: 'end' })
    + `<path d="M86 ${Y(0) - 6}l0 11 3-3 2.5 5 2-1-2.5-5h4Z" fill="${K.ink}"/>`;
  return svg(
    tablet + axes(100, 96, 226, 30) + tx(X(1), 108, '1', { size: 10, bold: true, fill: K.ink }) + tx(X(2), 108, '2', { size: 9 }) + tx(222, 90, 't', { math: true, size: 10.5, anchor: 'end' })
    + tx(6, 18, '커서 위치', { size: 9.5, fill: K.ink, anchor: 'start' })
    + dr(seg(X(0), Y(1), X(1), Y(0)), 0.1, { color: K.p, w: 2.6 }) + tx(112, 34, '1 − t', { math: true, size: 10.5, fill: K.p, anchor: 'start', pop: 0.6 })
    + dr(seg(X(2), Y(1), X(1), Y(0)), 0.8, { color: K.a, w: 2.6 }) + tx(204, 34, 't − 1', { math: true, size: 10.5, fill: K.a, anchor: 'end', pop: 1.3 })
    + pop(1.7, `<circle cx="${X(1)}" cy="${Y(0)}" r="4" fill="${K.ink}"/>`) + tx(6, 38, 'x(1) = 0', { math: true, size: 11, anchor: 'start', fill: K.ink, pop: 1.7 })
    + tx(6, 60, '왼쪽 −1', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 2.0 }) + tx(6, 78, '오른쪽 1', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.2 })
    + pop(2.0, guide(seg(X(0.6), Y(0.4), X(1.35), Y(-0.35)), K.p)) + pop(2.2, guide(seg(X(1.4), Y(0.4), X(0.65), Y(-0.35)), K.a))
    + tx(6, 100, '−1 ≠ 1', { math: true, size: 11, anchor: 'start', pop: 2.6 }) + tx(6, 113, '미분 불가', { size: 9.5, bold: true, fill: K.ink, anchor: 'start', pop: 2.6 }),
  );
}

function programMinimum() {
  const X = (x: number) => 112 + 36 * x, Y = (c: number) => 106 - 4.3 * c;
  const C = (x: number) => x ** 3 - 3 * x * x + 6 * x + 2, dC = (x: number) => 3 * (x - 1) ** 2 + 3;
  const pins = [0, 1, 2, 3].map((i) => `M${30 + i * 10} 30V36M${30 + i * 10} 76V82M18 ${42 + i * 10}H24M72 ${42 + i * 10}H78`).join('');
  const chip = `<path d="${pins}" stroke="${K.m}" stroke-width="2.2"/><rect x="24" y="36" width="48" height="40" rx="4" fill="${K.ink}"/><rect x="34" y="46" width="28" height="20" rx="2" fill="none" stroke="${K.am}" stroke-width="1.4"/>`
    + tx(48, 60, 'ms', { size: 9.5, bold: true, fill: K.am }) + tx(48, 98, '입력 0~3MB', { size: 9.5, fill: K.ink });
  const ticks = [0.3, 1, 2, 2.7].map((x, i) => {
    const m = dC(x), l = 0.45;
    return dr(seg(X(x - l), Y(C(x) - m * l), X(x + l), Y(C(x) + m * l)), 1.1 + 0.2 * i, { color: K.a, w: 1.8 });
  }).join('');
  return svg(
    chip + tx(170, 11, 'C(x) = x³ − 3x² + 6x + 2', { math: true, size: 10.5, fill: K.p })
    + axes(112, 106, 232, 18) + tx(X(1), 117, '1', { size: 9 }) + tx(X(2), 117, '2', { size: 9 }) + tx(X(3), 117, '3', { size: 9 }) + tx(108, Y(20) + 3.5, '20', { size: 9, anchor: 'end' })
    + dr(curve(C, 0, 3, X, Y), 0.1, { color: K.p, w: 2.2 }) + ticks
    + tx(150, 44, 'C′ > 0', { math: true, size: 11, fill: K.a, pop: 2.0 })
    + pop(2.2, guide(`M${X(0)} ${n1(Y(2))}H228`, K.am) + dot(X(0), Y(2), K.am)) + tx(105, Y(2) + 3, '2', { size: 10, bold: true, fill: K.am, anchor: 'end', pop: 2.2 })
    + tx(224, 88, 'C(x) ≥ 2', { math: true, size: 11, anchor: 'end', pop: 2.6 }),
  );
}

function roofMinimum() {
  const X = (x: number) => 84 + 56 * x, Y = (h: number) => 106 - 17 * h;
  const h = (x: number) => x ** 3 - 3 * x + 3;
  const roof = curve(h, 0, 2, X, Y, 40);
  const wins = [38, 58, 78].map((y) => `<rect x="${X(2) - 22}" y="${y}" width="14" height="10" fill="${W}" stroke="${K.p}" stroke-width="1"/>`).join('') + `<rect x="94" y="88" width="13" height="18" fill="${K.p}"/>`;
  const building = `<path d="M${X(0)} 106V${Y(3)}L${roof.slice(1)}V106Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/>${wins}`
    + `<path d="M70 106H212" stroke="${K.m}" stroke-width="1.6"/>`
    + `<path d="M${X(1)} ${Y(1) - 18}q-3 5 0 7q3-2 0-7ZM${X(1) - 12} ${Y(1) - 30}q-3 5 0 7q3-2 0-7ZM${X(1) + 12} ${Y(1) - 26}q-3 5 0 7q3-2 0-7Z" fill="${K.p}" fill-opacity=".6"/>`;
  return svg(
    building + tx(6, 16, 'h(x) = x³ − 3x + 3', { math: true, size: 11, fill: K.p, anchor: 'start' })
    + tx(X(0), 117, '0', { size: 9 }) + tx(X(1), 117, '1', { size: 10, bold: true, fill: K.ink }) + tx(X(2), 117, '2', { size: 9 }) + tx(226, 117, 'x(m)', { size: 9, anchor: 'end' })
    + dr(roof, 0.1, { color: K.a, w: 2.6 })
    + arrow(X(0.12), Y(h(0.12)) - 9, X(0.78), Y(h(0.78)) - 9, 1.1, { color: K.p, w: 1.8 }) + tx(78, 76, 'h′ &lt; 0', { math: true, size: 11, fill: K.p, anchor: 'end', pop: 1.5 })
    + arrow(X(1.15) - 6, Y(h(1.15)) - 7, X(1.6) - 6, Y(h(1.6)) - 7, 1.5, { color: K.a, w: 1.8 }) + tx(166, 50, 'h′ > 0', { math: true, size: 11, fill: K.a, anchor: 'end', pop: 1.9 })
    + pop(2.0, dot(X(1), Y(1), K.p, 4)) + tx(X(1), Y(1) + 12, '최소 1 m', { size: 10, bold: true, fill: K.p, pop: 2.1 })
    + pop(2.3, dot(X(0), Y(3), K.ink, 3) + dot(X(2), Y(5), K.a, 3.6))
    + tx(X(0) - 5, Y(3) + 3.5, '3 m', { size: 9.5, fill: K.ink, anchor: 'end', pop: 2.3 }) + tx(X(2) - 6, Y(5) - 6, '최대 5 m', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.5 }),
  );
}

const drawings: Record<string, string> = {
  'avatar-speed': avatarSpeed(),
  'stage-peak': stagePeak(),
  'runner-accel': runnerAccel(),
  'shirt-print': shirtPrint(),
  'sauce-flow': sauceFlow(),
  'video-turn': videoTurn(),
  'logo-tangent': logoTangent(),
  'pond-rise': pondRise(),
  'car-mean': carMean(),
  'practice-corner': practiceCorner(),
  'program-minimum': programMinimum(),
  'roof-minimum': roofMinimum(),
};
export default drawings;
