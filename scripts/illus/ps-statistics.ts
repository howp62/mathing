/**
 * 확률과 통계 '통계' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts ps-statistics`로 content/sets/ps-statistics.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 분포 막대가 세워지거나 곡선·구간이 그려지는 순서로 나타난다.
 * 막대 높이는 확률에 비례하고, 정규곡선은 실제 밀도식으로 그린다. 값은 카드 본문과 같다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 공통 조각 ---- */

/** 아래에서 위로 세워지는 막대(끝이 둥글지 않아 높이가 정확하다). dur는 그려지는 시간(초) */
const vbar = (x: number, base: number, h: number, w: number, color: string, at: number, dur = 0.6) =>
  h < 0.05 ? '' : `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s;animation-duration:${dur}s" d="M${n1(x)} ${base}V${n1(base - h)}" fill="none" stroke="${color}" stroke-width="${w}"/>`;

/** 정규분포 밀도 */
const normal = (m: number, s: number) => (x: number) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));

/** 이항분포 확률 */
function binom(n: number, p: number, k: number) {
  let c = 1;
  for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1);
  return c * p ** k * (1 - p) ** (n - k);
}

/** 고정된 씨앗의 난수(그림이 매번 같게) */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** 가운데에서 양쪽으로 그려지는 구간 + 끝 눈금 */
const interval = (c: number, lo: number, hi: number, y: number, at: number, color: string = K.a) =>
  dr(`M${n1(c)} ${y}H${n1(lo)}`, at, { color, w: 3 }) + dr(`M${n1(c)} ${y}H${n1(hi)}`, at, { color, w: 3 })
  + pop(at + 0.8, `<path d="M${n1(lo)} ${y - 5}V${y + 5}M${n1(hi)} ${y - 5}V${y + 5}" stroke="${color}" stroke-width="2"/>`);

/* ---- 카드별 그림 ---- */

/** 보상 동전 탑: 확률에 비례해 동전이 쌓임(1/4=2개, 1/2=4개) → 받침점이 1점에서 균형 = E(X) */
function rewardDistribution() {
  const base = 82.5, xs = [110, 150, 190], n = [2, 4, 2];
  const coin = (cx: number, k: number) => {
    const yb = base - 10 * k;
    return `<rect x="${cx - 11}" y="${yb - 9}" width="22" height="9" rx="2" fill="${K.am}"/><ellipse cx="${cx}" cy="${yb - 9}" rx="11" ry="2.6" fill="${K.f}" stroke="${K.am}" stroke-width="1.2"/>`;
  };
  let t = 0.1, stacks = '';
  xs.forEach((x, i) => {
    for (let k = 0; k < n[i]; k++) { stacks += pop(t, coin(x, k)); t += 0.12; }
    stacks += tx(x, base - 10 * n[i] - 9, ['1/4', '1/2', '1/4'][i], { size: 10, bold: true, fill: K.p, pop: t });
    t += 0.1;
  });
  const screen = `<rect x="6" y="20" width="58" height="42" rx="5" fill="${K.ink}"/><rect x="11" y="25" width="48" height="32" rx="2" fill="${K.p}"/><circle cx="35" cy="66" r="2" fill="${K.m}"/>`;
  return svg(
    screen + tx(35, 36, '이번 판 보상', { size: 9, fill: W }) + tx(35, 52, '0점', { size: 13, bold: true, fill: K.am })
    + tx(35, 84, '평균이 1점이어도', { size: 9 }) + tx(35, 96, '한 판은 0점 가능', { size: 9 })
    + `<path d="M92 84H208" stroke="${K.p}" stroke-width="3" stroke-linecap="round"/>`
    + stacks
    + tx(110, 112, '0점', { size: 9.5, fill: K.ink }) + tx(150, 112, '1점', { size: 9.5, fill: K.ink }) + tx(190, 112, '2점', { size: 9.5, fill: K.ink })
    + tx(150, 14, '1/4 + 1/2 + 1/4 = 1', { math: true, size: 11, pop: 1.3 })
    + pop(1.6, `<path d="M150 86L158 98H142Z" fill="${K.a}"/>`)
    + tx(162, 97, '← E(X) = 1', { math: true, size: 11, anchor: 'start', pop: 1.8 }),
  );
}

