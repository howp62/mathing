/**
 * 공통수학2 '집합과 명제' 예시 그림 원본(240×120).
 * `node scripts/write-illus.ts cm2-sets`로 content/sets/cm2-sets.json의 svg 칸에 써 넣는다.
 * 장면 속 물건(캐릭터·재생목록·매니큐어·달력 등)을 원소로 놓고, 집합을 두르고 · 영역을 칠하고 · 반례를 표시하는 순서만 움직인다.
 * 원소와 개수는 카드 본문과 같다.
 */
import { K, W, tx, dr, ring, svg, pop, n1, arrow } from './kit.ts';

/* ---- 공통 조각 ---- */

/** 체크 표시(그려짐) */
const check = (x: number, y: number, at: number, color: string = K.p) => dr(`M${x - 6} ${y}l4 4.5 8-9`, at, { color, w: 2.4 });
/** ✗ 표시(두 획이 차례로 그려짐) */
const cross = (x: number, y: number, at: number, color: string = K.a, s = 5) =>
  dr(`M${x - s} ${y - s}l${2 * s} ${2 * s}`, at, { color, w: 2.4 }) + dr(`M${x + s} ${y - s}l${-2 * s} ${2 * s}`, at + 0.25, { color, w: 2.4 });
/** 둥근 사각형 테두리를 선 하나로(그려지는 테두리용) */
const rrect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
/** 두 원(같은 반지름 r, 중심 (c1, y), (c2, y))의 겹친 부분 */
function lens(c1: number, c2: number, y: number, r: number) {
  const m = (c1 + c2) / 2, h = Math.sqrt(r * r - ((c2 - c1) / 2) ** 2);
  return `M${n1(m)} ${n1(y - h)}A${r} ${r} 0 0 1 ${n1(m)} ${n1(y + h)}A${r} ${r} 0 0 1 ${n1(m)} ${n1(y - h)}Z`;
}
/** 왼쪽 원에서 오른쪽 원을 뺀 초승달 */
function crescent(c1: number, c2: number, y: number, r: number) {
  const m = (c1 + c2) / 2, h = Math.sqrt(r * r - ((c2 - c1) / 2) ** 2);
  return `M${n1(m)} ${n1(y - h)}A${r} ${r} 0 1 0 ${n1(m)} ${n1(y + h)}A${r} ${r} 0 0 1 ${n1(m)} ${n1(y - h)}Z`;
}

/* ---- 카드별 그림 ---- */

/** 게임 로비: 캐릭터 가·나·다·라, 팀 A 원과 회복 B 원을 차례로 두르고 겹친 곳의 나를 표시 */
function gameFilter() {
  const token = (x: number, y: number, s: string, flag: boolean, potion: boolean) =>
    `<circle cx="${x}" cy="${y}" r="9" fill="${K.f}"/>${tx(x, y + 3.5, s, { size: 10, bold: true, fill: K.ink })}`
    + (flag ? `<path d="M${x - 9} ${y - 14}V${y - 4}" stroke="${K.ink}" stroke-width="1"/><path d="M${x - 9} ${y - 14}h7l-2 2.5 2 2.5h-7z" fill="${K.p}"/>` : '')
    + (potion ? `<path d="M${x + 8} ${y + 2}h3v3l2.5 4.5q0 2.5-2.5 2.5h-3q-2.5 0-2.5-2.5l2.5-4.5z" fill="${K.a}"/>` : '');
  return svg(
    `<rect x="6" y="16" width="144" height="98" rx="6" fill="${W}" stroke="${K.m}" stroke-width="1.2"/>` + tx(16, 30, 'U', { math: true, size: 12, fill: K.m })
    + tx(48, 29, '같은 팀 A', { size: 9.5, bold: true, fill: K.p }) + tx(110, 29, '회복 아이템 B', { size: 9.5, bold: true, fill: K.a })
    + pop(1.3, `<path d="${lens(58, 98, 70, 34)}" fill="${K.am}" fill-opacity=".45"/>`)
    + token(40, 72, '가', true, false) + token(78, 72, '나', true, true) + token(116, 72, '다', false, true) + token(134, 100, '라', false, false)
    + dr(ring(58, 70, 34), 0.1, { color: K.p, w: 2 }) + dr(ring(98, 70, 34), 0.7, { color: K.a, w: 2 })
    + dr(ring(78, 72, 12), 1.7, { color: K.ink, w: 1.6 })
    + tx(194, 26, 'U = {가, 나, 다, 라}', { size: 9 })
    + tx(194, 52, '두 조건 모두', { size: 9.5, fill: K.ink, pop: 1.3 })
    + tx(194, 78, 'A ∩ B', { math: true, size: 14, pop: 1.9 })
    + tx(194, 100, '= {나}', { size: 13, bold: true, fill: K.a, pop: 2.2 }),
  );
}

