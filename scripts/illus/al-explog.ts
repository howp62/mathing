/**
 * 대수 '지수함수와 로그함수' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts al-explog`로 content/sets/al-explog.json의 svg 칸에 써 넣는다.
 * 장면(관심사 속 물건)이 곧 수학 대상이다. 거듭 곱해지는 단계, 거꾸로 읽는 단계만 차례로 나타난다. 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 공통 조각 ---- */

/** 끝이 뭉툭한 그려지는 선(막대가 자라는 모습) */
const grow = (d: string, at: number, color: string, w: number, opacity?: number) =>
  `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt"${opacity ? ` stroke-opacity="${opacity}"` : ''}/>`;

/* ---- 카드별 그림 ---- */

function gameReward() {
  const X = (n: number) => 92 + 28 * n, base = 98, H = (v: number) => v * 0.04125;
  const vals = [100, 200, 400, 800, 1600];
  const sword = `<path d="M31 60V28L34 21L37 28V60Z" fill="${W}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/><path d="M34 27V58" stroke="${K.l}" stroke-width="1"/><rect x="23" y="60" width="22" height="5" rx="2" fill="${K.am}"/><rect x="32" y="65" width="4" height="12" fill="${K.p}"/><circle cx="34" cy="79" r="3" fill="${K.am}"/>`
    + `<path d="M48 22l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5zM18 38l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="${K.am}"/>`;
  const bars = vals.map((v, n) => {
    const t = 0.1 + 0.35 * n, top = base - H(v);
    return grow(`M${X(n)} ${base}V${n1(top)}`, t, K.am, 18)
      + pop(t + 0.55, `<ellipse cx="${X(n)}" cy="${n1(top)}" rx="9" ry="2.6" fill="${K.a}"/>`)
      + tx(X(n), Math.round(top - 5), String(v), { size: 9, bold: true, fill: n === 4 ? K.a : K.ink, pop: t + 0.6 })
      + tx(X(n), 110, String(n), { size: 9.5, fill: K.ink });
  }).join('');
  const lin = [100, 200, 300, 400, 500].map((v, n) => [X(n), base - H(v)] as const);
  const linear = pop(2.2, `<path d="M${lin.map(([x, y]) => `${x} ${n1(y)}`).join('L')}" fill="none" stroke="${K.m}" stroke-width="1.2" stroke-dasharray="2 2"/>`
    + lin.map(([x, y]) => `<circle cx="${x}" cy="${n1(y)}" r="2.3" fill="${W}" stroke="${K.m}" stroke-width="1.2"/>`).join(''));
  return svg(
    sword + tx(234, 12, 'R(n) = 100 × 2ⁿ', { math: true, size: 11, anchor: 'end' })
    + `<path d="M84 ${base}H222" stroke="${K.m}" stroke-width="1.2"/>` + bars + tx(80, 110, 'n', { math: true, size: 10.5, anchor: 'end', fill: K.ink })
    + linear + tx(218, base - H(500) + 3, '500', { size: 9, fill: K.m, anchor: 'start', pop: 2.3 })
    + tx(36, 97, '×2씩: 1600', { size: 9.5, bold: true, fill: K.a, pop: 2.0 }) + tx(36, 110, '+100씩: 500', { size: 9.5, fill: K.m, pop: 2.4 }),
  );
}

function musicScale() {
  const X = [64, 118, 172, 224], top = 40, bot = 78;
  const speaker = (x: number, L: number, at: number | null) => {
    const body = `<rect x="${x - 9}" y="55" width="5" height="8" fill="${K.p}"/><path d="M${x - 4} 55L${x + 1} 51V67L${x - 4} 63Z" fill="${K.p}"/>`;
    const waves = Array.from({ length: L }, (_, i) => `<path d="M${x + 4 + i * 3.5} ${54 - i * 2}q${3 + i} ${5 + i * 2} 0 ${10 + i * 4}" fill="none" stroke="${K.a}" stroke-width="1.4" stroke-linecap="round"/>`).join('');
    return body + (at === null ? waves : pop(at, waves));
  };
  const hops = [0, 1, 2].map((i) => {
    const t = 0.2 + i * 0.6, a = X[i] + 6, b = X[i + 1] - 6, m = (X[i] + X[i + 1]) / 2;
    return dr(`M${a + 2} ${top - 16}Q${m} 4 ${b - 2} ${top - 16}`, t, { color: K.p, w: 1.8 }) + tx(m, 11, '×10', { size: 9.5, bold: true, fill: K.p, pop: t + 0.4 })
      + dr(`M${a} ${bot + 16}Q${m} 116 ${b} ${bot + 16}`, t, { color: K.a, w: 1.8 }) + tx(m, 116, '+1', { size: 9.5, bold: true, fill: K.a, pop: t + 0.4 });
  }).join('');
  return svg(
    `<path d="M${X[0]} ${top}H${X[3]}M${X[0]} ${bot}H${X[3]}" stroke="${K.m}" stroke-width="1.2"/>`
    + X.map((x) => `<path d="M${x} ${top - 3}V${top + 3}M${x} ${bot - 3}V${bot + 3}" stroke="${K.ink}" stroke-width="1.4"/>`).join('')
    + ['1', '10', '100', '1000'].map((s, i) => tx(X[i], top - 6 + 0, s, { size: 9.5, fill: K.ink, bold: true })).join('')
    + ['0', '1', '2', '3'].map((s, i) => tx(X[i], bot + 13, s, { size: 10, fill: K.a, bold: true })).join('')
    + tx(6, top + 4, '비율 r', { size: 9.5, anchor: 'start', fill: K.ink }) + tx(6, bot + 4, '눈금 L', { size: 9.5, anchor: 'start', fill: K.ink })
    + tx(6, 62, '개념도', { size: 9, anchor: 'start' })
    + X.map((x, i) => speaker(x, i, i === 0 ? null : 0.6 + (i - 1) * 0.6)).join('')
    + hops + tx(6, 14, 'log₁₀1000 = 3', { math: true, size: 11, anchor: 'start', pop: 2.2 }),
  );
}