/** 추가 무대 시간: 1분·3분 막대(1/4, 3/4) → 평균 2.5분 표시 → 양쪽으로 표준편차 0.87분 */
function encoreTime() {
  const X = (t: number) => 80 + 36 * t, base = 88, H = 88;
  const curtain = `<path d="M2 4H14V92Q11 86 8 92Q5 86 2 92Z" fill="${K.a}" fill-opacity=".55"/><path d="M6 6V86M10 6V86" stroke="${K.a}" stroke-width=".8" stroke-opacity=".6"/>`;
  const mic = `<path d="M42 40V96M32 99H52" stroke="${K.ink}" stroke-width="2" stroke-linecap="round"/><rect x="36" y="22" width="12" height="18" rx="6" fill="${K.ink}"/><path d="M37 28H47M37 32H47" stroke="${K.m}" stroke-width=".8"/>`;
  const ticks = [0, 1, 2, 3, 4].map((t) => `M${X(t)} ${base}v3`).join('');
  return svg(
    curtain + mic + tx(42, 14, '앙코르!', { size: 9.5, bold: true, fill: K.a }) + tx(44, 112, '추가 무대 X', { size: 9, fill: K.ink })
    + `<path d="M72 ${base}H228${ticks}" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + [0, 2, 4].map((t) => tx(X(t), 99, String(t), { size: 9 })).join('') + tx(X(1), 99, '1분', { size: 9.5, bold: true, fill: K.ink }) + tx(X(3), 99, '3분', { size: 9.5, bold: true, fill: K.ink })
    + vbar(X(1), base, H / 4, 14, K.p, 0.1) + tx(X(1), base - H / 4 - 5, '1/4', { size: 10, bold: true, fill: K.p, pop: 0.5 })
    + vbar(X(3), base, (3 * H) / 4, 14, K.p, 0.4) + tx(X(3), base - (3 * H) / 4 - 5, '3/4', { size: 10, bold: true, fill: K.p, pop: 0.9 })
    + pop(1.2, guide(`M${X(2.5)} 56V${base}`, K.a) + `<circle cx="${X(2.5)}" cy="${base}" r="3.2" fill="${K.a}"/>`)
    + tx(152, 50, 'E(X) = 2.5', { math: true, size: 11, pop: 1.3 })
    + interval(X(2.5), X(2.5 - Math.sqrt(0.75)), X(2.5 + Math.sqrt(0.75)), 108, 1.7)
    + tx(134, 112, 'σ ≈ 0.87', { math: true, size: 11, anchor: 'end', pop: 2.4 }),
  );
}

/** 슛 10번의 성공 수: 0~10회 막대가 확률만큼 차례로 세워짐(6회가 가장 높음) → 평균 6 → 표준편차 1.55 */
function shotsBinomial() {
  const X = (k: number) => 80 + 14.2 * k, base = 92, S = 260;
  const bars = Array.from({ length: 11 }, (_, k) => vbar(X(k), base, S * binom(10, 0.6, k), 10, k === 6 ? K.a : K.p, 0.2 + k * 0.1, 0.5)).join('');
  const goal = `<path d="M8 46V14H56V46" fill="none" stroke="${K.ink}" stroke-width="2.2" stroke-linejoin="round"/><path d="M14 14V46M20 14V46M26 14V46M32 14V46M38 14V46M44 14V46M50 14V46M8 22H56M8 30H56M8 38H56" stroke="${K.l}" stroke-width=".8"/><path d="M2 46H62" stroke="${K.m}" stroke-width="1.2"/>`;
  const balls = Array.from({ length: 10 }, (_, i) => `<circle cx="${n1(8.5 + i * 5.3)}" cy="56" r="2.3" fill="${W}" stroke="${K.ink}" stroke-width="1"/>`).join('');
  return svg(
    goal + balls + tx(32, 72, '10번 · 매번 0.6', { size: 9, fill: K.ink }) + tx(32, 84, '서로 독립', { size: 9 })
    + tx(34, 102, 'X ~ B(10, 0.6)', { math: true, size: 10 })
    + `<path d="M72 ${base}H228" stroke="${K.m}" stroke-width="1.2"/>` + bars
    + [0, 2, 4, 6, 8].map((k) => tx(X(k), 103, String(k), { size: 9, fill: k === 6 ? K.a : K.m, bold: k === 6 })).join('') + tx(X(10), 103, '10회', { size: 9 })
    + tx(X(6), 18, 'E(X) = 6', { math: true, size: 11, pop: 1.5 })
    + interval(X(6), X(6 - Math.sqrt(2.4)), X(6 + Math.sqrt(2.4)), 112, 1.9)
    + tx(X(6 - Math.sqrt(2.4)) - 4, 115, 'σ ≈ 1.55', { math: true, size: 10.5, anchor: 'end', pop: 2.6 }),
  );
}

/** 색 오차 X ~ N(0, 2²) 곡선 → 0에서 3까지(σ의 1.5배) → 같은 자리의 Z축 1.5로 내림 */
function colorError() {
  const X = (x: number) => 146 + 12 * x, Y = (y: number) => 74 - 260 * y, f = normal(0, 2);
  const chip = (x: number, op: string) => `<rect x="${x}" y="16" width="20" height="34" rx="2" fill="${W}" stroke="${K.m}" stroke-width="1"/><rect x="${x + 2}" y="18" width="16" height="18" fill="${K.p}"${op}/>`;
  const xt = [-6, -4, -2, 0, 2, 4, 6].map((v) => `M${X(v)} 74v3`).join(''), zt = [-3, -2, -1, 0, 1, 2, 3].map((v) => `M${X(2 * v)} 102v3`).join('');
  return svg(
    chip(8, '') + chip(34, ' fill-opacity=".6"') + tx(18, 61, '기준', { size: 9, fill: K.ink }) + tx(44, 61, '출력', { size: 9, fill: K.ink })
    + tx(31, 78, '오차 X', { size: 9, fill: K.ink }) + tx(31, 96, 'X ~ N(0, 2²)', { math: true, size: 10 })
    + `<path d="M70 74H222${xt}M70 102H222${zt}" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(66, 77, 'X', { math: true, size: 11, anchor: 'end', fill: K.ink }) + tx(66, 105, 'Z', { math: true, size: 11, anchor: 'end', fill: K.ink })
    + [-6, -4, -2, 0, 2, 4, 6].map((v) => tx(X(v), 85, v < 0 ? `−${-v}` : String(v), { size: 9 })).join('')
    + [-3, -2, -1, 0, 3].map((v) => tx(X(2 * v), 114, v < 0 ? `−${-v}` : String(v), { size: 9 })).join('')
    + dr(curve(f, -6, 6, X, Y), 0.1, { color: K.p, w: 2.2 })
    + dr(`M${X(0)} 74H${X(3)}`, 0.9, { color: K.a, w: 3 })
    + pop(1.4, guide(`M${X(3)} ${n1(Y(f(3)))}V74`, K.a) + `<circle cx="${X(3)}" cy="74" r="3.2" fill="${K.a}"/>`)
    + tx(X(3), 85, '3', { size: 9.5, bold: true, fill: K.a, pop: 1.4 })
    + arrow(X(3), 88, X(3), 99, 1.6, { color: K.a, w: 1.8 })
    + pop(2.2, `<circle cx="${X(3)}" cy="102" r="3.2" fill="${K.a}"/>`) + tx(X(3), 114, '1.5', { size: 9.5, bold: true, fill: K.a, pop: 2.2 })
    + tx(204, 18, 'Z = (X − 0)/2', { math: true, size: 11, pop: 1.0 })
    + tx(204, 36, '3 ÷ 2 = 1.5', { math: true, size: 11, pop: 2.3 }),
  );
}

