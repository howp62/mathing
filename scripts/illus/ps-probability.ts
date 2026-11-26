/**
 * 확률과 통계 '확률' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts ps-probability`로 content/sets/ps-probability.json의 svg 칸에 써 넣는다.
 * 장면은 그대로 두고, 전체(분모) → 조건으로 좁힌 칸 → 사건 칸 → 확률 순서로 나타난다. 칸 수와 값은 카드 본문과 같다.
 */
import { K, W, tx, dr, ring, svg, pop, n1, arrow, guide } from './kit.ts';

/* ---- 공통 조각 ---- */

/** 직사각형 테두리를 선 하나로(그려지는 틀) */
const box = (x: number, y: number, w: number, h: number) => `M${n1(x)} ${n1(y)}H${n1(x + w)}V${n1(y + h)}H${n1(x)}Z`;

/** 가로 막대가 왼쪽에서 오른쪽으로 그려진다(끝이 둥글지 않아 길이가 정확하다) */
const hbar = (x1: number, x2: number, y: number, h: number, color: string, at: number) =>
  `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s" d="M${n1(x1)} ${y}H${n1(x2)}" fill="none" stroke="${color}" stroke-width="${h}"/>`;

/** 보물 상자(보상 칸 표시) */
const chest = (x: number, y: number) =>
  `<path d="M${x} ${y + 5}Q${x + 7} ${y - 2} ${x + 14} ${y + 5}Z" fill="${K.a}"/><rect x="${x}" y="${y + 5}" width="14" height="7" rx="1" fill="${K.am}"/><rect x="${x + 5.5}" y="${y + 4}" width="3" height="4" rx=".8" fill="${K.ink}"/>`;

/** 쿠키: 딸기(붉은 바탕에 흰 씨) 또는 초코(진한 바탕에 노란 칩) */
const cookie = (cx: number, cy: number, berry: boolean) =>
  `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${berry ? K.a : K.ink}"/>` +
  (berry
    ? `<g fill="${W}"><circle cx="${cx - 2}" cy="${cy - 1.5}" r=".8"/><circle cx="${cx + 1.8}" cy="${cy - 2}" r=".8"/><circle cx="${cx}" cy="${cy + 2}" r=".8"/></g>`
    : `<g fill="${K.am}"><circle cx="${cx - 2}" cy="${cy - 1}" r="1"/><circle cx="${cx + 2}" cy="${cy + 1.5}" r="1"/></g>`);

/* ---- 카드별 그림 ---- */