function sportsFlags() {
  const flag = (x: number, y: number, c: string) => `<path d="M${x} ${y}V${y - 9}" stroke="${K.ink}" stroke-width="1"/><path d="M${x} ${y - 9}L${x + 4.5} ${y - 7}L${x} ${y - 5}Z" fill="${c}"/>`;
  const block = (x: number, y: number, c: string) => Array.from({ length: 5 }, (_, i) => flag(x + i * 5.5, y, c)).join('');
  const rows = [52, 64, 76];
  const g1 = rows.map((y, j) => pop(0.7 + j * 0.12, block(78, y, j % 2 ? K.p : K.a))).join('');
  const g2 = [140, 172, 204].flatMap((x, i) => rows.map((y, j) => pop(1.7 + (i * 3 + j) * 0.07, block(x, y, (i + j) % 2 ? K.p : K.a)))).join('');
  const bunting = Array.from({ length: 12 }, (_, i) => `<path d="M${10 + i * 19} 4l8 0-4 7z" fill="${i % 2 ? K.p : K.am}" fill-opacity=".7"/>`).join('');
  return svg(
    `<path d="M4 4Q120 8 236 4" fill="none" stroke="${K.m}" stroke-width="1"/>` + bunting
    + tx(120, 30, 'F(t) = 5 × 3ᵗ', { math: true, size: 11.5 })
    + block(18, 64, K.a) + g1 + g2
    + arrow(50, 61, 72, 61, 0.2) + tx(61, 52, '×3', { size: 10, bold: true, fill: K.p })
    + arrow(112, 61, 134, 61, 1.2) + tx(123, 52, '×3', { size: 10, bold: true, fill: K.p })
    + tx(29, 94, '5개', { size: 10, bold: true, fill: K.ink }) + tx(90, 94, '15개', { size: 10, bold: true, fill: K.ink, pop: 1.0 }) + tx(184, 94, '45개', { size: 10, bold: true, fill: K.a, pop: 2.4 })
    + tx(29, 109, 't = 0', { math: true, size: 10.5 }) + tx(90, 109, 't = 1', { math: true, size: 10.5 }) + tx(184, 109, 't = 2', { math: true, size: 10.5 }),
  );
}

function fashionDilution() {
  const xs = [34, 108, 182], base = 92, u = 13, cw = 30;
  const beaker = (x: number) => `<path d="M${x} 30V${base}H${x + cw}V30" fill="none" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${x - 3} 30H${x + 3}M${x + cw - 3} 30H${x + cw + 3}" stroke="${K.p}" stroke-width="1.6"/>`;
  const level = (x: number, units: number, op: number, at: number | null) => {
    const h = units * u, mid = x + cw / 2;
    return at === null ? `<rect x="${x + 1}" y="${base - h}" width="${cw - 2}" height="${h}" fill="${K.a}" fill-opacity="${op}"/>` : grow(`M${mid} ${base - 0.5}V${base - h}`, at, K.a, cw - 2, op);
  };
  const nail = (x: number, op: number) => `<path d="M${x} 92V80a5 5 0 0 1 10 0V92" fill="${W}" stroke="${K.m}" stroke-width="1"/><path d="M${x + 2} 86V81a3 3 0 0 1 6 0V86Z" fill="${K.a}" fill-opacity="${op}"/>`;
  const drop = (x: number) => `<path d="M${x} 46c-2.5 3.5-3.5 5-3.5 6.5a3.5 3.5 0 0 0 7 0c0-1.5-1-3-3.5-6.5z" fill="${K.p}" fill-opacity=".5"/>`;
  return svg(
    xs.map(beaker).join('') + level(xs[0], 1, 1, null) + level(xs[1], 2, 0.5, 0.75) + level(xs[2], 4, 0.25, 1.85)
    + nail(xs[0] + 33, 1) + nail(xs[1] + 33, 0.5) + nail(xs[2] + 33, 0.25)
    + tx(49, 24, 'n = 0', { math: true, size: 10.5 }) + tx(123, 24, 'n = 1', { math: true, size: 10.5 }) + tx(197, 24, 'n = 2', { math: true, size: 10.5 })
    + drop(91) + arrow(79, 60, 103, 60, 0.2, { color: K.p, w: 1.6 }) + tx(91, 72, '같은 양', { size: 9, fill: K.p })
    + drop(165) + arrow(153, 60, 177, 60, 1.3, { color: K.p, w: 1.6 }) + tx(165, 72, '같은 양', { size: 9, fill: K.p })
    + tx(49, 106, '1', { size: 10.5, bold: true, fill: K.ink }) + tx(123, 106, '1/2', { size: 10.5, bold: true, fill: K.ink, pop: 1.2 })
    + tx(197, 106, '1/4 = 25%', { size: 10.5, bold: true, fill: K.a, pop: 2.3 })
    + tx(120, 12, 'C(n) = (1/2)ⁿ', { math: true, size: 10.5, pop: 2.6 }),
  );
}

