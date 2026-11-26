/**
 * 공통수학2 '도형의 방정식' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts cm2-figures`로 content/sets/cm2-figures.json의 svg 칸에 써 넣는다.
 * 장면(게임 지도·케이크·운동장 등) 위에 좌표를 겹쳐 그리고, 점 찍기·거리 선·이동·대칭만 차례로 움직인다.
 * 좌표 ↔ 화면은 카드마다 X(x), Y(y)로 한 번만 정하고, 그림 속 숫자는 카드 본문과 같다.
 */
import { K, W, tx, dr, ring, svg, pop, n1, arrow, guide } from './kit.ts';

/* ---- 공통 조각 ---- */

/** 바둑판 바닥(선 없이 칸 채움). 글자와 겹쳐도 선 검사에 걸리지 않게 채우기만 쓴다 */
function checker(x0: number, y0: number, cols: number, rows: number, c: number, color: string, op = 0.45) {
  let s = '';
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if ((i + j) % 2 === 0) s += `<rect x="${n1(x0 + i * c)}" y="${n1(y0 + j * c)}" width="${c}" height="${c}" fill="${color}" fill-opacity="${op}"/>`;
  return s;
}

const dot = (x: number, y: number, color: string = K.a, r = 3.2) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${color}"/>`;

/** 직각 표시: 꼭짓점 (x, y)에서 두 방향 (ux, uy), (vx, vy)로 s만큼 */
const rightMark = (x: number, y: number, ux: number, uy: number, vx: number, vy: number, s = 6, color: string = K.p) =>
  `<path d="M${n1(x + s * ux)} ${n1(y + s * uy)}L${n1(x + s * (ux + vx))} ${n1(y + s * (uy + vy))}L${n1(x + s * vx)} ${n1(y + s * vy)}" fill="none" stroke="${color}" stroke-width="1.2"/>`;

/* ---- 카드별 그림 ---- */

/** 게임 지도: 아이템 (0,0) 둘레 반지름 5 원, 캐릭터 (3,4)까지 가로 3 → 세로 4 → 거리 5 */
function gameRange() {
  const u = 10, X = (x: number) => 64 + u * x, Y = (y: number) => 62 - u * y;
  const gem = `<path d="M64 55L70 61L64 69L58 61Z" fill="${K.am}" stroke="${K.p}" stroke-width="1.2" stroke-linejoin="round"/><path d="M58 61H70" stroke="${K.p}" stroke-width=".8"/>`;
  const hero = `<circle cx="${X(3)}" cy="${Y(4)}" r="6.5" fill="${K.a}"/><rect x="${X(3) - 4}" y="${Y(4) - 2.5}" width="2.4" height="3" fill="${W}"/><rect x="${X(3) + 1.6}" y="${Y(4) - 2.5}" width="2.4" height="3" fill="${W}"/>`;
  return svg(
    `<rect x="8" y="6" width="112" height="112" rx="6" fill="${K.f}"/>` + checker(14, 12, 10, 10, 10, K.l, 0.35)
    + `<path d="M10 62H118M64 8V116" stroke="${K.m}" stroke-width="1"/>` + gem
    + dr(ring(64, 62, 50), 0.1, { color: K.p, w: 2.2 })
    + pop(0.9, hero) + tx(104, 20, '(3, 4)', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 0.9 })
    + dr(`M64 62H${X(3)}`, 1.1, { color: K.am, w: 2.2 }) + tx(79, 75, '3', { size: 10, bold: true, fill: K.ink, pop: 1.4 })
    + dr(`M${X(3)} 62V${Y(4) + 7}`, 1.5, { color: K.am, w: 2.2 }) + tx(99, 48, '4', { size: 10, bold: true, fill: K.ink, anchor: 'start', pop: 1.8 })
    + dr(`M64 62L${X(3) - 3.9} ${Y(4) + 5.2}`, 1.9, { color: K.a, w: 2.4 }) + tx(72, 40, '5', { size: 10.5, bold: true, fill: K.a, pop: 2.3 })
    + tx(181, 22, '한 칸 = 1 m', { size: 9.5 })
    + tx(181, 46, 'x² + y² = 25', { math: true, size: 12.5 })
    + tx(181, 70, '(3, 4)를 넣으면', { size: 9.5, fill: K.ink, pop: 2.3 })
    + tx(181, 88, '3² + 4² = 25', { math: true, size: 12, pop: 2.5 })
    + tx(181, 107, '경계 위', { size: 10.5, bold: true, fill: K.a, pop: 2.7 }),
  );
}

/** 편집 화면: 0~150초를 5칸으로 나눠 앞 2칸(빨강) · 뒤 3칸(파랑), 경계 60초에 표시 */
function musicMarker() {
  const X = (t: number) => 20 + (t * 200) / 150;
  const wave = Array.from({ length: 50 }, (_, i) => {
    const h = 3 + 12 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) + 2 * ((i * 7) % 3);
    return `<rect x="${n1(21 + i * 4)}" y="${n1(42 - h)}" width="2.4" height="${n1(2 * h)}" rx="1.2" fill="${i * 4 < 80 ? K.am : K.l}"/>`;
  }).join('');
  const chunks = [0, 1, 2, 3, 4].map((i) => pop(0.1 + i * 0.15, `<rect x="${X(30 * i) + 1}" y="90" width="38" height="11" rx="2" fill="${i < 2 ? K.a : K.p}"/>`)).join('');
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => `M${X(30 * i)} 67V73`).join('');
  return svg(
    `<rect x="12" y="20" width="216" height="44" rx="5" fill="${K.f}"/>` + wave
    + `<path d="M${X(0)} 70H${X(150)}" stroke="${K.p}" stroke-width="1.6"/><path d="${ticks}" stroke="${K.p}" stroke-width="1.4"/>`
    + tx(X(0), 84, '0초', { size: 9.5 }) + tx(X(150) - 2, 84, '150초', { size: 9.5 })
    + chunks + tx(X(30), 114, '앞 2칸', { size: 9.5, bold: true, fill: K.a, pop: 0.5 }) + tx(X(105), 114, '뒤 3칸', { size: 9.5, bold: true, fill: K.p, pop: 0.8 })
    + dr(`M${X(60)} 74V20`, 1.0, { color: K.a, w: 2.2 })
    + pop(1.8, `<path d="M${X(60)} 20h12l-3 4 3 4h-12z" fill="${K.a}"/>`) + tx(X(60), 84, '60초', { size: 10, bold: true, fill: K.a, pop: 1.8 })
    + tx(230, 13, '150 × 2/5 = 60', { math: true, size: 11.5, anchor: 'end', pop: 2.1 }),
  );
}