/** 열두 칸 게임판: 전체 12칸(분모) 테두리 → 보상 칸 3개에 차례로 동그라미 → 3/12 */
function equalBox() {
  const x0 = 12, y0 = 22, pw = 29, ph = 27, cw = 26, ch = 24;
  const reward = [[1, 0], [3, 1], [0, 2]];
  let cells = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = x0 + c * pw, y = y0 + r * ph, hot = reward.some(([a, b]) => a === c && b === r);
    cells += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="3" fill="${W}"/>`
      + (hot ? chest(x + 6, y + 2) : `<circle cx="${x + 13}" cy="${y + 8}" r="2.2" fill="${K.l}"/>`)
      + tx(x + 13, y + 22, '1/12', { size: 9, fill: hot ? K.a : K.m });
  }
  const rings = reward.map(([c, r], i) => dr(box(x0 + c * pw - 2, y0 + r * ph - 2, cw + 4, ch + 4), 0.8 + i * 0.3, { color: K.a, w: 2 })).join('');
  return svg(
    `<rect x="6" y="16" width="125" height="91" rx="6" fill="${K.f}"/>` + cells
    + tx(68, 11, '연습용 게임판', { size: 9.5, fill: K.ink })
    + dr(box(6, 16, 125, 91), 0.1, { color: K.p, w: 2 }) + rings
    + tx(186, 26, '칸마다 같은 확률', { size: 9.5, fill: K.ink })
    + tx(166, 54, '3', { size: 16, bold: true, fill: K.a, pop: 1.9 }) + tx(196, 54, '보상 칸', { size: 9, anchor: 'start', fill: K.a, pop: 1.9 })
    + `<path d="M152 61H180" stroke="${K.ink}" stroke-width="1.4"/>`
    + tx(166, 78, '12', { size: 16, bold: true, fill: K.p, pop: 0.6 }) + tx(196, 77, '전체 칸', { size: 9, anchor: 'start', fill: K.p, pop: 0.6 })
    + tx(186, 104, '= 1/4', { math: true, size: 14, pop: 2.3 }),
  );
}

/** 공연 조명 두 개가 만든 겹친 원: 댄스 55 → 발라드 40 → 겹친 20 → 합집합 75 */
function musicUnion() {
  const cy = 76, rx = 34, ry = 24, ca = 60, cb = 104, ix = 82, dy = n1(ry * Math.sqrt(1 - ((cb - ca) / 2 / rx) ** 2));
  const top = `${ix} ${n1(cy - Number(dy))}`, bot = `${ix} ${n1(cy + Number(dy))}`;
  const ell = (cx: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
  const beam = (lx: number, cx: number, color: string) => `<path d="M${lx - 3} 14L${cx - rx} ${cy}H${cx + rx}L${lx + 3} 14Z" fill="${color}" fill-opacity=".14"/>`;
  const lamp = (lx: number) => `<path d="M${lx} 6V9" stroke="${K.ink}" stroke-width="1.4"/><path d="M${lx - 6} 15L${lx - 4} 9H${lx + 4}L${lx + 6} 15Z" fill="${K.ink}"/>`;
  return svg(
    `<rect x="4" y="38" width="148" height="78" rx="4" fill="${K.f}"/><path d="M30 6H134" stroke="${K.m}" stroke-width="2" stroke-linecap="round"/>`
    + beam(ca, ca, K.am) + beam(cb, cb, K.p) + lamp(ca) + lamp(cb)
    + tx(8, 112, '카드 100장', { size: 9, anchor: 'start' }) + tx(146, 112, '그 밖 25', { size: 9, anchor: 'end' })
    + dr(ell(ca), 0.1, { color: K.am, w: 2 }) + tx(30, 48, '댄스 55', { size: 9.5, bold: true, fill: K.ink, pop: 0.3 })
    + dr(ell(cb), 0.6, { color: K.p, w: 2 }) + tx(134, 48, '발라드 40', { size: 9.5, bold: true, fill: K.ink, pop: 0.8 })
    + tx(46, 80, '35', { size: 10, fill: K.ink }) + tx(120, 80, '20', { size: 10, fill: K.ink })
    + pop(1.3, `<path d="M${top}A${rx} ${ry} 0 0 0 ${bot}A${rx} ${ry} 0 0 0 ${top}Z" fill="${K.a}" fill-opacity=".35"/>`) + tx(ix, 80, '20', { size: 10, bold: true, fill: K.a })
    + dr(`M${top}A${rx} ${ry} 0 1 0 ${bot}A${rx} ${ry} 0 1 0 ${top}Z`, 1.9, { color: K.a, w: 2.6 })
    + tx(196, 34, '55 + 40', { size: 11, fill: K.ink, pop: 1.0 })
    + tx(196, 54, '− 20 (겹침)', { size: 11, bold: true, fill: K.a, pop: 1.4 })
    + tx(196, 74, '= 75', { size: 11, fill: K.ink, pop: 2.0 })
    + tx(196, 100, '75/100 = 0.75', { math: true, size: 12.5, pop: 2.4 }),
  );
}

/** 넓이 1인 막대: 실패한 부분만 다음 슛으로 이어져 0.4 → 0.16 → 0.064, 남은 0.936이 한 번 이상 성공 */
function shotComplement() {
  const x0 = 62, L = 166, X = (p: number) => x0 + L * p;
  const hoop = `<rect x="8" y="12" width="34" height="22" rx="2" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><rect x="18" y="20" width="14" height="10" fill="none" stroke="${K.p}" stroke-width="1.2"/>`
    + `<path d="M16 36H34" stroke="${K.a}" stroke-width="2.2" stroke-linecap="round"/><path d="M17 37L20 50M33 37L30 50M21 37L23 50M29 37L27 50M20 50H30" fill="none" stroke="${K.m}" stroke-width="1"/>`
    + `<circle cx="26" cy="70" r="9" fill="${K.am}"/><path d="M17 70H35M26 61V79M19.5 63.5Q26 70 19.5 76.5M32.5 63.5Q26 70 32.5 76.5" fill="none" stroke="${K.ink}" stroke-width=".9"/>`;
  const row = (y: number, label: string, f: number, w: number, at: number, fl: string, sl: string) => {
    const xf = X(f * 0.4);
    return pop(at, `<rect x="${x0}" y="${y - 7}" width="${n1(xf - x0)}" height="14" fill="${K.l}"/><rect x="${n1(xf)}" y="${y - 7}" width="${n1(X(f) - xf)}" height="14" fill="${K.p}"/>`)
      + tx(x0 - 4, y + 3.5, label, { size: 9, anchor: 'end', fill: K.ink, pop: at })
      + (fl ? tx((x0 + xf) / 2, y + 3.5, fl, { size: 9, fill: K.ink, pop: at }) : '')
      + tx((xf + X(f)) / 2, y + 3.5, sl, { size: 9, fill: W, bold: true, pop: at }) + (w ? '' : '');
  };
  return svg(
    hoop + tx(26, 96, '매번 0.6', { size: 9, fill: K.ink }) + tx(26, 108, '서로 독립', { size: 9 })
    + row(16, '1번', 1, 0, 0.1, '실패 0.4', '성공 0.6')
    + pop(0.55, guide(`M${x0} 24V31M${n1(X(0.4))} 24V31`)) + row(38, '2번', 0.4, 0, 0.6, '0.16', '0.24')
    + tx(+n1(X(0.4) + 6), 41.5, '실패한 경우만 다시 던짐', { size: 9, anchor: 'start', pop: 0.6 })
    + pop(1.05, guide(`M${x0} 46V53M${n1(X(0.16))} 46V53`)) + row(60, '3번', 0.16, 0, 1.1, '', '')
    + tx(+n1(X(0.16) + 6), 63.5, '← 모두 실패 0.4³ = 0.064', { size: 9, anchor: 'start', fill: K.ink, pop: 1.5 })
    + `<rect x="${x0}" y="76" width="${L}" height="12" fill="${K.l}"/>`
    + hbar(X(0.064), X(1), 82, 12, K.a, 1.8)
    + tx(x0 - 4, 85.5, '합', { size: 9, anchor: 'end', fill: K.ink })
    + tx(145, 108, '1 − 0.4³ = 0.936', { math: true, size: 13, pop: 2.7 }),
  );
}

/** 네일 도안 50장: 파란색 20장으로 틀을 좁힘(나머지 30장 흐려짐) → 그중 무광 12장 → 12/20 */
function designCondition() {
  const x0 = 12, y0 = 24, pw = 11, ph = 16;
  const others = [K.a, K.am, K.l, K.a, K.l, K.am];
  let nails = '';
  for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) {
    const x = x0 + c * pw, y = y0 + r * ph, blue = c < 4, matte = blue && r < 3;
    const color = blue ? K.p : others[(c + r * 3) % others.length];
    nails += `<rect x="${x}" y="${y}" width="8" height="12" rx="3.5" fill="${color}"${matte ? ' fill-opacity=".7"' : ''}/>`
      + (matte ? '' : `<path d="M${x + 2.3} ${y + 3}V${y + 6.5}" stroke="${W}" stroke-width="1.2" stroke-linecap="round"/>`);
  }
  return svg(
    tx(65, 13, '네일 도안 카드 50장', { size: 9.5, fill: K.ink })
    + pop(1.3, `<rect x="${x0 - 2}" y="${y0 - 2}" width="${3 * pw + 12}" height="${3 * ph}" rx="2" fill="${K.am}" fill-opacity=".5"/>`)
    + nails
    + pop(0.7, `<rect x="${x0 + 4 * pw - 2}" y="${y0 - 3}" width="${6 * pw + 1}" height="${5 * ph + 2}" fill="${K.bg}" fill-opacity=".78"/>`)
    + dr(box(x0 - 3, y0 - 3, 4 * pw + 1, 5 * ph + 2), 0.1, { color: K.a, w: 2 })
    + tx(30, 116, '파란색 20장', { size: 9.5, bold: true, fill: K.a, pop: 0.5 })
    + tx(182, 30, '조건: 파란색', { size: 10, bold: true, fill: K.a, pop: 0.5 })
    + tx(182, 48, '전체 50장 → 20장', { size: 9.5, fill: K.ink, pop: 0.9 })
    + pop(1.3, `<rect x="146" y="61" width="9" height="12" rx="3.5" fill="${K.p}" fill-opacity=".7"/>`)
    + tx(160, 71, '무광(광 없음) 12장', { size: 9.5, fill: K.ink, anchor: 'start', pop: 1.6 })
    + tx(182, 100, '12/20 = 0.6', { math: true, size: 14, pop: 2.1 }),
  );
}

/** 쿠키 상자: 딸기 3/5에 동그라미 → 한 개 꺼내 다시 넣지 않음 → 남은 넷 중 딸기 2/4 → 곱하기 */
function cookieWithout() {
  const tray = (x: number) => `<rect x="${x}" y="30" width="68" height="26" rx="4" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="M${x + 2} 30L${x + 8} 22H${x + 62}L${x + 66} 30" fill="none" stroke="${K.m}" stroke-width="1.2"/>`;
  const xs = (x: number) => [0, 1, 2, 3, 4].map((i) => x + 8 + i * 13);
  const a = xs(4), b = xs(106);
  const first = a.map((x, i) => cookie(x, 43, i < 3)).join('');
  const second = `<circle cx="${b[0]}" cy="43" r="5.5" fill="none" stroke="${K.m}" stroke-width="1" stroke-dasharray="2 2"/>` + b.slice(1).map((x, i) => cookie(x, 43, i < 2)).join('');
  return svg(
    tray(4) + first + tx(38, 15, '처음 5개', { size: 9.5, fill: K.ink })
    + [0, 1, 2].map((i) => dr(ring(a[i], 43, 6.6), 0.1 + i * 0.25, { color: K.a, w: 1.8 })).join('')
    + tx(38, 74, '첫째 딸기 3/5', { size: 10, bold: true, fill: K.a, pop: 0.8 })
    + arrow(75, 43, 102, 43, 1.0) + pop(1.0, cookie(88.5, 29, true))
    + pop(1.4, tray(106) + second) + tx(140, 15, '남은 4개', { size: 9.5, fill: K.ink, pop: 1.4 })
    + [1, 2].map((i, k) => dr(ring(b[i], 43, 6.6), 1.6 + k * 0.25, { color: K.a, w: 1.8 })).join('')
    + tx(140, 74, '둘째 딸기 2/4', { size: 10, bold: true, fill: K.a, pop: 2.2 })
    + tx(208, 36, '다시', { size: 9.5, fill: K.ink, pop: 1.4 }) + tx(208, 48, '넣지 않음', { size: 9.5, fill: K.ink, pop: 1.4 })
    + tx(208, 66, '분모 5 → 4', { size: 10, bold: true, fill: K.p, pop: 1.5 })
    + tx(120, 104, '(3/5) × (2/4) = 3/10', { math: true, size: 13.5, pop: 2.6 }),
  );
}

/** 배치 실험 200번(점 200개): A안이 고른 118번을 줄마다 칠함 → 비율 막대 0.59 */
function videoTrials() {
  const x0 = 76, y0 = 20, s = 6;
  const pt = (i: number) => `M${x0 + (i % 20) * s} ${y0 + Math.floor(i / 20) * s}h0`;
  const all = Array.from({ length: 200 }, (_, i) => pt(i)).join('');
  const rows = [0, 1, 2, 3, 4, 5].map((r) => {
    const n = r < 5 ? 20 : 18;
    return pop(0.2 + r * 0.22, `<path d="${Array.from({ length: n }, (_, j) => pt(r * 20 + j)).join('')}" stroke="${K.a}" stroke-width="4.2" stroke-linecap="round"/>`);
  }).join('');
  const layout = (y: number, name: string, big: boolean) =>
    `<rect x="6" y="${y}" width="50" height="38" rx="3" fill="${W}" stroke="${K.p}" stroke-width="1.4"/><rect x="6.7" y="${y + 0.7}" width="48.6" height="11" fill="${K.p}"/>${tx(31, y + 9, name, { size: 9, bold: true, fill: W })}`
    + (big ? `<rect x="10" y="${y + 15}" width="24" height="18" rx="1" fill="${K.am}"/><path d="M38 ${y + 18}h14M38 ${y + 24}h14M38 ${y + 30}h9" stroke="${K.l}" stroke-width="2"/>`
      : `<rect x="10" y="${y + 15}" width="19" height="8" rx="1" fill="${K.am}"/><rect x="33" y="${y + 15}" width="19" height="8" rx="1" fill="${K.am}"/><rect x="10" y="${y + 26}" width="19" height="8" rx="1" fill="${K.am}"/><rect x="33" y="${y + 26}" width="19" height="8" rx="1" fill="${K.am}"/>`);
  return svg(
    layout(12, 'A안', true) + layout(62, 'B안', false)
    + `<path d="${all}" stroke="${K.l}" stroke-width="4.2" stroke-linecap="round"/>` + rows
    + tx(196, 16, '200번 반복', { size: 9, anchor: 'start', fill: K.ink }) + tx(196, 52, 'A안', { size: 9.5, anchor: 'start', bold: true, fill: K.a, pop: 1.4 }) + tx(196, 64, '118번', { size: 9.5, anchor: 'start', bold: true, fill: K.a, pop: 1.4 })
    + `<rect x="${x0}" y="84" width="114" height="8" fill="${K.l}"/>` + hbar(x0, x0 + 114 * 0.59, 88, 8, K.a, 1.7)
    + tx(x0 - 4, 91, '0', { size: 9, anchor: 'end' }) + tx(x0 + 118, 91, '1', { size: 9, anchor: 'start' })
    + tx(112, 112, '상대도수', { size: 9.5, fill: K.ink, anchor: 'end', pop: 2.6 }) + tx(116, 112, '118/200 = 0.59', { math: true, size: 12.5, anchor: 'start', pop: 2.6 }),
  );
}

/** 관찰 카드 100칸 지도: 물가 A 40칸 → 새 B 30칸 → 겹친 12칸 테두리, A 안에서도 새 비율이 0.3 */
function habitatIndependence() {
  const x0 = 12, y0 = 20, c = 7.6, g = 6.6;
  let cells = '';
  for (let r = 0; r < 10; r++) for (let k = 0; k < 10; k++) cells += `<rect x="${n1(x0 + k * c)}" y="${n1(y0 + r * c)}" width="${g}" height="${g}" fill="${K.f}"/>`;
  const waves = Array.from({ length: 6 }, (_, i) => `M${x0 + 3} ${n1(y0 + (3.6 + i * 1.05) * c + 4)}q3.5-3 7 0t7 0t7 0t7 0`).join('');
  const birds = [[5.3, 0.9], [7.6, 0.5], [6.4, 2.1], [8.7, 1.7]].map(([k, r]) => `M${n1(x0 + k * c - 4)} ${n1(y0 + r * c + 2)}q2-3 4 0q2-3 4 0`).join('');
  return svg(
    tx(50, 12, '관찰 카드 100장', { size: 9.5, fill: K.ink }) + cells
    + pop(0.1, `<rect x="${x0 - 1}" y="${y0 - 1}" width="${n1(4 * c + 1)}" height="${n1(10 * c + 1)}" fill="${K.p}" fill-opacity=".28"/><path d="${waves}" fill="none" stroke="${K.p}" stroke-width="1"/>`)
    + tx(+n1(x0 + 2 * c), 112, '물가 A 40', { size: 9.5, bold: true, fill: K.p, pop: 0.3 })
    + pop(0.7, `<rect x="${x0 - 1}" y="${y0 - 1}" width="${n1(10 * c + 1)}" height="${n1(3 * c + 1)}" fill="${K.am}" fill-opacity=".4"/><path d="${birds}" fill="none" stroke="${K.ink}" stroke-width="1.1" stroke-linecap="round"/>`)
    + tx(+n1(x0 + 10 * c + 4), +n1(y0 + 1.5 * c + 3.5), '새 B 30', { size: 9.5, bold: true, fill: K.ink, anchor: 'start', pop: 0.9 })
    + dr(box(x0 - 1, y0 - 1, 4 * c + 1, 3 * c + 1), 1.2, { color: K.a, w: 2.2 }) + tx(+n1(x0 + 2 * c), +n1(y0 + 1.5 * c + 4), '12', { size: 10, bold: true, fill: K.a, pop: 1.5 })
    + tx(176, 46, 'P(B) = 30/100 = 0.3', { math: true, size: 11, pop: 1.0 })
    + tx(176, 66, 'P(B|A) = 12/40 = 0.3', { math: true, size: 11, pop: 1.7 })
    + tx(176, 84, '같으므로 이 카드에서 독립', { size: 9.5, bold: true, fill: K.ink, pop: 2.1 })
    + tx(176, 106, '0.12 = 0.4 × 0.3', { math: true, size: 11, pop: 2.4 }),
  );
}

/** 혼잡 시간 출발 30대(3차선 정체): 30대 틀(조건) → 지연 18대 빨갛게 → 18/30 */
function roadDelay() {
  const x0 = 12, pw = 12, lanes = [38, 56, 74];
  const car = (x: number, y: number, fill: string) =>
    `<path d="M${x} ${y + 3}V${y - 1}L${x + 2} ${y - 4}H${x + 7}L${x + 9} ${y - 1}V${y + 3}Z" fill="${fill}"/><circle cx="${x + 2.2}" cy="${y + 3.5}" r="1.4" fill="${K.ink}"/><circle cx="${x + 6.8}" cy="${y + 3.5}" r="1.4" fill="${K.ink}"/>`;
  let cars = '';
  for (const y of lanes) for (let i = 0; i < 10; i++) cars += car(x0 + i * pw, y, W);
  const late = (lane: number, n: number) => Array.from({ length: n }, (_, i) => car(x0 + i * pw, lanes[lane], K.a)).join('');
  const clock = `<circle cx="14" cy="12" r="6" fill="${W}" stroke="${K.p}" stroke-width="1.4"/><path d="M14 8.5V12L16.5 13.5" fill="none" stroke="${K.p}" stroke-width="1.2" stroke-linecap="round"/>`;
  const stack = [0, 1, 2].map((i) => `<rect x="${170 - i * 3}" y="${18 + i * 3}" width="40" height="26" rx="3" fill="${K.f}" stroke="${K.m}" stroke-width="1"/>`).join('');
  return svg(
    clock + tx(24, 16, '혼잡 시간 출발 30장', { size: 9.5, bold: true, fill: K.ink, anchor: 'start' })
    + `<rect x="6" y="27" width="128" height="56" fill="${K.l}" fill-opacity=".6"/><path d="M8 47H132M8 65H132" stroke="${W}" stroke-width="1.2" stroke-dasharray="5 4"/>` + cars
    + dr(box(4, 25, 132, 60), 0.1, { color: K.p, w: 2 })
    + pop(0.7, late(0, 10)) + pop(1.0, late(1, 8)) + tx(70, 100, '그중 지연 18장', { size: 10, bold: true, fill: K.a, pop: 1.3 })
    + stack + tx(187, 37, '?', { size: 12, bold: true })
    + tx(190, 62, '나머지 70장', { size: 9.5, fill: K.ink }) + tx(190, 75, '지연 수 몰라도 됨', { size: 9 })
    + tx(190, 104, '18/30 = 0.6', { math: true, size: 14, pop: 1.8 }),
  );
}

/** 생활 기록 달력 40칸: 걷기 16칸을 고름 → 그 16장만 다시 펼침 → 일찍 잠든 10장에 달 → 10/16 */
function routineCondition() {
  const x0 = 8, y0 = 28, p = 12, cs = 10.5;
  const walk = [1, 3, 4, 8, 10, 13, 15, 17, 20, 22, 26, 27, 30, 33, 36, 38];
  const foot = (x: number, y: number) => `<ellipse cx="${n1(x - 1.6)}" cy="${n1(y + 0.6)}" rx="1.3" ry="2.2" fill="${K.p}"/><ellipse cx="${n1(x + 1.6)}" cy="${n1(y - 0.8)}" rx="1.3" ry="2.2" fill="${K.p}"/>`;
  const moon = (x: number, y: number) => `<path d="M${n1(x + 1)} ${n1(y - 3.5)}a3.6 3.6 0 1 0 2.6 6.2a3 3 0 1 1-2.6-6.2Z" fill="${K.am}"/>`;
  let cal = `<rect x="${x0 - 3}" y="${y0 - 10}" width="${8 * p + 5}" height="${5 * p + 13}" rx="3" fill="${K.f}"/><rect x="${x0 - 3}" y="${y0 - 10}" width="${8 * p + 5}" height="7" rx="2" fill="${K.p}"/>`;
  for (let i = 0; i < 40; i++) {
    const x = x0 + (i % 8) * p, y = y0 + Math.floor(i / 8) * p;
    cal += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" fill="${W}"/>` + (walk.includes(i) ? foot(x + cs / 2, y + cs / 2) : '');
  }
  const picks = walk.map((i) => box(x0 + (i % 8) * p - 0.8, y0 + Math.floor(i / 8) * p - 0.8, cs + 1.6, cs + 1.6)).join('');
  const gx = 138, gy = 27, gp = 17, gs = 15;
  let grid = '';
  for (let i = 0; i < 16; i++) {
    const x = gx + (i % 4) * gp, y = gy + Math.floor(i / 4) * gp;
    grid += `<rect x="${x}" y="${y}" width="${gs}" height="${gs}" rx="2" fill="${K.f}"/>` + foot(x + 5, y + 9);
  }
  const moons = Array.from({ length: 10 }, (_, i) => pop(1.2 + i * 0.09, moon(gx + (i % 4) * gp + 10.5, gy + Math.floor(i / 4) * gp + 5))).join('');
  return svg(
    tx(55, 12, '생활 기록 카드 40장', { size: 9.5, fill: K.ink }) + cal
    + pop(0.1, `<path d="${picks}" fill="none" stroke="${K.a}" stroke-width="1.4"/>`)
    + tx(55, 102, '발 = 걷기 · 달 = 일찍 잠듦', { size: 9, fill: K.ink })
    + arrow(110, 58, 130, 58, 0.4)
    + pop(0.8, grid) + tx(171, 19, '걷기 16장만', { size: 9.5, bold: true, fill: K.p, pop: 0.8 })
    + moons + tx(220, 110, '10/16 = 0.625', { math: true, size: 12.5, anchor: 'end', pop: 2.3 }),
  );
}

