/**
 * 대수 '수열' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts al-sequences`로 content/sets/al-sequences.json의 svg 칸에 써 넣는다.
 * 장면 속 물건이 곧 항이다. 항이 차례로 놓이고(시작 번호·항 수는 그림에 적음), 합이 쌓이는 과정만 움직인다. 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow } from './kit.ts';

/** 끝이 뭉툭한 그려지는 선(막대·구간이 자라는 모습) */
const grow = (d: string, at: number, color: string, w: number, opacity?: number) =>
  `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt"${opacity ? ` stroke-opacity="${opacity}"` : ''}/>`;

/* ---- 카드별 그림 ---- */

function gameDaily() {
  const a = (n: number) => 20 + 5 * (n - 1), s = 0.9, base = 98, X = (n: number) => 100 + 18 * (n - 1);
  const gift = `<rect x="18" y="34" width="40" height="26" fill="${K.a}"/><rect x="15" y="27" width="46" height="9" rx="1.5" fill="${K.a}"/><path d="M15 36H61" stroke="${K.p}" stroke-width="1"/><rect x="35" y="27" width="6" height="33" fill="${K.am}"/><path d="M38 27c-6-9-15-6-10 0ZM38 27c6-9 15-6 10 0Z" fill="${K.am}"/>`;
  const bars = [1, 2, 3, 4, 5, 6, 7].map((n) => {
    const t = 0.1 + 0.2 * (n - 1), last = n === 7;
    return grow(`M${X(n)} ${base}V${n1(base - s * a(n))}`, t, last ? K.a : K.p, 14)
      + tx(X(n), 110, String(a(n)), { size: 9, bold: true, fill: last ? K.a : K.ink, pop: t + 0.5 })
      + tx(X(n), 29, `${n}일`, { size: 9, fill: K.ink });
  }).join('');
  const copies = pop(2.3, [1, 2, 3, 4, 5, 6, 7].map((n) => `<rect x="${X(n) - 7}" y="${n1(base - 63)}" width="14" height="${n1(s * a(8 - n))}" fill="${K.am}" fill-opacity=".55"/>`).join('')
    + `<path d="M216 35H220V98H216" fill="none" stroke="${K.ink}" stroke-width="1.2"/>`);
  return svg(
    tx(234, 13, 'aₙ = 20 + 5(n − 1),  1 ≤ n ≤ 7', { math: true, size: 10, anchor: 'end' })
    + gift + tx(38, 75, '첫날 20점', { size: 9.5, fill: K.ink }) + tx(38, 88, '매일 +5점', { size: 9.5, fill: K.ink })
    + `<path d="M92 ${base}H214" stroke="${K.m}" stroke-width="1.2"/>` + bars + copies
    + tx(224, 70, '70', { size: 9.5, bold: true, fill: K.ink, anchor: 'start', pop: 2.4 })
    + tx(40, 101, '7 × 70 ÷ 2', { math: true, size: 10.5, fill: K.ink, pop: 2.6 }) + tx(40, 115, 'S₇ = 245점', { size: 10.5, bold: true, fill: K.a, pop: 2.8 }),
  );
}

function musicPractice() {
  const ys = [32, 52, 72, 92], x0 = 36, mw = 11;
  const staff = (y: number) => {
    let bars = '', notes = '';
    for (let k = 0; k <= 8; k++) bars += `M${x0 + k * mw} ${y - 3}V${y + 3}`;
    for (let k = 0; k < 8; k++) notes += `<ellipse cx="${x0 + k * mw + 5.5}" cy="${y + (k % 2 ? 1.5 : -1.5)}" rx="2.2" ry="1.6" fill="${K.ink}"/>`;
    return `<path d="M${x0} ${y - 3}H${x0 + 88}M${x0} ${y}H${x0 + 88}M${x0} ${y + 3}H${x0 + 88}" stroke="${K.l}" stroke-width=".8"/><path d="${bars}" stroke="${K.m}" stroke-width=".8"/>${notes}`;
  };
  const sums = [2, 6, 12, 20];
  const rows = ys.map((y, i) => {
    const n = i + 1, t = 0.1 + 0.5 * i, last = n === 4;
    return staff(y) + grow(`M${x0} ${y}H${x0 + 2 * n * mw}`, t, K.am, 11, 0.5)
      + tx(30, y + 3.5, `${n}회`, { size: 9, anchor: 'end', fill: K.ink })
      + tx(148, y + 3.5, String(2 * n), { size: 10, bold: true, fill: K.p, pop: t + 0.6 })
      + tx(200, y + 3.5, last ? '20마디' : String(sums[i]), { size: 10, bold: true, fill: last ? K.a : K.ink, pop: t + 0.8 });
  }).join('');
  return svg(
    tx(148, 16, 'aₙ = 2n', { math: true, size: 11 }) + tx(200, 16, '누적 합', { size: 9.5, fill: K.ink }) + tx(30, 16, '회차 n', { size: 9, anchor: 'end' })
    + `<path d="M172 ${ys[0]}V${ys[3]}" stroke="${K.l}" stroke-width="1"/>` + rows
    + tx(120, 114, 'S₄ = 2 + 4 + 6 + 8 = 20마디', { math: true, size: 10.5, pop: 2.6 }),
  );
}