/** 운동장(잔디 줄무늬) 위 두 지점 (1,2)·(4,6): 가로 3 → 세로 4 → 곧은 거리 5 */
function sportsDistance() {
  const u = 16, X = (x: number) => 104 + u * x, Y = (y: number) => 116 - u * y;
  const stripes = Array.from({ length: 8 }, (_, i) => i % 2 ? '' : `<rect x="${100 + i * 17}" y="4" width="17" height="112" fill="${K.l}" fill-opacity=".4"/>`).join('');
  const cone = (x: number, y: number) => `<path d="M${x - 5} ${y + 3}L${x} ${y - 9}L${x + 5} ${y + 3}Z" fill="${K.am}"/><path d="M${x - 3} ${y - 2}H${x + 3}" stroke="${W}" stroke-width="1.4"/>`;
  return svg(
    `<rect x="100" y="4" width="136" height="112" rx="6" fill="${K.f}"/>` + stripes
    + `<path d="M236 36H210V84H236" fill="none" stroke="${W}" stroke-width="1.6"/><circle cx="236" cy="60" r="6" fill="none" stroke="${W}" stroke-width="1.6"/>`
    + cone(X(1), Y(2) + 8) + cone(X(4) - 12, Y(6) + 4) + dot(X(1), Y(2), K.p) + dot(X(4), Y(6), K.p)
    + tx(116, 100, '(1, 2)', { size: 10, fill: K.ink }) + tx(176, 23, '(4, 6)', { size: 10, fill: K.ink, anchor: 'start' })
    + dr(`M${X(1)} ${Y(2)}H${X(4)}`, 0.2, { color: K.p, w: 2 }) + tx(144, 98, '3 m', { size: 10, bold: true, fill: K.p, pop: 0.7 })
    + dr(`M${X(4)} ${Y(2)}V${Y(6)}`, 0.8, { color: K.p, w: 2 }) + tx(174, 56, '4 m', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 1.3 })
    + pop(0.8, rightMark(X(4), Y(2), -1, 0, 0, -1))
    + dr(`M${X(1)} ${Y(2)}L${X(4)} ${Y(6)}`, 1.5, { color: K.a, w: 2.6 }) + tx(136, 48, '5 m', { size: 10.5, bold: true, fill: K.a, anchor: 'end', pop: 2.2 })
    + tx(50, 18, '운동장 (단위 m)', { size: 9 })
    + tx(50, 40, '가로 4 − 1 = 3', { size: 10, fill: K.ink, pop: 0.6 })
    + tx(50, 58, '세로 6 − 2 = 4', { size: 10, fill: K.ink, pop: 1.2 })
    + tx(50, 84, '√(3² + 4²)', { math: true, size: 12.5, pop: 2.2 })
    + tx(50, 104, '= 5 m', { math: true, size: 13, pop: 2.4 }),
  );
}

/** 옷 도안: 세로 중심선 = y축, 오른쪽 소매 무늬 (3,2) → 같은 높이로 왼쪽 (−3,2) */
function fashionMirror() {
  const u = 12, X = (x: number) => 84 + u * x, Y = (y: number) => 70 - u * y;
  const blouse = `<path d="M72 14Q84 25 96 14L112 18L142 48L130 58L108 40L110 112H58L60 40L38 58L26 48L56 18Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.6" stroke-linejoin="round"/><path d="M72 14Q84 25 96 14" fill="none" stroke="${K.p}" stroke-width="1.6"/>`;
  const flower = (cx: number, cy: number) => [0, 1, 2, 3, 4].map((k) => {
    const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
    return `<circle cx="${n1(cx + 3.6 * Math.cos(a))}" cy="${n1(cy + 3.6 * Math.sin(a))}" r="2.7" fill="${K.a}"/>`;
  }).join('') + `<circle cx="${cx}" cy="${cy}" r="1.8" fill="${K.am}"/>`;
  return svg(
    blouse + guide(`M84 24V116`, K.m)
    + flower(X(3), Y(2)) + tx(X(3) + 4, 76, '(3, 2)', { size: 10, bold: true, fill: K.ink })
    + arrow(X(3) - 7, Y(2), X(-3) + 7, Y(2), 0.2, { color: K.am, w: 1.8 })
    + tx(102, 41, '3', { size: 9.5, bold: true, fill: K.am, pop: 0.9 }) + tx(66, 41, '3', { size: 9.5, bold: true, fill: K.am, pop: 1.0 })
    + pop(1.3, flower(X(-3), Y(2))) + tx(X(-3) - 6, 76, '(−3, 2)', { size: 10, bold: true, fill: K.a, pop: 1.4 })
    + tx(196, 24, '세로 중심선 = y축', { size: 9.5 })
    + tx(196, 50, '(3, 2) → (−3, 2)', { math: true, size: 11, pop: 1.6 })
    + tx(196, 76, '(x, y) → (−x, y)', { math: true, size: 11.5, pop: 1.9 })
    + tx(196, 98, '좌우만 바뀌고', { size: 9.5, fill: K.ink, pop: 2.2 }) + tx(196, 112, '높이 2는 그대로', { size: 9.5, fill: K.ink, pop: 2.2 }),
  );
}