function cookingMold() {
  const cube = (x: number, y: number, s: number, op = 1) => {
    const o = 0.35 * s;
    return `<path d="M${x} ${y}h${s}l${n1(o)} ${n1(-o)}h${-s}Z" fill="${K.a}" fill-opacity="${n1(0.45 * op)}" stroke="${W}" stroke-width=".8" stroke-linejoin="round"/>`
      + `<path d="M${x + s} ${y}l${n1(o)} ${n1(-o)}v${s}l${n1(-o)} ${n1(o)}Z" fill="${K.a}" fill-opacity="${n1(0.95 * op)}" stroke="${W}" stroke-width=".8" stroke-linejoin="round"/>`
      + `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${K.a}" fill-opacity="${n1(0.7 * op)}" stroke="${W}" stroke-width=".8"/>`;
  };
  const X0 = 104, Y0 = 58, s = 20, o = 7;
  const order: [number, number, number][] = [];
  for (let k = 1; k >= 0; k--) for (let j = 1; j >= 0; j--) for (let i = 0; i < 2; i++) order.push([i, j, k]);
  const subs = order.map(([i, j, k], idx) => pop(0.5 + idx * 0.11, cube(X0 + s * i + o * k, Y0 + s * j - o * k, s))).join('');
  const ghost = `<path d="M${X0} ${Y0}h40l14 -14h-40ZM${X0 + 40} ${Y0}l14 -14v40l-14 14Z" fill="none" stroke="${K.l}" stroke-width="1" stroke-linejoin="round"/><rect x="${X0}" y="${Y0}" width="40" height="40" fill="none" stroke="${K.l}" stroke-width="1"/>`;
  return svg(
    tx(36, 20, '젤리 틀', { size: 9.5, fill: K.ink }) + cube(24, 78, 20) + `<path d="M24 104H44M24 101V107M44 101V107" stroke="${K.ink}" stroke-width="1.2"/>` + tx(34, 116, '2 cm', { size: 9.5, bold: true, fill: K.ink })
    + arrow(58, 82, 94, 82, 0.1) + tx(76, 74, '부피 ×8', { size: 9.5, bold: true, fill: K.p })
    + ghost + subs
    + dr(`M${X0} 104H${X0 + 40}`, 1.5, { color: K.a, w: 2.2 }) + pop(1.5, `<path d="M${X0} 101V107M${X0 + 20} 102V106M${X0 + 40} 101V107" stroke="${K.a}" stroke-width="1.2"/>`)
    + tx(X0 + 20, 116, '4 cm', { size: 10, bold: true, fill: K.a, pop: 2.1 })
    + tx(200, 46, 'k³ = 8', { math: true, size: 11.5, pop: 2.2 }) + tx(200, 66, 'k = ∛8 = 2', { math: true, size: 11.5, pop: 2.5 })
    + tx(200, 86, '한 변 ×2', { size: 10, bold: true, fill: K.a, pop: 2.8 }),
  );
}

function snsGrowth() {
  const X = (t: number) => 58 + 48 * t, Y = (v: number) => 98 - v * 0.0133;
  const V = [200, 600, 1800, 5400];
  const phone = `<rect x="4" y="4" width="232" height="112" rx="12" fill="${W}" stroke="${K.p}" stroke-width="2.2"/><rect x="11" y="44" width="3" height="32" rx="1.5" fill="${K.l}"/>`;
  const eye = `<path d="M24 16q8-8 16 0q-8 8-16 0Z" fill="none" stroke="${K.p}" stroke-width="1.4"/><circle cx="32" cy="16" r="2.4" fill="${K.p}"/>`;
  const pts = V.map((v, t) => {
    const at = 0.2 + t * 0.55;
    return pop(at, `<circle cx="${X(t)}" cy="${n1(Y(v))}" r="3.4" fill="${t === 3 ? K.a : K.p}"/>`)
      + (t ? arrow(X(t - 1) + 4, Y(V[t - 1]) - 2, X(t) - 4, Y(v) + 3, at - 0.45, { color: K.am, w: 1.6 }) : '');
  }).join('');
  const lab = [[X(0), Y(200) - 7, 'middle'], [X(1), Y(600) - 8, 'middle'], [X(2) - 7, Y(1800) - 2, 'end'], [X(3) + 7, Y(5400) + 4, 'start']] as const;
  return svg(
    phone + eye + tx(44, 19.5, '조회 수', { size: 9.5, anchor: 'start', fill: K.ink }) + tx(228, 20, 'V(t) = 200 × 3ᵗ', { math: true, size: 11, anchor: 'end' })
    + axes(28, 98, 226, 30) + [0, 1, 2, 3].map((t) => tx(X(t), 109, String(t), { size: 9.5, fill: K.ink })).join('') + tx(228, 92, 't(일)', { size: 9, anchor: 'end' })
    + pts + lab.map(([x, y, a], i) => tx(x, Math.round(y), String(V[i]), { size: 9.5, bold: true, fill: i === 3 ? K.a : K.ink, anchor: a, pop: 0.3 + i * 0.55 })).join('')
    + tx(X(1.5) - 6, 62, '하루마다 ×3', { size: 9.5, fill: K.am, bold: true, pop: 1.0 })
    + tx(120, 46, '가정한 모형', { size: 9, pop: 2.2 }),
  );
}