function sportsSegments() {
  const L = [100, 120, 140, 160, 180], s = 0.3, y = 58;
  const xs = L.reduce<number[]>((acc, l) => [...acc, acc[acc.length - 1] + l * s], [15]);
  const shoe = `<path d="M8 22V12H16L18 16H26Q32 16 32 20V22Z" fill="${K.a}"/><path d="M8 22H32" stroke="${K.ink}" stroke-width="2"/><path d="M17 16l2-2M20 16l2-2" stroke="${W}" stroke-width="1"/>`;
  const segs = L.map((l, i) => {
    const t = 0.1 + 0.4 * i, last = i === 4, mid = (xs[i] + xs[i + 1]) / 2;
    return grow(`M${n1(xs[i])} ${y}H${n1(xs[i + 1])}`, t, last ? K.a : i % 2 ? K.am : K.p, 8)
      + pop(t + 0.9, `<path d="M${n1(xs[i + 1])} ${y - 7}V${y + 7}" stroke="${K.ink}" stroke-width="1.4"/>`)
      + tx(mid, 46, last ? 'a₅ = 180' : String(l), { size: 9.5, bold: true, fill: last ? K.a : K.ink, pop: t + 0.5 })
      + tx(mid, 76, String(i + 1), { size: 9, fill: K.ink });
  }).join('');
  return svg(
    shoe + tx(38, 20, 'aₙ = 100 + 20(n − 1) m,  n = 1 ~ 5', { math: true, size: 10, anchor: 'start' })
    + `<rect x="10" y="${y - 7}" width="220" height="14" rx="7" fill="${K.l}"/><path d="M${xs[0]} ${y - 7}V${y + 7}" stroke="${K.ink}" stroke-width="1.4"/>`
    + segs + tx(8, 76, 'n', { math: true, size: 10.5, anchor: 'start', fill: K.ink })
    + dr(`M${xs[0]} 84V90H${n1(xs[5])}V84`, 2.1, { color: K.a, w: 1.6 })
    + tx(120, 104, 'S₅ = 5 × (100 + 180)/2 = 700 m', { math: true, size: 11, pop: 2.9 }),
  );
}

function fashionOdd() {
  const colors = [K.a, K.p, K.am, K.m];
  const bead = (i: number, j: number) => {
    const x = 24 + 13 * i, y = 86 - 13 * j, c = colors[Math.max(i, j)];
    return `<circle cx="${x}" cy="${y}" r="4.8" fill="${c}"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.2" fill="${W}" fill-opacity=".8"/>`;
  };
  const layer = (k: number) => {
    let s = '';
    for (let i = 0; i <= k; i++) for (let j = 0; j <= k; j++) if (Math.max(i, j) === k) s += bead(i, j);
    return s;
  };
  const lines = ['1 = 1²', '1 + 3 = 2²', '1 + 3 + 5 = 3²', '1 + 3 + 5 + 7 = 4²'];
  const gn = 'M172 56V50H208V86H202V56Z';
  return svg(
    tx(44, 22, '구슬 도안', { size: 9.5, fill: K.ink })
    + [0, 1, 2, 3].map((k) => pop(0.1 + k * 0.5, layer(k)) + tx(78, 50 + k * 14, lines[k], { math: true, size: 10, fill: K.ink, anchor: 'start', pop: 0.3 + k * 0.5 })).join('')
    + `<rect x="172" y="56" width="30" height="30" fill="${K.f}" stroke="${K.p}" stroke-width="1.4"/>` + tx(187, 75, 'k²', { math: true, size: 12, fill: K.p })
    + pop(2.1, `<path d="${gn}" fill="${K.a}" fill-opacity=".35"/>`) + dr(gn, 2.1, { color: K.a, w: 1.6 })
    + tx(190, 44, '2k + 1', { math: true, size: 10.5, pop: 2.3 })
    + tx(170, 104, 'k² + (2k + 1) = (k + 1)²', { math: true, size: 10.5, fill: K.ink, pop: 2.6 })
    + tx(120, 117, 'n = 1에서 시작 → 모든 자연수 n', { size: 9, fill: K.a, pop: 2.9 }),
  );
}