/** 케이크 윗면: 중심 (2,3)에서 위·왼·아래로 반지름 4, 마지막으로 (6,3)의 딸기까지 4 */
function cookingCircle() {
  const u = 10, cx = 56, cy = 60, X = (x: number) => cx + u * (x - 2), Y = (y: number) => cy - u * (y - 3);
  const cream = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8 + Math.PI / 16;
    return `<circle cx="${n1(cx + 35 * Math.cos(a))}" cy="${n1(cy + 35 * Math.sin(a))}" r="2.2" fill="${W}"/>`;
  }).join('');
  const berry = `<path d="M${X(6) - 5} ${Y(3) - 3}Q${X(6)} ${Y(3) + 10} ${X(6) + 5} ${Y(3) - 3}Q${X(6)} ${Y(3) - 6} ${X(6) - 5} ${Y(3) - 3}Z" fill="${K.a}"/><path d="M${X(6) - 3} ${Y(3) - 5}l3 2 3-2" fill="none" stroke="${K.p}" stroke-width="1.4" stroke-linecap="round"/>`;
  return svg(
    `<circle cx="${cx}" cy="${cy}" r="47" fill="${W}" stroke="${K.l}" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="40" fill="${K.f}" stroke="${K.am}" stroke-width="2.4"/>` + cream
    + dot(cx, cy, K.ink, 2.6) + tx(40, 48, '(2, 3)', { size: 9.5, bold: true, fill: K.ink })
    + dr(`M${cx} ${cy}V${Y(7)}`, 0.1, { color: K.p, w: 1.8 }) + tx(62, 34, '4', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 0.5 })
    + dr(`M${cx} ${cy}H${X(-2)}`, 0.4, { color: K.p, w: 1.8 }) + tx(30, 72, '4', { size: 10, bold: true, fill: K.p, pop: 0.8 })
    + dr(`M${cx} ${cy}V${Y(-1)}`, 0.7, { color: K.p, w: 1.8 }) + tx(62, 88, '4', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 1.1 })
    + dr(`M${cx} ${cy}H${X(6) - 6}`, 1.1, { color: K.a, w: 2.2 }) + tx(80, 55, '4', { size: 10, bold: true, fill: K.a, pop: 1.5 })
    + pop(1.8, berry) + tx(108, 64, '(6, 3)', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 1.8 })
    + tx(188, 20, '중심 (2, 3)', { size: 9.5, fill: K.ink }) + tx(188, 34, '반지름 4 cm', { size: 9.5, fill: K.ink })
    + tx(188, 60, '(6, 3)을 넣으면', { size: 9.5, pop: 2.0 })
    + tx(188, 80, '(6 − 2)² + 0² = 16', { math: true, size: 11, pop: 2.2 })
    + tx(188, 104, '테두리 위', { size: 10.5, bold: true, fill: K.a, pop: 2.5 }),
  );
}