/** 쿠키 모형 500개(점 500개): 번호로 무작위 30개가 여기저기서 뽑힘 → 표본 접시 30개(큰 것·작은 것 섞임) */
function cookieSampling() {
  const rnd = seeded(20261126), x0 = 12, y0 = 22, s = 4.2;
  const big = Array.from({ length: 500 }, () => rnd() < 0.5);
  const picks: number[] = [];
  while (picks.length < 30) { const i = Math.floor(rnd() * 500); if (!picks.includes(i)) picks.push(i); }
  const pt = (i: number) => `M${n1(x0 + (i % 25) * s)} ${n1(y0 + Math.floor(i / 25) * s)}h0`;
  const all = (b: boolean) => Array.from({ length: 500 }, (_, i) => i).filter((i) => big[i] === b).map(pt).join('');
  const hi = (ids: number[], b: boolean) => ids.filter((i) => big[i] === b).map(pt).join('');
  const picked = [0, 1, 2].map((g) => {
    const ids = picks.slice(g * 10, g * 10 + 10);
    return pop(0.2 + g * 0.3, `<path d="${hi(ids, true)}" stroke="${K.a}" stroke-width="4" stroke-linecap="round"/><path d="${hi(ids, false)}" stroke="${K.a}" stroke-width="2.8" stroke-linecap="round"/>`);
  }).join('');
  const plate = [0, 1, 2, 3, 4].map((r) => pop(1.3 + r * 0.12, picks.slice(r * 6, r * 6 + 6).map((i, c) =>
    `<circle cx="${154 + c * 13}" cy="${34 + r * 12}" r="${big[i] ? 4.6 : 3}" fill="${K.am}" stroke="${K.a}" stroke-width="1"/>`).join(''))).join('');
  return svg(
    `<rect x="6" y="16" width="113" height="92" rx="4" fill="${K.f}"/>` + tx(62, 11, '쿠키 모형 500개(모집단)', { size: 9.5, fill: K.ink })
    + `<path d="${all(true)}" stroke="${K.am}" stroke-width="3.2" stroke-linecap="round"/><path d="${all(false)}" stroke="${K.am}" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>`
    + picked + arrow(122, 60, 141, 60, 1.0)
    + `<rect x="145" y="25" width="84" height="66" rx="6" fill="${W}" stroke="${K.l}" stroke-width="1.4"/>` + plate
    + tx(187, 15, '번호로 뽑은 표본 30개', { size: 9.5, bold: true, fill: K.a, pop: 1.3 })
    + tx(187, 103, '큰 것·작은 것이 고루', { size: 9, fill: K.ink, pop: 2.0 }) + tx(187, 115, '큰 것만 고르면 치우침', { size: 9, pop: 2.0 }),
  );
}