/** 재생목록: A 6곡, B 5곡, 같은 곡 2곡을 잇고, 합친 목록에는 한 번씩만 9곡 */
function musicUnion() {
  const row = (x: number, y: number, c: string, w = 40) =>
    `<rect x="${x}" y="${y}" width="8" height="7" rx="1.5" fill="${c}"/><rect x="${x + 11}" y="${y + 2}" width="${w - 11}" height="3" rx="1.5" fill="${K.l}"/>`;
  const Ay = (i: number) => 18 + 10 * i, colA = [K.p, K.p, K.p, K.p, K.am, K.am], colB = [K.a, K.am, K.am, K.a, K.a];
  const merged = [K.p, K.p, K.p, K.p, K.am, K.am, K.a, K.a, K.a];
  return svg(
    tx(30, 11, '내 목록 A 6곡', { size: 9, fill: K.ink }) + tx(108, 11, '친구 B 5곡', { size: 9, fill: K.ink })
    + colA.map((c, i) => row(8, Ay(i), c)).join('') + colB.map((c, i) => row(86, Ay(i), c)).join('')
    + dr(`M50 ${Ay(4) + 3.5}L84 ${Ay(1) + 3.5}`, 0.2, { color: K.am, w: 1.6 }) + dr(`M50 ${Ay(5) + 3.5}L84 ${Ay(2) + 3.5}`, 0.5, { color: K.am, w: 1.6 })
    + tx(108, 76, '같은 곡 2곡', { size: 9, bold: true, fill: K.am, pop: 0.8 })
    + arrow(134, 50, 162, 50, 1.0)
    + tx(200, 11, '합친 목록', { size: 9, fill: K.ink })
    + merged.map((c, i) => pop(1.4 + i * 0.1, row(176, Ay(i) - 2, c, 50))).join('')
    + tx(200, 114, '9곡', { size: 11, bold: true, fill: K.a, pop: 2.4 })
    + tx(70, 104, '6 + 5 − 2 = 9', { math: true, size: 13, pop: 2.5 }),
  );
}

/** 점수판 1~12: 짝수 칸이 차례로 켜지고 6·12에 테두리(6의 배수 ⊂ 짝수), 마지막에 8을 반례로 표시 */
function sportsCondition() {
  const cx = (n: number) => 14 + 27 * ((n - 1) % 4), cy = (n: number) => 20 + 23 * Math.floor((n - 1) / 4);
  const tiles = Array.from({ length: 12 }, (_, i) => `<rect x="${cx(i + 1)}" y="${cy(i + 1)}" width="24" height="19" rx="3" fill="${K.m}" fill-opacity=".45"/>`).join('');
  const evens = [2, 4, 6, 8, 10, 12].map((n, k) => pop(0.1 + k * 0.12, `<rect x="${cx(n)}" y="${cy(n)}" width="24" height="19" rx="3" fill="${K.p}"/>`)).join('');
  const nums = Array.from({ length: 12 }, (_, i) => tx(cx(i + 1) + 12, cy(i + 1) + 13.5, String(i + 1), { size: 10.5, bold: true, fill: W })).join('');
  const box = (n: number, at: number, color: string) => dr(`M${cx(n) - 2} ${cy(n) - 2}H${cx(n) + 26}V${cy(n) + 21}H${cx(n) - 2}Z`, at, { color, w: 2.4 });
  return svg(
    `<rect x="6" y="12" width="118" height="80" rx="6" fill="${K.ink}"/>` + tiles + evens + nums
    + box(6, 0.9, K.am) + box(12, 1.1, K.am) + box(8, 2.0, K.a)
    + `<rect x="10" y="101" width="10" height="8" rx="2" fill="${K.p}"/>` + tx(24, 108.5, '짝수', { size: 9, anchor: 'start', fill: K.ink })
    + `<rect x="60" y="101" width="10" height="8" rx="2" fill="none" stroke="${K.am}" stroke-width="2"/>` + tx(74, 108.5, '6의 배수', { size: 9, anchor: 'start', fill: K.ink })
    + tx(182, 22, '6의 배수 ⇒ 짝수', { size: 10, bold: true, fill: K.p, pop: 1.2 })
    + tx(182, 40, '6k = 2 × 3k', { math: true, size: 12, pop: 1.4 })
    + tx(182, 66, '짝수 ⇒ 6의 배수?', { size: 10, bold: true, fill: K.a, pop: 1.8 })
    + tx(182, 84, '8은 짝수, 6의 배수 아님', { size: 9, fill: K.ink, pop: 2.3 })
    + tx(182, 104, '반대 문장은 거짓', { size: 10, bold: true, fill: K.a, pop: 2.5 }),
  );
}