/** 영상 화면 격자: 자막 상자 한 점 (2,1) → 오른쪽 3 → 위로 2 → (5,3), 상자째 이동 */
function videoShift() {
  const u = 16, X = (x: number) => 16 + u * x, Y = (y: number) => 104 - u * y;
  const dots = Array.from({ length: 9 }, (_, i) => Array.from({ length: 7 }, (_, j) => `<circle cx="${X(i)}" cy="${Y(j)}" r="1" fill="${W}" fill-opacity=".35"/>`).join('')).join('');
  const caption = (x: number, y: number, fill: string, ink: string) =>
    `<rect x="${x}" y="${y - u}" width="${3 * u}" height="${u}" rx="2" fill="${fill}"/><path d="M${x + 6} ${y - 8}H${x + 30}M${x + 34} ${y - 8}H${x + 42}" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  return svg(
    `<rect x="6" y="6" width="148" height="108" rx="6" fill="${K.ink}"/>` + dots
    + `<circle cx="16" cy="15" r="3" fill="${K.a}"/>` + tx(24, 18.5, 'REC', { size: 9, fill: W, anchor: 'start' })
    + caption(X(2), Y(1), K.l, K.ink) + dot(X(2), Y(1), K.a) + tx(X(2) - 4, 92, '(2, 1)', { size: 9.5, fill: W, anchor: 'end' })
    + arrow(X(2), Y(1), X(5), Y(1), 0.2, { color: K.am, w: 2 }) + tx(72, 100, '오른쪽 3', { size: 9.5, bold: true, fill: K.am, pop: 0.6 })
    + arrow(X(5), Y(1), X(5), Y(3), 1.0, { color: K.am, w: 2 }) + tx(101, 78, '위로 2', { size: 9.5, bold: true, fill: K.am, anchor: 'start', pop: 1.4 })
    + pop(1.7, caption(X(5), Y(3), K.am, W) + dot(X(5), Y(3), K.a)) + tx(80, 51, '(5, 3)', { size: 9.5, bold: true, fill: W, pop: 1.8 })
    + tx(197, 24, '모든 점을 똑같이', { size: 9.5 })
    + tx(197, 50, '(2, 1) → (5, 3)', { math: true, size: 11, pop: 1.9 })
    + tx(197, 76, '(x + 3, y + 2)', { math: true, size: 11.5, pop: 2.2 })
    + tx(197, 100, '모양은 그대로', { size: 9.5, fill: K.ink, pop: 2.5 }),
  );
}

/** 포스터: y=2x+1(기울기 2) 다음 기울기 −1/2 직선, 만나는 점에 직각 */
function designPerpendicular() {
  const u = 12, X = (x: number) => 40 + u * x, Y = (y: number) => 90 - u * y;
  const l1 = (x: number) => 2 * x + 1, l2 = (x: number) => -x / 2 + 3.5;
  const grid = Array.from({ length: 10 }, (_, i) => Array.from({ length: 9 }, (_, j) => `<circle cx="${X(i - 2)}" cy="${Y(j - 1)}" r=".9" fill="${K.l}"/>`).join('')).join('');
  const s = Math.sqrt(5);
  return svg(
    `<rect x="6" y="4" width="124" height="112" rx="3" fill="${W}" stroke="${K.l}" stroke-width="1.5"/>` + grid
    + `<circle cx="108" cy="36" r="13" fill="${K.am}" fill-opacity=".3"/><circle cx="14" cy="11" r="3" fill="${K.a}"/><circle cx="122" cy="11" r="3" fill="${K.a}"/>`
    + dr(`M${X(-1.25)} ${Y(l1(-1.25))}L${X(2.6)} ${Y(l1(2.6))}`, 0.1, { color: K.p, w: 2.4 })
    + tx(80, 30, 'y = 2x + 1', { math: true, size: 11, fill: K.p, anchor: 'start', pop: 0.6 })
    + pop(0.8, `<path d="M${X(-1)} ${Y(-1)}H${X(0)}V${Y(1)}" fill="none" stroke="${K.p}" stroke-width="1.3"/>`)
    + tx(X(-0.5), 113, '1', { size: 9.5, bold: true, fill: K.p, pop: 0.8 }) + tx(X(0) + 4, 94, '2', { size: 9.5, bold: true, fill: K.p, anchor: 'start', pop: 0.8 })
    + dr(`M${X(-1.5)} ${Y(l2(-1.5))}L${X(7)} ${Y(l2(7))}`, 1.1, { color: K.a, w: 2.4 })
    + pop(1.8, `<path d="M${X(3)} ${Y(2)}H${X(5)}V${Y(1)}" fill="none" stroke="${K.a}" stroke-width="1.3"/>`)
    + tx(X(4), 62, '2', { size: 9.5, bold: true, fill: K.a, pop: 1.8 }) + tx(X(5) + 4, 76, '1', { size: 9.5, bold: true, fill: K.a, anchor: 'start', pop: 1.8 })
    + pop(2.2, rightMark(X(1), Y(3), 1 / s, -2 / s, 2 / s, 1 / s, 7, K.ink))
    + tx(187, 26, '기울기 2', { size: 10, bold: true, fill: K.p, pop: 0.8 })
    + tx(187, 44, '기울기 −1/2', { size: 10, bold: true, fill: K.a, pop: 1.8 })
    + tx(187, 74, '2 × (−1/2) = −1', { math: true, size: 11.5, pop: 2.4 })
    + tx(187, 98, '곱이 −1 → 직각', { size: 9.5, bold: true, fill: K.ink, pop: 2.6 }),
  );
}

/** 놀이터 지도: 벽 x=2, 강아지 (7,4). 비스듬한 길(점선)보다 수직으로 내린 길 (2,4)까지 5가 가장 짧다 */
function animalBoundary() {
  const u = 14, X = (x: number) => 10 + u * x, Y = (y: number) => 108 - u * y;
  const dx = X(7), dy = Y(4);
  const bricks = Array.from({ length: 14 }, (_, j) => `<rect x="${j % 2 ? 32 : 34}" y="${6 + j * 8}" width="${j % 2 ? 12 : 10}" height="7" rx="1" fill="${K.am}" fill-opacity=".65"/>`).join('');
  const dog = `<g transform="translate(${dx} ${dy})"><path d="M9 2q7-3 6-11" fill="none" stroke="${K.am}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="3" cy="3" rx="8" ry="7" fill="${K.am}"/><ellipse cx="-3" cy="-1" rx="5" ry="8" fill="${K.am}"/><rect x="-7" y="4" width="3" height="7" rx="1" fill="${K.am}"/><circle cx="-6" cy="-10" r="5.5" fill="${K.am}"/><ellipse cx="-11" cy="-8.5" rx="3.5" ry="2.5" fill="${K.am}"/><ellipse cx="-2.5" cy="-9" rx="2" ry="4.5" fill="${K.m}"/><circle cx="-7" cy="-11" r="1" fill="${K.ink}"/><circle cx="-14.2" cy="-9" r="1.1" fill="${K.ink}"/></g>`;
  const from = (tx2: number, ty2: number) => {
    const L = Math.hypot(tx2 - dx, ty2 - dy);
    return `M${n1(dx + (9 * (tx2 - dx)) / L)} ${n1(dy + (9 * (ty2 - dy)) / L)}L${tx2} ${ty2}`;
  };
  return svg(
    `<rect x="44" y="6" width="100" height="110" rx="4" fill="${K.f}"/>` + bricks
    + tx(48, 16, '벽 x = 2', { size: 9.5, bold: true, fill: K.ink, anchor: 'start' })
    + pop(0.2, guide(from(X(2), Y(7)) + from(X(2), Y(1)), K.m))
    + dr(from(X(2), dy), 0.6, { color: K.a, w: 2.4 }) + dog
    + pop(1.5, rightMark(X(2), dy, 1, 0, 0, -1) + dot(X(2), dy))
    + tx(48, 44, '(2, 4)', { size: 9.5, bold: true, fill: K.a, anchor: 'start', pop: 1.5 })
    + tx(78, 64, '5 m', { size: 10.5, bold: true, fill: K.a, pop: 1.6 })
    + tx(dx, 76, '(7, 4)', { size: 9.5, fill: K.ink })
    + tx(192, 24, '비스듬한 길은 더 멀다', { size: 9, pop: 0.4 })
    + tx(192, 48, '가장 가까운 점', { size: 9.5, fill: K.ink, pop: 1.5 })
    + tx(192, 64, '(2, 4)', { math: true, size: 12, pop: 1.5 })
    + tx(192, 90, 'd = |7 − 2|', { math: true, size: 12, pop: 1.9 })
    + tx(192, 108, '= 5 m', { math: true, size: 12.5, pop: 2.1 }),
  );
}

