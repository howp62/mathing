/**
 * 미적분I '적분' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts c1-integrals`로 content/sets/c1-integrals.json의 svg 칸에 써 넣는다.
 * 그래프는 카드의 실제 함수식으로 그리고, 넓이는 왼쪽부터 조각이 차례로 차오른다(누적).
 * 장면 쪽 막대·물·칸은 같은 시각에 같은 양만큼 늘어난다. 부호가 다른 넓이는 색을 나눈다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 도우미 ---- */

type F = (x: number) => number;
const zero: F = () => 0;

/** a~b를 n조각으로 나눠, 위 함수 top과 아래 함수 bot 사이를 t0초부터 dt초 간격으로 하나씩 칠한다 */
function strips(top: F, a: number, b: number, n: number, X: F, Y: F, t0: number, dt: number, color: string, op = 1, bot: F = zero) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x0 = a + ((b - a) * i) / n, x1 = a + ((b - a) * (i + 1)) / n;
    const upper = curve(top, x0, x1, X, Y, 8);
    const lower = curve(bot, x1, x0, X, Y, 8).slice(1);
    s += `<path class="pop" style="--d:${(t0 + i * dt).toFixed(2)}s" d="${upper}L${lower}Z" fill="${color}"${op < 1 ? ` fill-opacity="${op}"` : ''}/>`;
  }
  return s;
}

/** 지속시간을 정한 선 그리기(누적량 막대를 넓이 조각과 같은 속도로) */
const seg = (d: string, at: number, dur: number, color: string, w: number) =>
  `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s;animation-duration:${dur}s;animation-timing-function:linear" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt"/>`;

/** 누적량 F(t)를 조각 경계마다 이어 그리는 막대(가로). x는 값 → 화면 좌표 */
function accBar(Fn: F, a: number, b: number, n: number, x: F, y: number, t0: number, dt: number, color: string, w: number) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const v0 = Fn(a + ((b - a) * i) / n), v1 = Fn(a + ((b - a) * (i + 1)) / n);
    s += seg(`M${n1(x(v0))} ${y}H${n1(x(v1))}`, t0 + i * dt, dt, color, w);
  }
  return s;
}

/* ---- 카드별 그림 ---- */

/** 게임 길: 속도 그래프 아래 넓이가 차오르는 동안 게임 화면의 위치 막대가 0 m → 12 m */
function gamePosition() {
  const X = (t: number) => 22 + 26 * t, Y = (v: number) => 100 - 11 * v;
  const P = (s: number) => 152 + (70 / 12) * s;
  const hero = `<g fill="${K.am}"><rect x="146" y="38" width="8" height="7"/><rect x="144" y="45" width="12" height="8"/><rect x="145" y="53" width="3" height="5"/><rect x="152" y="53" width="3" height="5"/></g><rect x="148" y="40" width="1.8" height="1.8" fill="${K.ink}"/><rect x="151" y="40" width="1.8" height="1.8" fill="${K.ink}"/>`;
  const flag = `<path d="M${P(12)} 62V40" stroke="${W}" stroke-width="1.4"/><path d="M${P(12)} 40h9l-2.5 3 2.5 3h-9z" fill="${K.a}"/>`;
  const ticks = [0, 2, 6, 12].map((s) => `M${n1(P(s))} 60v6`).join('');
  return svg(
    axes(22, 100, 112, 14) + tx(26, 14, 'v (m/s)', { size: 9, anchor: 'start' }) + tx(114, 104, 't(초)', { size: 9, anchor: 'start' })
    + tx(18, Y(1) + 3.5, '1', { size: 9, anchor: 'end' }) + tx(18, Y(7) + 3.5, '7', { size: 9, anchor: 'end' })
    + [1, 2, 3].map((t) => tx(X(t), 112, String(t), { size: 9 })).join('')
    + strips((t) => 2 * t + 1, 0, 3, 6, X, Y, 0.6, 0.15, K.am, 0.45)
    + dr(`M${X(0)} ${Y(1)}L${X(3)} ${Y(7)}`, 0.1, { color: K.p, w: 2.2 })
    + tx(26, 36, 'v = 2t + 1', { math: true, size: 10.5, anchor: 'start' })
    + tx(70, 86, '넓이 12', { size: 10, bold: true, fill: K.p, pop: 1.5 })
    + `<rect x="138" y="8" width="98" height="104" rx="7" fill="${K.p}"/>`
    + tx(187, 24, 's(0) = 0 → C = 0', { math: true, size: 10, fill: W })
    + hero + flag + `<path d="M${P(0)} 63H${P(12)}" stroke="${W}" stroke-opacity=".35" stroke-width="4"/><path d="${ticks}" stroke="${W}" stroke-width="1.2"/>`
    + accBar((t) => t * t + t, 0, 3, 6, P, 63, 0.6, 0.15, K.am, 4)
    + [0, 2, 6].map((s) => tx(P(s), 78, String(s), { size: 9, fill: W })).join('') + tx(P(12), 78, '12 m', { size: 9.5, bold: true, fill: K.am, pop: 1.5 })
    + tx(187, 100, 's(3) = 9 + 3 = 12', { math: true, size: 10.5, fill: W, pop: 1.7 }),
  );
}

