/**
 * 공통수학1 '경우의 수' 중 단순 그림이던 두 장(password, league)의 원본(240×120).
 * `node scripts/write-illus.ts cm1-counting`으로 써 넣는다. 나머지 카드는 기존 장면 그림(illus 키)을 그대로 둔다.
 */
import { K, W, tx, dr, svg, pop, n1 } from './kit.ts';

/** 도어록 숫자판: 자리마다 10가지가 하나씩 채워져 4자리 10⁴, 두 자리를 더하면 10⁶ */
function password() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  const pad = keys.map((k, i) => {
    const x = 22 + (i % 3) * 14, y = 44 + Math.floor(i / 3) * 15;
    return `<circle cx="${x}" cy="${y}" r="6" fill="${K.f}"/>${tx(x, y + 3.2, k, { size: 9, bold: true, fill: K.p })}`;
  }).join('');
  const lock = `<rect x="8" y="8" width="56" height="106" rx="9" fill="${K.p}"/><rect x="14" y="16" width="44" height="14" rx="2" fill="${K.ink}"/>` + pad;
  const dots = (n: number, at: number | null) => Array.from({ length: n }, (_, i) => {
    const c = `<circle cx="${n1(21 + i * 6)}" cy="23" r="2" fill="${i >= 4 ? K.am : W}"/>`;
    return at === null || i < 4 ? c : pop(at + (i - 4) * 0.3, c);
  }).join('');
  const SW = 22, GAP = 4, X0 = 76;
  const slot = (j: number, y: number, hot: boolean) => {
    const x = X0 + j * (SW + GAP);
    return `<rect x="${x}" y="${y}" width="${SW}" height="20" rx="4" fill="${W}" stroke="${hot ? K.a : K.p}" stroke-width="1.6"/>${tx(x + SW / 2, y + 14, '10', { size: 10, bold: true, fill: hot ? K.a : K.p })}`;
  };
  return svg(
    lock + dots(6, 1.7)
    + tx(152, 12, '자리마다 0~9 중 하나(10가지)', { size: 9 })
    + [0, 1, 2, 3].map((j) => pop(0.2 + j * 0.2, slot(j, 20, false))).join('')
    + tx(126, 57, '4자리 10⁴ = 10000가지', { size: 10, bold: true, fill: K.p, pop: 1.1 })
    + pop(1.4, [0, 1, 2, 3].map((j) => slot(j, 66, false)).join(''))
    + pop(1.7, slot(4, 66, true)) + pop(2.0, slot(5, 66, true))
    + tx(156, 102, '6자리 10⁶ = 1000000가지', { size: 10.5, bold: true, fill: K.a, pop: 2.3 })
    + tx(156, 116, '두 자리 늘면 100배', { size: 9, fill: K.ink, pop: 2.5 }),
  );
}

/** 10팀 리그: 두 팀씩 잇는 선(경기) 45개가 차례로 그려지고, 한 쌍을 홈·원정으로 나누면 2배인 90경기 */
function league() {
  const cx = 58, cy = 60, R = 46;
  const P = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 10;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  });
  const colors = [K.p, K.a, K.am, K.m, K.ink];
  let lines = '', k = 0;
  for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) {
    const hot = i === 0 && j === 3;
    lines += dr(`M${n1(P[i][0])} ${n1(P[i][1])}L${n1(P[j][0])} ${n1(P[j][1])}`, 0.1 + k * 0.025, { color: hot ? K.a : K.m, w: hot ? 2.2 : 1, opacity: hot ? 0 : 0.5 });
    k++;
  }
  const badge = (x: number, y: number, i: number, r = 6.5) => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${r}" fill="${colors[i % 5]}" stroke="${W}" stroke-width="1.5"/><path d="M${n1(x - r + 2)} ${n1(y)}H${n1(x + r - 2)}" stroke="${W}" stroke-width="1.4"/>`;
  const A = [168, 74], B = [214, 74];
  return svg(
    lines + P.map(([x, y], i) => badge(x, y, i)).join('')
    + tx(170, 16, '10팀 중 2팀 고르기', { size: 9.5, fill: K.ink })
    + tx(170, 36, '₁₀C₂ = 45경기', { size: 11, bold: true, fill: K.p, pop: 1.4 })
    + badge(A[0], A[1], 0, 8) + badge(B[0], B[1], 3, 8)
    + dr(`M${A[0] + 6} ${A[1] - 7}Q191 52 ${B[0] - 7} ${B[1] - 7}`, 1.7, { color: K.a, w: 1.8 })
    + pop(2.3, `<path d="M${B[0] - 13} ${B[1] - 10}L${B[0] - 7} ${B[1] - 7}L${B[0] - 13} ${B[1] - 3}" fill="none" stroke="${K.a}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)
    + dr(`M${B[0] - 6} ${B[1] + 7}Q191 96 ${A[0] + 7} ${A[1] + 7}`, 2.0, { color: K.p, w: 1.8 })
    + pop(2.6, `<path d="M${A[0] + 13} ${A[1] + 10}L${A[0] + 7} ${A[1] + 7}L${A[0] + 13} ${A[1] + 3}" fill="none" stroke="${K.p}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)
    + tx(191, 50, '홈', { size: 9, fill: K.a, pop: 1.9 }) + tx(191, 104, '원정', { size: 9, fill: K.p, pop: 2.2 })
    + tx(170, 116, '₁₀P₂ = 90경기', { size: 11, bold: true, fill: K.a, pop: 2.7 }),
  );
}

const drawings: Record<string, string> = { password: password(), league: league() };
export default drawings;