function designSquare() {
  const poster = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${K.f}" stroke="${K.p}" stroke-width="1"/><circle cx="${n1(x + w * 0.5)}" cy="${n1(y + h * 0.38)}" r="${n1(w * 0.22)}" fill="${K.am}"/><path d="M${n1(x + w * 0.18)} ${n1(y + h * 0.72)}H${n1(x + w * 0.82)}M${n1(x + w * 0.28)} ${n1(y + h * 0.84)}H${n1(x + w * 0.72)}" stroke="${K.p}" stroke-width="${n1(w * 0.07)}" stroke-linecap="round"/>`;
  const bx = 100, by = 22, sw = 30, sh = 40;
  const tiles = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j], k) => pop(0.4 + k * 0.25, poster(bx + i * sw, by + j * sh, sw, sh))).join('');
  return svg(
    poster(20, 62, sw, sh) + `<rect x="20" y="62" width="${sw}" height="${sh}" fill="none" stroke="${K.p}" stroke-width="1.8"/>`
    + `<path d="M20 56H50M20 53V59M50 53V59" stroke="${K.ink}" stroke-width="1.2"/>` + tx(35, 50, '15 cm', { size: 9.5, bold: true, fill: K.ink })
    + tx(35, 114, '처음 포스터', { size: 9 })
    + arrow(58, 82, 92, 82, 0.1) + tx(75, 74, '넓이 ×4', { size: 9.5, bold: true, fill: K.p })
    + `<rect x="${bx}" y="${by}" width="60" height="80" fill="none" stroke="${K.l}" stroke-width="1"/>` + tiles
    + pop(1.4, `<rect x="${bx}" y="${by}" width="60" height="80" fill="none" stroke="${K.p}" stroke-width="1.8"/>`)
    + dr(`M${bx} 110H${bx + 30}`, 1.5, { color: K.a, w: 2.2 }) + dr(`M${bx + 30} 110H${bx + 60}`, 1.9, { color: K.a, w: 2.2 })
    + pop(1.5, `<path d="M${bx} 107V113M${bx + 30} 108V112M${bx + 60} 107V113" stroke="${K.a}" stroke-width="1.2"/>`)
    + tx(bx + 30, 16, '30 cm', { size: 10, bold: true, fill: K.a, pop: 2.4 })
    + tx(204, 48, 'k² = 4', { math: true, size: 11.5, pop: 2.4 }) + tx(204, 68, 'k = 4¹ᐟ² = 2', { math: true, size: 11.5, pop: 2.7 })
    + tx(204, 88, '길이는 ×2', { size: 10, bold: true, fill: K.a, pop: 2.9 }),
  );
}

function animalSim() {
  const bunny = (x: number, y: number, c: string) =>
    `<path d="M${x - 1.2} ${y - 3}l-.8-4.2M${x + 1.2} ${y - 3}l.8-4.2" stroke="${c}" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="${x}" cy="${y}" rx="3" ry="2.7" fill="${c}"/>`;
  const herd = (x0: number, cols: number, from: number, c: string) => {
    let s = '';
    for (let i = from; i < cols; i++) for (let j = 0; j < 3; j++) s += bunny(x0 + 5 + i * 7, 54 + j * 10, c);
    return s;
  };
  const patch = (x: number, cols: number) => `<rect x="${x}" y="42" width="${cols * 7 + 6}" height="36" rx="8" fill="${K.f}" stroke="${K.l}" stroke-width="1"/>`;
  const P = [18, 78, 152];
  return svg(
    tx(120, 16, 'A(n) = 12 × 1.5ⁿ', { math: true, size: 11.5 })
    + patch(P[0], 4) + herd(P[0], 4, 0, K.p)
    + patch(P[1], 6) + herd(P[1], 4, 0, K.p) + pop(0.7, herd(P[1], 6, 4, K.a))
    + patch(P[2], 9) + herd(P[2], 6, 0, K.p) + pop(1.8, herd(P[2], 9, 6, K.a))
    + arrow(54, 60, 74, 60, 0.2) + tx(64, 52, '×1.5', { size: 9, bold: true, fill: K.p })
    + arrow(128, 60, 148, 60, 1.3) + tx(138, 52, '×1.5', { size: 9, bold: true, fill: K.p })
    + tx(P[1] + 5 + 4.5 * 7, 36, '+6', { size: 10, bold: true, fill: K.a, pop: 0.8 }) + tx(P[2] + 5 + 6.5 * 7 + 3.5, 36, '+9', { size: 10, bold: true, fill: K.a, pop: 1.9 })
    + tx(35, 94, '12마리', { size: 10, bold: true, fill: K.ink }) + tx(102, 94, '18마리', { size: 10, bold: true, fill: K.ink, pop: 1.0 }) + tx(186.5, 94, '27마리', { size: 10, bold: true, fill: K.a, pop: 2.1 })
    + tx(35, 109, 'n = 0', { math: true, size: 10.5 }) + tx(102, 109, 'n = 1', { math: true, size: 10.5 }) + tx(186.5, 109, 'n = 2', { math: true, size: 10.5 }),
  );
}