/** 공연 편집 화면: 효과 설정값 선 p(t) = t 아래가 차오르고, 넓이 2(설정 단위·초) */
function musicCue() {
  const X = (t: number) => 46 + 58 * t, Y = (p: number) => 100 - 26 * p;
  const wave = Array.from({ length: 31 }, (_, i) => {
    const h = 3 + 5 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37));
    return `M${46 + i * 6} ${n1(34 - h)}V${n1(34 + h)}`;
  }).join('');
  return svg(
    `<rect x="6" y="5" width="228" height="111" rx="6" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><path d="M6 19V11a6 6 0 0 1 6-6h216a6 6 0 0 1 6 6V19Z" fill="${K.p}"/>`
    + tx(120, 15.5, '공연 편집 · 효과 설정값', { size: 9, bold: true, fill: W })
    + `<rect x="42" y="23" width="188" height="22" rx="3" fill="${K.f}"/><path d="${wave}" stroke="${K.m}" stroke-width="2" stroke-linecap="round"/>`
    + tx(24, 37, '음원', { size: 9 }) + tx(24, 76, '효과', { size: 9 })
    + `<rect x="42" y="48" width="188" height="56" rx="3" fill="${K.f}"/><path d="M${X(0)} 100H${X(2) + 6}" stroke="${K.m}" stroke-width="1.2"/>`
    + strips((t) => t, 0, 2, 4, X, Y, 0.7, 0.2, K.am, 0.5)
    + dr(`M${X(0)} ${Y(0)}L${X(2)} ${Y(2)}`, 0.1, { color: K.p, w: 2.2 })
    + `<rect x="${X(0) - 3}" y="${Y(0) - 3}" width="6" height="6" transform="rotate(45 ${X(0)} ${Y(0)})" fill="${K.p}"/><rect x="${X(2) - 3}" y="${Y(2) - 3}" width="6" height="6" transform="rotate(45 ${X(2)} ${Y(2)})" fill="${K.p}"/>`
    + tx(76, 62, 'p(t) = t', { math: true, size: 11 })
    + tx(X(0), 112.5, '0', { size: 9 }) + tx(X(2), 112.5, '2초', { size: 9 })
    + tx(198, 72, '넓이 = 2', { size: 10.5, bold: true, fill: K.a, pop: 1.6 }) + tx(198, 85, '설정 단위·초', { size: 9, pop: 1.6 })
    + tx(198, 98, '음량이 아님', { size: 9, fill: K.ink, pop: 1.8 }),
  );
}

/** 왕복 연습: 축 아래 넓이(−1)가 칠해질 때 트랙에서 왼쪽으로, 축 위(+1)가 칠해질 때 다시 오른쪽으로 */
function runnerReturn() {
  const X = (t: number) => 20 + 42 * t, Y = (v: number) => 62 - 18 * v;
  const R = (s: number) => 212 + 62 * s;
  const cone = (x: number) => `<path d="M${x - 5} 58L${x} 44L${x + 5} 58Z" fill="${K.am}"/><path d="M${x - 7} 58H${x + 7}" stroke="${K.p}" stroke-width="1.6"/>`;
  return svg(
    `<path d="M${X(0)} 106V14M17 62H112" fill="none" stroke="${K.m}" stroke-width="1.2"/>` + tx(24, 14, 'v (m/s)', { size: 9, anchor: 'start' })
    + tx(114, 66, 't', { math: true, size: 10, anchor: 'start' }) + tx(67, 73, '1', { size: 9 }) + tx(X(2), 74, '2', { size: 9 })
    + strips((t) => 2 * t - 2, 0, 1, 3, X, Y, 0.7, 0.12, K.p, 0.35)
    + strips((t) => 2 * t - 2, 1, 2, 3, X, Y, 1.5, 0.12, K.a, 0.35)
    + dr(`M${X(0)} ${Y(-2)}L${X(2)} ${Y(2)}`, 0.1, { color: K.p, w: 2.2 })
    + tx(33, 80, '−1', { size: 10, bold: true, fill: K.p, pop: 1.0 }) + tx(93, 56, '+1', { size: 10, bold: true, fill: K.a, pop: 1.8 })
    + tx(64, 100, 'v = 2t − 2', { math: true, size: 11, anchor: 'start' })
    + `<rect x="124" y="34" width="112" height="24" fill="${K.a}" fill-opacity=".22"/><path d="M124 46H236" stroke="${W}" stroke-width="1.2"/>`
    + cone(R(-1)) + cone(R(0)) + tx(R(0), 28, '출발·도착', { size: 9 })
    + tx(R(-1), 70, '−1 m', { size: 9.5 }) + tx(R(0), 70, '0 m', { size: 9.5 })
    + arrow(R(0) - 4, 40, R(-1) + 6, 40, 0.7, { color: K.p, w: 2.2 }) + arrow(R(-1) + 6, 52, R(0) - 4, 52, 1.5, { color: K.a, w: 2.2 })
    + tx(180, 88, '변위 −1 + 1 = 0 m', { size: 10, bold: true, fill: K.ink, pop: 2.2 })
    + tx(180, 104, '이동거리 1 + 1 = 2 m', { size: 10, bold: true, fill: K.a, pop: 2.4 }),
  );
}

