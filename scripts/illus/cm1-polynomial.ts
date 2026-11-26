/**
 * 공통수학1 '다항식의 연산' 예시 그림 원본(240×120). 예전 200×90 단순 그림(illus 키)을 바꾼다.
 * `node scripts/write-illus.ts cm1-polynomial`로 content/sets/cm1-polynomial.json의 svg 칸에 써 넣는다(illus는 null).
 * 곡선은 실제 식으로 그리고, 나눗셈·전개·값 넣기처럼 순서가 수학인 부분만 차례로 움직인다.
 */
import { qrModules } from '../../lib/illus.ts';
import { K, W, tx, dr, ring, svg, pop, n1, arrow, axes, curve, guide } from './kit.ts';

/* ---- 도우미 ---- */

/** 꺾인 화살표(한 조각 path) + 끝 머리. 머리는 선이 거의 다 그려진 뒤 나타난다 */
function bentArrow(d: string, ex: number, ey: number, dir: 'l' | 'r' | 'u' | 'd', at: number, color: string = K.p, w = 1.8) {
  const h = { l: `M${ex + 5} ${ey - 4}L${ex} ${ey}L${ex + 5} ${ey + 4}`, r: `M${ex - 5} ${ey - 4}L${ex} ${ey}L${ex - 5} ${ey + 4}`, u: `M${ex - 4} ${ey + 5}L${ex} ${ey}L${ex + 4} ${ey + 5}`, d: `M${ex - 4} ${ey - 5}L${ex} ${ey}L${ex + 4} ${ey - 5}` }[dir];
  return dr(d, at, { color, w }) + `<path class="pop" style="--d:${(at + 0.6).toFixed(2)}s" d="${h}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** 지속시간을 정한 선 그리기 */
const seg = (d: string, at: number, dur: number, color: string, w: number) =>
  `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s;animation-duration:${dur}s" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt"/>`;

/* ---- 카드별 그림 ---- */

/** QR: 정보 P(x)를 G(x)로 나눠 몫·나머지가 나오고, 나머지 R(x)를 코드 안에 함께 적는다 → 찢어져도 복원 */
function qr() {
  const mods = qrModules(21, 4, 8, 18, 3, 0.3).replace(/#fff/g, W);
  const tear = `<path d="M44 18L66 18L66 26L60 30L64 36L56 40L50 34L44 38Z" fill="${K.bg}" stroke="${K.a}" stroke-width="1.4" stroke-dasharray="2.5 2" stroke-linejoin="round"/>`;
  const chip = (x: number, w: number, s: string, fill: string, op = 1) => `<rect x="${x}" y="34" width="${w}" height="20" rx="4" fill="${fill}"${op < 1 ? ` fill-opacity="${op}"` : ''} stroke="${K.p}" stroke-width="1.3"/>${tx(x + w / 2, 48, s, { size: 10, fill: K.ink })}`;
  return svg(
    `<rect x="4" y="14" width="92" height="92" rx="3" fill="${W}"/><g fill="${K.ink}">${mods}</g>`
    + tx(50, 116, 'QR 코드', { size: 9 })
    + tx(166, 22, '정보 P(x) ÷ 약속 G(x)', { size: 10, fill: K.ink })
    + pop(0.2, chip(104, 56, '몫 Q(x)', K.f)) + pop(0.5, chip(168, 66, '나머지 R(x)', K.am, 0.45))
    + bentArrow('M201 54V66H100', 100, 66, 'l', 0.8, K.a)
    + pop(1.5, `<rect x="64" y="66" width="28" height="36" fill="${K.am}" fill-opacity=".45" stroke="${K.a}" stroke-width="1.4"/>`)
    + tx(166, 84, 'P(x) = G(x)Q(x) + R(x)', { math: true, size: 11, pop: 1.6 })
    + pop(2.1, tear) + tx(55, 10, '찢어진 곳', { size: 9, fill: K.a, pop: 2.1 })
    + dr('M118 106l4 4 8-9', 2.5, { color: K.p, w: 2.2 }) + tx(136, 110, '나머지로 찾아 되살림', { size: 9.5, bold: true, fill: K.p, anchor: 'start', pop: 2.6 }),
  );
}

/** 레벨 막대: E(n) = n³까지 쌓인 경험치. 앞 레벨까지(회색) 위에 새로 필요한 양(+7, +19, +37)이 차오른다 */
function xp() {
  const base = 98, sc = 76 / 64, xs = [30, 66, 102, 138];
  const E = (n: number) => n ** 3;
  const bars = xs.map((x, i) => {
    const n = i + 1, prev = E(n - 1), cur = E(n), t = 0.2 + i * 0.45;
    const yPrev = base - prev * sc, yCur = base - cur * sc;
    return (prev ? pop(t, `<rect x="${x - 8}" y="${n1(yPrev)}" width="16" height="${n1(prev * sc)}" fill="${K.l}"/>`) : '')
      + seg(`M${x} ${n1(yPrev)}V${n1(yCur)}`, t + 0.1, 0.35, n === 4 ? K.a : K.am, 16)
      + tx(x, +n1(yCur - 4), String(cur), { size: 10, bold: true, fill: K.ink, pop: t + 0.4 })
      + (n > 1 ? tx(x + 11, +n1((yPrev + yCur) / 2 + 3.5), `+${cur - prev}`, { size: 9, bold: true, fill: K.a, anchor: 'start', pop: t + 0.4 }) : '');
  }).join('');
  const shield = (x: number, n: number) => `<path d="M${x - 11} 102h22v6q0 6-11 9q-11-3-11-9Z" fill="${K.p}"/>${tx(x, 112, `Lv${n}`, { size: 9, bold: true, fill: W })}`;
  return svg(
    `<path d="M12 ${base}H158" stroke="${K.m}" stroke-width="1.2"/>` + xs.map((x, i) => shield(x, i + 1)).join('')
    + tx(12, 14, '레벨까지 필요한 경험치', { size: 9, anchor: 'start' })
    + bars
    + tx(200, 40, 'E(n) = n³', { math: true, size: 12 })
    + tx(200, 62, '다음 레벨까지', { size: 9 }) + tx(200, 76, '+7 → +19 → +37', { size: 9, bold: true, fill: K.a, pop: 1.9 })
    + tx(200, 96, '점점 더 많이', { size: 9.5, bold: true, fill: K.ink, pop: 2.1 }),
  );
}

/** 내비 화면(위에서 본 길): 가까운 차선 점을 찍고, 그 점을 지나는 y = ax² + bx + c를 앞쪽까지 그려 휘는 쪽을 예상 */
function lane() {
  const f = (x: number) => 0.0016 * x * x + 0.04 * x;
  const SX = (x: number) => 30 + x, SY = (y: number) => 86 - y;
  const xs = Array.from({ length: 49 }, (_, i) => -30 + (236 / 48) * i);
  const edge = (o: number) => xs.map((x) => `${n1(SX(x))} ${n1(SY(f(x) + o))}`);
  const road = `M${edge(17).join('L')}L${edge(-17).reverse().join('L')}Z`;
  const pts = [14, 34, 54, 74].map((x, i) => `<circle class="pop" style="--d:${(0.2 + i * 0.2).toFixed(2)}s" cx="${SX(x)}" cy="${n1(SY(f(x)))}" r="3.4" fill="${K.p}" stroke="${W}" stroke-width="1"/>`).join('');
  return svg(
    `<rect x="2" y="2" width="236" height="116" rx="10" fill="${K.f}"/>`
    + `<path d="${road}" fill="${K.l}"/><path d="M${edge(17).join('L')}M${edge(-17).join('L')}" fill="none" stroke="${W}" stroke-width="1.6"/>`
    + `<path d="M${SX(0)} ${SY(0)}L${SX(92)} ${n1(SY(f(92) + 26))}L${SX(92)} ${n1(SY(f(92) - 26))}Z" fill="${K.am}" fill-opacity=".25"/>`
    + `<path d="M${SX(-14)} ${SY(-7)}L${SX(4)} ${SY(0)}L${SX(-14)} ${SY(7)}L${SX(-9)} ${SY(0)}Z" fill="${K.p}" stroke="${W}" stroke-width="1.2" stroke-linejoin="round"/>`
    + tx(58, 110, '카메라가 본 곳', { size: 9, fill: K.ink })
    + pts
    + dr(curve(f, 0, 200, SX, SY, 40), 1.1, { color: K.a, w: 2.4 })
    + tx(150, 30, '앞으로 휘는 쪽 예상', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 2.1 })
    + tx(232, 102, 'y = ax² + bx + c', { math: true, size: 11.5, anchor: 'end', pop: 2.2 }),
  );
}

/** 던진 공의 높이 그래프 h(t)와 조립제법: h(t)를 (t − 2)로 나눈 나머지 6이 h(2) = 6과 같다 */
function ball() {
  const h = (t: number) => -5 * t * t + 12 * t + 2;
  const X = (t: number) => 20 + 52 * t, Y = (v: number) => 106 - 9 * v;
  const root = (12 + Math.sqrt(184)) / 10;
  const baseball = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${W}" stroke="${K.p}" stroke-width="1.3"/><path d="M${n1(cx - 3)} ${n1(cy - 4.4)}q2 4.4 0 8.8M${n1(cx + 3)} ${n1(cy - 4.4)}q-2 4.4 0 8.8" fill="none" stroke="${K.a}" stroke-width="1"/>`;
  const C = [182, 204, 226];
  return svg(
    axes(20, 106, 160, 12) + tx(24, 12, 'h (m)', { size: 9, anchor: 'start' }) + tx(160, 117, 't(초)', { size: 9, anchor: 'end' })
    + tx(11, Y(2) + 3.5, '2', { size: 9, anchor: 'end' })
    + dr(curve(h, 0, root, X, Y), 0.1, { color: K.p, w: 2.2 }) + baseball(X(0), Y(2))
    + pop(1.1, guide(`M${X(2)} 106V${Y(6)}H20`, K.a) + baseball(X(2), Y(6)))
    + tx(X(2), 117, '2', { size: 9.5, bold: true, fill: K.a, pop: 1.1 }) + tx(16, Y(6) + 3.5, '6', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 1.1 })
    + tx(75, 86, 'h(t) = −5t² + 12t + 2', { math: true, size: 9.5 })
    + tx(204, 12, 'h(t) ÷ (t − 2)', { math: true, size: 10.5 })
    + `<path d="M170 22V64M170 50H236" fill="none" stroke="${K.ink}" stroke-width="1.2"/>` + tx(165, 34, '2', { size: 10, bold: true, fill: K.a, anchor: 'end' })
    + ['−5', '12', '2'].map((s, i) => tx(C[i], 34, s, { size: 10, fill: K.ink })).join('')
    + tx(C[1], 46, '−10', { size: 10, fill: K.m, pop: 1.5 }) + tx(C[2], 46, '4', { size: 10, fill: K.m, pop: 1.9 })
    + tx(C[0], 62, '−5', { size: 10, fill: K.ink, pop: 1.3 }) + tx(C[1], 62, '2', { size: 10, fill: K.ink, pop: 1.7 })
    + tx(C[2], 62, '6', { size: 11, bold: true, fill: K.a, pop: 2.1 }) + dr(ring(C[2], 58, 8), 2.1, { w: 1.6 })
    + tx(204, 84, '나머지 6', { size: 10, bold: true, fill: K.a, pop: 2.4 }) + tx(204, 98, '= h(2)', { math: true, size: 11, pop: 2.5 }),
  );
}