/** 영상 편집 트랙(화면·음성 어긋남) → 표본평균 12 → 양쪽으로 1.96×2/√25 = 0.784만큼 구간 */
function videoMeanInterval() {
  const X = (v: number) => 20 + (v - 10.5) * (200 / 3), half = (1.96 * 2) / Math.sqrt(25);
  const frames = Array.from({ length: 8 }, (_, i) => `<rect x="${30 + i * 11}" y="12" width="10" height="14" rx="1" fill="${K.p}" fill-opacity="${i % 2 ? '.75' : '.9'}"/>`).join('');
  const wave = 'M38 41' + Array.from({ length: 20 }, (_, i) => `L${40 + i * 4} ${41 + (i % 2 ? 1 : -1) * [3, 6, 4, 7, 2, 5, 6, 3, 5, 4][i % 10]}`).join('') + 'L120 41';
  return svg(
    tx(6, 23, '화면', { size: 9, anchor: 'start', fill: K.ink }) + tx(6, 45, '음성', { size: 9, anchor: 'start', fill: K.ink }) + frames
    + `<path d="${wave}" fill="none" stroke="${K.am}" stroke-width="1.4" stroke-linejoin="round"/>`
    + guide('M30 8V52', K.a) + `<path d="M30 56H38" stroke="${K.a}" stroke-width="2" stroke-linecap="round"/>` + tx(42, 59, '어긋남(ms)', { size: 9, anchor: 'start', fill: K.a })
    + tx(182, 15, '정규모집단, σ = 2ms', { size: 9, fill: K.ink }) + tx(182, 30, 'n = 25, x̄ = 12', { math: true, size: 11 })
    + tx(182, 50, '12 ± 1.96 × 2/√25', { math: true, size: 11.5, pop: 0.5 })
    + `<path d="M16 82H224M${n1(X(11))} 79v6M${n1(X(13))} 79v6" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(X(11), 96, '11', { size: 9 }) + tx(X(13), 96, '13', { size: 9 }) + tx(224, 96, 'ms', { size: 9, anchor: 'end' })
    + interval(X(12), X(12 - half), X(12 + half), 82, 1.0)
    + `<circle cx="${X(12)}" cy="82" r="3.4" fill="${K.p}"/>` + tx(X(12), 96, 'x̄ = 12', { math: true, size: 10.5, fill: K.p })
    + tx(X(12 - half), 72, '11.22', { size: 9.5, bold: true, fill: K.a, pop: 2.0 }) + tx(X(12 + half), 72, '12.78', { size: 9.5, bold: true, fill: K.a, pop: 2.0 })
    + tx(120, 114, '같은 절차로 만든 구간의 약 95%가 μ를 포함', { size: 9, pop: 2.4 }),
  );
}

/** 관찰 기록 400장 막대(새 240 | 160) → 큰 표본 조건 → 0.6에서 양쪽으로 근사 95% 구간 */
function birdProportion() {
  const B = (n: number) => 66 + 0.4 * n, P = (p: number) => 66 + 800 * (p - 0.5);
  const half = 1.96 * Math.sqrt((0.6 * 0.4) / 400);
  const bino = `<circle cx="18" cy="24" r="9" fill="${K.ink}"/><circle cx="40" cy="24" r="9" fill="${K.ink}"/><circle cx="18" cy="24" r="5" fill="${K.p}"/><circle cx="40" cy="24" r="5" fill="${K.p}"/><rect x="25" y="16" width="8" height="8" rx="2" fill="${K.ink}"/><circle cx="16" cy="22" r="1.5" fill="${W}"/><circle cx="38" cy="22" r="1.5" fill="${W}"/>`;
  return svg(
    bino + tx(29, 48, '관찰 기록', { size: 9, fill: K.ink }) + tx(29, 60, '임의추출', { size: 9 })
    + pop(0.1, `<rect x="${B(0)}" y="14" width="${B(240) - B(0)}" height="18" fill="${K.p}"/>`) + tx((B(0) + B(240)) / 2, 27, '새 240장', { size: 9.5, bold: true, fill: W, pop: 0.1 })
    + pop(0.4, `<rect x="${B(240)}" y="14" width="${B(400) - B(240)}" height="18" fill="${K.l}"/>`) + tx((B(240) + B(400)) / 2, 27, '160장', { size: 9.5, bold: true, fill: K.ink, pop: 0.4 })
    + tx(146, 46, '표본 400장 · 두 범주 모두 충분히 큼', { size: 9, fill: K.ink, pop: 0.7 })
    + `<path d="M62 86H230M${P(0.5)} 83v6M${P(0.6)} 83v6M${P(0.7)} 83v6" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(P(0.5), 99, '50%', { size: 9 }) + tx(P(0.7) - 4, 99, '70%', { size: 9 })
    + tx(29, 89, '근사 95%', { size: 9.5, bold: true, fill: K.a, pop: 1.0 })
    + tx(146, 114, '0.6 ± 1.96√(0.6×0.4/400)', { math: true, size: 11, pop: 0.9 })
    + interval(P(0.6), P(0.6 - half), P(0.6 + half), 86, 1.2)
    + `<circle cx="${P(0.6)}" cy="86" r="3.4" fill="${K.p}"/>` + tx(P(0.6), 99, 'p̂ = 0.6', { math: true, size: 10.5, fill: K.p })
    + tx(P(0.6 - half), 75, '55.2%', { size: 9.5, bold: true, fill: K.a, pop: 2.0 }) + tx(P(0.6 + half), 75, '64.8%', { size: 9.5, bold: true, fill: K.a, pop: 2.0 }),
  );
}