function travelZoom() {
  const ys = [30, 50, 70, 90], L = [10, 20, 40, 80], x0 = 70;
  const zoom = `<rect x="8" y="34" width="22" height="44" rx="5" fill="${W}" stroke="${K.p}" stroke-width="1.5"/><path d="M8 56H30" stroke="${K.l}" stroke-width="1"/><path d="M13 45H25M19 39V51M13 67H25" stroke="${K.p}" stroke-width="2" stroke-linecap="round"/>`;
  const map = `<rect x="38" y="18" width="150" height="84" rx="4" fill="${K.f}"/><path d="M38 38.5h150v3H38zM38 78.5h150v3H38zM98.5 18h3v84h-3zM148.5 18h3v84h-3z" fill="${W}"/>`;
  const rows = ys.map((y, i) => {
    const t = 0.1 + i * 0.35;
    return pop(t, `<circle cx="${x0}" cy="${y}" r="2.4" fill="${K.p}"/>`) + grow(`M${x0} ${y}H${x0 + L[i]}`, t, K.p, 4)
      + tx(x0 + L[i] + 5, y + 3.5, `${L[i]} cm`, { size: 9.5, bold: true, fill: i === 3 ? K.a : K.ink, anchor: 'start', pop: t + 0.6 })
      + tx(64, y + 3.5, ['처음', '1번', '2번', '3번'][i], { size: 9, anchor: 'end', fill: K.ink });
  }).join('');
  const counts = [0, 1, 2].map((i) => {
    const t = 1.8 + i * 0.35;
    return arrow(200, ys[i] + 4, 200, ys[i + 1] - 4, t, { color: K.a, w: 1.6 }) + tx(206, (ys[i] + ys[i + 1]) / 2 + 3.5, `×2`, { size: 9.5, bold: true, fill: K.a, anchor: 'start', pop: t + 0.3 });
  }).join('');
  return svg(
    map + zoom + rows + counts
    + tx(212, 112, 'x = log₂8 = 3', { math: true, size: 11, anchor: 'end', pop: 3.0 }) + tx(42, 113, '2ˣ = 8', { math: true, size: 11, anchor: 'start', pop: 2.9 })
    + tx(212, 14, '확대 횟수', { size: 9, fill: K.a, anchor: 'end', pop: 1.8 }),
  );
}

function carPower() {
  const X = (t: number) => 48 + 40 * t, Y = (p: number) => 100 - p;
  const P = (t: number) => 80 * Math.pow(0.5, t / 2);
  const battery = (y: number, frac: number) => `<rect x="4" y="${y - 4.5}" width="16" height="9" rx="1.5" fill="${W}" stroke="${K.p}" stroke-width="1.2"/><rect x="20" y="${y - 2}" width="2" height="4" fill="${K.p}"/><rect x="5.5" y="${y - 3}" width="${n1(13 * frac)}" height="6" fill="${K.am}"/>`;
  const toy = `<path d="M150 34V28Q150 24 156 24H166L172 18H186L192 24H198Q202 24 202 28V34Z" fill="${K.p}"/><path d="M174 20H184L188 24H172Z" fill="${W}" fill-opacity=".8"/><path d="M196 24L200 10" stroke="${K.ink}" stroke-width="1"/><circle cx="200" cy="10" r="1.8" fill="${K.a}"/><circle cx="160" cy="35" r="4.5" fill="${K.ink}"/><circle cx="160" cy="35" r="1.6" fill="${W}"/><circle cx="192" cy="35" r="4.5" fill="${K.ink}"/><circle cx="192" cy="35" r="1.6" fill="${W}"/>`;
  return svg(
    toy + tx(176, 54, 'P(t) = 80 × (1/2)ᵗᐟ²', { math: true, size: 11 })
    + battery(Y(80), 1) + battery(Y(40), 0.5) + battery(Y(20), 0.25)
    + tx(42, Y(80) + 3.5, '80', { size: 9, anchor: 'end', fill: K.ink }) + tx(42, Y(40) + 3.5, '40', { size: 9, anchor: 'end', fill: K.ink }) + tx(42, Y(20) + 3.5, '20', { size: 9, anchor: 'end', fill: K.ink })
    + axes(48, 100, 216, 12) + [0, 1, 2, 3, 4].map((t) => tx(X(t), 111, String(t), { size: 9.5, fill: t === 1 || t === 4 ? K.a : K.ink, bold: t === 1 || t === 4 })).join('') + tx(234, 92, 't(시간)', { size: 9, anchor: 'end' })
    + dr(curve(P, 0, 4, X, Y), 0.1, { color: K.p, w: 2.2 })
    + arrow(X(1), 97, X(1), Y(P(1)) + 4, 1.1, { color: K.a, w: 1.6 }) + pop(1.7, `<circle cx="${X(1)}" cy="${n1(Y(P(1)))}" r="3.2" fill="${K.a}"/>`)
    + arrow(X(1) - 4, Y(P(1)), 51, Y(P(1)), 1.8, { color: K.a, w: 1.6 }) + tx(42, Y(P(1)) + 3.5, '≈56.57', { size: 9, bold: true, fill: K.a, anchor: 'end', pop: 2.4 })
    + pop(2.6, guide(`M${X(4)} 97V${Y(20) + 4}`, K.a) + `<circle cx="${X(4)}" cy="${Y(20)}" r="3.2" fill="${K.a}"/>`)
    + tx(X(4), Y(20) - 7, 'P(4) = 20', { math: true, size: 10.5, anchor: 'middle', pop: 2.8 }),
  );
}