/** 디자인 프로그램: 조절점 P₁을 끌어 옮기면 3차 곡선 B(t)가 새 모양으로 다시 그려진다 */
function bezier() {
  const P0 = [44, 92], P1 = [64, 22], P2 = [150, 98], P3 = [204, 30], Q1 = [124, 18];
  const B = (a: number[], b: number[], c: number[], d: number[]) => 'M' + Array.from({ length: 41 }, (_, i) => {
    const t = i / 40, u = 1 - t;
    const p = [0, 1].map((k) => u ** 3 * a[k] + 3 * t * u * u * b[k] + 3 * t * t * u * c[k] + t ** 3 * d[k]);
    return `${n1(p[0])} ${n1(p[1])}`;
  }).join('L');
  const sq = (p: number[], c: string) => `<rect x="${p[0] - 3.5}" y="${p[1] - 3.5}" width="7" height="7" fill="${W}" stroke="${c}" stroke-width="1.5"/>`;
  const dot = (p: number[]) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${K.p}"/>`;
  const nib = `<path d="M16 22l-5 8 5 6 5-6Z" fill="${W}"/><path d="M16 30v-4" stroke="${K.p}" stroke-width="1.2"/>`;
  const pointer = `<path d="M15 46l0 10 3-2.5 2 4.4 2-.9-2-4.4 3.8-.3Z" fill="${K.f}"/>`;
  return svg(
    `<rect x="6" y="8" width="20" height="96" rx="4" fill="${K.p}"/>` + `<rect x="9" y="17" width="14" height="23" rx="3" fill="${K.a}"/>` + nib + pointer
    + `<rect x="30" y="8" width="204" height="96" rx="3" fill="${W}"/>`
    + `<path d="M${P0}L${P1}M${P2}L${P3}" stroke="${K.m}" stroke-width="1"/>` + `<path d="${B(P0, P1, P2, P3)}" fill="none" stroke="${K.p}" stroke-width="2.4"/>`
    + dot(P0) + dot(P3) + sq(P1, K.m) + sq(P2, K.m)
    + tx(P0[0] - 6, P0[1] + 4, 'P₀', { math: true, size: 10, anchor: 'end', fill: K.p }) + tx(P1[0] - 7, P1[1] + 4, 'P₁', { math: true, size: 10, anchor: 'end', fill: K.p })
    + tx(P2[0] + 7, P2[1] + 1, 'P₂', { math: true, size: 10, anchor: 'start', fill: K.p }) + tx(P3[0] + 7, P3[1] + 4, 'P₃', { math: true, size: 10, anchor: 'start', fill: K.p })
    + arrow(P1[0] + 6, P1[1] - 1, Q1[0] - 6, Q1[1] + 1, 0.2, { color: K.a, w: 1.8 })
    + pop(0.9, `<path d="M${P0}L${Q1}" stroke="${K.a}" stroke-width="1"/>` + sq(Q1, K.a))
    + dr(B(P0, Q1, P2, P3), 1.1, { color: K.a, w: 2.4 })
    + tx(132, 34, '끌어 옮김', { size: 9, fill: K.a, anchor: 'start', pop: 0.9 })
    + tx(120, 116, 'B(t) = (1−t)³P₀ + 3t(1−t)²P₁ + ⋯', { math: true, size: 10, pop: 2.1 }),
  );
}

