/**
 * 공통수학1 '행렬' 중 단순 그림이던 세 장(pixels, recipe-cost, rotate)의 원본(240×120).
 * `node scripts/write-illus.ts cm1-matrices`로 써 넣는다. 나머지 카드는 기존 장면 그림(illus 키)을 그대로 둔다.
 */
import { K, W, tx, dr, ring, svg, pop, n1, arrow } from './kit.ts';

/** 행렬 괄호 */
const brackets = (x1: number, x2: number, y1: number, y2: number, c: string = K.ink) =>
  `<path d="M${x1 + 4} ${y1}H${x1}V${y2}H${x1 + 4}M${x2 - 4} ${y1}H${x2}V${y2}H${x2 - 4}" fill="none" stroke="${c}" stroke-width="1.5"/>`;

/** 사진 확대: 16×9칸 사진의 3×3칸을 확대하면 칸마다 밝기 숫자(0 검정 ~ 255 흰색) → 행렬 */
function pixels() {
  const shade: [number, string][] = [[30, K.ink], [140, K.m], [210, K.l], [230, K.f], [255, W]];
  const level = (c: number, r: number) => {
    const d = Math.hypot(c - 5.5, (r - 4) * 1.15);
    return d < 1.6 ? 0 : d < 2.6 ? 1 : d < 3.6 ? 2 : d < 5.5 ? 3 : 4;
  };
  const S = 4, PX = 10, PY = 22;
  let photo = '';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) photo += `<rect x="${PX + c * S}" y="${PY + r * S}" width="${S}" height="${S}" fill="${shade[level(c, r)][1]}"/>`;
  const c0 = 6, r0 = 3, G = 22, GX = 100, GY = 30;
  let big = '', nums = '';
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const [v, col] = shade[level(c0 + c, r0 + r)];
    big += `<rect x="${GX + c * G}" y="${GY + r * G}" width="${G}" height="${G}" fill="${col}"/>`;
    nums += tx(GX + c * G + G / 2, GY + r * G + G / 2 + 3.5, String(v), { size: 9.5, bold: true, fill: v < 150 ? W : K.ink, pop: 0.9 + (r * 3 + c) * 0.1 });
  }
  const zx = PX + c0 * S, zy = PY + r0 * S;
  return svg(
    `<rect x="${PX - 2}" y="${PY - 2}" width="${16 * S + 4}" height="${9 * S + 4}" fill="none" stroke="${K.p}" stroke-width="1.4"/>` + photo
    + tx(42, 14, '흑백 사진', { size: 9, fill: K.ink }) + tx(42, 72, '세로 1080칸', { size: 9 }) + tx(42, 85, '가로 1920칸', { size: 9 })
    + tx(42, 104, '0 검정 ~ 255 흰색', { size: 9, fill: K.ink })
    + dr(`M${zx} ${zy}h${3 * S}v${3 * S}h${-3 * S}Z`, 0.1, { color: K.a, w: 1.6 })
    + dr(`M${zx + 3 * S} ${zy}L${GX} ${GY}`, 0.5, { color: K.a, w: 1 }) + dr(`M${zx + 3 * S} ${zy + 3 * S}L${GX} ${GY + 3 * G}`, 0.5, { color: K.a, w: 1 })
    + pop(0.7, big + `<rect x="${GX}" y="${GY}" width="${3 * G}" height="${3 * G}" fill="none" stroke="${K.a}" stroke-width="1.4"/>`) + nums
    + pop(1.9, brackets(GX - 5, GX + 3 * G + 5, GY - 3, GY + 3 * G + 3))
    + tx(206, 46, '1080 × 1920', { size: 9.5, bold: true, fill: K.ink, pop: 2.1 }) + tx(206, 60, '행렬', { size: 9.5, fill: K.ink, pop: 2.1 })
    + tx(206, 82, '숫자', { size: 9, pop: 2.3 }) + tx(206, 96, '2073600개', { size: 10, bold: true, fill: K.a, pop: 2.3 }),
  );
}