/** 지도: 캠핑장 A(0,0) — 전망대 B(8,4) 길을 4칸으로 나누고 A에서 1칸 간 곳 P(2,1) */
function travelMeet() {
  const u = 21, X = (x: number) => 22 + u * x, Y = (y: number) => 104 - u * y;
  const nx = 1 / Math.sqrt(5), ny = 2 / Math.sqrt(5);
  const tick = (k: number) => `M${n1(X(2 * k) - 6 * nx)} ${n1(Y(k) - 6 * ny)}L${n1(X(2 * k) + 6 * nx)} ${n1(Y(k) + 6 * ny)}`;
  const tent = `<path d="M2 104L11 86L20 104Z" fill="${K.am}"/><path d="M11 104L11 94L15 104" fill="${K.f}"/>`;
  const tower = `<path d="M198 24L201 6H207L210 24Z" fill="${K.p}"/><rect x="199" y="2" width="10" height="4" rx="1" fill="${K.a}"/>`;
  return svg(
    `<path d="M${X(0)} ${Y(0)}L${X(8)} ${Y(4)}" stroke="${K.l}" stroke-width="9" stroke-linecap="round"/><path d="M${X(0)} ${Y(0)}L${X(8)} ${Y(4)}" stroke="${W}" stroke-width="1.2" stroke-dasharray="4 4"/>`
    + tent + tower + dot(X(0), Y(0), K.p) + dot(X(8), Y(4), K.p)
    + tx(26, 117, 'A(0, 0)', { size: 9.5, fill: K.ink, anchor: 'start' }) + tx(214, 40, 'B(8, 4)', { size: 9.5, fill: K.ink })
    + [1, 2, 3].map((k) => pop(0.1 + k * 0.2, `<path d="${tick(k)}" stroke="${K.p}" stroke-width="2" stroke-linecap="round"/>`)).join('')
    + tx(176, 76, '길 전체를 4칸으로', { size: 9.5, pop: 0.5 })
    + dr(`M${X(0)} ${Y(0)}L${X(2)} ${Y(1)}`, 1.0, { color: K.a, w: 4 })
    + tx(38, 86, '1', { size: 10, bold: true, fill: K.a, pop: 1.4 }) + tx(124, 44, '3', { size: 10, bold: true, fill: K.p, pop: 1.4 })
    + pop(1.7, `<circle cx="${X(2)}" cy="${Y(1)}" r="4.5" fill="${K.a}" stroke="${W}" stroke-width="1.5"/>`)
    + tx(52, 70, 'P(2, 1)', { size: 10, bold: true, fill: K.a, pop: 1.8 })
    + tx(176, 95, 'A에서 1/4 지점', { size: 10, bold: true, fill: K.a, pop: 2.0 })
    + tx(176, 113, '(8 ÷ 4, 4 ÷ 4) = (2, 1)', { math: true, size: 10.5, pop: 2.3 }),
  );
}

/** 보호 구역(중심 (0,0), 반지름 3)과 도로 y=3: 중심에서 도로로 내린 거리 = 3 = 반지름 → 한 점 (0,3) */
function carTangent() {
  const u = 14, X = (x: number) => 66 + u * x, Y = (y: number) => 72 - u * y;
  const trees = [[-1.6, 1], [1.4, 1.2], [-1.2, -1.6], [1.5, -1.3], [0.2, -2.1]].map(([x, y]) => `<circle cx="${n1(X(x))}" cy="${n1(Y(y))}" r="5" fill="${K.am}" fill-opacity=".55"/><circle cx="${n1(X(x) + 3)}" cy="${n1(Y(y) - 2)}" r="3.5" fill="${K.am}" fill-opacity=".55"/>`).join('');
  const car = `<rect x="150" y="25" width="26" height="11" rx="3" fill="${K.a}"/><rect x="155" y="27" width="5" height="7" rx="1" fill="${W}" fill-opacity=".8"/><rect x="166" y="27" width="4" height="7" rx="1" fill="${W}" fill-opacity=".8"/>`;
  return svg(
    `<circle cx="${X(0)}" cy="${Y(0)}" r="${3 * u}" fill="${K.f}" stroke="${K.p}" stroke-width="2"/>` + trees
    + `<path d="M6 ${Y(3)}H234" stroke="${K.l}" stroke-width="10"/><path d="M6 ${Y(3)}H234" stroke="${K.p}" stroke-width="1.6"/>` + car
    + dot(X(0), Y(0), K.ink, 2.6) + tx(X(0), 88, '(0, 0)', { size: 9.5, fill: K.ink })
    + tx(208, 16, '도로 y = 3', { size: 9.5, fill: K.ink })
    + dr(`M${X(0)} ${Y(0)}V${Y(3) + 2}`, 0.2, { color: K.a, w: 2.4 }) + tx(X(0) + 6, 55, '3', { size: 10.5, bold: true, fill: K.a, anchor: 'start', pop: 0.7 })
    + pop(1.1, rightMark(X(0), Y(3), 1, 0, 0, 1, 6, K.ink))
    + pop(1.4, `<circle cx="${X(0)}" cy="${Y(3)}" r="4.2" fill="${K.a}" stroke="${W}" stroke-width="1.4"/>`) + tx(X(0), 16, '(0, 3)', { size: 10, bold: true, fill: K.a, pop: 1.4 })
    + tx(180, 58, 'x² + y² = 9', { math: true, size: 12 })
    + tx(180, 78, 'y = 3 → x² = 0', { math: true, size: 11.5, pop: 1.7 })
    + tx(180, 97, '만나는 점 한 개', { size: 10, bold: true, fill: K.a, pop: 2.0 })
    + tx(180, 113, '중심~도로 거리 = 반지름', { size: 9, pop: 2.2 }),
  );
}