function cookingSauce() {
  const cx = [26, 70, 114], amt = [100, 50, 25], col = [K.a, K.am, K.p], op = [0.85, 0.85, 0.6];
  const dish = (i: number) => {
    const h = 25 * (amt[i] / 100);
    return `<rect x="${cx[i] - 14}" y="50" width="28" height="28" rx="3" fill="${W}" stroke="${K.p}" stroke-width="1.5"/><rect x="${cx[i] - 12.5}" y="${n1(76.5 - h)}" width="25" height="${n1(h)}" fill="${col[i]}" fill-opacity="${op[i]}"/><ellipse cx="${cx[i]}" cy="50" rx="14" ry="2.5" fill="none" stroke="${K.p}" stroke-width="1.2"/>`;
  };
  const Y = (v: number) => 104 - 0.4 * v, bounds = [0, 100, 150, 175];
  const steps = [0, 1, 2].map((i) => {
    const t = 0.1 + 0.8 * i;
    return dr(`M${cx[i] + 6} 45Q${(cx[i] + 180) / 2} ${14 + i * 3} 182 22`, t, { color: col[i], w: 1.6 })
      + grow(`M185 ${n1(Y(bounds[i]) - (i ? 0 : 0.8))}V${Y(bounds[i + 1])}`, t + 0.4, col[i], 24, op[i]);
  }).join('');
  return svg(
    tx(6, 14, 'aₙ = 100 × (1/2)ⁿ⁻¹', { math: true, size: 10.5, anchor: 'start' })
    + [0, 1, 2].map(dish).join('')
    + amt.map((v, i) => tx(cx[i], 90, `${v} mL`, { size: 9.5, bold: true, fill: K.ink }) + tx(cx[i], 103, `n = ${i + 1}`, { math: true, size: 10 })).join('')
    + `<path d="M172 22V104H198V22" fill="none" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/>`
    + [100, 150, 175].map((v) => `<path d="M198 ${Y(v)}h-4" stroke="${K.p}" stroke-width="1"/>`).join('') + steps
    + tx(202, Y(100) + 3.5, '100', { size: 9, anchor: 'start', fill: K.ink, pop: 0.9 }) + tx(202, Y(150) + 3.5, '150', { size: 9, anchor: 'start', fill: K.ink, pop: 1.7 })
    + tx(202, Y(175) + 3, '175', { size: 9.5, bold: true, anchor: 'start', fill: K.a, pop: 2.6 })
    + tx(76, 116, 'S₃ = 100 + 50 + 25 = 175 mL', { math: true, size: 10.5, pop: 2.8 }),
  );
}

function snsSquares() {
  const fx = [14, 89, 164], cy = 57;
  let holes = '';
  for (let x = 9; x < 232; x += 10) holes += `<rect x="${x}" y="25" width="5" height="4" rx="1" fill="${K.bg}"/><rect x="${x}" y="85" width="5" height="4" rx="1" fill="${K.bg}"/>`;
  const scene = (k: number, t0: number, dt: number) => {
    const n = k + 1, ccx = fx[k] + 31;
    let s = '';
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const c = `<rect x="${ccx - 6 * n + 12 * i + 0.5}" y="${cy - 6 * n + 12 * j + 0.5}" width="11" height="11" rx="1.5" fill="${(i + j) % 2 ? K.am : K.a}"/>`;
      s += pop(t0 + (j * n + i) * dt, c);
    }
    return s;
  };
  return svg(
    `<rect x="4" y="22" width="232" height="70" fill="${K.ink}"/>` + holes
    + fx.map((x) => `<rect x="${x}" y="32" width="62" height="50" rx="2" fill="${W}"/>`).join('')
    + fx.map((x, k) => tx(x + 31, 15, `${k + 1}번째 장면`, { size: 9, fill: K.ink })).join('')
    + scene(0, 0.2, 0) + scene(1, 0.6, 0.12) + scene(2, 1.3, 0.08)
    + tx(45, 104, '1² = 1', { math: true, size: 10.5, fill: K.ink, pop: 0.4 }) + tx(120, 104, '2² = 4', { math: true, size: 10.5, fill: K.ink, pop: 1.1 }) + tx(195, 104, '3² = 9', { math: true, size: 10.5, fill: K.ink, pop: 2.1 })
    + tx(120, 117, '1² + 2² + 3² = 3×4×7/6 = 14', { math: true, size: 10.5, pop: 2.6 }),
  );
}