/** 티셔츠 앞판 위 cm 모눈: 곡선 y = x(4 − x)와 가로축 사이 조각이 차오르고 바느질 선이 둘러진다 */
function shirtPatch() {
  const X = (x: number) => 82 + 19 * x, Y = (y: number) => 100 - 12 * y;
  const f = (x: number) => x * (4 - x);
  // 모눈은 조각 바깥에만 그린다(조각 안은 천으로 덮임)
  let grid = '';
  for (let k = 1; k < 4; k++) grid += `M${X(k)} ${Y(4)}V${n1(Y(f(k)))}`;
  for (let k = 1; k < 4; k++) { const r = Math.sqrt(4 - k); grid += `M${X(0)} ${Y(k)}H${n1(X(2 - r))}M${n1(X(2 + r))} ${Y(k)}H${X(4)}`; }
  grid += `M${X(0)} ${Y(4)}H${X(4)}`;
  return svg(
    `<path d="M98 8Q120 22 142 8L176 18L206 46L186 60L170 48V114H70V48L54 60L34 46L64 18Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/>`
    + `<path d="${grid}" stroke="${K.l}" stroke-width=".8"/><path d="M${X(0) - 3} ${Y(0)}H${X(4) + 4}M${X(0)} ${Y(0) + 3}V${Y(4) - 2}" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + strips(f, 0, 4, 8, X, Y, 0.8, 0.1, K.am)
    + dr(curve(f, 0, 4, X, Y), 0.1, { color: K.p, w: 2.2 })
    + pop(1.8, `<path d="${curve((x) => Math.max(0, f(x) - 0.25), 0.07, 3.93, X, Y)}" fill="none" stroke="${W}" stroke-width="1.2" stroke-dasharray="2.5 2"/>`)
    + tx(120, 85.5, '32/3 cm²', { size: 10, bold: true, fill: K.ink, pop: 1.9 })
    + tx(X(0), 110, '0', { size: 9 }) + tx(X(4), 110, '4', { size: 9 }) + tx(X(2), 110, '2', { size: 9 })
    + tx(206, 80, 'y = x(4 − x)', { math: true, size: 10.5 }) + tx(206, 94, '높이 ≥ 0', { size: 9 })
    + tx(36, 80, '장식 조각', { size: 9.5, fill: K.ink }) + tx(36, 94, '단위 cm', { size: 9 }),
  );
}

/** 소스 기계: 유입률 r = 3t² 아래 조각이 하나 차오를 때마다 계량컵에 같은 양이 쌓인다(1초까지 1 mL, 2초까지 8 mL) */
function sauceTotal() {
  const X = (t: number) => 20 + 44 * t, Y = (r: number) => 100 - 6.5 * r;
  const L = (v: number) => 100 - 7 * v;
  const n = 8, cum = (t: number) => t ** 3;
  const layers = Array.from({ length: n }, (_, i) => {
    const y0 = L(cum((i + 1) / 4)), y1 = L(cum(i / 4));
    return `<rect class="pop" style="--d:${(0.6 + i * 0.12).toFixed(2)}s" x="155" y="${n1(y0)}" width="42" height="${n1(y1 - y0 + 0.4)}" fill="${K.a}" fill-opacity=".8"/>`;
  }).join('');
  const bottle = `<rect x="166" y="2" width="20" height="16" rx="3" fill="${K.a}"/><path d="M170 18H182L178 26H174Z" fill="${K.a}"/><rect x="169" y="6" width="14" height="6" rx="1" fill="${W}"/>`;
  return svg(
    axes(20, 100, 114, 14) + tx(24, 14, 'r (mL/s)', { size: 9, anchor: 'start' }) + tx(116, 104, 't(초)', { size: 9, anchor: 'start' })
    + [1, 2].map((t) => tx(X(t), 112, String(t), { size: 9 })).join('') + tx(16, Y(12) + 3.5, '12', { size: 9, anchor: 'end' }) + tx(16, Y(3) + 3.5, '3', { size: 9, anchor: 'end' })
    + strips((t) => 3 * t * t, 0, 2, n, X, Y, 0.6, 0.12, K.a, 0.8)
    + dr(curve((t) => 3 * t * t, 0, 2, X, Y), 0.1, { color: K.p, w: 2.2 })
    + tx(30, 40, 'r = 3t²', { math: true, size: 11, anchor: 'start' })
    + guide(`M${X(1)} 100V${Y(3)}`) + tx(88, 94, '넓이 8', { size: 10, bold: true, fill: W, pop: 1.6 })
    + bottle + `<path d="M176 26V${L(8)}" stroke="${K.a}" stroke-width="1.6" stroke-opacity=".6"/>`
    + layers + `<path d="M153 34V98q0 4 4 4H195q4 0 4-4V34" fill="none" stroke="${K.p}" stroke-width="2"/><path d="M153 46q-12 0-12 14t12 14" fill="none" stroke="${K.p}" stroke-width="2"/>`
    + `<path d="M199 ${L(1)}h-7M199 ${L(8)}h-7" stroke="${K.p}" stroke-width="1.4"/>`
    + tx(203, L(1) + 3.5, '1 mL', { size: 9.5, anchor: 'start', pop: 1.1 }) + tx(203, L(8) + 3.5, '8 mL', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 1.5 })
    + tx(176, 114, '새로 나온 양만', { size: 9, fill: K.ink }),
  );
}

/** 영상 편집기: 변화율 r = 2t + 1 아래 넓이 6이 차오르는 동안 밝기 막대가 20 → 26 */
function videoSetting() {
  const X = (t: number) => 20 + 42 * t, Y = (r: number) => 100 - 14 * r;
  const S = (v: number) => 140 + 12 * (v - 20);
  const sun = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${K.am}"/><path d="${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `M${n1(cx + 5.5 * Math.cos(a))} ${n1(cy + 5.5 * Math.sin(a))}L${n1(cx + 7.5 * Math.cos(a))} ${n1(cy + 7.5 * Math.sin(a))}`; }).join('')}" stroke="${K.am}" stroke-width="1.4" stroke-linecap="round"/>`;
  const vlogger = `<rect x="128" y="8" width="104" height="52" rx="4" fill="${K.p}"/><circle cx="180" cy="28" r="9" fill="${K.f}"/><path d="M162 60Q162 40 180 40Q198 40 198 60Z" fill="${K.f}"/><circle cx="222" cy="16" r="3" fill="${K.a}"/>`;
  return svg(
    axes(20, 100, 114, 16) + tx(24, 16, 'r (단위/초)', { size: 9, anchor: 'start' }) + tx(116, 104, 't', { math: true, size: 10, anchor: 'start' })
    + [1, 2].map((t) => tx(X(t), 112, String(t), { size: 9 })).join('') + tx(16, Y(1) + 3.5, '1', { size: 9, anchor: 'end' }) + tx(16, Y(5) + 3.5, '5', { size: 9, anchor: 'end' })
    + strips((t) => 2 * t + 1, 0, 2, 4, X, Y, 0.6, 0.2, K.am, 0.5)
    + dr(`M${X(0)} ${Y(1)}L${X(2)} ${Y(5)}`, 0.1, { color: K.p, w: 2.2 })
    + tx(30, 40, 'r = 2t + 1', { math: true, size: 11, anchor: 'start' }) + tx(62, 88, '넓이 6', { size: 10, bold: true, fill: K.p, pop: 1.5 })
    + vlogger + pop(1.5, `<rect x="128" y="8" width="104" height="52" rx="4" fill="${W}" fill-opacity=".22"/>`)
    + sun(136, 74) + tx(148, 77.5, '밝기 설정', { size: 9, anchor: 'start' })
    + `<path d="M130 88H228" stroke="${K.l}" stroke-width="4" stroke-linecap="round"/><circle cx="${S(20)}" cy="88" r="4" fill="${W}" stroke="${K.m}" stroke-width="1.4"/>`
    + accBar((t) => 20 + t * t + t, 0, 2, 4, S, 88, 0.6, 0.2, K.am, 4)
    + pop(1.4, `<circle cx="${S(26)}" cy="88" r="4.5" fill="${K.a}"/>`)
    + tx(S(20), 101, '20', { size: 9.5 }) + tx(S(26), 101, '26', { size: 10, bold: true, fill: K.a, pop: 1.5 })
    + tx(180, 116, 'B(2) = 20 + 6 = 26', { math: true, size: 10.5, pop: 1.7 }),
  );
}

/** 로고 작업판: y = 2x와 y = x² 사이가 차오르고, x = 1의 높이 차를 보인 뒤 명함에 같은 모양 로고 */
function logoGap() {
  const X = (x: number) => 26 + 50 * x, Y = (y: number) => 100 - 20 * y;
  let grid = '';
  for (let k = 1; k <= 2; k++) grid += `M${X(k)} ${Y(4)}V${Y(0)}`;
  for (let k = 1; k <= 4; k++) grid += `M${X(0)} ${Y(k)}H${X(2)}`;
  const x2 = (x: number) => x * x, l2 = (x: number) => 2 * x;
  const LX = (x: number) => 196 + 12 * x, LY = (y: number) => 96 - 4.5 * y;
  const logo = `<path d="${curve(l2, 0, 2, LX, LY, 4)}L${curve(x2, 2, 0, LX, LY, 16).slice(1)}Z" fill="${K.a}"/>`;
  return svg(
    `<rect x="8" y="6" width="168" height="108" rx="3" fill="${W}"/>` + `<path d="${grid}" stroke="${K.f}" stroke-width="1"/>`
    + axes(X(0), Y(0), X(2) + 10, Y(4) - 4)
    + strips(l2, 0, 2, 6, X, Y, 1.0, 0.12, K.a, 0.4, x2)
    + dr(`M${X(0)} ${Y(0)}L${X(2)} ${Y(4)}`, 0.1, { color: K.p, w: 2 })
    + dr(curve(x2, 0, 2, X, Y), 0.5, { color: K.am, w: 2 })
    + dr(`M${X(1)} ${Y(1)}V${Y(2)}`, 1.8, { color: K.ink, w: 2 })
    + tx(130, 24, 'y = 2x', { math: true, size: 11, anchor: 'start', fill: K.p }) + tx(130, 46, 'y = x²', { math: true, size: 11, anchor: 'start', fill: K.am })
    + tx(X(0), 111, '0', { size: 9 }) + tx(X(1), 111, '1', { size: 9 }) + tx(X(2), 111, '2', { size: 9 }) + tx(22, Y(4) + 3.5, '4', { size: 9, anchor: 'end' })
    + tx(208, 22, '높이 차', { size: 9.5, pop: 1.9 }) + tx(208, 36, '2x − x²', { math: true, size: 11, pop: 1.9 })
    + tx(208, 54, '= 4/3 cm²', { size: 10.5, bold: true, fill: K.a, pop: 2.1 })
    + pop(2.3, `<rect x="184" y="64" width="50" height="40" rx="3" fill="${W}" stroke="${K.p}" stroke-width="1.4"/>${logo}<path d="M214 80H228M214 87H226M214 94H222" stroke="${K.l}" stroke-width="2" stroke-linecap="round"/>`),
  );
}

/** 연못: 유입률 4 − t 아래를 1시간씩 칠할 때마다 연못에 3.5 L, 2.5 L, 1.5 L가 쌓인다. 원래 물은 셈에서 뺀다 */
function pondInflow() {
  const X = (t: number) => 20 + 28 * t, Y = (r: number) => 100 - 16 * r;
  const parts = [3.5, 2.5, 1.5];
  const D = 4;
  let top = 84;
  const layers = parts.map((v, i) => {
    const h = v * D; top -= h;
    return `<rect class="pop" style="--d:${(0.6 + i * 0.45).toFixed(2)}s" x="146" y="${top}" width="74" height="${h + 0.4}" fill="${K.p}" fill-opacity="${[0.35, 0.5, 0.65][i]}"/>`;
  }).join('');
  const reed = (x: number) => `<path d="M${x} 50V30" stroke="${K.m}" stroke-width="1.4"/><rect x="${x - 2}" y="28" width="4" height="9" rx="2" fill="${K.am}"/>`;
  return svg(
    axes(20, 100, 112, 20) + tx(24, 18, 'r (L/시간)', { size: 9, anchor: 'start' }) + tx(114, 104, '시간', { size: 9, anchor: 'start' })
    + [1, 2, 3].map((t) => tx(X(t), 112, String(t), { size: 9 })).join('') + tx(16, Y(4) + 3.5, '4', { size: 9, anchor: 'end' }) + tx(16, Y(1) + 3.5, '1', { size: 9, anchor: 'end' })
    + parts.map((v, i) => `<path class="pop" style="--d:${(0.6 + i * 0.45).toFixed(2)}s" d="M${X(i)} 100V${Y(4 - i)}L${X(i + 1)} ${Y(3 - i)}V100Z" fill="${K.p}" fill-opacity="${[0.35, 0.5, 0.65][i]}"/>` + tx(X(i + 0.5), 94, String(v), { size: 9.5, bold: true, fill: K.ink, pop: 0.7 + i * 0.45 })).join('')
    + dr(`M${X(0)} ${Y(4)}L${X(3)} ${Y(1)}`, 0.1, { color: K.p, w: 2.2 })
    + tx(64, 34, 'r = 4 − t', { math: true, size: 11, anchor: 'start' })
    + `<path d="M232 14H196V24" fill="none" stroke="${K.m}" stroke-width="5"/><circle cx="214" cy="14" r="5" fill="none" stroke="${K.a}" stroke-width="2"/><path d="M196 26V54" stroke="${K.p}" stroke-width="2" stroke-opacity=".5"/>`
    + reed(136) + reed(142)
    + `<rect x="146" y="84" width="74" height="20" fill="${K.l}"/>` + tx(183, 97.5, '원래 물(뺌)', { size: 9, fill: K.ink })
    + layers + `<path d="M144 46V106H222V46" fill="none" stroke="${K.p}" stroke-width="2.4" stroke-linejoin="round"/>`
    + tx(183, 73, '+7.5 L', { size: 10.5, bold: true, fill: W, pop: 2.0 }) + tx(160, 116, '새로 들어온 물만 셈', { size: 9, fill: K.ink, pop: 2.0 }),
  );
}

/** 위에서 본 도로: 두 차의 위치 그래프 t² + 2, t² + 5가 그려지고, 같은 높이의 도로에서 둘 다 4 m씩 올라간다 */
function tripStart() {
  const X = (t: number) => 22 + 40 * t, Y = (s: number) => 108 - 10 * s;
  const car = (cx: number, s: number, fill: string) => {
    const cy = Y(s);
    return `<rect x="${cx - 6}" y="${cy - 2}" width="12" height="16" rx="3" fill="${fill}" stroke="${K.p}" stroke-width="1"/><rect x="${cx - 4}" y="${cy + 1}" width="8" height="4" rx="1" fill="${W}" fill-opacity=".8"/>`;
  };
  return svg(
    axes(22, 108, 110, 8) + tx(26, 8, 's (m)', { size: 9, anchor: 'start' }) + tx(X(2), 116, '2초', { size: 9 })
    + [2, 5, 6, 9].map((s) => tx(18, Y(s) + 3.5, String(s), { size: 9, anchor: 'end', fill: s > 5 ? K.ink : K.m })).join('')
    + dr(curve((t) => t * t + 2, 0, 2, X, Y), 0.1, { color: K.p, w: 2.2 }) + dr(curve((t) => t * t + 5, 0, 2, X, Y), 0.1, { color: K.a, w: 2.2 })
    + tx(30, 22, 's₂ = t² + 5', { math: true, size: 10.5, anchor: 'start', fill: K.a }) + tx(30, 35, 's₁ = t² + 2', { math: true, size: 10.5, anchor: 'start', fill: K.p })
    + pop(1.1, `<circle cx="${X(2)}" cy="${Y(6)}" r="3.2" fill="${K.p}"/><circle cx="${X(2)}" cy="${Y(9)}" r="3.2" fill="${K.a}"/>` + guide(`M${X(2) + 4} ${Y(6)}H150M${X(2) + 4} ${Y(9)}H150`))
    + `<rect x="150" y="4" width="56" height="108" fill="${K.l}"/><path d="M150 4V112M206 4V112" stroke="${K.m}" stroke-width="1.6"/><path d="M178 6V110" stroke="${W}" stroke-width="1.6" stroke-dasharray="6 5"/>`
    + car(162, 2, K.p) + car(194, 5, K.a)
    + arrow(162, Y(2) - 4, 162, Y(6) + 1, 0.3, { color: K.p, w: 2.2 }) + arrow(194, Y(5) - 4, 194, Y(9) + 1, 0.3, { color: K.a, w: 2.2 })
    + `<path class="pop" style="--d:1.1s" d="M154 ${Y(6)}H175M182 ${Y(9)}H203" stroke="${K.ink}" stroke-width="2"/>`
    + tx(166, Y(4) + 3, '+4', { size: 9.5, bold: true, fill: K.p, anchor: 'start', pop: 1.0 }) + tx(190, Y(7) + 3, '+4', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 1.0 })
    + tx(210, Y(6) + 3.5, '6 m', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 1.3 }) + tx(210, Y(9) + 3.5, '9 m', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 1.3 })
    + tx(210, Y(2) + 3.5, '2 m', { size: 9.5, anchor: 'start' }) + tx(210, Y(5) + 3.5, '5 m', { size: 9.5, anchor: 'start' }),
  );
}

