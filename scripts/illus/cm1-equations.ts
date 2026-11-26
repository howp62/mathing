/**
 * 공통수학1 '방정식과 부등식' 중 단순 그림이던 세 장(ray-hit, cookie-price, fish-yield)의 원본(240×120).
 * `node scripts/write-illus.ts cm1-equations`로 써 넣는다. 나머지 카드는 기존 장면 그림(illus 키)을 그대로 둔다.
 */
import { K, W, tx, dr, svg, pop, n1, curve, guide } from './kit.ts';

/** 게임 속 빛: 손전등에서 나온 직선 세 개가 공과 두 점에서(D > 0), 한 점에서(D = 0), 만나지 않음(D < 0) */
function rayHit() {
  const C = [20, 64], O = [124, 64], r = 26;
  const d = O[0] - C[0], alpha = Math.asin(r / d), tl = Math.sqrt(d * d - r * r);
  const T = [C[0] + tl * Math.cos(alpha), C[1] - tl * Math.sin(alpha)];
  const end2 = [196, C[1] - (196 - C[0]) * Math.tan(alpha)];
  const beta = (22 * Math.PI) / 180, end3 = [C[0] + 112 * Math.cos(beta), C[1] + 112 * Math.sin(beta)];
  const dot = (x: number, y: number, at: number) => `<circle class="pop" style="--d:${at.toFixed(2)}s" cx="${n1(x)}" cy="${n1(y)}" r="3.6" fill="${K.a}" stroke="${W}" stroke-width="1"/>`;
  const torch = `<path d="M4 59H12L18 55V73L12 69H4Z" fill="${K.p}" stroke="${K.p}" stroke-width="1" stroke-linejoin="round"/><rect x="2" y="61" width="5" height="6" rx="1" fill="${K.ink}"/>`;
  return svg(
    tx(8, 16, 'D = b² − 4ac', { math: true, size: 11, anchor: 'start' })
    + `<circle cx="${O[0]}" cy="${O[1]}" r="${r}" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/><ellipse cx="${O[0] - 9}" cy="${O[1] - 11}" rx="7" ry="4.5" transform="rotate(-30 ${O[0] - 9} ${O[1] - 11})" fill="${W}"/>`
    + torch
    + dr(`M${C[0]} ${C[1]}L196 ${C[1]}`, 0.1, { color: K.a, w: 2 }) + dot(O[0] - r, O[1], 0.6) + dot(O[0] + r, O[1], 0.8)
    + tx(200, 60, '관통', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 1.0 }) + tx(200, 74, 'D > 0', { math: true, size: 10.5, anchor: 'start', pop: 1.0 })
    + dr(`M${C[0]} ${C[1]}L${n1(end2[0])} ${n1(end2[1])}`, 1.0, { color: K.am, w: 2 }) + dot(T[0], T[1], 1.6)
    + tx(200, 20, '스침', { size: 10, bold: true, fill: K.am, anchor: 'start', pop: 1.8 }) + tx(200, 34, 'D = 0', { math: true, size: 10.5, anchor: 'start', pop: 1.8 })
    + dr(`M${C[0]} ${C[1]}L${n1(end3[0])} ${n1(end3[1])}`, 1.9, { color: K.m, w: 2 })
    + tx(140, 108, '빗나감', { size: 10, bold: true, fill: K.m, anchor: 'start', pop: 2.7 }) + tx(176, 108, 'D &lt; 0', { math: true, size: 10.5, anchor: 'start', pop: 2.7 })
    + tx(124, 84, '공', { size: 9, fill: K.p }),
  );
}