function designPattern() {
  const xs = [22, 50, 86, 132], base = 80, c = 7;
  const tile = (x: number, y: number) => `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${K.f}" stroke="${K.p}" stroke-width=".8"/><path d="M${x + 3.5} ${y + 1.5}l2 2-2 2-2-2z" fill="${K.a}"/>`;
  const rect = (k: number) => {
    const n = k + 1;
    let s = '';
    for (let i = 0; i <= n; i++) for (let j = 0; j < n; j++) s += tile(xs[k] + i * c, base - (j + 1) * c);
    return s;
  };
  const rings = Array.from({ length: 13 }, (_, i) => `<circle cx="${22 + i * 16}" cy="12" r="3" fill="none" stroke="${K.p}" stroke-width="1.2"/>`).join('');
  return svg(
    `<rect x="6" y="12" width="228" height="104" rx="4" fill="${W}"/>` + rings
    + tx(96, 34, 'aₙ = n(n + 1)', { math: true, size: 11.5 })
    + [0, 1, 2, 3].map((k) => {
      const n = k + 1, t = 0.2 + 0.4 * k;
      return pop(t, rect(k)) + tx(xs[k] + ((n + 1) * c) / 2, 94, `a${'₁₂₃₄'[k]} = ${n * (n + 1)}`, { math: true, size: 10, fill: k === 3 ? K.a : K.ink, pop: t + 0.1 });
    }).join('')
    + tx(xs[3] + 17.5, 47, 'n + 1 = 5', { math: true, size: 9.5, fill: K.p, pop: 1.9 }) + tx(128, 70, '4', { size: 9.5, bold: true, fill: K.p, anchor: 'end', pop: 1.9 })
    + arrow(172, 66, 186, 66, 2.0, { color: K.a, w: 1.6 })
    + tx(208, 52, 'n = 4', { math: true, size: 10.5, fill: K.ink, pop: 2.2 }) + tx(208, 70, '4 × 5', { math: true, size: 10.5, fill: K.ink, pop: 2.5 }) + tx(208, 88, '= 20', { math: true, size: 10.5, pop: 2.8 }),
  );
}