/** 오차 분포 σ=6 → 9개 평균 σ=2 → 36개 평균 σ=1: 같은 축척의 실제 정규곡선이 차례로 좁아짐(중심 μ는 그대로) */
function tripMeans() {
  const X = (m: number) => 144 + 5.5 * m, Y = (y: number) => 100 - 210 * y;
  const clock = `<circle cx="28" cy="24" r="14" fill="${W}" stroke="${K.p}" stroke-width="2"/><path d="M28 24V14" stroke="${K.p}" stroke-width="2" stroke-linecap="round"/><path d="M28 24L35 17" stroke="${K.a}" stroke-width="2" stroke-linecap="round"/><circle cx="28" cy="24" r="1.8" fill="${K.ink}"/>`;
  return svg(
    clock + tx(28, 52, '계획 · 실제', { size: 9, fill: K.ink }) + tx(28, 68, '정규 · 독립', { size: 9 }) + tx(28, 82, 'σ = 6분', { size: 9.5, bold: true, fill: K.ink })
    + tx(28, 100, 'E(X̄) = μ', { math: true, size: 10.5 })
    + axes(56, 100, 232, 100) + guide(`M${X(0)} 100V12`) + tx(X(0), 112, 'μ', { math: true, size: 11, fill: K.ink })
    + dr(curve(normal(0, 6), -16, 16, X, Y, 64), 0.1, { color: K.m, w: 2 }) + tx(200, 87, '한 개: 6분', { size: 9, anchor: 'start', fill: K.m, pop: 0.6 })
    + dr(curve(normal(0, 2), -8, 8, X, Y, 64), 0.8, { color: K.p, w: 2.2 }) + tx(172, 64, 'n = 9: 2분', { size: 9.5, anchor: 'start', bold: true, fill: K.p, pop: 1.4 })
    + dr(curve(normal(0, 1), -4.5, 4.5, X, Y, 64), 1.6, { color: K.a, w: 2.4 }) + tx(166, 26, 'n = 36: 1분', { size: 9.5, anchor: 'start', bold: true, fill: K.a, pop: 2.2 })
    + tx(232, 112, '6/√n', { math: true, size: 11, anchor: 'end', pop: 2.4 }),
  );
}