/** 축제 가판: 칠판에 매출 (1000 + 100k)(100 − 5k)를 값에 따라 그리고, 꼭짓점 1500원(75개)에서 최대 112500원 */
function cookiePrice() {
  const R = (p: number) => { const k = (p - 1000) / 100; return (1000 + 100 * k) * (100 - 5 * k); };
  const X = (p: number) => 92 + (p - 1000) * 0.066, Y = (v: number) => 104 - v * 0.00062;
  const awning = Array.from({ length: 12 }, (_, i) => `<path d="M${i * 20} 2H${i * 20 + 20}V12A10 6 0 0 1 ${i * 20} 12Z" fill="${i % 2 ? W : K.a}"/>`).join('');
  const cookie = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="7" fill="${K.am}"/><circle cx="${x - 2.5}" cy="${y - 2}" r="1.2" fill="${K.ink}"/><circle cx="${x + 2.5}" cy="${y + 1}" r="1.2" fill="${K.ink}"/><circle cx="${x - 1}" cy="${y + 3}" r="1" fill="${K.ink}"/>`;
  const vx = X(1500), vy = Y(R(1500));
  return svg(
    awning + `<rect x="80" y="20" width="156" height="98" rx="3" fill="${K.p}"/>`
    + `<path d="M${X(1000)} 22V104H230" fill="none" stroke="${K.l}" stroke-width="1.2"/>`
    + tx(96, 30, '매출', { size: 9, fill: K.l, anchor: 'start' }) + tx(230, 114, '3000원', { size: 9, fill: K.l, anchor: 'end' })
    + dr(curve(R, 1000, 3000, X, Y), 0.2, { color: W, w: 2.2 })
    + pop(1.3, guide(`M${n1(vx)} ${n1(vy + 4)}V104`, K.am) + `<circle cx="${n1(vx)}" cy="${n1(vy)}" r="4" fill="${K.am}"/>`)
    + tx(+n1(vx), 114, '1500원', { size: 9.5, bold: true, fill: K.am, pop: 1.4 })
    + `<rect x="8" y="22" width="62" height="42" rx="4" fill="${W}" stroke="${K.p}" stroke-width="1.4"/>`
    + tx(39, 35, '1000원 100개', { size: 9, fill: K.ink }) + tx(39, 48, '100원 오르면', { size: 9, fill: K.a }) + tx(39, 60, '5개 덜 팔림', { size: 9, fill: K.p })
    + cookie(18, 76) + cookie(34, 76) + cookie(50, 76) + cookie(26, 70) + cookie(42, 70)
    + tx(40, 98, '1500원 × 75개', { size: 9.5, fill: K.ink, pop: 1.7 }) + tx(40, 112, '= 112500원', { size: 10, bold: true, fill: K.a, pop: 1.9 }),
  );
}

/** 물고기 수와 한 해 증가량: 적을 때·K/2일 때·많을 때 늘어나는 양 막대가 차례로 서고, K/2에서 가장 크다 */
function fishYield() {
  const g = (n: number) => n * (1 - n);
  const X = (n: number) => 24 + 190 * n, Y = (v: number) => 88 - 240 * v;
  const fish = (x: number, y: number, c: string) => `<path d="M${n1(x - 4)} ${n1(y)}L${n1(x - 8)} ${n1(y - 3)}V${n1(y + 3)}Z" fill="${c}"/><ellipse cx="${n1(x)}" cy="${n1(y)}" rx="4.5" ry="2.4" fill="${c}"/>`;
  const school = (n: number, count: number) => Array.from({ length: count }, (_, i) => {
    const cols = Math.min(count, 4), row = Math.floor(i / cols), col = i % cols;
    return fish(X(n) - (cols - 1) * 5.5 + col * 11 + (row % 2) * 3, 97 + row * 6, i % 3 ? K.p : K.am);
  }).join('');
  const ns = [1 / 6, 1 / 2, 5 / 6];
  return svg(
    `<rect x="0" y="90" width="240" height="30" fill="${K.p}" fill-opacity=".14"/>`
    + `<path d="M${X(0)} 88H${X(1) + 10}M${X(0)} 91V14" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + school(ns[0], 2) + school(ns[1], 8) + school(ns[2], 12)
    + dr(curve(g, 0, 1, X, Y), 0.1, { color: K.p, w: 2.2 })
    + ns.map((n, i) => dr(`M${n1(X(n))} 88V${n1(Y(g(n)) + 3)}`, 1.0 + i * 0.35, { color: i === 1 ? K.a : K.am, w: 4 })).join('')
    + tx(28, 14, 'G(N) = rN(1 − N/K)', { math: true, size: 10.5, anchor: 'start' })
    + tx(+n1(X(ns[0]) - 8), +n1(Y(g(ns[0])) - 4), '적으면', { size: 9, fill: K.ink, pop: 1.3 })
    + tx(198, 50, '많으면', { size: 9, fill: K.ink, anchor: 'start', pop: 2.0 })
    + tx(236, 16, 'N = K/2일 때 최대', { size: 10, bold: true, fill: K.a, anchor: 'end', pop: 2.3 })
    + tx(X(0) - 6, 116, '0', { size: 9 }) + tx(X(0.5), 116, 'K/2', { size: 9.5, bold: true, fill: K.a }) + tx(X(1), 116, 'K', { size: 9.5 }),
  );
}

const drawings: Record<string, string> = { 'ray-hit': rayHit(), 'cookie-price': cookiePrice(), 'fish-yield': fishYield() };
export default drawings;