/** 실내 걷기 경로: 시작점 (4,2)를 왼쪽 4 → 아래 2 옮기면 (0,0), 경로 전체가 같은 모양으로 */
function healthPath() {
  const u = 13, X = (x: number) => 30 + u * x, Y = (y: number) => 104 - u * y;
  const route: [number, number][] = [[4, 2], [6, 3], [8, 3], [9, 5], [7, 6]];
  const d = (pts: [number, number][]) => 'M' + pts.map(([x, y]) => `${X(x)} ${Y(y)}`).join('L');
  const moved = route.map(([x, y]) => [x - 4, y - 2] as [number, number]);
  const shoe = `<path d="M178 14Q180 8 186 9L190 16Q200 18 212 20Q218 22 216 28H178Z" fill="${K.f}" stroke="${K.p}" stroke-width="1.5" stroke-linejoin="round"/><path d="M178 28H216" stroke="${K.p}" stroke-width="2.4"/><path d="M188 14l3 4M193 13l2 4" stroke="${K.a}" stroke-width="1.2"/>`;
  return svg(
    `<rect x="4" y="12" width="150" height="104" rx="5" fill="${K.f}"/>` + checker(4, 12, 11, 8, 13.6, K.l, 0.3)
    + `<path d="${d(route)}" fill="none" stroke="${K.p}" stroke-width="2.2" stroke-linejoin="round"/>` + route.map(([x, y]) => dot(X(x), Y(y), K.p, 2.4)).join('')
    + tx(92, 89, '(4, 2)', { size: 9.5, fill: K.p, anchor: 'start' })
    + arrow(X(4), Y(2), X(0), Y(2), 0.2, { color: K.am, w: 2 }) + tx(56, 72, '왼쪽 4', { size: 9.5, bold: true, fill: K.am, pop: 0.6 })
    + arrow(X(0), Y(2), X(0), Y(0), 1.0, { color: K.am, w: 2 }) + tx(26, 94, '아래 2', { size: 9.5, bold: true, fill: K.am, anchor: 'end', pop: 1.3 })
    + dr(d(moved), 1.6, { color: K.a, w: 2.4 }) + pop(2.4, moved.map(([x, y]) => dot(X(x), Y(y), K.a, 2.4)).join(''))
    + tx(X(0), 116, '(0, 0)', { size: 9.5, bold: true, fill: K.a, pop: 2.4 })
    + shoe
    + tx(197, 50, '(4, 2) → (0, 0)', { math: true, size: 11, pop: 1.5 })
    + tx(197, 74, '(x − 4, y − 2)', { math: true, size: 11.5, pop: 1.8 })
    + tx(197, 98, '구간 길이 그대로', { size: 9.5, fill: K.ink, pop: 2.6 }),
  );
}

/** 공원 설계도: 나무 (1,−2) 둘레 반지름 2 경계를 그리고, 안쪽 점(2,−3)·바깥 점(3,−4)을 식에 넣어 본다 */
function environmentRadius() {
  const u = 20, X = (x: number) => 24 + u * x, Y = (y: number) => 14 - u * y;
  const cx = X(1), cy = Y(-2);
  const canopy = [[0, 0, 9], [-6, -4, 6], [6, -4, 6], [-6, 5, 6], [6, 5, 6]].map(([x, y, r]) => `<circle cx="${cx + x}" cy="${cy + y}" r="${r}" fill="${K.am}" fill-opacity=".6"/>`).join('');
  return svg(
    `<rect x="2" y="4" width="108" height="112" rx="8" fill="${K.f}"/><path d="M2 108Q60 100 110 112" fill="none" stroke="${K.l}" stroke-width="8"/>`
    + pop(0.9, `<circle cx="${cx}" cy="${cy}" r="${2 * u}" fill="${K.am}" fill-opacity=".18"/>`)
    + canopy + dot(cx, cy, K.ink, 2.2)
    + dr(ring(cx, cy, 2 * u), 0.1, { color: K.p, w: 2.2 })
    + tx(cx, 34, '(1, −2)', { size: 9.5, bold: true, fill: K.ink })
    + dr(`M${cx} ${cy}H${cx + 2 * u}`, 0.9, { color: K.a, w: 2 }) + tx(cx + 30, cy - 4, '2 m', { size: 9.5, bold: true, fill: K.a, pop: 1.3 })
    + pop(1.6, `<circle cx="${X(2)}" cy="${Y(-3)}" r="3.6" fill="${K.p}" stroke="${W}" stroke-width="1.2"/>`)
    + pop(2.2, `<circle cx="${X(3)}" cy="${Y(-4)}" r="3.6" fill="${K.a}" stroke="${W}" stroke-width="1.2"/>`)
    + tx(176, 20, '(x − 1)² + (y + 2)² = 4', { math: true, size: 10.5 })
    + tx(176, 46, '(2, −3) → 1 + 1 = 2 &lt; 4', { math: true, size: 10, fill: K.p, pop: 1.7 })
    + tx(176, 60, '경계 안쪽', { size: 9.5, bold: true, fill: K.p, pop: 1.7 })
    + tx(176, 82, '(3, −4) → 4 + 4 = 8 &gt; 4', { math: true, size: 10, fill: K.a, pop: 2.3 })
    + tx(176, 96, '경계 바깥', { size: 9.5, bold: true, fill: K.a, pop: 2.3 })
    + tx(176, 114, '왼쪽 값 &lt; 4 이면 안쪽', { size: 9, pop: 2.6 }),
  );
}