/** 0점·2점 카드(각 1/2), 1점 카드는 없음 → 평균 1 → 양쪽 거리 1씩 = 표준편차 1 */
function wellnessPoints() {
  const X = (v: number) => 80 + 60 * v, base = 86;
  const card = (v: number, at: number) => pop(at, `<rect x="${X(v) - 13}" y="${base - 48}" width="26" height="48" rx="3" fill="${K.p}"/><path d="M${X(v) - 6} ${base - 14}q6-6 12 0" fill="none" stroke="${K.am}" stroke-width="1.6" stroke-linecap="round"/>`)
    + tx(X(v), base - 30, `${v}점`, { size: 11, bold: true, fill: W, pop: at }) + tx(X(v), base - 53, '1/2', { size: 10, bold: true, fill: K.p, pop: at });
  const shoe = `<path d="M10 54V44H22L28 50L48 54Q54 56 54 60V62H10Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/><path d="M10 62H54" stroke="${K.a}" stroke-width="2.4"/><path d="M24 50l3-3M29 52l3-3" stroke="${K.p}" stroke-width="1.1"/>`;
  return svg(
    shoe + tx(32, 76, '같은 확률로', { size: 9, fill: K.ink }) + tx(32, 88, '한 장 뽑기', { size: 9, fill: K.ink })
    + `<path d="M64 ${base}H220" stroke="${K.m}" stroke-width="1.2"/>`
    + `<rect x="${X(1) - 13}" y="${base - 48}" width="26" height="48" rx="3" fill="none" stroke="${K.m}" stroke-width="1" stroke-dasharray="3 2"/>`
    + tx(X(1), base - 28, '1점', { size: 9, fill: K.m }) + tx(X(1), base - 16, '없음', { size: 9, fill: K.m })
    + card(0, 0.1) + card(2, 0.4)
    + [0, 1, 2].map((v) => tx(X(v), 97, String(v), { size: 9, fill: K.ink })).join('')
    + pop(0.9, `<circle cx="${X(1)}" cy="${base}" r="3.4" fill="${K.a}"/>`) + tx(X(1), 26, 'E(X) = 1', { math: true, size: 11, pop: 0.9 })
    + arrow(X(1) - 3, 106, X(0) + 3, 106, 1.3, { color: K.a }) + arrow(X(1) + 3, 106, X(2) - 3, 106, 1.3, { color: K.a })
    + tx((X(0) + X(1)) / 2, 117, '거리 1', { size: 9, bold: true, fill: K.a, pop: 2.0 }) + tx((X(1) + X(2)) / 2, 117, '거리 1', { size: 9, bold: true, fill: K.a, pop: 2.0 })
    + tx(32, 104, 'Var(X) = 1', { math: true, size: 10.5, pop: 2.3 }) + tx(32, 117, 'σ = 1', { math: true, size: 10.5, pop: 2.4 }),
  );
}