/** 디스토션 페달: 입력 파형 → 페달 화면의 y = x − x³/3(큰 값일수록 더 눌림) → 꼭대기가 눌린 출력 파형 */
function wave() {
  const g = (x: number) => x - x ** 3 / 3;
  const A = 20, mid = 54;
  const wavePath = (x0: number, x1: number, fn: (s: number) => number) => 'M' + Array.from({ length: 49 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 48, s = Math.sin((2 * Math.PI * (x - x0)) / ((x1 - x0) / 2));
    return `${n1(x)} ${n1(mid - A * fn(s))}`;
  }).join('L');
  const X = (x: number) => 120 + 30 * x, Y = (y: number) => 48 - 30 * y;
  return svg(
    `<path d="M4 ${mid - A}H58M4 ${mid + A}H58" stroke="${K.l}" stroke-width="1" stroke-dasharray="2 2"/><path d="M182 ${mid - A}H236M182 ${mid + A}H236" stroke="${K.l}" stroke-width="1" stroke-dasharray="2 2"/>`
    + tx(31, 92, '입력 x', { size: 9.5, fill: K.ink }) + tx(31, 105, '−1 ~ 1', { size: 9 }) + tx(209, 92, '출력 y', { size: 9.5, fill: K.ink }) + tx(209, 105, '꼭대기 2/3', { size: 9, fill: K.a, pop: 2.6 })
    + dr(wavePath(4, 58, (s) => s), 0.1, { color: K.p, w: 2 })
    + `<path d="M58 ${mid}H70M170 ${mid}H182" stroke="${K.ink}" stroke-width="2"/>`
    + `<rect x="70" y="6" width="100" height="108" rx="8" fill="${K.a}"/><rect x="78" y="14" width="84" height="68" rx="3" fill="${W}"/>`
    + `<path d="M${X(-1.2)} ${Y(0)}H${X(1.2)}M${X(0)} ${Y(-1.12)}V${Y(1.12)}" stroke="${K.l}" stroke-width="1"/>`
    + guide(`M${X(-1)} ${Y(-1)}L${X(1)} ${Y(1)}`)
    + dr(curve(g, -1, 1, X, Y, 32), 0.8, { color: K.p, w: 2.2 })
    + arrow(X(1), Y(1) + 1, X(1), Y(2 / 3) - 1, 1.5, { color: K.a, w: 1.8 }) + arrow(X(-1), Y(-1) - 1, X(-1), Y(-2 / 3) + 1, 1.5, { color: K.a, w: 1.8 })
    + tx(84, 30, '1 → 2/3', { math: true, size: 10, anchor: 'start', fill: K.a, pop: 2.0 })
    + tx(158, 78, 'y = x − x³/3', { math: true, size: 9.5, anchor: 'end', fill: K.p })
    + `<circle cx="94" cy="96" r="7" fill="${K.ink}"/><path d="M94 96l3-5" stroke="${W}" stroke-width="1.5"/><circle cx="146" cy="96" r="7" fill="${K.ink}"/><path d="M146 96l-4-4" stroke="${W}" stroke-width="1.5"/>`
    + tx(120, 100, 'DIST', { size: 9, bold: true, fill: W })
    + dr(wavePath(182, 236, g), 2.0, { color: K.a, w: 2 }),
  );
}