function healthMarker() {
  const X = (t: number) => 50 + 46 * t, Y = (m: number) => 90 - 0.6 * m;
  const M = (t: number) => 100 * Math.pow(0.5, t);
  const screen = `<rect x="6" y="4" width="228" height="100" rx="5" fill="${K.p}"/><rect x="10" y="8" width="220" height="92" rx="2" fill="${W}"/><path d="M110 104L106 114H134L130 104Z" fill="${K.p}"/><path d="M98 115H142" stroke="${K.p}" stroke-width="2.4" stroke-linecap="round"/>`;
  const dropIcon = `<path d="M20 12c-3 4-4.5 6-4.5 8a4.5 4.5 0 0 0 9 0c0-2-1.5-4-4.5-8z" fill="${K.a}"/>`;
  return svg(
    screen + dropIcon + tx(28, 21, '가상 색소 M', { size: 9, anchor: 'start', fill: K.ink })
    + axes(50, 90, 222, 26) + [0, 1, 2, 3].map((t) => tx(X(t), 99.5, String(t), { size: 9, fill: t === 2 ? K.a : K.ink, bold: t === 2 })).join('') + tx(226, 84, 't(시간)', { size: 9, anchor: 'end' })
    + tx(46, Y(100) + 3.5, '100', { size: 9, anchor: 'end', fill: K.ink }) + tx(46, Y(50) + 3.5, '50', { size: 9, anchor: 'end', fill: K.ink })
    + dr(curve(M, 0, 3, X, Y), 0.1, { color: K.p, w: 2.2 })
    + tx(46, Y(25) + 3.5, '25', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 1.0 })
    + arrow(X(0) + 2, Y(25), X(2) - 4, Y(25), 1.1, { color: K.a, w: 1.8 }) + pop(1.7, `<circle cx="${X(2)}" cy="${Y(25)}" r="3.4" fill="${K.a}"/>`)
    + arrow(X(2), Y(25) + 4, X(2), 87, 1.8, { color: K.a, w: 1.8 })
    + tx(224, 42, '100 × (1/2)ᵗ = 25', { math: true, size: 10.5, anchor: 'end', pop: 2.4 }) + tx(224, 58, '2ᵗ = 4 ⇔ t = 2', { math: true, size: 11, anchor: 'end', pop: 2.7 }),
  );
}

function environmentPaper() {
  const base = 96, s = 0.3, xs = [30, 110, 190], w = 34;
  const stack = (x: number, n: number) => {
    const h = n * s;
    let lines = '';
    for (let y = base - 4; y > base - h + 1; y -= 4) lines += `M${x + 2} ${n1(y)}H${x + w - 2}`;
    return `<rect x="${x}" y="${n1(base - h)}" width="${w}" height="${n1(h)}" fill="${W}" stroke="${K.p}" stroke-width="1.4"/><path d="${lines}" stroke="${K.l}" stroke-width=".8"/>`;
  };
  const cut = (x: number, from: number, to: number) => `<rect x="${x}" y="${n1(base - from * s)}" width="${w}" height="${n1((from - to) * s)}" fill="${K.a}" fill-opacity=".12" stroke="${K.a}" stroke-width="1" stroke-dasharray="3 2"/>`;
  return svg(
    tx(120, 14, 'U(n) = 200 × 0.8ⁿ', { math: true, size: 11.5 })
    + stack(xs[0], 200)
    + pop(0.7, stack(xs[1], 160)) + pop(0.9, cut(xs[1], 200, 160)) + tx(xs[1] - 4, 47, '−40', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 1.0 })
    + pop(1.8, stack(xs[2], 128)) + pop(2.0, cut(xs[2], 160, 128)) + tx(xs[2] - 4, 57, '−32', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 2.1 })
    + arrow(70, 74, 104, 74, 0.2) + tx(87, 66, '×0.8', { size: 9.5, bold: true, fill: K.p })
    + arrow(150, 78, 184, 78, 1.3) + tx(167, 70, '×0.8', { size: 9.5, bold: true, fill: K.p })
    + tx(47, 108, '200장', { size: 10, bold: true, fill: K.ink }) + tx(127, 108, '160장', { size: 10, bold: true, fill: K.ink, pop: 1.0 }) + tx(207, 108, '128장', { size: 10, bold: true, fill: K.a, pop: 2.2 })
    + tx(47, 29, 'n = 0', { math: true, size: 10.5 }) + tx(127, 29, 'n = 1', { math: true, size: 10.5 }) + tx(207, 29, 'n = 2', { math: true, size: 10.5 }),
  );
}

