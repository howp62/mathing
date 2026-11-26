/**
 * 확률과 통계 '경우의 수' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts ps-counting`으로 content/sets/ps-counting.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 자리마다 선택지가 채워지거나 칸막이가 놓이는 과정만 차례로 나타난다. 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, ring, svg, pop, n1 } from './kit.ts';

/* ---- 공통 ---- */

const dot = (x: number | string, y: number | string, r: number, fill: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const chip = (cx: number, cy: number, s: string, fill: string, r = 6) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>${tx(cx, cy + 3.2, s, { size: 9, bold: true, fill: W })}`;
const tile = (x: number, y: number, w: number, h: number, s: string, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}"/>${tx(x + w / 2, y + h / 2 + 3.2, s, { size: 9, bold: true, fill: W })}`;

/* ---- 장면 조각 ---- */

/** 구슬(가운데 구멍) */
const bead = (cx: number, cy: number, fill: string) => `<circle cx="${cx}" cy="${cy}" r="7" fill="${fill}" stroke="${K.ink}" stroke-width=".8"/><circle cx="${cx}" cy="${cy}" r="2" fill="${W}"/>`;
/** 구슬 병 */
const jar = (x: number, y: number, fill: string) =>
  `<rect x="${x + 3}" y="${y}" width="18" height="4" rx="1" fill="${K.m}"/><rect x="${x}" y="${y + 4}" width="24" height="20" rx="4" fill="${W}" stroke="${K.p}" stroke-width="1.2"/>`
  + [[7, 18], [14, 13], [19, 19], [10, 11]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="3.4" fill="${fill}"/>`).join('');

/** 쿠키(초코칩 점) */
const cookie = (cx: number, cy: number, fill: string) =>
  `<circle cx="${cx}" cy="${cy}" r="9" fill="${fill}" stroke="${K.ink}" stroke-width=".9"/>` + [[-3, -3], [3, -1], [-1, 4]].map(([dx, dy]) => dot(cx + dx, cy + dy, 1.3, K.ink)).join('');

/** 켜짐/꺼짐 스위치 */
const toggle = (cx: number, cy: number, on: boolean) =>
  `<rect x="${cx - 12}" y="${cy - 5.5}" width="24" height="11" rx="5.5" fill="${on ? K.p : K.l}"/><circle cx="${on ? cx + 6.5 : cx - 6.5}" cy="${cy}" r="4" fill="${W}"/>`;

/** 장소 아이콘(연못·숲·풀밭) */
const place = (cx: number, cy: number, kind: 0 | 1 | 2) => {
  const color = [K.p, K.m, K.am][kind];
  const inner = [
    `<ellipse cx="${cx}" cy="${cy + 1}" rx="7" ry="4" fill="${K.p}" fill-opacity=".8"/><path d="M${cx - 4} ${cy}q2-1.5 4 0t4 0" fill="none" stroke="${W}" stroke-width="1"/>`,
    `<path d="M${cx - 6} ${cy + 4}L${cx - 2} ${cy - 5}L${cx + 2} ${cy + 4}ZM${cx - 1} ${cy + 4}L${cx + 3} ${cy - 6}L${cx + 7} ${cy + 4}Z" fill="${K.m}"/>`,
    `<path d="M${cx - 6} ${cy + 4}l2-7 1 7 2-8 2 8 1-6 2 6" fill="none" stroke="${K.am}" stroke-width="1.6" stroke-linejoin="round"/>`,
  ][kind];
  return `<circle cx="${cx}" cy="${cy}" r="11" fill="${W}" stroke="${color}" stroke-width="1.6"/>${inner}`;
};

/** 블록 세 종류(바닥 가운데가 (cx, by)) */
const cube = (cx: number, by: number, s = 12) => `<path d="M${cx - s / 2} ${by}V${by - s}H${cx + s / 2}V${by}Z" fill="${K.p}"/><path d="M${cx - s / 2} ${by - s}l3-3H${cx + s / 2 + 3}l-3 3Z" fill="${K.p}" fill-opacity=".55"/>`;
const prism = (cx: number, by: number, s = 12) => `<path d="M${cx - s / 2 - 1} ${by}L${cx} ${by - s}L${cx + s / 2 + 1} ${by}Z" fill="${K.a}"/>`;
const pillar = (cx: number, by: number, s = 12) => `<rect x="${cx - s / 2 + 1}" y="${by - s - 2}" width="${s - 2}" height="${s + 2}" fill="${K.am}"/><ellipse cx="${cx}" cy="${by - s - 2}" rx="${s / 2 - 1}" ry="2" fill="${K.am}" stroke="${K.ink}" stroke-width=".6"/>`;

/** 걷기(발자국)·스트레칭 그림 */
const steps = (cx: number, cy: number) => `<g fill="${K.p}"><ellipse cx="${cx - 4}" cy="${cy + 3}" rx="3" ry="4.5"/><ellipse cx="${cx + 4}" cy="${cy - 4}" rx="3" ry="4.5"/></g>`;
const stretch = (cx: number, cy: number) =>
  `<circle cx="${cx}" cy="${cy - 7}" r="2.6" fill="${K.a}"/><path d="M${cx} ${cy - 4}V${cy + 4}M${cx - 6} ${cy - 10}L${cx} ${cy - 3}L${cx + 6} ${cy - 10}M${cx} ${cy + 4}L${cx - 4} ${cy + 9}M${cx} ${cy + 4}L${cx + 4} ${cy + 9}" fill="none" stroke="${K.a}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ---- 카드별 그림 ---- */

function comboRepeat() {
  const skills: [string, string][] = [['A', K.a], ['B', K.am], ['C', K.p]];
  const cx = (j: number) => 42 + 52 * j;
  const pick = [0, 0, 2, 1];
  const slots = [0, 1, 2, 3].map((j) => {
    const t = 0.2 + 0.4 * j;
    return `<rect x="${cx(j) - 23}" y="34" width="46" height="52" rx="5" fill="${W}" stroke="${K.l}" stroke-width="1.4"/>` + tx(cx(j), 47, `${j + 1}번째`, { size: 9, fill: K.ink })
      + pop(t, skills.map(([s, c], k) => chip(cx(j) - 14 + 14 * k, 62, s, c)).join(''))
      + tx(cx(j), 80, '3가지', { size: 9.5, bold: true, fill: K.a, pop: t + 0.1 })
      + (j < 3 ? tx(cx(j) + 26, 64, '×', { size: 10, fill: K.ink, pop: t + 0.3 }) : '');
  }).join('');
  const rings = pick.map((k, j) => dr(ring(cx(j) - 14 + 14 * k, 62, 8), 2.0 + 0.2 * j, { color: K.ink, w: 1.6 })).join('');
  return svg(
    tx(8, 20, '기술 3가지', { size: 9.5, anchor: 'start', fill: K.ink })
    + skills.map(([s, c], k) => `<rect x="${70 + 40 * k}" y="8" width="32" height="18" rx="5" fill="${c}"/>${tx(86 + 40 * k, 21, s, { size: 10, bold: true, fill: W })}`).join('')
    + tx(234, 20, '다시 써도 됨', { size: 9, anchor: 'end' })
    + slots + rings
    + tx(120, 102, '3 × 3 × 3 × 3 = 81', { math: true, size: 12.5, pop: 1.8 })
    + tx(120, 116, '예: A → A → C → B (같은 기술을 또 씀)', { size: 9, fill: K.ink, pop: 2.8 }),
  );
}

function rhythmStage() {
  const words = ['AABBB', 'ABABB', 'ABBAB', 'ABBBA', 'BAABB', 'BABAB', 'BABBA', 'BBAAB', 'BBABA', 'BBBAA'];
  const rows = words.map((w, k) => {
    const x0 = k < 5 ? 104 : 172, y = 10 + 21 * (k % 5);
    return pop(0.2 + 0.17 * k, [...w].map((c, i) => tile(x0 + 12.5 * i, y, 11.5, 13, c, c === 'A' ? K.a : K.p)).join(''));
  }).join('');
  const piece = (x: number, s: 'A' | 'B') =>
    `<rect x="${x}" y="22" width="15" height="18" rx="2" fill="${s === 'A' ? K.a : K.p}"/>${tx(x + 7.5, 34.5, s, { size: 9, bold: true, fill: W })}`;
  return svg(
    `<rect x="4" y="4" width="92" height="112" rx="6" fill="${K.f}"/>` + tx(50, 15, '공연 5구간 조각', { size: 9, fill: K.ink })
    + piece(10, 'A') + piece(27, 'A') + piece(48, 'B') + piece(65, 'B') + piece(81, 'B')
    + tx(23.5, 52, 'A 2번', { size: 9, fill: K.a, bold: true }) + tx(73, 52, 'B 3번', { size: 9, fill: K.p, bold: true })
    + tx(50, 72, '5! ÷ (2! × 3!)', { math: true, size: 11.5, fill: K.p })
    + tx(50, 90, '= 120 ÷ 12', { math: true, size: 11.5, pop: 1.9 })
    + tx(50, 108, '= 10가지', { size: 13, bold: true, fill: K.a, pop: 2.2 })
    + rows,
  );
}

function practiceOrder() {
  const run = [1, 4];
  const cells = [0, 1, 2, 3, 4, 5].map((i) => {
    const x = 14 + 20 * i, on = run.includes(i);
    return `<rect x="${x}" y="22" width="18" height="20" rx="2" fill="${on ? K.a : W}" stroke="${K.p}" stroke-width="1"/>`
      + (on ? `<path d="M${x + 5} ${27}l4 5-4 5M${x + 10} 27l4 5-4 5" fill="none" stroke="${W}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` : `<circle cx="${x + 9}" cy="32" r="4" fill="none" stroke="${K.p}" stroke-width="1.3"/><path d="M${x + 5} 32h8" stroke="${K.p}" stroke-width=".8"/>`)
      + tx(x + 9, 54, String(i + 1), { size: 9, fill: K.ink });
  }).join('');
  const cx = (j: number) => 160 + (j - 2) * 15, cy = (i: number) => 30 + (i - 1) * 15;
  const tri = [1, 2, 3, 4, 5].map((i) => {
    let g = '';
    for (let j = i + 1; j <= 6; j++) g += `<rect x="${cx(j)}" y="${cy(i)}" width="13" height="13" rx="2" fill="${K.f}" stroke="${K.p}" stroke-width=".9"/>`;
    return pop(0.2 + 0.3 * (i - 1), g) + tx(cx(i + 1) - 3, cy(i) + 10, String(i), { size: 9, anchor: 'end', fill: K.ink, pop: 0.2 + 0.3 * (i - 1) });
  }).join('');
  return svg(
    `<rect x="6" y="10" width="130" height="54" rx="4" fill="${K.f}" stroke="${K.m}" stroke-width="1.2"/><rect x="56" y="5" width="30" height="10" rx="2" fill="${K.m}"/>` + cells
    + tx(196, 12, '달리기 두 자리', { size: 9.5, bold: true, fill: K.ink })
    + [2, 3, 4, 5, 6].map((j) => tx(cx(j) + 6.5, 26, String(j), { size: 9, fill: K.ink })).join('') + tri
    + `<rect x="${cx(5)}" y="${cy(2)}" width="13" height="13" rx="2" fill="${K.a}" class="pop" style="--d:1.80s"/>`
    + dr(`M${cx(5) - 2} ${cy(2) - 2}h17v17h-17Z`, 1.8, { color: K.ink, w: 1.4 })
    + tx(70, 78, '5 + 4 + 3 + 2 + 1 = 15', { math: true, size: 11, pop: 1.7 })
    + tx(70, 96, '6! ÷ (2! × 4!)', { math: true, size: 11.5, fill: K.p, pop: 2.1 })
    + tx(70, 113, '= 15가지', { size: 13, bold: true, fill: K.a, pop: 2.4 })
    + tx(196, 116, '예: 2번·5번 = 위 표시', { size: 9, fill: K.ink, pop: 2.2 }),
  );
}

function beadSupply() {
  const colors = [K.a, K.am, K.p];
  const cx = (k: number) => 20 + 20 * k;
  /** seq: 'o'=구슬, '|'=칸막이 */
  const row = (y: number, seq: string, t0: number) => {
    let color = 0, beadN = 0, barN = 0, s = `<rect x="8" y="${y - 13}" width="124" height="26" rx="4" fill="${K.f}"/>`;
    [...seq].forEach((c, k) => {
      if (c === '|') { s += dr(`M${cx(k)} ${y - 11}V${y + 11}`, t0 + 0.25 * barN++, { color: K.ink, w: 2.6 }); color++; }
      else s += pop(t0 + 0.55 + 0.15 * beadN++, bead(cx(k), y, colors[color]));
    });
    return s;
  };
  return svg(
    jar(10, 4, K.a) + jar(42, 4, K.am) + jar(74, 4, K.p) + tx(110, 20, '구슬 4개 + 칸막이 2개 = 6자리', { size: 9.5, anchor: 'start', fill: K.ink })
    + row(48, 'oo|o|o', 0.1) + tx(138, 52, '빨강 2 · 노랑 1 · 파랑 1', { size: 9.5, anchor: 'start', fill: K.ink, pop: 1.3 })
    + row(80, '|oooo|', 1.5) + tx(138, 84, '빨강 0 · 노랑 4 · 파랑 0', { size: 9.5, anchor: 'start', fill: K.ink, pop: 2.6 })
    + tx(120, 110, '₃H₄ = ₆C₄ = 15가지', { size: 12.5, bold: true, fill: K.a, pop: 2.8 }),
  );
}

function cookieBox() {
  const flavor = [K.m, K.am, K.a, K.p];
  const cx = (k: number) => 22 + 24.5 * k;
  const seq = 'oo|o||ooo';
  let f = 0, nBar = 0, nC = 0, body = '';
  [...seq].forEach((c, k) => {
    if (c === '|') { body += dr(`M${n1(cx(k))} 33V71`, 0.1 + 0.25 * nBar++, { color: K.ink, w: 3 }); f++; }
    else body += pop(0.9 + 0.14 * nC++, cookie(Number(n1(cx(k))), 52, flavor[f]));
  });
  const counts: [number, string][] = [[(cx(0) + cx(1)) / 2, '2개'], [cx(3), '1개'], [(cx(4) + cx(5)) / 2, '0개'], [cx(7), '3개']];
  return svg(
    tx(120, 13, '맛 4가지 중 6개 · 같은 맛 여러 개 가능', { size: 9.5, fill: K.ink })
    + `<path d="M10 30L22 21H218L230 30Z" fill="${K.l}"/><rect x="10" y="30" width="220" height="44" rx="3" fill="${K.f}" stroke="${K.am}" stroke-width="1.8"/>`
    + body
    + counts.map(([x, s], i) => tx(Number(n1(x)), 88, s, { size: 10, bold: true, fill: flavor[i], pop: 1.8 })).join('')
    + tx(120, 100, '쿠키 6 + 칸막이 3 = 9자리', { size: 9.5, fill: K.ink, pop: 2.0 })
    + tx(120, 114, '₄H₆ = ₉C₆ = 84가지', { size: 12, bold: true, fill: K.a, pop: 2.3 }),
  );
}

function transitionEdit() {
  const words = ['AABB', 'ABAB', 'ABBA', 'BAAB', 'BABA', 'BBAA'];
  const tr = (cx: number, cy: number, s: string) => s === 'A'
    ? `<path d="M${cx} ${cy - 7}L${cx + 7} ${cy}L${cx} ${cy + 7}L${cx - 7} ${cy}Z" fill="${K.a}"/>${tx(cx, cy + 3.2, 'A', { size: 9, bold: true, fill: W })}`
    : `<circle cx="${cx}" cy="${cy}" r="6.5" fill="${K.p}"/>${tx(cx, cy + 3.2, 'B', { size: 9, bold: true, fill: W })}`;
  const rows = words.map((w, i) => {
    const y = 14 + 17 * i;
    const clips = [0, 1, 2, 3, 4].map((k) => `<rect x="${8 + 32 * k}" y="${y - 5}" width="16" height="10" rx="1.5" fill="${K.l}"/>`).join('');
    const slots = [0, 1, 2, 3].map((k) => `<circle cx="${32 + 32 * k}" cy="${y}" r="2" fill="${K.m}"/>`).join('');
    return `<path d="M8 ${y}H152" stroke="${K.l}" stroke-width="1"/>` + clips + slots + pop(0.2 + 0.28 * i, [...w].map((c, k) => tr(32 + 32 * k, y, c)).join(''));
  }).join('');
  return svg(
    rows
    + tx(198, 26, 'A 화면 2개', { size: 10, bold: true, fill: K.a }) + tx(198, 40, 'B 화면 2개', { size: 10, bold: true, fill: K.p })
    + tx(198, 64, '4! ÷ (2! × 2!)', { math: true, size: 11.5, pop: 1.9 })
    + tx(198, 86, '= 6가지', { size: 13, bold: true, fill: K.a, pop: 2.2 })
    + tx(198, 104, '같은 화면끼리는', { size: 9 }) + tx(198, 116, '바꿔도 같은 편집', { size: 9 }),
  );
}

function habitatReturn() {
  const root = [26, 56] as const;
  const d1 = [20, 56, 92].map((y) => [62, y] as const);
  const d2 = Array.from({ length: 9 }, (_, k) => [112, 12 + 11 * k] as const);
  const d3 = Array.from({ length: 27 }, (_, k) => [156, n1(8 + 3.5 * k)] as const);
  const colors = [K.p, K.m, K.am];
  const L1 = d1.map(([x, y]) => dr(`M${root[0]} ${root[1]}L${x - 11} ${y}`, 0.1, { color: K.l, w: 1.4 })).join('');
  const L2 = d2.map(([x, y], k) => dr(`M${d1[Math.floor(k / 3)][0] + 11} ${d1[Math.floor(k / 3)][1]}L${x - 3} ${y}`, 0.5, { color: K.l, w: 1 })).join('');
  const L3 = d3.map(([x, y], k) => dr(`M${d2[Math.floor(k / 3)][0] + 3} ${d2[Math.floor(k / 3)][1]}L${x - 2} ${y}`, 1.0, { color: K.l, w: 0.7 })).join('');
  const P2 = pop(0.9, d2.map(([x, y], k) => dot(x, y, 3.6, colors[k % 3])).join(''));
  const P3 = pop(1.4, d3.map(([x, y], k) => dot(x, y, 1.6, colors[k % 3])).join(''));
  const path = dr(`M${root[0]} ${root[1]}L${d1[0][0]} ${d1[0][1]}L${d2[1][0]} ${d2[1][1]}L${d3[3][0]} ${d3[3][1]}`, 2.1, { color: K.a, w: 2 });
  return svg(
    `<rect x="4" y="44" width="20" height="26" rx="2" fill="${K.f}" stroke="${K.p}" stroke-width="1.2"/><path d="M8 51h12M8 56h12M8 61h8" stroke="${K.m}" stroke-width="1"/>`
    + L1 + L2 + L3 + path
    + d1.map(([x, y], i) => place(x, y, i as 0 | 1 | 2)).join('')
    + tx(48, 12, '연못', { size: 9, anchor: 'end', fill: K.ink }) + tx(48, 50, '숲', { size: 9, anchor: 'end', fill: K.ink }) + tx(48, 106, '풀밭', { size: 9, anchor: 'end', fill: K.ink })
    + P2 + P3
    + `<path class="draw" pathLength="1" style="--d:1.60s" d="M166 58H186" fill="none" stroke="${K.p}" stroke-width="1.8" stroke-linecap="round"/><path class="pop" style="--d:2.10s" d="M182 54L186 58L182 62" fill="none" stroke="${K.p}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    + tx(176, 52, '×3', { size: 9.5, fill: K.p, pop: 1.6 })
    + tx(212, 64, '81', { size: 18, bold: true, fill: K.a, pop: 1.9 }) + tx(212, 84, '3⁴ = 81', { math: true, size: 12, pop: 2.0 })
    + tx(62, 115, '1일 3', { size: 9, fill: K.ink }) + tx(112, 115, '2일 9', { size: 9, fill: K.ink, pop: 0.9 }) + tx(156, 115, '3일 27', { size: 9, fill: K.ink, pop: 1.4 }) + tx(212, 115, '4일 81', { size: 9, fill: K.a, bold: true, pop: 1.9 })
    + tx(236, 14, '예: 연못 → 숲', { size: 9, anchor: 'end', fill: K.a, pop: 2.6 }) + tx(236, 27, '→ 연못 → …', { size: 9, anchor: 'end', fill: K.a, pop: 2.6 }),
  );
}

function roadStops() {
  const X = (i: number) => 30 + 34 * i, Y = (j: number) => 96 - 34 * j;
  const C = (n: number, k: number) => [1, 1, 1, 1, 2, 1, 1, 3, 3, 1, 1, 4, 6, 4, 1][[0, 1, 3, 6, 10][n] + k];
  let roads = '';
  for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) roads += `M${X(i)} ${Y(k) - 10}V${Y(k + 1) + 10}M${X(k) + 10} ${Y(i)}H${X(k + 1) - 10}`;
  roads += `M${X(0)} ${Y(0) + 10}v4M${X(0) - 10} ${Y(0)}h-4M${X(2) + 10} ${Y(2)}h4`;
  const seg = (d: string, t: number) => `<path class="draw" pathLength="1" style="--d:${t.toFixed(2)}s;animation-duration:.35s;animation-timing-function:linear" d="${d}" fill="none" stroke="${K.a}" stroke-width="3.4" stroke-linecap="round"/>`;
  const route = [`M${X(0) + 10} ${Y(0)}H${X(1) - 10}`, `M${X(1)} ${Y(0) - 10}V${Y(1) + 10}`, `M${X(1) + 10} ${Y(1)}H${X(2) - 10}`, `M${X(2)} ${Y(1) - 10}V${Y(2) + 10}`].map((d, k) => seg(d, 1.6 + 0.35 * k)).join('');
  let nodes = '';
  for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) {
    const v = C(i + j, i), end = i === 2 && j === 2;
    nodes += pop(0.1 + 0.3 * (i + j), `<circle cx="${X(i)}" cy="${Y(j)}" r="9" fill="${end ? K.a : W}" stroke="${end ? K.a : K.p}" stroke-width="1.4"/>` + tx(X(i), Y(j) + 3.6, String(v), { size: 10, bold: true, fill: end ? W : K.p }));
  }
  const wave = (x: number, y: number) => `<path d="M${x - 7} ${y}q3.5-4 7 0t7 0" fill="none" stroke="${K.p}" stroke-width="1.8" stroke-linecap="round"/>`;
  const tree = (x: number, y: number) => `<path d="M${x - 6} ${y + 4}L${x} ${y - 7}L${x + 6} ${y + 4}Z" fill="${K.m}"/><path d="M${x} ${y + 4}v3" stroke="${K.m}" stroke-width="1.6"/>`;
  return svg(
    `<rect x="4" y="4" width="132" height="112" rx="6" fill="${K.f}"/><path d="${roads}" stroke="${W}" stroke-width="7"/>`
    + tx(X(0), 116, '출발', { size: 9, fill: K.ink }) + tx(X(2), 14, '4번 쉰 뒤', { size: 9, fill: K.ink })
    + route
    + nodes
    + wave(152, 20) + tx(164, 24, '→ 바다 A', { size: 10, bold: true, anchor: 'start', fill: K.p })
    + tree(152, 40) + tx(164, 44, '↑ 숲 B', { size: 10, bold: true, anchor: 'start', fill: K.m })
    + tx(189, 66, 'A 2번 · B 2번', { size: 10, fill: K.ink, pop: 1.6 })
    + tx(189, 86, '(a+b)⁴의 a²b² 계수', { math: true, size: 11, pop: 2.0 })
    + tx(189, 106, '= ₄C₂ = 6', { size: 13, bold: true, fill: K.a, pop: 2.3 }),
  );
}

function movementCards() {
  const kinds = ['W', 'S', 'W', 'W', 'S'];
  const cx = (i: number) => 30 + 45 * i;
  let w = 0, s = 0;
  const cards = kinds.map((k, i) => {
    const x = cx(i) - 20, n = k === 'W' ? ++w : ++s, t = 0.2 + 0.15 * i;
    return `<rect x="${x}" y="26" width="40" height="38" rx="4" fill="${W}" stroke="${K.p}" stroke-width="1.4"/>`
      + (k === 'W' ? steps(cx(i), 40) : stretch(cx(i), 42)) + tx(cx(i), 59, k === 'W' ? '걷기' : '스트레칭', { size: 9, fill: K.ink })
      + pop(t, `<circle cx="${x + 33}" cy="33" r="5.5" fill="${k === 'W' ? K.p : K.a}"/>` + tx(x + 33, 36.2, String(n), { size: 9, bold: true, fill: W }));
  }).join('');
  return svg(
    cards
    + dr(`M${cx(0)} 22Q${(cx(0) + cx(2)) / 2} 6 ${cx(2)} 22`, 1.2, { color: K.p, w: 1.6 })
    + dr(`M${cx(2)} 22Q${(cx(2) + cx(3)) / 2} 10 ${cx(3)} 22`, 1.4, { color: K.p, w: 1.6 })
    + dr(`M${cx(1)} 68Q${(cx(1) + cx(4)) / 2} 80 ${cx(4)} 68`, 1.6, { color: K.a, w: 1.6 })
    + tx(120, 86, '이름표를 붙이면 5! = 120', { size: 9.5, fill: K.ink, pop: 1.0 })
    + tx(120, 101, '같은 종류끼리 바꾼 3! × 2! = 12가지는 같은 순서', { size: 9.5, fill: K.ink, pop: 2.0 })
    + tx(120, 116, '120 ÷ 12 = 10가지', { size: 12, bold: true, fill: K.a, pop: 2.4 }),
  );
}

function binaryLabel() {
  const cols = [34, 74, 114, 154];
  const rows = [3, 2, 1, 0].map((off, r) => {
    const y = 44 + 15 * r;
    return tx(16, y + 3.2, String(r + 1), { size: 9, fill: K.m }) + pop(0.2 + 0.4 * r, cols.map((x, c) => toggle(x, y, c !== off)).join(''));
  }).join('');
  return svg(
    `<rect x="6" y="4" width="170" height="94" rx="5" fill="${W}" stroke="${K.l}" stroke-width="1.4"/><path d="M6 17V9a5 5 0 0 1 5-5h160a5 5 0 0 1 5 5V17Z" fill="${K.f}"/>`
    + tx(14, 14, '표시 네 칸', { size: 9, anchor: 'start', fill: K.ink })
    + cols.map((x) => tx(x, 30, '(1+x)', { math: true, size: 10.5, fill: K.p })).join('')
    + rows
    + tx(208, 28, 'x: 켜짐', { size: 9.5, fill: K.p, bold: true }) + tx(208, 44, '1: 꺼짐', { size: 9.5, fill: K.m, bold: true })
    + tx(208, 70, 'x³의 계수', { size: 9.5, fill: K.ink, pop: 1.8 })
    + tx(208, 92, '4가지', { size: 14, bold: true, fill: K.a, pop: 1.9 })
    + tx(120, 114, '(1+x)⁴ = 1 + 4x + 6x² + 4x³ + x⁴', { math: true, size: 11.5, pop: 2.2 }),
  );
}

function modelBlocks() {
  const P = (b: number, c: number) => [112 + 20 * b + 10 * c, 100 - 16 * c] as const;
  const rows = [0, 1, 2, 3, 4, 5].map((c) => {
    const t = 0.2 + 0.25 * c, n = 6 - c;
    const pts = Array.from({ length: n }, (_, b) => { const [x, y] = P(b, c); return dot(x, y, 3.6, K.p); }).join('');
    const [x0, y0] = P(0, c);
    return pop(t, pts) + tx(x0 - 8, y0 + 3.2, String(n), { size: 9, anchor: 'end', fill: K.m, pop: t });
  }).join('');
  const [ex, ey] = P(2, 1);
  return svg(
    tx(48, 13, '예: 2 · 2 · 1', { size: 9.5, bold: true, fill: K.ink })
    + `<rect x="8" y="48" width="82" height="6" rx="2" fill="${K.am}" fill-opacity=".6"/>`
    + cube(18, 48) + cube(34, 48) + prism(52, 48) + prism(68, 48) + pillar(83, 48)
    + tx(26, 66, '정육면체', { size: 9, fill: K.p }) + tx(60, 66, '지붕', { size: 9, fill: K.a }) + tx(84, 66, '기둥', { size: 9, fill: K.am })
    + cube(112, 118, 9) + prism(212, 118, 9) + pillar(162, 13, 8)
    + rows
    + pop(1.8, dot(ex, ey, 4.4, K.a)) + dr(ring(ex, ey, 8), 1.8, { color: K.a, w: 1.6 })
    + tx(48, 84, '6+5+4+3+2+1', { math: true, size: 11, pop: 1.7 })
    + tx(48, 100, '₃H₅ = ₇C₅', { size: 11, fill: K.p, pop: 2.1 })
    + tx(48, 115, '= 21가지', { size: 12, bold: true, fill: K.a, pop: 2.4 }),
  );
}

const drawings: Record<string, string> = {
  'combo-repeat': comboRepeat(),
  'rhythm-stage': rhythmStage(),
  'practice-order': practiceOrder(),
  'bead-supply': beadSupply(),
  'cookie-box': cookieBox(),
  'transition-edit': transitionEdit(),
  'habitat-return': habitatReturn(),
  'road-stops': roadStops(),
  'movement-cards': movementCards(),
  'binary-label': binaryLabel(),
  'model-blocks': modelBlocks(),
};
export default drawings;