/** 매니큐어 병: A {빨강, 파랑, 노랑}, B {파랑, 초록}. 두 줄의 파랑을 잇고 A에서 지운 뒤, 남은 색이 A−B 칸에 */
function fashionDifference() {
  const bottle = (x: number, y: number, c: string, name: string) =>
    `<rect x="${x - 3}" y="${y}" width="6" height="9" rx="1" fill="${K.ink}"/><rect x="${x - 8}" y="${y + 9}" width="16" height="17" rx="4" fill="${c}"/><rect x="${x - 5}" y="${y + 12}" width="3" height="8" rx="1.5" fill="${W}" fill-opacity=".5"/>`
    + tx(x, y + 38, name, { size: 9, fill: K.ink });
  const G = K.m; // 팔레트에 초록이 없어 회색 병에 '초록' 이름표
  return svg(
    tx(10, 26, 'A', { math: true, size: 13, fill: K.ink }) + tx(10, 82, 'B', { math: true, size: 13, fill: K.ink })
    + bottle(36, 6, K.a, '빨강') + bottle(68, 6, K.p, '파랑') + bottle(100, 6, K.am, '노랑')
    + bottle(68, 62, K.p, '파랑') + bottle(100, 62, G, '초록')
    + dr('M68 48V60', 0.2, { color: K.m, w: 1.6 })
    + cross(68, 23, 0.6, K.a, 9)
    + tx(178, 14, '새로 고를 A − 이미 가진 B', { size: 9 })
    + `<circle cx="160" cy="56" r="28" fill="none" stroke="${K.p}" stroke-width="1.6"/><circle cx="196" cy="56" r="28" fill="none" stroke="${K.m}" stroke-width="1.6"/>`
    + tx(140, 32, 'A', { math: true, size: 11, fill: K.p }) + tx(218, 32, 'B', { math: true, size: 11, fill: K.m })
    + pop(1.3, `<path d="${crescent(160, 196, 56, 28)}" fill="${K.am}" fill-opacity=".35"/>`)
    + `<circle cx="178" cy="56" r="4" fill="${K.p}"/><circle cx="206" cy="56" r="4" fill="${G}"/>`
    + pop(1.6, `<circle cx="148" cy="48" r="4.5" fill="${K.a}"/>`) + pop(1.8, `<circle cx="148" cy="66" r="4.5" fill="${K.am}"/>`)
    + tx(178, 104, 'A − B = {빨강, 노랑}', { size: 10.5, bold: true, fill: K.a, pop: 2.1 }),
  );
}

/** 축제 메뉴판(U): 샐러드·구운 채소·주먹밥, 채소 메뉴 A를 두르고 두 원소마다 U 안에 있음을 체크 */
function cookingSubset() {
  const salad = `<circle cx="36" cy="58" r="15" fill="${W}"/><ellipse cx="31" cy="55" rx="6" ry="4" fill="${K.am}"/><ellipse cx="40" cy="54" rx="5" ry="3.5" fill="${K.l}"/><ellipse cx="36" cy="63" rx="6" ry="3.5" fill="${K.am}" fill-opacity=".7"/><circle cx="42" cy="62" r="2.5" fill="${K.a}"/>`;
  const skewer = `<path d="M62 58H96" stroke="${K.l}" stroke-width="2"/><rect x="66" y="51" width="8" height="14" rx="2" fill="${K.a}"/><rect x="76" y="52" width="8" height="12" rx="2" fill="${K.am}"/><rect x="86" y="51" width="7" height="14" rx="2" fill="${K.a}" fill-opacity=".7"/>`;
  const onigiri = `<path d="M128 44Q136 44 141 60Q143 70 128 70Q113 70 115 60Q120 44 128 44Z" fill="${W}"/><rect x="121" y="60" width="14" height="10" fill="${K.ink}"/>`;
  return svg(
    `<rect x="4" y="6" width="150" height="108" rx="6" fill="${K.p}" stroke="${K.am}" stroke-width="3"/>`
    + tx(124, 22, '축제 메뉴 U', { size: 9.5, bold: true, fill: W })
    + salad + skewer + onigiri
    + tx(36, 88, '샐러드', { size: 9, fill: W }) + tx(79, 88, '구운 채소', { size: 9, fill: W }) + tx(128, 88, '주먹밥', { size: 9, fill: W })
    + dr(rrect(12, 32, 92, 70, 14), 0.2, { color: K.am, w: 2.2 }) + tx(12, 22, '채소 메뉴 A', { size: 9.5, bold: true, fill: K.am, anchor: 'start', pop: 0.9 })
    + check(24, 40, 1.2, W) + check(66, 40, 1.5, W)
    + tx(198, 30, 'A의 원소가', { size: 9.5, fill: K.ink, pop: 1.2 })
    + tx(198, 46, '모두 U에도 있음', { size: 9.5, fill: K.ink, pop: 1.6 })
    + tx(198, 78, 'A ⊆ U', { math: true, size: 16, pop: 2.0 })
    + tx(198, 100, '부분집합', { size: 10.5, bold: true, fill: K.a, pop: 2.3 }),
  );
}