/** 0과 1을 100번 더한 합: 35~65 막대가 확률만큼 세워짐 → N(50, 5²) 곡선을 겹쳐 모양 비교 */
function randomBits() {
  const X = (k: number) => 74 + 5 * (k - 35), base = 96, S = 880;
  const bars = Array.from({ length: 31 }, (_, i) => vbar(X(35 + i), base, S * binom(100, 0.5, 35 + i), 3.6, K.p, 0.1 + i * 0.035, 0.4)).join('');
  const bits = ['1011001', '0110100', '1100101', '0101…'];
  const term = `<rect x="4" y="8" width="60" height="60" rx="4" fill="${K.ink}"/><rect x="4" y="8" width="60" height="9" rx="4" fill="${K.p}"/><circle cx="10" cy="12.5" r="1.6" fill="${K.a}"/><circle cx="15" cy="12.5" r="1.6" fill="${K.am}"/>`
    + bits.map((b, i) => tx(10, 30 + i * 11, b, { size: 9.5, anchor: 'start', fill: i === 3 ? K.m : K.am })).join('');
  return svg(
    term + tx(34, 82, '100개의 합 X', { size: 9, fill: K.ink }) + tx(34, 98, 'B(100, 0.5)', { math: true, size: 10.5 })
    + `<path d="M70 ${base}H228" stroke="${K.m}" stroke-width="1.2"/>` + bars
    + tx(X(35), 107, '35', { size: 9 }) + tx(X(50), 107, '50', { size: 9, bold: true, fill: K.ink }) + tx(X(65), 107, '65', { size: 9 })
    + tx(204, 30, '막대: 정수 X', { size: 9, fill: K.p, pop: 1.2 })
    + dr(curve((x) => normal(50, 5)(x), 33, 67, X, (y) => base - S * y, 68), 1.7, { color: K.a, w: 1.8 })
    + tx(98, 30, 'N(50, 5²)', { math: true, size: 11, pop: 2.5 })
    + tx(149, 117, '평균 50 · σ = 5', { size: 9, fill: K.ink, pop: 2.5 }),
  );
}

/** 창 1000개 건물(p 모름) → 무작위 100개씩 두 번 → 파란 창 30개, 35개를 줄마다 칠함 → 표본비율이 다름 */
function windowSamples() {
  const rnd = seeded(1000);
  let facade = `<path d="M6 22L31 10L56 22Z" fill="${K.m}"/><rect x="8" y="22" width="46" height="84" fill="${K.f}" stroke="${K.p}" stroke-width="1.4"/>`;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) facade += `<rect x="${12 + c * 10.5}" y="${27 + r * 9.6}" width="7" height="6" fill="${rnd() < 0.33 ? K.p : W}"/>`;
  const gx = 90, p = 4.6, q = 3.6;
  const grid = (y0: number) => {
    let s = `<rect x="${gx - 3}" y="${y0 - 3}" width="${10 * p + 5}" height="${10 * p + 5}" rx="2" fill="${K.f}"/>`;
    for (let i = 0; i < 100; i++) s += `<rect x="${n1(gx + (i % 10) * p)}" y="${n1(y0 + Math.floor(i / 10) * p)}" width="${q}" height="${q}" fill="${W}"/>`;
    return s;
  };
  const blue = (y0: number, n: number, t0: number) => Array.from({ length: Math.ceil(n / 10) }, (_, r) => pop(t0 + r * 0.15,
    Array.from({ length: Math.min(10, n - r * 10) }, (_, c) => `<rect x="${n1(gx + c * p)}" y="${n1(y0 + r * p)}" width="${q}" height="${q}" fill="${K.p}"/>`).join(''))).join('');
  return svg(
    facade + tx(31, 117, '창 1000개', { size: 9.5, bold: true, fill: K.ink })
    + grid(10) + grid(66)
    + arrow(59, 33, 82, 33, 0.1) + tx(70, 27, '100개', { size: 9 })
    + blue(10, 30, 0.5) + tx(144, 26, '파란 창 30개', { size: 9.5, anchor: 'start', bold: true, fill: K.p, pop: 1.0 })
    + tx(144, 44, 'p̂₁ = 30/100 = 0.30', { math: true, size: 10.5, anchor: 'start', pop: 1.1 })
    + arrow(59, 89, 82, 89, 1.3) + tx(70, 83, '100개', { size: 9 })
    + blue(66, 35, 1.7) + tx(144, 82, '파란 창 35개', { size: 9.5, anchor: 'start', bold: true, fill: K.p, pop: 2.3 })
    + tx(144, 100, 'p̂₂ = 35/100 = 0.35', { math: true, size: 10.5, anchor: 'start', pop: 2.4 })
    + tx(188, 63, '전체 비율 p는 모름', { size: 9, pop: 2.6 }),
  );
}

const drawings: Record<string, string> = {
  'reward-distribution': rewardDistribution(),
  'encore-time': encoreTime(),
  'shots-binomial': shotsBinomial(),
  'color-error': colorError(),
  'cookie-sampling': cookieSampling(),
  'video-mean-interval': videoMeanInterval(),
  'bird-proportion': birdProportion(),
  'trip-means': tripMeans(),
  'wellness-points': wellnessPoints(),
  'random-bits': randomBits(),
  'window-samples': windowSamples(),
};
export default drawings;