function aiSearch() {
  const c = 5.5, gx = 12, gy = 30;
  let cells = '';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) cells += `<rect x="${n1(gx + i * c + 0.5)}" y="${n1(gy + j * c + 0.5)}" width="4.5" height="4.5" rx="1" fill="${K.p}" fill-opacity=".75"/>`;
  const masks: [number, number, number, number][] = [[4, 0, 4, 8], [0, 4, 4, 4], [2, 0, 2, 4], [0, 2, 2, 2], [1, 0, 1, 2], [0, 1, 1, 1]];
  const N = [64, 32, 16, 8, 4, 2, 1], NX = (i: number) => 78 + 25.5 * i, ny = 62;
  const steps = masks.map(([i, j, w, h], k) => {
    const t = 0.2 + k * 0.38;
    return pop(t + 0.3, `<rect x="${gx + i * c}" y="${gy + j * c}" width="${w * c}" height="${h * c}" fill="${K.bg}" fill-opacity=".85"/>`)
      + dr(`M${NX(k) + 5} ${ny - 12}Q${NX(k) + 12.75} ${ny - 24} ${NX(k + 1) - 5} ${ny - 12}`, t, { color: k < 3 ? K.p : K.a, w: 1.6 })
      + tx(NX(k) + 12.75, ny - 24, String(k + 1), { size: 9, bold: true, fill: k < 3 ? K.p : K.a, pop: t + 0.3 });
  }).join('');
  return svg(
    `<rect x="6" y="14" width="56" height="66" rx="4" fill="${W}" stroke="${K.p}" stroke-width="1.4"/><path d="M6 24H62" stroke="${K.p}" stroke-width="1.2"/><circle cx="11" cy="19" r="1.6" fill="${K.a}"/><circle cx="16" cy="19" r="1.6" fill="${K.am}"/>`
    + cells + steps + pop(2.7, `<rect x="${gx}" y="${gy}" width="${c}" height="${c}" fill="none" stroke="${K.a}" stroke-width="1.6"/>`)
    + tx(34, 94, '후보 64개', { size: 9.5, fill: K.ink }) + tx(34, 107, '반씩 남기기', { size: 9 })
    + N.map((v, i) => tx(NX(i), ny + 4, String(v), { size: 10, bold: true, fill: i === 3 || i === 6 ? K.a : K.ink })).join('')
    + pop(1.4, `<path d="M${NX(0)} 74V78H${NX(3)}V74" fill="none" stroke="${K.p}" stroke-width="1.2"/>`) + tx((NX(0) + NX(3)) / 2, 90, 'log₂(64/8) = 3', { math: true, size: 10, fill: K.p, pop: 1.5 })
    + pop(2.6, `<path d="M${NX(3)} 74V78H${NX(6)}V74" fill="none" stroke="${K.a}" stroke-width="1.2"/>`) + tx((NX(3) + NX(6)) / 2, 90, 'log₂8 = 3', { math: true, size: 10, pop: 2.7 })
    + tx(155, 112, '2ⁿ = 64 ⇔ n = log₂64 = 6', { math: true, size: 11, pop: 3.0 }),
  );
}

function buildingModules() {
  const cw = 12, ch = 10, x0 = 72, b = 98;
  const mod = (i: number, j: number, c: string) => `<rect x="${x0 + i * cw + 1}" y="${b - (j + 1) * ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="1" fill="${c}" fill-opacity=".85"/>`;
  const range = (a: number, z: number) => Array.from({ length: z - a }, (_, k) => a + k);
  const row = (j: number, cols: number[], c: string) => cols.map((i) => mod(i, j, c)).join('');
  const steps: [number, string][] = [
    [0.3, row(0, [1], K.am)], [0.7, row(0, [2, 3], K.am)], [1.1, row(0, range(4, 8), K.am)],
    [1.6, row(1, range(0, 8), K.a)], [2.0, row(2, range(0, 8), K.a) + row(3, range(0, 8), K.a)],
  ];
  const counter = ['2⁰ = 1', '2¹ = 2', '2² = 4', '2³ = 8', '2⁴ = 16', '2⁵ = 32'];
  return svg(
    tx(120, 14, '2³ × 2² = 2³⁺² = 2⁵ = 32', { math: true, size: 11.5 })
    + `<path d="M${x0 - 4} ${b}V${b - 46}H${x0 + 100}V${b}" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="M${x0 - 12} ${b}H${x0 + 108}" stroke="${K.m}" stroke-width="1.6"/>`
    + mod(0, 0, K.am) + steps.map(([t, g]) => pop(t, g)).join('')
    + counter.map((s, k) => tx(8, 34 + k * 13, s, { math: true, size: 10, anchor: 'start', fill: k < 4 ? K.p : K.a, bold: true, pop: k === 0 ? undefined : steps[k - 1][0] })).join('')
    + pop(1.2, `<path d="M${x0} ${b + 4}V${b + 7}H${x0 + 96}V${b + 4}" fill="none" stroke="${K.am}" stroke-width="1.2"/>`) + tx(x0 + 48, b + 18, '가로 2³ = 8칸', { size: 9.5, bold: true, fill: K.ink, pop: 1.3 })
    + pop(2.1, `<path d="M${x0 + 104} ${b}H${x0 + 107}V${b - 40}H${x0 + 104}" fill="none" stroke="${K.a}" stroke-width="1.2"/>`) + tx(x0 + 112, b - 24, '세로', { size: 9.5, bold: true, fill: K.ink, anchor: 'start', pop: 2.2 }) + tx(x0 + 112, b - 11, '2² = 4칸', { size: 9.5, bold: true, fill: K.ink, anchor: 'start', pop: 2.2 })
    + tx(30, 116, '×2를 5번', { size: 9, fill: K.a, pop: 2.4 }),
  );
}