/** 짧은 영상 세 개의 조회 수 막대: 기준선 100회, 20초 영상만 10회 → 동그라미로 반례 */
function videoCounter() {
  const base = 98, Y = (v: number) => base - 0.6 * v;
  const bar = (x: number, v: number, at: number, color: string) =>
    `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s" d="M${x} ${base}V${n1(Y(v))}" fill="none" stroke="${color}" stroke-width="18"/>`;
  const eye = `<path d="M16 10q8-7 16 0q-8 7-16 0z" fill="none" stroke="${K.m}" stroke-width="1.2"/><circle cx="24" cy="10" r="2" fill="${K.m}"/>`;
  return svg(
    eye + tx(36, 13.5, '조회 수', { size: 9, anchor: 'start' })
    + `<path d="M20 ${base}H146M22 ${base}V20" stroke="${K.m}" stroke-width="1.2"/>`
    + bar(44, 10, 0.1, K.a) + bar(84, 140, 0.3, K.p) + bar(124, 120, 0.5, K.p)
    + tx(44, 86, '10회', { size: 9.5, bold: true, fill: K.a, pop: 0.6 })
    + pop(1.1, `<path d="M22 ${Y(100)}H146" stroke="${K.ink}" stroke-width="1.2" stroke-dasharray="4 3"/>`) + tx(28, Y(100) - 4, '100회', { size: 9, fill: K.ink, anchor: 'start', pop: 1.1 })
    + tx(44, 117, '20초 영상', { size: 9, fill: K.ink }) + tx(84, 117, '영상 2', { size: 9 }) + tx(124, 117, '영상 3', { size: 9 })
    + dr('M24 90a20 16 0 1 0 40 0a20 16 0 1 0 -40 0', 1.6, { color: K.a, w: 2 })
    + tx(196, 26, '"모든 짧은 영상이', { size: 9.5, fill: K.ink }) + tx(196, 40, '100회 이상"?', { size: 9.5, fill: K.ink })
    + tx(196, 70, '반례 1개', { size: 11, bold: true, fill: K.a, pop: 2.1 })
    + tx(196, 92, '→ 거짓', { size: 12, bold: true, fill: K.a, pop: 2.4 }),
  );
}

/** 도안 네 장: A∪B의 바깥 테두리를 그린 뒤 그 밖의 도안에 동그라미, 이어서 Aᶜ·Bᶜ를 칠하면 겹친 곳이 같은 자리 */
function designDeMorgan() {
  const U = 'M6 16H142V112H6Z';
  const poster = (x: number, y: number, dots: string[]) =>
    `<rect x="${x - 7}" y="${y - 9}" width="14" height="18" rx="1.5" fill="${W}" stroke="${K.m}" stroke-width="1"/>` + dots.map((c, i) => `<circle cx="${x - (dots.length - 1) * 2.5 + i * 5}" cy="${y}" r="2.4" fill="${c}"/>`).join('')
    + (dots.length ? '' : `<path d="M${x - 4} ${y + 3}h8" stroke="${K.l}" stroke-width="2"/>`);
  return svg(
    `<path d="${U}" fill="${W}" stroke="${K.m}" stroke-width="1.2"/>`
    + pop(1.4, `<path d="${U}${ring(54, 64, 30)}" fill="${K.p}" fill-opacity=".16" fill-rule="evenodd"/>`)
    + pop(1.9, `<path d="${U}${ring(92, 64, 30)}" fill="${K.a}" fill-opacity=".16" fill-rule="evenodd"/>`)
    + `<circle cx="54" cy="64" r="30" fill="none" stroke="${K.p}" stroke-width="1.6"/><circle cx="92" cy="64" r="30" fill="none" stroke="${K.a}" stroke-width="1.6"/>`
    + tx(40, 29, '파랑 A', { size: 9.5, bold: true, fill: K.p }) + tx(106, 29, '빨강 B', { size: 9.5, bold: true, fill: K.a })
    + poster(40, 64, [K.p]) + poster(73, 64, [K.p, K.a]) + poster(106, 64, [K.a]) + poster(124, 98, [])
    + dr(`M73 40.8A30 30 0 1 0 73 87.2A30 30 0 1 0 73 40.8Z`, 0.1, { color: K.ink, w: 2.4 })
    + dr(ring(124, 98, 12), 0.9, { color: K.am, w: 2.2 })
    + tx(192, 22, '둘 다 안 쓴 도안', { size: 9.5, bold: true, fill: K.ink })
    + tx(192, 46, '(A ∪ B)ᶜ', { math: true, size: 13, pop: 1.0 })
    + tx(192, 66, '=', { math: true, size: 13, pop: 2.3 })
    + tx(192, 86, 'Aᶜ ∩ Bᶜ', { math: true, size: 13, pop: 2.3 })
    + tx(192, 106, '파랑 없음 ∩ 빨강 없음', { size: 9, pop: 2.0 }),
  );
}