/** AI가 고양이라 표시한 25장(틀 = 분모) → 정답표와 맞춰 실제 고양이 20장에 체크 → 20/25 */
function aiLabels() {
  const x0 = 10, y0 = 24, pw = 17, ph = 15, tw = 15, th = 13;
  const dogAt = [2, 0, 4, 1, 3];
  const cat = (cx: number, cy: number) => `<path d="M${cx - 4} ${cy - 1}L${cx - 3.5} ${cy - 6}L${cx - 1} ${cy - 3}H${cx + 1}L${cx + 3.5} ${cy - 6}L${cx + 4} ${cy - 1}Z" fill="${K.am}"/><circle cx="${cx}" cy="${cy}" r="4" fill="${K.am}"/>`;
  const dog = (cx: number, cy: number) => `<circle cx="${cx}" cy="${cy}" r="3.8" fill="${K.m}"/><ellipse cx="${cx - 4}" cy="${cy}" rx="1.6" ry="3.4" fill="${K.ink}"/><ellipse cx="${cx + 4}" cy="${cy}" rx="1.6" ry="3.4" fill="${K.ink}"/>`;
  let thumbs = '', checks = '';
  for (let r = 0; r < 5; r++) {
    let row = '';
    for (let c = 0; c < 5; c++) {
      const x = x0 + c * pw, y = y0 + r * ph, isDog = dogAt[r] === c;
      thumbs += `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="1.5" fill="${W}"/>` + (isDog ? dog(x + 7.5, y + 7.5) : cat(x + 7.5, y + 8)) + `<circle cx="${x + tw - 1.5}" cy="${y + 1.5}" r="2" fill="${K.a}"/>`;
      if (!isDog) row += `M${x + 8} ${y + 9}l2.5 2.5 4.5-5`;
    }
    checks += pop(0.9 + r * 0.2, `<path d="${row}" fill="none" stroke="${K.p}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  const pile = [0, 1, 2].map((i) => `<rect x="${112 - i * 3}" y="${22 + i * 3}" width="36" height="28" rx="2" fill="${W}" stroke="${K.m}" stroke-width="1"/>`).join('');
  return svg(
    `<rect x="${x0 - 3}" y="${y0 - 3}" width="${5 * pw + 4}" height="${5 * ph + 4}" rx="3" fill="${K.f}"/>` + thumbs
    + tx(51, 14, 'AI 고양이 표시 25장', { size: 9.5, bold: true, fill: K.a })
    + dr(box(x0 - 3, y0 - 3, 5 * pw + 4, 5 * ph + 4), 0.1, { color: K.a, w: 2 })
    + checks + tx(51, 114, '정답표: 실제 고양이 20장', { size: 9.5, fill: K.p, bold: true, pop: 1.9 })
    + pile + tx(127, 64, '표시 안 한 75장', { size: 9, fill: K.ink })
    + tx(196, 32, '분모', { size: 9.5, fill: K.ink, pop: 0.4 }) + tx(196, 44, '= 표시된 25장', { size: 9.5, bold: true, fill: K.a, pop: 0.4 })
    + tx(196, 82, '20/25 = 0.8', { math: true, size: 14, pop: 2.2 })
    + tx(166, 104, '실제 고양이 전체가 분모면 다른 값', { size: 9, pop: 2.5 }),
  );
}

/** 파란 2·흰 3 주머니, 다시 넣고 뽑는 나무그림: 파랑 2/5 가지 → 창 1 → 파랑 2/5 가지 → 창 2 → 4/25 */
function windowDraws() {
  const card = (x: number, y: number, blue: boolean) => `<rect x="${x - 4.5}" y="${y - 6}" width="9" height="12" rx="1.5" fill="${blue ? K.p : W}" stroke="${blue ? K.p : K.m}" stroke-width="1"/>`;
  const pouch = `<path d="M10 52Q6 92 14 98H46Q54 92 50 52Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 52Q30 44 52 52" fill="none" stroke="${K.am}" stroke-width="2.2" stroke-linecap="round"/>`
    + card(18, 68, true) + card(30, 68, true) + card(42, 68, false) + card(24, 84, false) + card(36, 84, false);
  const R = [60, 64], B1 = [100, 38], W1 = [100, 84], BB = [148, 20], BW = [148, 50], WB = [148, 70], WW = [148, 94];
  const gray = (a: number[], b: number[]) => `M${a[0] + 5} ${a[1]}L${b[0] - 6} ${b[1]}`;
  const house = `<path d="M176 46L205 24L234 46Z" fill="${K.a}" fill-opacity=".8"/><rect x="180" y="46" width="50" height="48" fill="${K.f}" stroke="${K.p}" stroke-width="1.4"/>`
    + `<rect x="186" y="54" width="14" height="14" fill="${W}" stroke="${K.p}" stroke-width="1.2"/><rect x="210" y="54" width="14" height="14" fill="${W}" stroke="${K.p}" stroke-width="1.2"/>`;
  return svg(
    pouch + tx(30, 40, '파랑 2 · 흰 3', { size: 9, fill: K.ink }) + tx(30, 112, '다시 넣고 섞기', { size: 9, fill: K.ink })
    + `<circle cx="${R[0]}" cy="${R[1]}" r="3" fill="${K.p}"/><path d="${gray(R, W1)}${gray(B1, BW)}${gray(W1, WB)}${gray(W1, WW)}" stroke="${K.l}" stroke-width="1.6"/>`
    + card(B1[0], B1[1], true) + card(W1[0], W1[1], false) + card(BB[0], BB[1], true) + card(BW[0], BW[1], false) + card(WB[0], WB[1], true) + card(WW[0], WW[1], false)
    + tx(72, 92, '3/5', { size: 9, fill: K.m })
    + dr(gray(R, B1), 0.2, { color: K.a, w: 2.4 }) + tx(70, 42, '2/5', { size: 10, bold: true, fill: K.a, pop: 0.5 })
    + house + tx(193, 82, '창 1', { size: 9, fill: K.ink }) + tx(217, 82, '창 2', { size: 9, fill: K.ink })
    + pop(0.9, `<rect x="187" y="55" width="12" height="12" fill="${K.p}"/>`)
    + dr(gray(B1, BB), 1.3, { color: K.a, w: 2.4 }) + tx(118, 19, '2/5', { size: 10, bold: true, fill: K.a, pop: 1.6 })
    + pop(2.0, `<rect x="211" y="55" width="12" height="12" fill="${K.p}"/>`)
    + tx(186, 113, '(2/5) × (2/5) = 4/25', { math: true, size: 11.5, pop: 2.4 }),
  );
}

const drawings: Record<string, string> = {
  'equal-box': equalBox(),
  'music-union': musicUnion(),
  'shot-complement': shotComplement(),
  'design-condition': designCondition(),
  'cookie-without': cookieWithout(),
  'video-trials': videoTrials(),
  'habitat-independence': habitatIndependence(),
  'road-delay': roadDelay(),
  'routine-condition': routineCondition(),
  'ai-labels': aiLabels(),
  'window-draws': windowDraws(),
};
export default drawings;