function stageInverse() {
  const u = 11, ox = 128, oy = 102, X = (x: number) => ox + u * x, Y = (y: number) => oy - u * y;
  const fader = `<rect x="14" y="30" width="34" height="76" rx="4" fill="${K.f}" stroke="${K.p}" stroke-width="1.4"/><path d="M26 96V40" stroke="${K.l}" stroke-width="4" stroke-linecap="round"/>`
    + [0, 1, 2, 3].map((v) => `<path d="M32 ${96 - v * 18.67}h4" stroke="${K.m}" stroke-width="1"/>`).join('')
    + [0, 1, 2, 3].map((v) => tx(42, 96 - v * 18.67 + 3.5, String(v), { size: 9, fill: v === 2 ? K.a : K.ink, bold: v === 2 })).join('');
  const bulb = `<circle cx="84" cy="46" r="9" fill="${K.am}"/><rect x="80" y="54" width="8" height="6" fill="${K.p}"/>`;
  const rays = [-60, -20, 20, 60].map((a, i) => {
    const r = (a * Math.PI) / 180;
    return `<path d="M${n1(84 + 12 * Math.sin(r))} ${n1(46 - 12 * Math.cos(r))}L${n1(84 + 18 * Math.sin(r))} ${n1(46 - 18 * Math.cos(r))}" stroke="${K.am}" stroke-width="2" stroke-linecap="round"/>`;
  }).join('');
  return svg(
    tx(31, 22, '조절값 x', { size: 9, fill: K.ink }) + fader + grow('M26 96V58.7', 0.6, K.a, 4) + pop(1.3, `<rect x="19" y="54.7" width="14" height="8" rx="2" fill="${K.p}"/>`)
    + bulb + pop(1.5, rays) + tx(84, 76, '밝기 비율', { size: 9, fill: K.ink }) + tx(84, 89, 'y = 4', { math: true, size: 11, pop: 1.5 })
    + axes(ox, oy, 226, 10) + guide(`M${X(0)} ${Y(0)}L${X(8)} ${Y(8)}`, K.l)
    + [2, 4, 8].map((v) => tx(X(v), 113, String(v), { size: 9, fill: K.ink }) + tx(ox - 4, Y(v) + 3.5, String(v), { size: 9, anchor: 'end', fill: K.ink })).join('')
    + dr(curve((x) => 2 ** x, 0, 3, X, Y), 0.1, { color: K.a, w: 2.2 }) + tx(X(3) + 6, Y(8) + 8, 'y = 2ˣ', { math: true, size: 10.5, anchor: 'start' })
    + pop(1.6, `<circle cx="${X(2)}" cy="${Y(4)}" r="3.2" fill="${K.a}"/>`)
    + dr(curve(Math.log2, 1, 8, X, Y), 1.9, { color: K.p, w: 2.2 }) + tx(236, 62, 'y = log₂x', { math: true, size: 10.5, fill: K.p, anchor: 'end', pop: 2.5 }) + tx(84, 105, 'x = log₂4 = 2', { math: true, size: 10.5, pop: 2.9 })
    + pop(2.5, guide(`M${X(2)} ${Y(4)}L${X(4)} ${Y(2)}`, K.a) + `<circle cx="${X(4)}" cy="${Y(2)}" r="3.2" fill="${K.p}"/>`)
    + pop(1.7, guide(`M${X(2)} ${Y(4)}V${oy}M${X(2)} ${Y(4)}H${ox}`, K.a)) + tx(X(4) + 5, Y(2) + 13, '(4, 2)', { size: 9, anchor: 'start', fill: K.p, bold: true, pop: 2.7 }),
  );
}

const drawings: Record<string, string> = {
  'game-reward': gameReward(),
  'music-scale': musicScale(),
  'sports-flags': sportsFlags(),
  'fashion-dilution': fashionDilution(),
  'cooking-mold': cookingMold(),
  'sns-growth': snsGrowth(),
  'design-square': designSquare(),
  'animal-sim': animalSim(),
  'travel-zoom': travelZoom(),
  'car-power': carPower(),
  'health-marker': healthMarker(),
  'environment-paper': environmentPaper(),
  'ai-search': aiSearch(),
  'building-modules': buildingModules(),
  'stage-inverse': stageInverse(),
};
export default drawings;