/** 동물 카드 고양이·고양이·강아지: '모든'은 세 장을 다 확인(✓✓✗ → 거짓), '어떤'은 한 장이면 끝(✓ → 참) */
function animalQuantifier() {
  const card = (x: number, face: string) => `<rect x="${x - 18}" y="6" width="36" height="42" rx="4" fill="${W}" stroke="${K.l}" stroke-width="1.5"/>${face}`;
  const cat = (x: number) => `<path d="M${x - 10} 20L${x - 8} 30L${x - 4} 25ZM${x + 10} 20L${x + 8} 30L${x + 4} 25Z" fill="${K.am}"/><circle cx="${x}" cy="31" r="9" fill="${K.am}"/><circle cx="${x - 3.5}" cy="30" r="1.3" fill="${K.ink}"/><circle cx="${x + 3.5}" cy="30" r="1.3" fill="${K.ink}"/><path d="M${x - 15} 33h7M${x + 8} 33h7" stroke="${K.m}" stroke-width=".8"/>`;
  const dog = (x: number) => `<circle cx="${x}" cy="30" r="9" fill="${K.l}"/><ellipse cx="${x - 9}" cy="29" rx="3.5" ry="7" fill="${K.m}"/><ellipse cx="${x + 9}" cy="29" rx="3.5" ry="7" fill="${K.m}"/><circle cx="${x - 3.5}" cy="28" r="1.3" fill="${K.ink}"/><circle cx="${x + 3.5}" cy="28" r="1.3" fill="${K.ink}"/><ellipse cx="${x}" cy="33" rx="2.4" ry="1.7" fill="${K.ink}"/><path d="M${x} 35v3" stroke="${K.a}" stroke-width="2" stroke-linecap="round"/>`;
  const xs = [72, 116, 160];
  return svg(
    card(xs[0], cat(xs[0])) + card(xs[1], cat(xs[1])) + card(xs[2], dog(xs[2]))
    + `<path d="M50 58H232M50 88H232" stroke="${K.l}" stroke-width="1"/>`
    + tx(26, 72, '모든', { size: 11, bold: true, fill: K.ink }) + tx(26, 84, '카드가 고양이', { size: 9 })
    + tx(26, 104, '어떤', { size: 11, bold: true, fill: K.ink }) + tx(26, 116, '카드는 고양이', { size: 9 })
    + check(xs[0], 72, 0.2) + check(xs[1], 72, 0.6) + cross(xs[2], 72, 1.0)
    + tx(208, 77, '거짓', { size: 11, bold: true, fill: K.a, pop: 1.6 })
    + check(xs[0], 104, 1.9) + tx(136, 108, '한 장이면 충분', { size: 9, pop: 2.3 })
    + tx(208, 109, '참', { size: 11, bold: true, fill: K.p, pop: 2.4 }),
  );
}

/** 탑승 게이트: 탑승 가능 p는 표 보유 q 안쪽. 표 없는 사람은 q 밖에서 막히고(대우), 표가 있어도 p 밖일 수 있다(역) */
function travelContrapositive() {
  const person = (x: number, y: number, ticket: boolean) =>
    `<circle cx="${x}" cy="${y - 10}" r="4.5" fill="${K.ink}"/><path d="M${x - 6} ${y + 8}V${y - 1}Q${x - 6} ${y - 5} ${x - 2} ${y - 5}H${x + 2}Q${x + 6} ${y - 5} ${x + 6} ${y - 1}V${y + 8}Z" fill="${K.p}"/>`
    + (ticket ? `<rect x="${x + 5}" y="${y}" width="8" height="5" rx="1" fill="${K.am}"/>` : '');
  return svg(
    `<rect x="32" y="12" width="120" height="100" rx="10" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/>` + tx(118, 26, '표 보유 q', { size: 9.5, bold: true, fill: K.p })
    + `<rect x="42" y="38" width="56" height="64" rx="8" fill="${W}"/>`
    + dr(rrect(42, 38, 56, 64, 8), 0.1, { color: K.a, w: 2 }) + tx(70, 52, '탑승 가능 p', { size: 9, bold: true, fill: K.a, pop: 0.6 })
    + person(66, 84, true) + `<path d="M84 62V96M90 62V96" stroke="${K.l}" stroke-width="2"/>`
    + tx(194, 24, 'p ⇒ q', { math: true, size: 13, fill: K.p, pop: 0.6 })
    + person(14, 70, false) + tx(14, 92, '표 없음', { size: 9, fill: K.ink })
    + arrow(22, 62, 40, 62, 1.1, { color: K.a, w: 1.8 }) + cross(34, 46, 1.6, K.a, 4)
    + tx(194, 46, '대우', { size: 9.5, bold: true, fill: K.ink, pop: 1.9 }) + tx(194, 64, '¬q ⇒ ¬p', { math: true, size: 13, pop: 1.9 })
    + pop(2.2, person(124, 70, true)) + tx(124, 94, '다른 조건', { size: 9, fill: K.a, pop: 2.2 })
    + tx(194, 88, '역 q ⇒ p 는', { size: 9.5, fill: K.ink, pop: 2.4 }) + tx(194, 104, '틀릴 수 있음', { size: 10, bold: true, fill: K.a, pop: 2.4 }),
  );
}