/** 그림판 창: 캐릭터 점 (2,−3)에서 원점을 지나 같은 거리만큼 → (−2,3), 캐릭터도 뒤집혀 나타남 */
function computerReflect() {
  const u = 13, X = (x: number) => 77 + u * x, Y = (y: number) => 66 - u * y;
  const bot = (x: number, y: number, rot: number) =>
    `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 6}" y="${y - 6}" width="12" height="11" rx="2" fill="${K.am}"/><circle cx="${x - 2.5}" cy="${y - 2}" r="1.4" fill="${K.ink}"/><circle cx="${x + 2.5}" cy="${y - 2}" r="1.4" fill="${K.ink}"/><path d="M${x} ${y - 6}V${y - 9}" stroke="${K.ink}" stroke-width="1.2"/><circle cx="${x}" cy="${y - 10}" r="1.4" fill="${K.a}"/><rect x="${x - 4}" y="${y + 5}" width="8" height="3" fill="${K.ink}"/></g>`;
  const tickAt = (x: number, y: number) => `<path d="M${n1(x - 3.3)} ${n1(y - 2.2)}l6.6 4.4" stroke="${K.ink}" stroke-width="1.4"/>`;
  return svg(
    `<rect x="6" y="6" width="138" height="108" rx="5" fill="${W}" stroke="${K.p}" stroke-width="1.6"/><path d="M6 18V11a5 5 0 0 1 5-5h128a5 5 0 0 1 5 5V18Z" fill="${K.p}"/>`
    + [14, 21, 28].map((x) => `<circle cx="${x}" cy="12" r="2" fill="${W}"/>`).join('') + tx(80, 15.5, '그림판', { size: 9, fill: W })
    + `<path d="M12 66H140M77 22V110" stroke="${K.l}" stroke-width="1.2"/>`
    + bot(X(2), Y(-3), 0) + tx(116, 92, '(2, −3)', { size: 9.5, bold: true, fill: K.p })
    + dr(`M${X(2)} ${Y(-3) - 7}L${X(0)} ${Y(0)}`, 0.2, { color: K.a, w: 2 })
    + pop(1.0, tickAt((X(2) + X(0)) / 2, (Y(-3) + Y(0) - 7) / 2) + dot(X(0), Y(0), K.ink, 2.6))
    + dr(`M${X(0)} ${Y(0)}L${X(-2)} ${Y(3) + 7}`, 1.1, { color: K.a, w: 2 })
    + pop(1.9, tickAt((X(-2) + X(0)) / 2, (Y(3) + 7 + Y(0)) / 2) + bot(X(-2), Y(3), 180))
    + tx(40, 44, '(−2, 3)', { size: 9.5, bold: true, fill: K.a, pop: 2.0 })
    + tx(192, 24, '원점 대칭', { size: 10, bold: true, fill: K.ink })
    + tx(192, 48, '(2, −3)', { math: true, size: 12, fill: K.p })
    + arrow(192, 55, 192, 68, 1.0, { color: K.a, w: 1.8 })
    + tx(192, 84, '(−2, 3)', { math: true, size: 12, pop: 1.9 })
    + tx(192, 108, '(x, y) → (−x, −y)', { math: true, size: 10.5, pop: 2.3 }),
  );
}

/** 건축 도안: 벽 y=2x+1, y=2x−3. 둘 다 오른쪽 1칸에 위로 2칸(기울기 2), 가로 간격이 어디서나 같다 */
function architectureLines() {
  const u = 12, X = (x: number) => 56 + u * x, Y = (y: number) => 68 - u * y;
  const seg = (b: number) => [(-3.5 - b) / 2, (5 - b) / 2].map((x) => [X(x), Y(2 * x + b)]);
  const [[a1, b1], [c1, d1]] = seg(1), [[a2, b2], [c2, d2]] = seg(-3);
  const gap = (y: number, at: number) => {
    const x1 = X((y - 1) / 2) + 4, x2 = X((y + 3) / 2) - 4;
    return pop(at, `<path d="M${n1(x1)} ${Y(y)}H${n1(x2)}" stroke="${K.am}" stroke-width="1.6"/><path d="M${n1(x1 + 3)} ${Y(y) - 3}L${n1(x1)} ${Y(y)}L${n1(x1 + 3)} ${Y(y) + 3}M${n1(x2 - 3)} ${Y(y) - 3}L${n1(x2)} ${Y(y)}L${n1(x2 - 3)} ${Y(y) + 3}" fill="none" stroke="${K.am}" stroke-width="1.6"/>`);
  };
  return svg(
    `<rect x="4" y="4" width="136" height="112" rx="4" fill="${W}"/>`
    + `<path d="M${a1} ${b1}L${c1} ${d1}L${c2} ${d2}L${a2} ${b2}Z" fill="${K.f}"/>`
    + `<path d="M${a1 - 6} ${b1}L${c1 - 6} ${d1}L${c1} ${d1}L${a1} ${b1}Z" fill="${K.l}"/><path d="M${a2} ${b2}L${c2} ${d2}L${c2 + 6} ${d2}L${a2 + 6} ${b2}Z" fill="${K.l}"/>`
    + `<path d="M6 ${Y(0)}H138M${X(0)} 6V114" stroke="${K.m}" stroke-width="1"/>`
    + dr(`M${a1} ${b1}L${c1} ${d1}`, 0.1, { color: K.p, w: 2.2 }) + dr(`M${a2} ${b2}L${c2} ${d2}`, 0.6, { color: K.a, w: 2.2 })
    + pop(1.2, `<path d="M${X(-2)} ${Y(-3)}H${X(-1)}V${Y(-1)}" fill="none" stroke="${K.p}" stroke-width="1.3"/>`)
    + tx(X(-1.5), 114, '1', { size: 9.5, bold: true, fill: K.p, pop: 1.2 }) + tx(X(-1) + 4, 94, '2', { size: 9.5, bold: true, fill: K.p, anchor: 'start', pop: 1.2 })
    + pop(1.5, `<path d="M${X(2)} ${Y(1)}H${X(3)}V${Y(3)}" fill="none" stroke="${K.a}" stroke-width="1.3"/>`)
    + tx(X(2.5), 65, '1', { size: 9.5, bold: true, fill: K.a, pop: 1.5 }) + tx(X(3) + 4, 47, '2', { size: 9.5, bold: true, fill: K.a, anchor: 'start', pop: 1.5 })
    + pop(1.8, dot(X(0), Y(1), K.p, 2.8) + dot(X(0), Y(-3), K.a, 2.8))
    + tx(X(0) - 6, Y(1) - 2, '1', { size: 9.5, bold: true, fill: K.p, anchor: 'end', pop: 1.8 }) + tx(X(0) + 6, Y(-3) + 3.5, '−3', { size: 9.5, bold: true, fill: K.a, anchor: 'start', pop: 1.8 })
    + gap(4, 2.1) + gap(2, 2.3)
    + tx(190, 22, 'y = 2x + 1', { math: true, size: 11.5, fill: K.p })
    + tx(190, 40, 'y = 2x − 3', { math: true, size: 11.5 })
    + tx(190, 64, '기울기 2 = 2', { size: 9.5, fill: K.ink, pop: 1.5 })
    + tx(190, 80, 'y절편 1 ≠ −3', { size: 9.5, fill: K.ink, pop: 1.9 })
    + tx(190, 104, '간격 그대로 → 나란히', { size: 9.5, bold: true, fill: K.a, pop: 2.5 }),
  );
}