/** 사진 앱 곡선: 어두운 쪽 점을 끌어올리면 3차 곡선이 다시 그려지고, 사진의 어두운 부분만 밝아진다 */
function tone() {
  const f = (x: number) => 1.2 * x ** 3 - 2.4 * x * x + 2.2 * x;
  const X = (x: number) => 12 + 90 * x, Y = (y: number) => 102 - 90 * y;
  const photo = (x: number, wall: string, sofa: string) =>
    `<rect x="${x}" y="12" width="56" height="44" rx="2" fill="${wall}"/><rect x="${x + 30}" y="18" width="18" height="18" fill="${W}"/><path d="M${x + 39} 18v18M${x + 30} 27h18" stroke="${K.l}" stroke-width="1.2"/><path d="M${x + 6} 56V44q0-4 4-4h16q4 0 4 4V56Z" fill="${sofa}"/>`;
  return svg(
    `<rect x="${X(0)}" y="${Y(1)}" width="90" height="90" fill="${W}"/><path d="M${X(0.5)} ${Y(1)}V${Y(0)}M${X(0)} ${Y(0.5)}H${X(1)}" stroke="${K.f}" stroke-width="1"/><rect x="${X(0)}" y="${Y(1)}" width="90" height="90" fill="none" stroke="${K.l}" stroke-width="1"/>`
    + guide(`M${X(0)} ${Y(0)}L${X(1)} ${Y(1)}`)
    + tx(X(0), 114, '어두운 쪽', { size: 9, anchor: 'start' }) + tx(X(1), 114, '밝은 쪽', { size: 9, anchor: 'end' })
    + `<circle cx="${X(0.25)}" cy="${Y(0.25)}" r="3" fill="${K.l}"/>`
    + arrow(X(0.25), Y(0.25) - 4, X(0.25), Y(f(0.25)) + 1, 0.1, { color: K.a, w: 1.8 })
    + dr(curve(f, 0, 1, X, Y), 0.8, { color: K.p, w: 2.4 }) + pop(0.6, `<circle cx="${X(0.25)}" cy="${n1(Y(f(0.25)))}" r="4" fill="${K.a}"/>`)
    + photo(112, K.ink, K.p) + photo(178, K.m, K.p) + pop(1.7, `<rect x="178" y="12" width="56" height="44" rx="2" fill="none" stroke="${K.a}" stroke-width="2"/>`)
    + arrow(170, 34, 176, 34, 1.5, { color: K.a, w: 1.8 })
    + tx(140, 68, '보정 전', { size: 9 }) + tx(206, 68, '보정 후', { size: 9, fill: K.a, bold: true, pop: 1.8 })
    + tx(173, 86, '어두운 곳만 밝게', { size: 9.5, bold: true, fill: K.ink, pop: 2.0 })
    + tx(173, 110, 'f(x) = ax³ + bx² + cx + d', { math: true, size: 10 }),
  );
}