/** 장난감 자동차 회로: 배터리에서 전기가 흘러가다 꺼진 스위치에서 멈춘다 → 배터리만으로는 부족(필요조건) */
function carNecessary() {
  const battery = `<rect x="14" y="46" width="16" height="36" rx="3" fill="${K.am}"/><rect x="18" y="42" width="8" height="4" rx="1" fill="${K.ink}"/><path d="M19 56h6M22 53v6" stroke="${W}" stroke-width="1.6"/>`;
  const car = `<path d="M96 92V78Q96 70 104 70H136Q146 70 148 80V92Z" fill="${K.p}"/><rect x="108" y="74" width="10" height="8" rx="2" fill="${W}" fill-opacity=".7"/><path d="M140 70V58" stroke="${K.ink}" stroke-width="1.2"/><circle cx="140" cy="57" r="2" fill="${K.a}"/><circle cx="106" cy="94" r="6" fill="${K.ink}"/><circle cx="138" cy="94" r="6" fill="${K.ink}"/><circle cx="106" cy="94" r="2" fill="${K.l}"/><circle cx="138" cy="94" r="2" fill="${K.l}"/>`;
  return svg(
    `<path d="M22 82V110H100V100M94 24H110V70" fill="none" stroke="${K.m}" stroke-width="1.6"/><path d="M22 42V24H70" fill="none" stroke="${K.m}" stroke-width="1.6"/>`
    + `<circle cx="70" cy="24" r="2.4" fill="${K.ink}"/><circle cx="94" cy="24" r="2.4" fill="${K.ink}"/><path d="M70 24L89 12" stroke="${K.ink}" stroke-width="2.2" stroke-linecap="round"/>`
    + battery + car
    + tx(46, 16, '배터리 있음', { size: 9, fill: K.ink })
    + dr('M22 42V24H70', 0.2, { color: K.am, w: 3 })
    + cross(82, 30, 1.2, K.a, 4) + tx(82, 47, '스위치 꺼짐', { size: 9, bold: true, fill: K.a, pop: 1.4 })
    + tx(60, 72, '멈춤', { size: 10, bold: true, fill: K.a, pop: 1.7 })
    + tx(194, 22, '움직임 ⇒ 배터리', { size: 9.5, bold: true, fill: K.p })
    + tx(194, 38, '필요조건', { size: 10, bold: true, fill: K.p, pop: 0.4 })
    + tx(194, 66, '배터리 ⇒ 움직임?', { size: 9.5, bold: true, fill: K.a, pop: 1.9 })
    + tx(194, 82, '스위치가 꺼지면 ✗', { size: 9, fill: K.ink, pop: 2.1 })
    + tx(194, 102, '충분조건 아님', { size: 10, bold: true, fill: K.a, pop: 2.4 }),
  );
}

/** 일주일 기록 U: 산책한 월·수·금(발자국) 말고 나머지 칸을 차례로 두르고 물음표(다른 운동은 모름) */
function healthRecords() {
  const days = ['월', '화', '수', '목', '금', '토', '일'], walk = [0, 2, 4];
  const X = (i: number) => 12 + 31 * i;
  const feet = (x: number) => `<ellipse cx="${x + 10}" cy="66" rx="3" ry="5" fill="${K.p}" transform="rotate(-12 ${x + 10} 66)"/><ellipse cx="${x + 18}" cy="61" rx="3" ry="5" fill="${K.p}" transform="rotate(12 ${x + 18} 61)"/>`;
  const comp = [1, 3, 5, 6];
  return svg(
    tx(12, 18, 'U = 일주일 기록', { size: 9.5, fill: K.ink, anchor: 'start' }) + tx(228, 18, '발자국 = 산책한 날 A', { size: 9, anchor: 'end' })
    + days.map((d, i) => `<rect x="${X(i)}" y="30" width="28" height="44" rx="4" fill="${walk.includes(i) ? K.f : W}" stroke="${K.l}" stroke-width="1.2"/>` + tx(X(i) + 14, 45, d, { size: 10, bold: true, fill: K.ink }) + (walk.includes(i) ? feet(X(i)) : '')).join('')
    + comp.map((i, k) => dr(rrect(X(i) + 2, 32, 24, 40, 3), 0.2 + k * 0.3, { color: K.a, w: 2 }) + tx(X(i) + 14, 68, '?', { size: 12, bold: true, fill: K.a, pop: 0.7 + k * 0.3 })).join('')
    + tx(120, 96, 'Aᶜ = {화, 목, 토, 일}', { size: 12, bold: true, fill: K.a, pop: 2.0 })
    + tx(120, 113, '? = 다른 운동을 했는지는 알 수 없음', { size: 9, pop: 2.3 }),
  );
}