/** 연습 화면: v = 3t² 아래 넓이 1이 차오르는 동안 화면 속 자 위의 커서가 5 cm → 6 cm */
function practicePosition() {
  const X = (t: number) => 20 + 80 * t, Y = (v: number) => 100 - 24 * v;
  const R = (c: number) => 136 + 18 * (c - 3);
  const cursor = (x: number, y: number, fill: string) => `<path d="M${x} ${y}l0 13 3.5-3 2.5 5.5 2.4-1.1-2.5-5.4 4.6-.4Z" fill="${fill}" stroke="${K.ink}" stroke-width=".9" stroke-linejoin="round"/>`;
  const ticks = Array.from({ length: 11 }, (_, i) => `M${n1(R(3 + i / 2))} 62v${i % 2 ? 4 : 8}`).join('');
  return svg(
    axes(20, 100, 108, 16) + tx(24, 16, 'v (cm/s)', { size: 9, anchor: 'start' }) + tx(X(1), 112, '1초', { size: 9 }) + tx(X(0), 112, '0', { size: 9 })
    + tx(16, Y(3) + 3.5, '3', { size: 9, anchor: 'end' })
    + strips((t) => 3 * t * t, 0, 1, 5, X, Y, 0.6, 0.14, K.am, 0.6)
    + dr(curve((t) => 3 * t * t, 0, 1, X, Y), 0.1, { color: K.p, w: 2.2 })
    + tx(30, 40, 'v = 3t²', { math: true, size: 11, anchor: 'start' }) + tx(76, 94, '넓이 1', { size: 10, bold: true, fill: K.p, pop: 1.3 })
    + `<rect x="122" y="8" width="112" height="104" rx="6" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><path d="M122 22V14a6 6 0 0 1 6-6h100a6 6 0 0 1 6 6V22Z" fill="${K.p}"/>`
    + `<path d="M134 15.5c-2-2.5-5-1-3 1.5l3 3 3-3c2-2.5-1-4-3-1.5z" fill="${K.a}"/>` + tx(182, 18.5, '연습 화면', { size: 9, bold: true, fill: W })
    + tx(178, 40, '커서 처음 위치 5 cm', { size: 9, fill: K.ink })
    + `<rect x="130" y="62" width="98" height="14" fill="${K.f}" stroke="${K.m}" stroke-width="1"/><path d="${ticks}" stroke="${K.m}" stroke-width="1"/>`
    + [3, 4, 5, 6, 7, 8].map((c) => tx(R(c), 88, String(c), { size: 9, fill: c === 6 ? K.a : K.m, bold: c === 6 })).join('')
    + cursor(R(5), 46, K.l) + arrow(R(5), 56, R(6), 56, 0.6, { color: K.a, w: 2.2 }) + pop(1.4, cursor(R(6), 46, K.a))
    + tx(178, 104, '5 + 1 = 6 cm', { math: true, size: 11, pop: 1.6 }),
  );
}