/** 재료비: 머핀 줄 × 값 세로줄 → 1400, 쿠키 줄 × 값 세로줄 → 1300 */
function recipeCost() {
  const muffin = (x: number, y: number) => `<path d="M${x - 7} ${y}L${x - 5} ${y + 9}H${x + 5}L${x + 7} ${y}Z" fill="${K.am}"/><path d="M${x - 8} ${y + 1}A8 7 0 0 1 ${x + 8} ${y + 1}Z" fill="${K.a}"/><circle cx="${x}" cy="${y - 6}" r="1.8" fill="${K.a}"/>`;
  const cookie = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${K.am}"/><circle cx="${x - 3}" cy="${y - 2}" r="1.3" fill="${K.ink}"/><circle cx="${x + 2.5}" cy="${y + 1}" r="1.3" fill="${K.ink}"/><circle cx="${x - 1}" cy="${y + 3.5}" r="1.1" fill="${K.ink}"/>`;
  const wheat = (x: number, y: number) => `<path d="M${x} ${y + 9}V${y - 7}" stroke="${K.am}" stroke-width="1.4"/>` + [-5, -1, 3].map((d) => `<ellipse cx="${x - 2.5}" cy="${y + d}" rx="2.6" ry="1.5" transform="rotate(-35 ${x - 2.5} ${y + d})" fill="${K.am}"/><ellipse cx="${x + 2.5}" cy="${y + d}" rx="2.6" ry="1.5" transform="rotate(35 ${x + 2.5} ${y + d})" fill="${K.am}"/>`).join('');
  const egg = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="5.5" ry="7" fill="${W}" stroke="${K.m}" stroke-width="1.2"/>`;
  const box = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;
  const r1 = 54, r2 = 80, c1 = 70, c2 = 96, bx = 140, rx = 196;
  const n = (x: number, y: number, s: string, o: { fill?: string; pop?: number; bold?: boolean } = {}) => tx(x, y + 4, s, { size: 11, fill: o.fill ?? K.ink, pop: o.pop, bold: o.bold });
  return svg(
    wheat(c1, 18) + egg(c2, 18) + tx(c1, 38, '밀가루', { size: 9 }) + tx(c2, 38, '달걀', { size: 9 })
    + tx(bx, 38, '값', { size: 9 }) + tx(rx, 38, '재료비', { size: 9 })
    + muffin(36, r1 - 1) + cookie(36, r2) + tx(12, r1 + 4, '머핀', { size: 9, anchor: 'start' }) + tx(12, r2 + 4, '쿠키', { size: 9, anchor: 'start' })
    + brackets(56, 110, 42, 92) + n(c1, r1, '2') + n(c2, r1, '2') + n(c1, r2, '3') + n(c2, r2, '1')
    + tx(118, 71, '×', { size: 11, fill: K.ink }) + brackets(124, 156, 42, 92) + n(bx, r1, '300') + n(bx, r2, '400')
    + tx(164, 71, '=', { size: 11, fill: K.ink }) + brackets(172, 220, 42, 92)
    + dr(box(58, r1 - 10, 50, 20), 0.2, { color: K.a, w: 1.6 }) + dr(box(127, 44, 26, 46), 0.2, { color: K.a, w: 1.6 })
    + tx(120, 103, '머핀 2×300 + 2×400 = 1400', { size: 9.5, fill: K.a, pop: 0.9 }) + n(rx, r1, '1400', { fill: K.a, bold: true, pop: 1.2 })
    + dr(box(58, r2 - 10, 50, 20), 1.5, { color: K.p, w: 1.6 })
    + tx(120, 115, '쿠키 3×300 + 1×400 = 1300', { size: 9.5, fill: K.p, pop: 2.1 }) + n(rx, r2, '1300', { fill: K.p, bold: true, pop: 2.4 })
    + tx(232, 75, '원', { size: 9, anchor: 'end' }),
  );
}

/** 좌표 위 게임 비행선: 꼭짓점 (3, 1)이 원점을 중심으로 90° 돌아 (−1, 3)으로, 같은 값을 회전 행렬 곱셈으로 */
function rotate() {
  const X = (x: number) => 58 + 16 * x, Y = (y: number) => 98 - 16 * y;
  let dots = '';
  for (let x = -3; x <= 4; x++) for (let y = -1; y <= 4; y++) dots += `<circle cx="${X(x)}" cy="${Y(y)}" r="1" fill="${K.l}"/>`;
  const ship = (pts: number[][], fill: string, stroke: string) => `<path d="M${pts.map(([x, y]) => `${X(x)} ${Y(y)}`).join('L')}Z" fill="${fill}" fill-opacity=".35" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>`;
  const rr = Math.sqrt(10) * 16;
  const a0 = Math.atan2(1, 3);
  const arc = 'M' + Array.from({ length: 25 }, (_, i) => { const a = a0 + ((Math.PI / 2) * i) / 24; return `${n1(X(0) + rr * Math.cos(a))} ${n1(Y(0) - rr * Math.sin(a))}`; }).join('L');
  return svg(
    dots + `<path d="M${X(-3) - 4} ${Y(0)}H${X(4) + 6}M${X(0)} ${Y(-1) + 4}V${Y(4) - 6}" stroke="${K.m}" stroke-width="1.2"/>`
    + ship([[1, 0], [3, 1], [1, 2]], K.p, K.p) + `<path d="M${X(0)} ${Y(0)}L${X(3)} ${Y(1)}" stroke="${K.p}" stroke-width="1" stroke-dasharray="2 2"/>`
    + `<circle cx="${X(3)}" cy="${Y(1)}" r="3.4" fill="${K.p}"/>` + tx(X(3) + 3, Y(1) + 15, '(3, 1)', { size: 9.5, fill: K.p, bold: true })
    + dr(arc, 0.2, { color: K.am, w: 1.8 }) + dr(`M${X(0)} ${Y(0)}L${X(-1)} ${Y(3)}`, 0.7, { color: K.a, w: 1.4 })
    + pop(1.2, ship([[0, 1], [-1, 3], [-2, 1]], K.a, K.a) + `<circle cx="${X(-1)}" cy="${Y(3)}" r="3.4" fill="${K.a}"/>`)
    + tx(X(-1) - 6, Y(3) - 5, '(−1, 3)', { size: 9.5, fill: K.a, bold: true, anchor: 'end', pop: 1.3 }) + tx(X(2.6), Y(3.1), '90°', { size: 9.5, bold: true, fill: K.am, pop: 1.0 })
    + tx(186, 16, '회전 행렬 × 점', { size: 9 })
    + brackets(136, 170, 26, 62) + tx(146, 40, '0', { size: 10.5, fill: K.ink }) + tx(160, 40, '−1', { size: 10.5, fill: K.ink }) + tx(146, 56, '1', { size: 10.5, fill: K.ink }) + tx(160, 56, '0', { size: 10.5, fill: K.ink })
    + tx(176, 48, '×', { size: 10.5, fill: K.ink }) + brackets(182, 200, 26, 62, K.p) + tx(191, 40, '3', { size: 10.5, fill: K.p }) + tx(191, 56, '1', { size: 10.5, fill: K.p })
    + tx(206, 48, '=', { size: 10.5, fill: K.ink }) + pop(2.4, brackets(212, 236, 26, 62, K.a))
    + dr(`M138 32h32v12h-32Z`, 1.5, { color: K.am, w: 1.4 }) + tx(224, 40, '−1', { size: 10.5, bold: true, fill: K.a, pop: 1.8 })
    + dr(`M138 48h32v12h-32Z`, 2.0, { color: K.am, w: 1.4 }) + tx(224, 56, '3', { size: 10.5, bold: true, fill: K.a, pop: 2.3 })
    + tx(186, 84, '0×3 − 1×1 = −1', { size: 9.5, fill: K.ink, pop: 1.8 }) + tx(186, 100, '1×3 + 0×1 = 3', { size: 9.5, fill: K.ink, pop: 2.3 }),
  );
}

const drawings: Record<string, string> = { pixels: pixels(), 'recipe-cost': recipeCost(), rotate: rotate() };
export default drawings;