/** 병뚜껑 짝짓기: 짝수 n=2k면 k쌍으로 남김없이. 남았다고 하면 2k+1(홀수)이라 짝수와 모순 */
function environmentProof() {
  const cols = [K.a, K.p, K.am, K.m, K.p, K.a, K.am, K.p];
  const cap = (x: number, y: number, c: string) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/><circle cx="${x}" cy="${y}" r="3.6" fill="none" stroke="${W}" stroke-width="1" stroke-opacity=".7"/>`;
  const row = (y: number, t0: number) => [0, 1, 2, 3].map((j) => {
    const x0 = 70 + 30 * j;
    return cap(x0, y, cols[2 * j]) + cap(x0 + 14, y, cols[2 * j + 1]) + dr(`M${x0} ${y + 8}Q${x0 + 7} ${y + 15} ${x0 + 14} ${y + 8}`, t0 + j * 0.15, { color: K.ink, w: 1.6 });
  }).join('');
  return svg(
    tx(30, 30, 'n = 2k', { math: true, size: 13 }) + tx(30, 44, '짝수라면', { size: 9 })
    + row(28, 0.1)
    + tx(208, 32, '남는 것 0', { size: 9.5, bold: true, fill: K.p, pop: 0.9 })
    + `<path d="M8 56H232" stroke="${K.l}" stroke-width="1"/>`
    + tx(30, 78, '남았다고', { size: 9.5, fill: K.ink }) + tx(30, 91, '가정하면', { size: 9.5, fill: K.ink })
    + row(80, 1.2) + pop(1.9, cap(198, 80, K.am)) + dr(ring(198, 80, 10), 2.0, { color: K.a, w: 2 })
    + tx(220, 84, '+1', { size: 10, bold: true, fill: K.a, pop: 2.0 })
    + tx(98, 112, 'n = 2k + 1', { math: true, size: 12, anchor: 'end', pop: 2.4 }) + tx(104, 112, '→ 홀수, 짝수와 모순', { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 2.6 }),
  );
}

/** 파일 분류표(크기 × 종류): A∩B 칸(큰 그림)을 두르고, 나머지 세 칸 = 작은 줄(Aᶜ) ∪ 그림 아닌 줄(Bᶜ) */
function computerFilter() {
  const file = (x: number, y: number, big: boolean, img: boolean) => {
    const w = big ? 20 : 13, h = big ? 26 : 17, x0 = x - w / 2, y0 = y - h / 2, f = big ? 6 : 4;
    return `<path d="M${x0} ${y0}H${x0 + w - f}L${x0 + w} ${y0 + f}V${y0 + h}H${x0}Z" fill="${W}" stroke="${K.p}" stroke-width="1.2" stroke-linejoin="round"/>`
      + (img ? `<path d="M${x0 + 2} ${y0 + h - 3}L${x0 + w * 0.4} ${y0 + h * 0.5}L${x0 + w - 2} ${y0 + h - 3}Z" fill="${K.am}"/><circle cx="${x0 + w * 0.65}" cy="${y0 + h * 0.35}" r="${big ? 2.2 : 1.5}" fill="${K.a}"/>`
        : `<path d="M${x0 + 3} ${y0 + h * 0.4}H${x0 + w - 3}M${x0 + 3} ${y0 + h * 0.6}H${x0 + w - 3}M${x0 + 3} ${y0 + h * 0.8}H${x0 + w - 6}" stroke="${K.l}" stroke-width="1.4"/>`);
  };
  return svg(
    `<rect x="52" y="24" width="104" height="80" fill="${W}"/>`
    + pop(0.8, `<path d="M104 24H156V104H52V64H104Z" fill="${K.a}" fill-opacity=".15"/>`)
    + `<path d="M52 24H156V104H52ZM104 24V104M52 64H156" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(78, 17, '그림 B', { size: 9.5, bold: true, fill: K.ink }) + tx(130, 17, '그림 아님', { size: 9.5, fill: K.ink })
    + tx(26, 47, '큰 파일 A', { size: 9.5, bold: true, fill: K.ink }) + tx(26, 87, '작은 파일', { size: 9.5, fill: K.ink })
    + file(78, 44, true, true) + file(130, 44, true, false) + file(78, 84, false, true) + file(130, 84, false, false)
    + dr('M55 27H101V61H55Z', 0.1, { color: K.p, w: 2.4 })
    + dr('M49 67H159V107H49Z', 1.3, { color: K.am, w: 2 }) + tx(104, 117, '작은 파일 Aᶜ', { size: 9, bold: true, fill: K.am, pop: 1.5 })
    + dr('M107 21H159V107H107Z', 1.8, { color: K.a, w: 2 })
    + tx(200, 26, '(A ∩ B)ᶜ', { math: true, size: 13, pop: 0.8 })
    + tx(200, 46, '=', { math: true, size: 13, pop: 2.4 })
    + tx(200, 66, 'Aᶜ ∪ Bᶜ', { math: true, size: 13, pop: 2.4 })
    + tx(200, 92, '크지 않거나', { size: 9.5, fill: K.am, bold: true, pop: 1.5 })
    + tx(200, 108, '그림이 아님', { size: 9.5, fill: K.a, bold: true, pop: 2.0 }),
  );
}