/** 다운로드: 속도 6t − 2t² 아래가 반 초씩 차오를 때마다 진행 막대가 같은 양(MB)만큼 늘어 9 MB */
function downloadTotal() {
  const X = (t: number) => 20 + 28 * t, Y = (r: number) => 100 - 15 * r;
  const B = (m: number) => 128 + (98 / 9) * m;
  const r = (t: number) => 6 * t - 2 * t * t, cum = (t: number) => 3 * t * t - (2 * t ** 3) / 3;
  const cloud = `<path d="M160 40a10 10 0 0 1 2-19.5a13 13 0 0 1 24-3a9 9 0 0 1 14 7a8 8 0 0 1-1 15.5Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/>`;
  const file = `<path d="M214 92h12l6 6v16h-18Z" fill="${W}" stroke="${K.p}" stroke-width="1.4" stroke-linejoin="round"/><path d="M226 92v6h6" fill="none" stroke="${K.p}" stroke-width="1.2"/>`;
  return svg(
    axes(20, 100, 112, 18) + tx(24, 18, 'r (MB/s)', { size: 9, anchor: 'start' }) + tx(114, 104, 't', { math: true, size: 10, anchor: 'start' })
    + [1, 2, 3].map((t) => tx(X(t), 112, String(t), { size: 9 })).join('') + tx(16, Y(4.5) + 3.5, '4.5', { size: 9, anchor: 'end' })
    + strips(r, 0, 3, 6, X, Y, 0.6, 0.15, K.am, 0.6)
    + dr(curve(r, 0, 3, X, Y), 0.1, { color: K.p, w: 2.2 })
    + tx(76, 26, 'r = 6t − 2t²', { math: true, size: 10.5, anchor: 'start' }) + tx(X(1.5), 86, '넓이 9', { size: 10, bold: true, fill: K.p, pop: 1.6 })
    + cloud + arrow(180, 44, 180, 58, null, { color: K.p, w: 2 })
    + `<rect x="128" y="64" width="98" height="12" rx="6" fill="${K.f}" stroke="${K.p}" stroke-width="1.2"/>`
    + accBar(cum, 0, 3, 6, B, 70, 0.6, 0.15, K.am, 10)
    + tx(128, 88, '0', { size: 9 }) + tx(226, 88, '9 MB', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.6 })
    + file + tx(170, 104, '새로 받은 양', { size: 9.5, fill: K.ink, pop: 1.7 }),
  );
}