/** 택배 상자: 윗면 (x + 3)(x + 1)을 넓이 칸으로 전개(x², 3x, x, 3)한 뒤 높이 x를 곱한다 */
function box() {
  const fx = 12, fy = 60, fw = 60, fh = 26, dx = 22, dy = -18;
  const top = `M${fx} ${fy}L${fx + dx} ${fy + dy}H${fx + fw + dx}L${fx + fw} ${fy}Z`;
  const side = `M${fx + fw} ${fy}L${fx + fw + dx} ${fy + dy}V${fy + fh + dy}L${fx + fw} ${fy + fh}Z`;
  const gx = 132, gy = 22, cw = [40, 30], ch = [30, 12];
  const cell = (i: number, j: number, s: string, fill: string, at: number) => {
    const x = gx + (j ? cw[0] : 0), y = gy + (i ? ch[0] : 0);
    return pop(at, `<rect x="${x}" y="${y}" width="${cw[j]}" height="${ch[i]}" fill="${fill}" stroke="${K.p}" stroke-width="1.2"/>`) + tx(x + cw[j] / 2, y + ch[i] / 2 + 4, s, { math: true, size: 10.5, fill: K.ink, pop: at });
  };
  return svg(
    `<path d="${side}" fill="${K.l}" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/>`
    + `<path d="${top}" fill="${K.f}" stroke="${K.p}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${fx + dx / 2 + 26} ${fy + dy / 2}H${fx + dx / 2 + 36}" stroke="${K.am}" stroke-width="5"/>`
    + pop(0.1, `<path d="${top}" fill="${K.am}" fill-opacity=".45"/>`)
    + tx(fx + fw / 2, fy + fh + 12, 'x + 3', { math: true, size: 10.5 }) + tx(fx - 3, fy + fh / 2 + 4, 'x', { math: true, size: 10.5, anchor: 'end' })
    + tx(100, 54, 'x + 1', { math: true, size: 10.5, anchor: 'start' })
    + tx(42, 112, '윗면 → 칸 나누기', { size: 9 })
    + bentArrow(`M${fx + dx + 30} ${fy + dy - 4}V12H${gx - 8}`, gx - 8, 12, 'r', 0.2, K.am, 1.6)
    + tx(gx + 20, gy - 4, 'x', { math: true, size: 10 }) + tx(gx + 55, gy - 4, '3', { math: true, size: 10 })
    + tx(gx - 4, gy + 19, 'x', { math: true, size: 10, anchor: 'end' }) + tx(gx - 4, gy + 40, '1', { math: true, size: 10, anchor: 'end' })
    + cell(0, 0, 'x²', K.f, 0.7) + cell(0, 1, '3x', W, 1.0) + cell(1, 0, 'x', W, 1.3) + cell(1, 1, '3', K.f, 1.6)
    + tx(gx + 35, 80, 'x² + 4x + 3', { math: true, size: 11, pop: 1.9 })
    + tx(gx + 35, 96, '× 높이 x', { size: 9.5, bold: true, fill: K.ink, pop: 2.2 })
    + tx(gx + 2, 114, '부피', { size: 10, bold: true, fill: K.ink, anchor: 'end', pop: 2.6 }) + tx(gx + 6, 114, 'x³ + 4x² + 3x', { math: true, size: 12, anchor: 'start', pop: 2.6 }),
  );
}

const drawings: Record<string, string> = { qr: qr(), xp: xp(), lane: lane(), ball: ball(), bezier: bezier(), wave: wave(), tone: tone(), box: box() };
export default drawings;