/** 둘레가 같은 방(a + b = 10): 8×2, 7×3, 6×4, 5×5를 차례로 그리면 넓이 16, 21, 24, 25. 오른쪽 그래프에서 a = 5일 때 가장 큼 */
function architectureInequality() {
  const u = 9, ox = 10, oy = 110;
  const rooms: [number, number, number][] = [[8, 2, 0.1], [7, 3, 0.5], [6, 4, 0.9], [5, 5, 1.3]];
  const GX = (a: number) => 120 + 11 * a, GY = (v: number) => 108 - 3.6 * v;
  return svg(
    `<rect x="${ox}" y="${oy - 5 * u}" width="${5 * u}" height="${5 * u}" fill="${K.f}"/>`
    + rooms.map(([a, b, at]) => {
      const sq = a === b, c = sq ? K.a : K.p;
      return dr(`M${ox} ${oy}H${ox + a * u}V${oy - b * u}H${ox}Z`, at, { color: c, w: sq ? 2.4 : 1.4 })
        + (sq ? tx(ox + a * u + 4, oy - b * u - 2, '25', { size: 9.5, bold: true, fill: c, anchor: 'start', pop: at + 0.5 }) : tx(GX(a) + 5, GY(a * b) - 2, String(a * b), { size: 9.5, bold: true, fill: c, anchor: 'start', pop: at + 0.5 }))
        + pop(at + 0.5, `<circle cx="${GX(a)}" cy="${n1(GY(a * b))}" r="${sq ? 3.6 : 2.8}" fill="${c}"/>`);
    }).join('')
    + tx(54, 14, 'a + b = 10', { math: true, size: 12 })
    + tx(54, 30, '(a − b)² ≥ 0', { math: true, size: 11.5, pop: 2.1 })
    + tx(54, 47, 'ab ≤ 25', { math: true, size: 13, pop: 2.4 })
    + `<path d="M117 108H232M120 111V8" fill="none" stroke="${K.m}" stroke-width="1.2"/>`
    + tx(124, 12, '넓이 ab', { size: 9, anchor: 'start' }) + tx(232, 116.5, 'a', { math: true, size: 11, anchor: 'end' })
    + dr('M' + Array.from({ length: 41 }, (_, i) => i / 4).map((a) => `${n1(GX(a))} ${n1(GY(a * (10 - a)))}`).join('L'), 1.9, { color: K.l, w: 1.6 })
    + tx(116, GY(25) + 3.5, '25', { size: 9.5, bold: true, fill: K.a, anchor: 'end', pop: 1.8 }) + tx(GX(5), 116.5, '5', { size: 9.5, bold: true, fill: K.a, pop: 1.8 }),
  );
}

/** 무대 위 가·나·다·라: 춤 A 괄호(가~다), 노래 B 괄호(나~라)가 차례로 그려지고 겹친 나·다가 밝아짐 */
function performanceMembers() {
  const xs = [44, 88, 132, 176], names = ['가', '나', '다', '라'];
  const member = (x: number, s: string) =>
    `<path d="M${x - 14} 102V92Q${x - 14} 80 ${x - 4} 80H${x + 4}Q${x + 14} 80 ${x + 14} 92V102Z" fill="${K.p}"/><circle cx="${x}" cy="70" r="9" fill="${K.p}"/>${tx(x, 73.5, s, { size: 10, bold: true, fill: W })}`;
  const bracket = (x1: number, x2: number, y: number, at: number, c: string) => dr(`M${x1} ${y + 7}V${y}H${x2}V${y + 7}`, at, { color: c, w: 2.2 });
  return svg(
    pop(1.4, `<rect x="${xs[1] - 20}" y="54" width="${xs[2] - xs[1] + 40}" height="52" rx="8" fill="${K.am}" fill-opacity=".35"/>`)
    + `<path d="M6 104H234" stroke="${K.l}" stroke-width="3"/>`
    + xs.map((x, i) => member(x, names[i])).join('')
    + bracket(xs[0] - 12, xs[2] + 12, 30, 0.1, K.p) + tx(xs[0] - 16, 36, '춤 A', { size: 9.5, bold: true, fill: K.p, anchor: 'end' })
    + bracket(xs[1] - 12, xs[3] + 12, 44, 0.7, K.a) + tx(xs[3] + 16, 50, '노래 B', { size: 9.5, bold: true, fill: K.a, anchor: 'start' })
    + tx(234, 16, 'A ∩ B = {나, 다}', { size: 11.5, bold: true, fill: K.a, anchor: 'end', pop: 1.9 })
    + tx(xs[0], 116, '춤만', { size: 9, fill: K.p, pop: 2.3 }) + tx((xs[1] + xs[2]) / 2, 116, '둘 다', { size: 9.5, bold: true, fill: K.ink, pop: 2.3 }) + tx(xs[3], 116, '노래만', { size: 9, fill: K.a, pop: 2.3 }),
  );
}

const drawings: Record<string, string> = {
  'game-filter': gameFilter(),
  'music-union': musicUnion(),
  'sports-condition': sportsCondition(),
  'fashion-difference': fashionDifference(),
  'cooking-subset': cookingSubset(),
  'video-counter': videoCounter(),
  'design-de-morgan': designDeMorgan(),
  'animal-quantifier': animalQuantifier(),
  'travel-contrapositive': travelContrapositive(),
  'car-necessary': carNecessary(),
  'health-records': healthRecords(),
  'environment-proof': environmentProof(),
  'computer-filter': computerFilter(),
  'architecture-inequality': architectureInequality(),
  'performance-members': performanceMembers(),
};
export default drawings;