function animalVisits() {
  const ys = [34, 54, 74, 94], X = (i: number) => 46 + 13 * i;
  const stamp = (x: number, y: number, kind: 'start' | 'copy' | 'new') => {
    const fill = kind === 'copy' ? W : kind === 'start' ? K.am : K.a, ink = kind === 'copy' ? K.p : W;
    return `<circle cx="${x}" cy="${y}" r="5" fill="${fill}" stroke="${kind === 'copy' ? K.p : fill}" stroke-width="1.3"/><path d="M${x - 2.3} ${y}l1.6 1.8 3-3.4" fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  const cat = `<path d="M8 20V8L12 12H18L22 8V20Q22 24 15 24Q8 24 8 20Z" fill="${K.am}"/><circle cx="12.5" cy="17" r="1.1" fill="${K.ink}"/><circle cx="17.5" cy="17" r="1.1" fill="${K.ink}"/>`;
  const labels = ['a₁ = 1', 'a₂ = a₁ + 2 = 3', 'a₃ = a₂ + 2 = 5', 'a₄ = a₃ + 2 = 7번'];
  let body = pop(0.1, stamp(X(0), ys[0], 'start')) + tx(150, ys[0] + 3.5, labels[0], { math: true, size: 10, fill: K.ink, anchor: 'start', pop: 0.2 });
  for (let n = 2; n <= 4; n++) {
    const y = ys[n - 1], prev = 2 * n - 3, t = 0.5 + 0.7 * (n - 2);
    let copies = '', news = '';
    for (let i = 0; i < prev; i++) copies += stamp(X(i), y, 'copy');
    news = stamp(X(prev), y, 'new') + stamp(X(prev + 1), y, 'new');
    body += pop(t, copies) + arrow(X(prev - 1) + 5, ys[n - 2] + 4, X(prev) - 2, y - 6, t, { color: K.a, w: 1.4 }) + pop(t + 0.45, news)
      + tx(150, y + 3.5, labels[n - 1], { math: true, size: 10, fill: n === 4 ? K.a : K.ink, anchor: 'start', pop: t + 0.6 });
  }
  return svg(
    cat + tx(28, 19, '가상 돌봄 방문', { size: 9.5, anchor: 'start', fill: K.ink }) + tx(234, 19, 'aₙ₊₁ = aₙ + 2', { math: true, size: 11, anchor: 'end' })
    + ys.map((y, i) => tx(36, y + 3.5, `${i + 1}회차`, { size: 9, anchor: 'end', fill: K.ink })).join('') + body,
  );
}

function travelStages() {
  const L = [20, 25, 30, 35], ang = [-35, 25, -35, 20], col = [K.a, K.p, K.p, K.a];
  const P: [number, number][] = [[16, 90]];
  L.forEach((l, i) => {
    const r = (ang[i] * Math.PI) / 180, [x, y] = P[i];
    P.push([x + 1.5 * l * Math.cos(r), y + 1.5 * l * Math.sin(r)]);
  });
  const lab: [number, number][] = [[20, 72], [60, 99], [84, 64], [140, 61]];
  const legs = L.map((l, i) => {
    const t = 0.1 + 0.4 * i;
    return dr(`M${n1(P[i][0])} ${n1(P[i][1])}L${n1(P[i + 1][0])} ${n1(P[i + 1][1])}`, t, { color: col[i], w: 3 })
      + pop(t + 0.7, `<circle cx="${n1(P[i + 1][0])}" cy="${n1(P[i + 1][1])}" r="2.8" fill="${W}" stroke="${col[i]}" stroke-width="1.5"/>`)
      + tx(lab[i][0], lab[i][1], `${l} m`, { size: 9.5, bold: true, fill: col[i], pop: t + 0.5 });
  }).join('');
  const map = `<rect x="4" y="24" width="166" height="90" rx="6" fill="${K.f}"/><path d="M4 44h166v3H4zM60 24h3v90h-3zM120 24h3v90h-3z" fill="${W}"/>`;
  const end = P[4];
  return svg(
    tx(120, 15, 'aₙ = 20 + 5(n − 1),  n = 1 ~ 4', { math: true, size: 10.5 })
    + map + `<circle cx="${P[0][0]}" cy="${P[0][1]}" r="3.4" fill="${K.ink}"/>` + tx(16, 106, '출발', { size: 9, fill: K.ink })
    + legs + pop(1.9, `<path d="M${n1(end[0])} ${n1(end[1] - 13)}l2 4.5 4.8.4-3.6 3.2 1.1 4.7-4.3-2.5-4.3 2.5 1.1-4.7-3.6-3.2 4.8-.4z" fill="${K.am}"/>`)
    + tx(204, 44, '20 + 35 = 55', { size: 9.5, bold: true, fill: K.a, pop: 2.2 }) + tx(204, 62, '25 + 30 = 55', { size: 9.5, bold: true, fill: K.p, pop: 2.4 })
    + tx(204, 82, 'S₄ = 4 × 55/2', { math: true, size: 10.5, fill: K.ink, pop: 2.7 }) + tx(204, 100, '= 110 m', { size: 11, bold: true, fill: K.a, pop: 3.0 }),
  );
}

function carDisplay() {
  const ys = [30, 47, 64, 81, 98];
  const car = (x: number, y: number, c: string) =>
    `<rect x="${x}" y="${y - 7}" width="13" height="5" rx="2" fill="${c}"/><path d="M${x + 3} ${y - 7}L${x + 5} ${y - 10.5}H${x + 9}L${x + 11} ${y - 7}Z" fill="${c}"/><circle cx="${x + 3}" cy="${y - 1.5}" r="1.8" fill="${K.ink}"/><circle cx="${x + 10}" cy="${y - 1.5}" r="1.8" fill="${K.ink}"/>`;
  const sums = [1, 3, 6, 10, 15];
  const rows = ys.map((y, i) => {
    const k = i + 1, t = 0.2 + 0.4 * i, x0 = 85 - 8 * k + 1.5;
    return `<path d="M40 ${y + 2}H130" stroke="${K.m}" stroke-width="1.4"/>`
      + pop(t, Array.from({ length: k }, (_, j) => car(x0 + 16 * j, y, j % 2 ? K.p : K.a)).join(''))
      + tx(34, y, `k = ${k}`, { math: true, size: 10, anchor: 'end', fill: K.ink })
      + tx(152, y, String(sums[i]), { size: 10, bold: true, fill: k === 5 ? K.a : K.ink, pop: t + 0.1 });
  }).join('');
  return svg(
    tx(152, 14, '누적', { size: 9.5, fill: K.ink }) + rows
    + tx(198, 40, '5', { math: true, size: 10, fill: K.ink, pop: 2.3 }) + pop(2.3, `<path d="M208 46H188L198 60L188 74H208" fill="none" stroke="${K.p}" stroke-width="2.2" stroke-linejoin="round"/>`)
    + tx(214, 64, 'k', { math: true, size: 13, fill: K.p, anchor: 'start', pop: 2.3 }) + tx(198, 87, 'k = 1', { math: true, size: 10, fill: K.ink, pop: 2.3 })
    + tx(205, 106, '= 15대', { size: 11, bold: true, fill: K.a, pop: 2.7 }),
  );
}

function healthPoints() {
  const mx = [8, 66, 124, 182], cnt = [2, 4, 8, 16], cols = [2, 2, 4, 4];
  const monitor = (x: number) => `<rect x="${x}" y="22" width="50" height="36" rx="3" fill="${K.p}"/><path d="M${x + 21} 58L${x + 19} 64H${x + 31}L${x + 29} 58Z" fill="${K.p}"/>`;
  const dots = (k: number) => {
    const c = cols[k], r = cnt[k] / c, cx = mx[k] + 25;
    let s = '';
    for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) s += `<circle cx="${n1(cx - 3.5 * (c - 1) + 7 * i)}" cy="${n1(40 - 3.5 * (r - 1) + 7 * j)}" r="2.5" fill="${K.am}"/>`;
    return s;
  };
  const sx = [14, 26, 50, 98, 194];
  return svg(
    tx(120, 14, 'aₙ = 2 × 2ⁿ⁻¹  (1 ≤ n ≤ 4)', { math: true, size: 10.5 })
    + mx.map((x, k) => monitor(x) + pop(0.1 + 0.3 * k, dots(k)) + tx(x + 25, 76, `${cnt[k]}개`, { size: 9.5, bold: true, fill: k === 3 ? K.a : K.ink, pop: 0.2 + 0.3 * k })).join('')
    + [0, 1, 2, 3].map((k) => grow(`M${sx[k]} 89H${sx[k + 1]}`, 1.3 + 0.25 * k, k % 2 ? K.a : K.am, 9)).join('')
    + pop(2.6, `<path d="M${sx[3]} 98V101H${sx[4]}V98" fill="none" stroke="${K.ink}" stroke-width="1.2"/>`) + tx(146, 112, '마지막 화면 16', { size: 9, fill: K.ink, pop: 2.6 })
    + tx(200, 92.5, '합 30개', { size: 10.5, bold: true, fill: K.a, anchor: 'start', pop: 2.8 })
    + tx(6, 116, 'S₄ = 2(2⁴ − 1)/(2 − 1)', { math: true, size: 10, anchor: 'start', pop: 3.0 }),
  );
}

function environmentCount() {
  const rows = [50, 62, 74];
  const can = (x: number, y: number, c: string) => `<rect x="${x}" y="${y - 9}" width="6" height="9" rx="1" fill="${c}"/><rect x="${x}" y="${y - 9}" width="6" height="2" fill="${K.l}"/>`;
  const starts: number[] = [];
  let x = 34;
  for (let k = 1; k <= 4; k++) { starts.push(x); x += 8 * k + 6; }
  const bin = `<path d="M8 44H26L24 76H10Z" fill="${K.p}"/><rect x="6" y="39" width="22" height="5" rx="1.5" fill="${K.p}"/><path d="M14 54l3-5 3 5M20 63l-3 5-3-5" fill="none" stroke="${W}" stroke-width="1.4" stroke-linejoin="round"/>`;
  const days = [1, 2, 3, 4].map((k, i) => {
    let s = '';
    for (let c = 0; c < k; c++) for (const y of rows) s += can(starts[i] + 1 + 8 * c, y, k % 2 ? K.p : K.a);
    const mid = starts[i] + 4 * k;
    return pop(0.1 + 0.35 * i, s) + tx(mid, 88, String(3 * k), { size: 10, bold: true, fill: K.ink, pop: 0.2 + 0.35 * i }) + tx(mid, 101, `${k}일`, { size: 9, fill: K.ink });
  }).join('');
  const bands = rows.map((y, i) => dr(`M32 ${y - 11}H134V${y + 1}H32Z`, 1.6 + 0.2 * i, { color: K.a, w: 1.3 }) + tx(140, y - 2, '10', { size: 9.5, bold: true, fill: K.a, anchor: 'start', pop: 2.1 + 0.15 * i })).join('');
  return svg(
    tx(84, 20, 'n일째 3n개 (n = 1, 2, 3, 4)', { size: 9.5, fill: K.ink })
    + bin + days + bands
    + tx(196, 40, 'Σ(k=1~4) 3k', { math: true, size: 10.5, fill: K.ink, pop: 2.4 }) + tx(196, 58, '= 3Σ(k=1~4) k', { math: true, size: 10.5, fill: K.ink, pop: 2.6 })
    + tx(196, 76, '= 3 × 10', { math: true, size: 10.5, fill: K.ink, pop: 2.8 }) + tx(196, 94, '= 30개', { size: 11, bold: true, fill: K.a, pop: 3.0 })
    + tx(84, 115, '3줄 × (1 + 2 + 3 + 4)', { size: 9.5, fill: K.a, pop: 2.2 }),
  );
}

function aiCopy() {
  const cx = [30, 82, 140, 204], cy = 56, half = [18, 18, 18, 24];
  const shapes: [number, number][] = [[1, 1], [2, 1], [2, 2], [4, 2]];
  const isCopy = (k: number, i: number, j: number) => (k === 1 && i === 1) || (k === 2 && j === 1) || (k === 3 && i >= 2);
  const cell = (k: number, i: number, j: number, c: string) => {
    const [w, h] = shapes[k];
    return `<rect x="${cx[k] - 5 * w + 10 * i + 0.5}" y="${cy - 5 * h + 10 * j + 0.5}" width="9" height="9" rx="1.5" fill="${c}"/>`;
  };
  const pattern = (k: number, at: number) => {
    const [w, h] = shapes[k];
    let base = '', copy = '';
    for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
      if (isCopy(k, i, j)) copy += cell(k, i, j, K.a); else base += cell(k, i, j, K.p);
    }
    return `<rect x="${cx[k] - half[k]}" y="${cy - 16}" width="${2 * half[k]}" height="32" rx="3" fill="${K.f}"/>` + base + (copy ? pop(at, copy) : '');
  };
  const exps = ['2⁰ = 1', '2¹ = 2', '2² = 4', '2³ = 8'];
  return svg(
    tx(120, 18, 'aₙ = 2ⁿ⁻¹', { math: true, size: 12 })
    + [0, 1, 2, 3].map((k) => pattern(k, 0.2 + 0.7 * k + 0.4)).join('')
    + [0, 1, 2].map((k) => {
      const a = cx[k] + half[k] + 2, b = cx[k + 1] - half[k + 1] - 2, t = 0.2 + 0.7 * k;
      return arrow(a, cy, b, cy, t, { color: K.a, w: 1.6 }) + tx((a + b) / 2, 36, '×2', { size: 9.5, bold: true, fill: K.a });
    }).join('')
    + [0, 1, 2, 3].map((k) => tx(cx[k], 86, `n = ${k + 1}`, { math: true, size: 10.5, fill: K.ink }) + tx(cx[k], 101, exps[k], { math: true, size: 10.5, pop: k === 0 ? 0.1 : 0.7 * k + 0.6 })).join('')
    + tx(120, 116, '지수 n − 1 = 복제한 횟수', { size: 9.5, fill: K.a, bold: true, pop: 2.8 }),
  );
}

function buildingMid() {
  const sides = [Math.SQRT2 * 10, 20, Math.sqrt(8) * 10], px = [18, 48, 86], bot = 84;
  const panel = (i: number) => {
    const s = sides[i], x = px[i], y = bot - s;
    return `<rect x="${x}" y="${n1(y)}" width="${n1(s)}" height="${n1(s)}" fill="${K.am}" fill-opacity=".75" stroke="${K.p}" stroke-width="1.2"/><path d="M${n1(x + s / 2)} ${n1(y + s * 0.2)}L${n1(x + s * 0.8)} ${n1(y + s / 2)}L${n1(x + s / 2)} ${n1(y + s * 0.8)}L${n1(x + s * 0.2)} ${n1(y + s / 2)}Z" fill="${W}" fill-opacity=".7"/>`;
  };
  const top = (i: number) => [px[i] + sides[i] / 2, bot - sides[i] - 3] as const;
  let strip = '', square = '';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) strip += `<rect x="${146 + 5 * i}" y="${30 + 5 * j}" width="5" height="5" fill="${K.p}" fill-opacity=".8" stroke="${W}" stroke-width=".6"/>`;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) square += `<rect x="${206 + 5 * i}" y="${25 + 5 * j}" width="5" height="5" fill="${K.a}" fill-opacity=".8" stroke="${W}" stroke-width=".6"/>`;
  const [a0, a1, a2] = [top(0), top(1), top(2)];
  return svg(
    `<rect x="8" y="24" width="122" height="80" fill="${K.f}" stroke="${K.p}" stroke-width="1.4"/><rect x="4" y="18" width="130" height="6" fill="${K.p}"/><path d="M2 104H136" stroke="${K.m}" stroke-width="1.6"/>`
    + panel(0) + panel(2) + `<rect x="${px[1]}" y="${bot - 20}" width="20" height="20" fill="none" stroke="${K.p}" stroke-width="1.2" stroke-dasharray="3 2"/>` + pop(1.7, panel(1))
    + tx(25, 97, '2 cm²', { size: 9, fill: K.ink }) + tx(58, 97, 'b', { math: true, size: 11, fill: K.a }) + tx(100, 97, '8 cm²', { size: 9, fill: K.ink })
    + tx(58, 113, '4 cm²', { size: 9.5, bold: true, fill: K.a, pop: 1.8 })
    + dr(`M${n1(a0[0])} ${n1(a0[1])}Q${n1((a0[0] + a1[0]) / 2)} 40 ${n1(a1[0])} ${n1(a1[1])}`, 2.1, { color: K.a, w: 1.5 }) + tx(Math.round((a0[0] + a1[0]) / 2), 42, '×2', { size: 9.5, bold: true, fill: K.a, pop: 2.4 })
    + dr(`M${n1(a1[0])} ${n1(a1[1])}Q${n1((a1[0] + a2[0]) / 2)} 36 ${n1(a2[0])} ${n1(a2[1])}`, 2.4, { color: K.a, w: 1.5 }) + tx(Math.round((a1[0] + a2[0]) / 2), 38, '×2', { size: 9.5, bold: true, fill: K.a, pop: 2.7 })
    + pop(0.2, strip) + tx(166, 52, '2 × 8', { math: true, size: 10.5, fill: K.ink, pop: 0.3 })
    + arrow(189, 37, 201, 37, 0.5, { color: K.p, w: 1.4 })
    + pop(1.0, square) + tx(216, 56, '4 × 4', { math: true, size: 10.5, fill: K.ink, pop: 1.1 })
    + tx(188, 76, 'b² = 2 × 8 = 16', { math: true, size: 10.5, pop: 1.3 }) + tx(188, 93, 'b = 4 (양수)', { size: 9.5, bold: true, fill: K.ink, pop: 1.6 })
    + tx(188, 110, '공비 2', { size: 10, bold: true, fill: K.a, pop: 2.9 }),
  );
}

function stageSeats() {
  const ys = [30, 44, 58, 72, 86];
  const seat = (x: number, y: number, c: string) => `<rect x="${n1(x)}" y="${y}" width="7" height="7" rx="2" fill="${c}"/>`;
  const rows = ys.map((y, i) => {
    const n = i + 1, c = 8 + 2 * (n - 1), x0 = 120 - (9 * c - 2) / 2, t = 0.2 + 0.4 * i;
    const seats = Array.from({ length: c }, (_, j) => seat(x0 + 9 * j, y, n > 1 && (j === 0 || j === c - 1) ? K.a : K.am)).join('');
    return pop(t, seats) + tx(36, y + 7, String(n), { size: 9.5, anchor: 'end', fill: K.ink })
      + tx(212, y + 7, String(c), { size: 10, bold: true, fill: n === 5 ? K.a : K.ink, pop: t + 0.1 });
  }).join('');
  return svg(
    `<rect x="80" y="4" width="80" height="14" rx="3" fill="${K.p}"/>` + tx(120, 14.5, '무대', { size: 9, fill: W, bold: true })
    + tx(36, 14, '줄 n', { size: 9, anchor: 'end' }) + tx(212, 14, '자리', { size: 9 }) + rows
    + tx(120, 111, 'S₅ = 5 × (8 + 16)/2 = 60자리', { math: true, size: 11, pop: 2.4 }),
  );
}

const drawings: Record<string, string> = {
  'game-daily': gameDaily(),
  'music-practice': musicPractice(),
  'sports-segments': sportsSegments(),
  'fashion-odd': fashionOdd(),
  'cooking-sauce': cookingSauce(),
  'sns-squares': snsSquares(),
  'design-pattern': designPattern(),
  'animal-visits': animalVisits(),
  'travel-stages': travelStages(),
  'car-display': carDisplay(),
  'health-points': healthPoints(),
  'environment-count': environmentCount(),
  'ai-copy': aiCopy(),
  'building-mid': buildingMid(),
  'stage-seats': stageSeats(),
};
export default drawings;