/** 건축 모형 단면: 사선 y = x − 1이 기준선 아래(−0.5)·위(+0.5)를 칠하고, 아래 조각을 뒤집어 넓이 1 */
function wallSigned() {
  const X = (x: number) => 34 + 50 * x, Y = (y: number) => 62 - 34 * y;
  const g = (x: number) => x - 1;
  return svg(
    `<rect x="24" y="104" width="122" height="7" rx="1.5" fill="${K.m}"/><rect x="${X(0) - 4}" y="62" width="4" height="42" fill="${K.l}"/><rect x="${X(2)}" y="28" width="4" height="76" fill="${K.l}"/>`
    + `<path d="M${X(0) - 6} ${Y(0)}H${X(2) + 8}" stroke="${K.ink}" stroke-width="2"/>`
    + tx(X(2) + 10, Y(0) + 13, '기준선 y = 0', { size: 9, anchor: 'start' })
    + strips(g, 0, 1, 3, X, Y, 0.6, 0.12, K.p, 0.4) + strips(g, 1, 2, 3, X, Y, 1.2, 0.12, K.a, 0.4)
    + dr(`M${X(0)} ${Y(-1)}L${X(2)} ${Y(1)}`, 0.1, { color: K.p, w: 2.6 })
    + tx(47, 80, '−0.5', { size: 10, bold: true, fill: K.p, pop: 0.9 }) + tx(114, 56, '+0.5', { size: 10, bold: true, fill: K.a, pop: 1.5 })
    + tx(98, 92, 'y = x − 1', { math: true, size: 11, anchor: 'start' })
    + tx(X(1), Y(0) + 13, '1', { size: 9 }) + tx(X(0) - 8, Y(0) + 13, '0', { size: 9, anchor: 'end' })
    + pop(2.2, `<path d="M${X(0)} ${Y(0)}H${X(1)}L${X(0)} ${Y(1)}Z" fill="${K.p}" fill-opacity=".15" stroke="${K.p}" stroke-width="1.2" stroke-dasharray="3 2"/>`)
    + tx(46, 52, '0.5', { size: 9.5, bold: true, fill: K.p, pop: 2.2 })
    + tx(194, 24, '정적분 (단위 m²)', { size: 9, pop: 1.8 }) + tx(194, 38, '−0.5 + 0.5 = 0', { math: true, size: 11, pop: 1.8 })
    + tx(194, 94, '두 삼각형 넓이', { size: 9, pop: 2.4 }) + tx(194, 108, '0.5 + 0.5 = 1 m²', { size: 10.5, bold: true, fill: K.a, pop: 2.4 }),
  );
}

const drawings: Record<string, string> = {
  'game-position': gamePosition(),
  'music-cue': musicCue(),
  'runner-return': runnerReturn(),
  'shirt-patch': shirtPatch(),
  'sauce-total': sauceTotal(),
  'video-setting': videoSetting(),
  'logo-gap': logoGap(),
  'pond-inflow': pondInflow(),
  'trip-start': tripStart(),
  'practice-position': practicePosition(),
  'download-total': downloadTotal(),
  'wall-signed': wallSigned(),
};
export default drawings;