/** 무대 바닥(나무판): 두 자리 (−2,1)·(2,4). 가로 4 → 세로 3 → 줄자로 재면 5 */
function performanceSpacing() {
  const u = 18, X = (x: number) => 90 + u * x, Y = (y: number) => 104 - u * y;
  const planks = Array.from({ length: 7 }, (_, i) => `<rect x="6" y="${6 + i * 14}" width="164" height="13" fill="${i % 2 ? K.l : K.f}" fill-opacity="${i % 2 ? '.45' : '1'}"/>`).join('');
  const spike = (x: number, y: number) => `<path d="M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10" stroke="${K.am}" stroke-width="2.4" stroke-linecap="round"/>`;
  const person = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4.5" fill="${K.p}"/><circle cx="${x}" cy="${y}" r="3.6" fill="${K.ink}"/>`;
  const [x1, y1, x2, y2] = [X(-2), Y(1), X(2), Y(4)];
  const ticks = [1, 2, 3, 4].map((k) => {
    const px = x1 + ((x2 - x1) * k) / 5, py = y1 + ((y2 - y1) * k) / 5;
    return `<path class="pop" style="--d:${(2.1 + k * 0.08).toFixed(2)}s" d="M${n1(px - 3 * 0.6)} ${n1(py - 3 * 0.8)}l${n1(6 * 0.6)} ${n1(6 * 0.8)}" stroke="${K.ink}" stroke-width="1.3"/>`;
  }).join('');
  return svg(
    planks + `<rect x="6" y="103" width="164" height="4" fill="${K.p}"/>` + tx(88, 116, '객석', { size: 9 })
    + spike(x1, y1) + spike(x2, y2) + person(x1, y1) + person(x2, y2)
    + tx(26, 90, '(−2, 1)', { size: 9.5, bold: true, fill: K.ink }) + tx(x2, 20, '(2, 4)', { size: 9.5, bold: true, fill: K.ink })
    + dr(`M${x1} ${y1}H${x2}`, 0.2, { color: K.p, w: 1.8 }) + tx(98, 98, '4 m', { size: 10, bold: true, fill: K.p, pop: 0.6 })
    + dr(`M${x2} ${y1}V${y2}`, 0.8, { color: K.p, w: 1.8 }) + tx(x2 + 6, 62, '3 m', { size: 10, bold: true, fill: K.p, anchor: 'start', pop: 1.2 })
    + dr(`M${x1} ${y1}L${x2} ${y2}`, 1.4, { color: K.am, w: 5 }) + ticks
    + tx(82, 52, '5 m', { size: 10.5, bold: true, fill: K.a, anchor: 'end', pop: 2.4 })
    + tx(206, 22, '가로 4 m', { size: 9.5, fill: K.ink, pop: 0.6 })
    + tx(206, 40, '세로 3 m', { size: 9.5, fill: K.ink, pop: 1.2 })
    + tx(206, 70, '√(4² + 3²)', { math: true, size: 11.5, pop: 2.4 })
    + tx(206, 90, '= 5 m', { math: true, size: 12.5, pop: 2.6 }),
  );
}

const drawings: Record<string, string> = {
  'game-range': gameRange(),
  'music-marker': musicMarker(),
  'sports-distance': sportsDistance(),
  'fashion-mirror': fashionMirror(),
  'cooking-circle': cookingCircle(),
  'video-shift': videoShift(),
  'design-perpendicular': designPerpendicular(),
  'animal-boundary': animalBoundary(),
  'travel-meet': travelMeet(),
  'car-tangent': carTangent(),
  'health-path': healthPath(),
  'environment-radius': environmentRadius(),
  'computer-reflect': computerReflect(),
  'architecture-lines': architectureLines(),
  'performance-spacing': performanceSpacing(),
};
export default drawings;
