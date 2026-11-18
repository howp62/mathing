/**
 * 예시 카드용 간단한 도식(직접 만든 SVG). 외부 이미지는 쓰지 않는다.
 * 예시 카드 그림(content/sets의 svg 포함)은 이 팔레트 색만 쓴다: 사이트 색(globals.css)과 맞추기 위해서다.
 */
const K = { p: '#2F4D7A', a: '#C8553D', m: '#8A8178', l: '#D8CCB7', f: '#EDE4D3', am: '#D79A2B', ink: '#2A2522', bg: '#F7F2E8' };

function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function qrModules(n: number, size: number, ox: number, oy: number, seed: number, gap: number) {
  const r = seeded(seed);
  let g = '';
  const inF = (x: number, y: number) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (inF(x, y)) continue;
      if (r() < 0.5) g += `<rect x="${(ox + x * size).toFixed(2)}" y="${(oy + y * size).toFixed(2)}" width="${size - gap}" height="${size - gap}"/>`;
    }
  const fp = (x: number, y: number) => {
    const X = ox + x * size, Y = oy + y * size;
    return `<rect x="${X}" y="${Y}" width="${size * 7}" height="${size * 7}"/><rect x="${X + size}" y="${Y + size}" width="${size * 5}" height="${size * 5}" fill="#fff"/><rect x="${X + size * 2}" y="${Y + size * 2}" width="${size * 3}" height="${size * 3}"/>`;
  };
  return g + fp(0, 0) + fp(n - 7, 0) + fp(0, n - 7);
}

export const ILLUS: Record<string, string> = {
  qr: `<svg viewBox="0 0 200 90"><g fill="${K.ink}">${qrModules(21, 3.6, 62, 7, 3, 0.25)}</g><path d="M106 83 L111 74 L117 78 L122 67 L128 71 L133 59 L138.5 56 L138.5 83 Z" fill="${K.bg}" stroke="${K.a}" stroke-width="1.6" stroke-dasharray="3 2.5" stroke-linejoin="round"/></svg>`,
  xp: `<svg viewBox="0 0 200 90"><path d="M32 78H182M32 78V8" stroke="${K.l}" stroke-width="2" fill="none"/><path d="M32 78C104 78 142 66 176 12" fill="none" stroke="${K.p}" stroke-width="3.5" stroke-linecap="round"/><circle cx="176" cy="12" r="5" fill="${K.a}"/><text x="38" y="18" font-size="11" fill="${K.m}" font-family="sans-serif">경험치</text><text x="150" y="89" font-size="11" fill="${K.m}" font-family="sans-serif">레벨</text></svg>`,
  lane: `<svg viewBox="0 0 200 90"><path d="M44 90C72 58 96 36 126 4L152 4C142 34 150 62 168 90Z" fill="${K.f}"/><path d="M44 90C72 58 96 36 126 4M168 90C150 62 142 34 152 4" stroke="${K.m}" stroke-width="2.5" fill="none"/><path d="M106 90C112 62 122 36 139 4" stroke="${K.am}" stroke-width="2.5" stroke-dasharray="7 6" fill="none"/><g fill="${K.a}"><circle cx="58" cy="75" r="3.4"/><circle cx="76" cy="56" r="3.4"/><circle cx="94" cy="38" r="3.4"/><circle cx="112" cy="20" r="3.4"/></g></svg>`,
  bezier: `<svg viewBox="0 0 200 90"><path d="M30 72L70 8M170 20L130 82" stroke="${K.a}" stroke-width="1.5" stroke-dasharray="4 4"/><path d="M30 72C70 8 130 82 170 20" stroke="${K.p}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="30" cy="72" r="5" fill="${K.p}"/><circle cx="170" cy="20" r="5" fill="${K.p}"/><rect x="66" y="4" width="8" height="8" fill="${K.a}"/><rect x="126" y="78" width="8" height="8" fill="${K.a}"/></svg>`,
  wave: `<svg viewBox="0 0 200 90"><path d="M10 45C30 0 50 0 70 45S110 90 130 45S170 0 190 45" stroke="${K.l}" stroke-width="2" stroke-dasharray="4 4" fill="none"/><path d="M10 45C18 22 26 17 40 17L56 17C64 17 68 30 70 45C72 60 76 73 90 73L110 73C122 73 127 60 130 45C133 30 138 17 152 17L168 17C178 17 184 30 190 45" stroke="${K.p}" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
  tone: `<svg viewBox="0 0 200 90"><rect x="62" y="8" width="76" height="76" rx="4" fill="#fff" stroke="${K.l}"/><path d="M62 46H138M100 8V84" stroke="${K.f}" stroke-width="1.5"/><path d="M62 84L138 8" stroke="${K.l}" stroke-dasharray="3 3"/><path d="M62 84C84 80 90 52 100 46S116 12 138 8" stroke="${K.p}" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="84" cy="66" r="4.5" fill="${K.a}"/></svg>`,
  box: `<svg viewBox="0 0 200 90"><path d="M58 36L84 16H156L130 36Z" fill="#E3E9F3" stroke="${K.p}" stroke-width="2" stroke-linejoin="round"/><path d="M130 36L156 16V58L130 78Z" fill="#CBD7EA" stroke="${K.p}" stroke-width="2" stroke-linejoin="round"/><rect x="58" y="36" width="72" height="42" fill="#fff" stroke="${K.p}" stroke-width="2"/><g font-family="serif" font-style="italic" font-size="13" fill="${K.a}"><text x="80" y="90">x+3</text><text x="44" y="61">x</text><text x="146" y="78">x+1</text></g></svg>`,
  ball: `<svg viewBox="0 0 200 90"><path d="M10 82H190" stroke="${K.l}" stroke-width="2"/><path d="M20 82Q100 -20 180 82" stroke="${K.p}" stroke-width="2.5" stroke-dasharray="5 5" fill="none"/><g fill="${K.p}" opacity=".45"><circle cx="40" cy="60" r="4"/><circle cx="70" cy="40" r="4"/><circle cx="100" cy="33" r="4"/></g><circle cx="140" cy="42.5" r="7" fill="${K.a}"/><text x="150" y="34" font-size="11" fill="${K.m}" font-family="sans-serif">2초 뒤</text></svg>`,

  /* ---- 장면 + 수학 그림(240×120). 장면은 그대로, 수학 부분은 class="draw"(선이 그려짐)·"pop"(나타남), --d는 시작 시각 ---- */
  // 여행 예산: 여행 가방(예산 60만 원), 1박 x원짜리 침대 3개, 수직선 위 8 ≤ x ≤ 16
  trip: `<svg viewBox="0 0 240 120">${suitcase()}${[98, 138, 178].map(bed).join('')}<text x="226" y="38" font-size="11" font-weight="700" text-anchor="middle" fill="${K.m}" font-family="sans-serif">3박</text><path d="M100 92H230" stroke="${K.l}" stroke-width="2" stroke-linecap="round"/><path d="M104 88V96M152 88V96M200 88V96" stroke="${K.m}" stroke-width="1.4"/><g font-size="10" fill="${K.m}" font-family="sans-serif" text-anchor="middle"><text x="104" y="109">0</text><text x="152" y="109">8</text><text x="200" y="109">16</text></g><text x="232" y="109" font-size="8.5" fill="${K.m}" font-family="sans-serif" text-anchor="end">만 원</text><path class="draw" pathLength="1" style="--d:.2s" d="M152 92H200" stroke="${K.a}" stroke-width="5" stroke-linecap="round"/><g class="pop" style="--d:1.1s" fill="${K.a}"><circle cx="152" cy="92" r="4.5"/><circle cx="200" cy="92" r="4.5"/></g><text class="pop" style="--d:1.3s" x="176" y="78" font-size="12.5" text-anchor="middle" fill="${K.a}" font-family="serif" font-style="italic">8 ≤ x ≤ 16</text></svg>`,
  // 강아지 운동장: 울타리(둘레 20 m)를 따라 선이 그려지고, 가로·세로와 합·곱이 나타남
  fence: `<svg viewBox="0 0 240 120"><rect x="20" y="20" width="120" height="80" fill="${K.f}"/><path class="draw" pathLength="1" style="--d:.1s" d="M20 20H140V100H20Z" fill="none" stroke="${K.p}" stroke-width="3" stroke-linejoin="round"/><g class="pop" style="--d:1s" fill="${K.p}">${[[20, 20], [80, 20], [140, 20], [140, 60], [140, 100], [80, 100], [20, 100], [20, 60]].map(([x, y]) => `<rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" rx="1.5"/>`).join('')}</g>${dog(78, 64)}<g class="pop" style="--d:1.2s" font-size="11" font-weight="700" fill="${K.ink}" font-family="sans-serif"><text x="80" y="115" text-anchor="middle">6 m</text><text x="145" y="64">4 m</text></g><g font-size="10" fill="${K.m}" font-family="sans-serif" text-anchor="middle"><text x="198" y="32">울타리 20 m</text><text x="198" y="48">넓이 24 m²</text></g><g font-size="12" fill="${K.a}" font-family="serif" font-style="italic" text-anchor="middle"><text class="pop" style="--d:1.5s" x="198" y="76">6 + 4 = 10</text><text class="pop" style="--d:1.8s" x="198" y="96">6 × 4 = 24</text></g></svg>`,
  // 코디: 상의 4벌 × 하의 3벌을 잇는 선 12개가 차례로 그려지고, 원피스 2벌은 '또는'으로 더함
  outfit: `<svg viewBox="0 0 240 120"><g stroke="${K.p}" stroke-width="1.3" stroke-opacity=".55" fill="none">${[20, 45, 70, 95].flatMap((t, i) => [30, 58, 86].map((b, j) => `<path class="draw" pathLength="1" style="--d:${((i * 3 + j) * 0.07).toFixed(2)}s" d="M43 ${t}L92 ${b}"/>`)).join('')}</g><g stroke="${K.p}" stroke-width="1.5" stroke-linejoin="round">${[20, 45, 70, 95].map((y, i) => `<path transform="translate(30 ${y})" fill="${['#fff', K.f, '#E3E9F3', '#F6E3D8'][i]}" d="M-11-4L-5-9H5L11-4L7.5 .5L5-1.5V9H-5V-1.5L-7.5 .5Z"/>`).join('')}${[30, 58, 86].map((y, i) => `<path transform="translate(104 ${y})" fill="${['#CBD7EA', K.f, '#fff'][i]}" d="M-8-9H8L9.5 9H2.5L0-1L-2.5 9H-9.5Z"/>`).join('')}${[176, 204].map((x, i) => `<path transform="translate(${x} 44)" fill="${['#F6E3D8', K.f][i]}" d="M-5-12Q0-8 5-12L6.5-4L4.5-1.5L11 12H-11L-4.5-1.5L-6.5-4Z"/><path transform="translate(${x} 44)" fill="none" d="M-4.5-1.5H4.5"/>`).join('')}</g><text x="148" y="48" font-size="10" fill="${K.m}" font-family="sans-serif" text-anchor="middle">또는</text><g fill="${K.a}" font-family="serif" font-style="italic" text-anchor="middle"><text class="pop" style="--d:1.3s" x="190" y="86" font-size="12.5">4×3 + 2 = 14</text><text class="pop" style="--d:1.6s" x="190" y="105" font-size="11">× 신발 2 = 28</text></g></svg>`,
  // 공연 순서: 노래 7곡 중 5곡을 순서대로 자리에 넣고, 자리마다 고를 수 있는 곡 수 7·6·5·4·3
  setlist: `<svg viewBox="0 0 240 120">${[0, 1, 2, 3, 4, 5, 6].map((i) => note(24 + i * 28, 26, i % 2 ? K.p : K.m)).join('')}${tx(234, 24, '7곡', { anchor: 'end', bold: true })}${[2, 5, 0, 6, 3].map((n, j) => dr(`M${24 + n * 28} 32Q${(24 + n * 28 + 43 + j * 40) / 2} 46 ${43 + j * 40} 60`, j * 0.25, { color: K.p, w: 1.4, opacity: 0.55 })).join('')}${[0, 1, 2, 3, 4].map((j) => `<rect x="${28 + j * 40}" y="62" width="30" height="24" rx="5" fill="#fff" stroke="${K.p}" stroke-width="1.6"/>${tx(43 + j * 40, 97, `${j + 1}번째`, { size: 8.5 })}`).join('')}${[7, 6, 5, 4, 3].map((k, j) => tx(43 + j * 40, 79, String(k), { math: true, size: 14, pop: 0.5 + j * 0.25 })).join('')}${[0, 1, 2, 3].map((j) => tx(63 + j * 40, 78, '×', { size: 11, pop: 0.6 + j * 0.25 })).join('')}${tx(120, 114, '7 × 6 × 5 × 4 × 3 = 2520', { math: true, size: 12, pop: 1.8 })}</svg>`,
  // 떡볶이 토핑: 8가지 중 3가지에 동그라미, 그릇에 올라감. 순서는 상관없으니 3×2×1로 나눔
  topping: `<svg viewBox="0 0 240 120">${['#fff', K.am, '#F6E3D8', K.f, '#E3E9F3', K.l, '#fff', K.am].map((c, i) => `<circle cx="${20 + (i % 4) * 24}" cy="${20 + Math.floor(i / 4) * 24}" r="8" fill="${c}" stroke="${K.p}" stroke-width="1.4"/>`).join('')}<circle cx="20" cy="20" r="3.2" fill="${K.am}"/><circle cx="20" cy="44" r="3.2" fill="${K.am}"/>${[1, 4, 6].map((i, k) => dr(ring(20 + (i % 4) * 24, 20 + Math.floor(i / 4) * 24, 11.5), 0.2 + k * 0.35, { w: 2 })).join('')}<path d="M26 80H104Q102 112 65 112Q28 112 26 80Z" fill="#F6E3D8" stroke="${K.p}" stroke-width="2"/><ellipse cx="65" cy="80" rx="39" ry="5" fill="${K.a}"/><g fill="#fff" stroke="${K.p}" stroke-width="1"><rect x="40" y="75" width="16" height="5" rx="2.5"/><rect x="74" y="76" width="16" height="5" rx="2.5"/></g><g class="pop" style="--d:1.3s" stroke="${K.p}" stroke-width="1.2"><circle cx="50" cy="73" r="5" fill="${K.am}"/><circle cx="65" cy="71" r="5" fill="#E3E9F3"/><circle cx="80" cy="73" r="5" fill="#fff"/></g>${tx(176, 24, '8가지 중 3가지', { bold: true, fill: K.ink })}${tx(176, 40, '올리는 순서는 상관없음', { size: 9 })}${tx(176, 66, '8 × 7 × 6 = 336', { math: true, size: 12, pop: 1.5 })}${tx(176, 84, '÷ (3 × 2 × 1)', { math: true, size: 12, pop: 1.8 })}${tx(176, 106, '= 56', { math: true, size: 15, pop: 2.1 })}</svg>`,
  // 여행지 5곳: 지도 위 핀을 한 번씩 잇는 길이 그려지고 순서 번호가 붙음
  route: `<svg viewBox="0 0 240 120"><rect x="8" y="8" width="132" height="104" rx="10" fill="${K.f}"/><path d="M8 52Q60 40 140 70M70 8Q80 60 60 112" fill="none" stroke="#fff" stroke-width="5"/>${dr('M30 34L44 68L66 102L124 90L112 28', 0.1, { w: 2.4 })}${[[30, 34], [44, 68], [66, 102], [124, 90], [112, 28]].map(([x, y], i) => `${pin(x, y)}${tx(x + 10, y - 10, String(i + 1), { size: 10, bold: true, fill: K.a, anchor: 'start', pop: 0.1 + i * 0.25 })}`).join('')}${tx(190, 24, '여행지 5곳', { bold: true, fill: K.ink })}${tx(190, 40, '모두 한 번씩 들르기', { size: 9 })}${tx(190, 66, '5×4×3×2×1', { math: true, size: 12.5, pop: 1.5 })}${tx(190, 87, '= 120', { math: true, size: 15, pop: 1.8 })}${tx(190, 108, '10곳이면 360만 가지가 넘음', { size: 8.5, pop: 2.1 })}</svg>`,
  // DNA: 이중 나선(장면), 두 글자 묶음 4×4=16은 모자라고 세 글자 묶음 4×4×4=64면 충분
  codon: `<svg viewBox="0 0 240 120">${helix()}${tx(84, 16, '두 글자씩 묶으면', { size: 9, anchor: 'start', fill: K.ink })}${['A', 'G'].map((c, i) => letterBox(84 + i * 16, 22, c)).join('')}${tx(122, 35, '4×4 = 16', { math: true, size: 11.5, anchor: 'start', pop: 0.3 })}${dr('M190 26l8 8m0-8l-8 8', 0.8, { w: 2.2 })}${tx(194, 48, '20보다 적음', { size: 8.5, fill: K.a, pop: 0.9 })}${tx(84, 64, '세 글자씩 묶으면', { size: 9, anchor: 'start', fill: K.ink })}${['A', 'T', 'G'].map((c, i) => letterBox(84 + i * 16, 70, c)).join('')}${tx(138, 83, '4×4×4 = 64', { math: true, size: 11.5, anchor: 'start', pop: 1.2 })}${dr('M222 78l4 4l9-10', 1.7, { color: K.p, w: 2.4 })}${tx(160, 112, '아미노산은 20가지', { size: 9.5, fill: K.ink, bold: true })}</svg>`,
  // 새 다리 색 고리: 다리 2개에 고리가 하나씩 끼워지고, 5색으로 만들 수 있는 표시 수
  birdband: `<svg viewBox="0 0 240 120"><path d="M12 44L28 50L16 62Z" fill="${K.l}" stroke="${K.p}" stroke-width="1.4" stroke-linejoin="round"/><path d="M46 66V104M58 66V104M40 104H51M53 104H64" stroke="${K.m}" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="50" cy="52" rx="24" ry="16" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/><path d="M36 48Q52 40 64 50Q50 58 36 52Z" fill="${K.l}" stroke="${K.p}" stroke-width="1.2"/><circle cx="74" cy="36" r="10" fill="${K.f}" stroke="${K.p}" stroke-width="1.8"/><circle cx="77" cy="34" r="1.6" fill="${K.ink}"/><path d="M83 35L95 39L83 42Z" fill="${K.am}"/>${[[46, 76, K.a], [58, 76, K.p], [46, 87, K.am], [58, 87, '#fff']].map(([x, y, c], i) => `<rect class="pop" style="--d:${(0.2 + i * 0.25).toFixed(2)}s" x="${Number(x) - 4.5}" y="${y}" width="9" height="6" rx="1.5" fill="${c}" stroke="${K.ink}" stroke-width=".8"/>`).join('')}${[K.a, K.am, K.p, K.m, '#fff'].map((c, i) => `<circle cx="${136 + i * 15}" cy="20" r="5.5" fill="${c}" stroke="${K.ink}" stroke-width=".8"/>`).join('')}${tx(216, 24, '5색', { anchor: 'start', bold: true, fill: K.ink })}${tx(170, 46, '다리마다 1개씩', { size: 9 })}${tx(170, 63, '5 × 5 = 25', { math: true, pop: 1.3 })}${tx(170, 84, '다리마다 위아래 2개씩', { size: 9 })}${tx(170, 101, '5×5×5×5 = 625', { math: true, pop: 1.6 })}</svg>`,
  // 음악 앱 스펙트럼(장면) 옆 복소평면: z = a + bi 화살표의 길이(크기)와 각(시작 위치)
  spectrum: `<svg viewBox="0 0 240 120"><rect x="14" y="6" width="62" height="108" rx="9" fill="#fff" stroke="${K.p}" stroke-width="2"/><rect x="20" y="16" width="50" height="86" rx="3" fill="${K.p}"/>${[20, 34, 48, 40, 28, 52, 30, 16].map((h, i) => `<rect x="${23 + i * 6}" y="${94 - h}" width="4" height="${h}" rx="1" fill="${i % 3 === 1 ? K.am : K.f}"/>`).join('')}<path d="M106 96H212M120 112V18" stroke="${K.l}" stroke-width="1.6"/>${tx(214, 108, '실수', { size: 8.5, anchor: 'end' })}${tx(125, 24, '허수', { size: 8.5, anchor: 'start' })}${dr('M120 96L190 44', 0.2, { w: 2.6 })}${dr('M138 96A18 18 0 0 0 134.4 85.3', 0.9, { color: K.m, w: 1.4 })}<circle class="pop" style="--d:1s" cx="190" cy="44" r="4" fill="${K.a}"/><path class="pop" style="--d:1.2s" d="M190 44V96M190 44H120" fill="none" stroke="${K.m}" stroke-width="1.2" stroke-dasharray="3 3"/>${tx(190, 108, 'a', { math: true, pop: 1.3 })}${tx(112, 48, 'b', { math: true, pop: 1.3 })}${tx(236, 30, 'z = a + bi', { math: true, anchor: 'end', size: 13, pop: 1.5 })}${tx(148, 64, '크기', { size: 8.5, anchor: 'end', pop: 1.4 })}${tx(142, 92, '위치', { size: 8, anchor: 'start', pop: 1.4 })}</svg>`,
  // 다이빙: 10 m 다이빙대에서 뛰어 물에 닿는 높이 곡선, 닿는 때 t = 2
  dive: `<svg viewBox="0 0 240 120"><rect x="0" y="104" width="240" height="16" fill="#E3E9F3"/><path d="M0 104q10-4 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="${K.p}" stroke-width="1.4"/><rect x="14" y="26" width="22" height="78" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/><path d="M10 26H46" stroke="${K.p}" stroke-width="3" stroke-linecap="round"/>${tx(25, 70, '10 m', { size: 8.5, bold: true, fill: K.p })}<circle cx="40" cy="12" r="3.5" fill="${K.p}"/><path d="M40 16V22M40 18L35.5 13.5M40 18L44.5 13.5M40 22L38 25M40 22L42 25" fill="none" stroke="${K.p}" stroke-width="1.6" stroke-linecap="round"/>${dr('M40 24Q110 -16 180 104', 0.2, { w: 2.2 })}<path class="pop" style="--d:1.1s" d="M172 100l-6-7M180 98v-9M188 100l6-7" fill="none" stroke="${K.p}" stroke-width="1.6" stroke-linecap="round"/>${tx(196, 92, 't = 2초', { math: true, anchor: 'start', pop: 1.3 })}${tx(234, 22, '−5t² + 5t + 10 = 0', { anchor: 'end', size: 11, fill: K.a, bold: true, pop: 1.5 })}</svg>`,
  // 약 농도 곡선: 기준선 5보다 높은 부분이 강조되고, 시간축에 1 ≤ t ≤ 5
  medicine: `<svg viewBox="0 0 240 120"><g transform="rotate(-30 32 32)"><rect x="14" y="25" width="36" height="14" rx="7" fill="#fff" stroke="${K.p}" stroke-width="1.6"/><path d="M32 25H21a7 7 0 0 0 0 14H32Z" fill="${K.a}" stroke="${K.p}" stroke-width="1.6"/></g>${tx(76, 16, '피 속 약 농도', { size: 8.5, anchor: 'start' })}<path d="M66 104H226M70 108V16" stroke="${K.l}" stroke-width="1.6"/><path d="M66 59H226" stroke="${K.m}" stroke-width="1.2" stroke-dasharray="4 3"/>${tx(63, 62, '5', { size: 9, anchor: 'end' })}${tx(226, 54, '효과 기준', { size: 8.5, anchor: 'end' })}${dr('M70 104Q142 -58 214 104', 0.1, { color: K.p, w: 2.4 })}${dr('M94 59Q142 -13 190 59', 1, { w: 3.6 })}<path class="pop" style="--d:1.4s" d="M94 59V104M190 59V104" stroke="${K.a}" stroke-width="1" stroke-dasharray="3 3"/>${dr('M94 104H190', 1.4, { w: 4 })}${tx(94, 116, '1', { size: 9.5, pop: 1.6 })}${tx(190, 116, '5', { size: 9.5, pop: 1.6 })}${tx(142, 90, '1 ≤ t ≤ 5', { math: true, pop: 1.8 })}${tx(234, 116, '시간', { size: 8.5, anchor: 'end' })}</svg>`,
  // 밤 사진 4장(점이 자글자글)을 더해 4로 나누면 깨끗한 사진
  nightphoto: `<svg viewBox="0 0 240 120">${[0, 1, 2, 3].map((k) => nightFrame(8 + k * 36, 22, k + 1)).join('')}${[0, 1, 2].map((k) => tx(40 + k * 36, 43, '+', { size: 11 })).join('')}${['A', 'B', 'C', 'D'].map((c, k) => tx(22 + k * 36, 70, c, { math: true, size: 11, fill: K.m })).join('')}${dr('M150 39H169M164 34L169 39L164 44', 0.3, { w: 2.2 })}<g class="pop" style="--d:1s"><rect x="174" y="10" width="60" height="58" rx="3" fill="${K.p}"/><circle cx="220" cy="24" r="6" fill="${K.f}"/><g fill="${K.f}"><circle cx="186" cy="20" r="1"/><circle cx="200" cy="30" r="1"/><circle cx="192" cy="40" r=".8"/><circle cx="226" cy="44" r=".8"/></g><path d="M174 68L190 46L200 56L212 42L234 68Z" fill="${K.ink}" opacity=".55"/></g>${tx(76, 96, '¼(A + B + C + D)', { math: true, size: 13, pop: 0.6 })}${tx(204, 84, '평균 내면', { size: 9, pop: 1.2 })}${tx(204, 98, '점이 사라짐', { size: 9, fill: K.a, bold: true, pop: 1.3 })}</svg>`,
  // 인공 신경망: 입력 3개 → 출력 2개 선(굵기 = 가중치)이 그려지고, 같은 숫자가 가중치 행렬에 나타남
  aiweights: `<svg viewBox="0 0 240 120">${[[0.2, 0.7, 0.1], [0.5, 0.3, 0.9]].flatMap((row, i) => row.map((w, j) => dr(`M29 ${30 + j * 30}L84 ${45 + i * 30}`, (i * 3 + j) * 0.1, { color: K.p, w: 0.6 + 3 * w, opacity: 0.6 }))).join('')}${[30, 60, 90].map((y) => `<circle cx="22" cy="${y}" r="7" fill="${K.f}" stroke="${K.p}" stroke-width="1.6"/>`).join('')}${[45, 75].map((y) => `<circle cx="92" cy="${y}" r="8" fill="#F6E3D8" stroke="${K.a}" stroke-width="1.6"/>`).join('')}${tx(22, 112, '입력', { size: 9 })}${tx(92, 98, '출력', { size: 9 })}${brackets(112, 132, 50, 86)}${tx(122, 64, 'y₁', { math: true, size: 10.5 })}${tx(122, 80, 'y₂', { math: true, size: 10.5 })}${tx(140, 72, '=', { size: 12, fill: K.ink })}${brackets(148, 204, 50, 86)}${[[0.2, 0.7, 0.1], [0.5, 0.3, 0.9]].flatMap((row, i) => row.map((w, j) => tx(160 + j * 16, 64 + i * 16, String(w), { size: 9.5, fill: K.p, pop: 1 + (i * 3 + j) * 0.1 }))).join('')}${tx(211, 72, '×', { size: 10, fill: K.ink })}${brackets(216, 236, 42, 94)}${['x₁', 'x₂', 'x₃'].map((x, i) => tx(226, 58 + i * 15, x, { math: true, size: 10.5, fill: K.p })).join('')}${tx(176, 102, '가중치 행렬', { size: 8.5, fill: K.a, pop: 1.6 })}${tx(176, 24, '출력 = (가중치) × (입력)', { size: 9.5, fill: K.ink, bold: true, pop: 1.8 })}</svg>`,
  // 직항 지도: 도시 1–2(2편), 2–3(1편) 길이 그려지고, 표의 i행 j열에 같은 수가 나타남
  flights: `<svg viewBox="0 0 240 120">${dr('M38 33Q70 22 88 52', 0.2, { w: 2.2 })}${dr('M89 67Q70 94 45 97', 0.6, { w: 2.2 })}${[[30, 30, '1'], [96, 60, '2'], [36, 98, '3']].map(([x, y, n]) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="${K.p}" stroke-width="1.8"/>${tx(Number(x), Number(y) + 3.5, String(n), { size: 10, bold: true, fill: K.p })}`).join('')}${tx(66, 22, '2편', { size: 9, bold: true, fill: K.a, pop: 0.9 })}${tx(76, 96, '1편', { size: 9, bold: true, fill: K.a, pop: 1.1 })}${tx(184, 12, '도착', { size: 8.5 })}${tx(140, 28, '출발', { size: 8.5 })}${['1', '2', '3'].map((n, j) => tx(162 + j * 22, 28, n, { size: 9 })).join('')}${['1', '2', '3'].map((n, i) => tx(140, 54 + i * 22, n, { size: 9 })).join('')}${brackets(150, 218, 38, 102)}${[[0, 2, 0], [2, 0, 1], [0, 1, 0]].flatMap((row, i) => row.map((v, j) => tx(162 + j * 22, 54 + i * 22, String(v), { size: 11, bold: v > 0, fill: v ? K.p : K.l, pop: 1.2 + (i * 3 + j) * 0.06 }))).join('')}${dr(ring(184, 50.5, 9.5), 1.9, { w: 1.6 })}${tx(184, 116, '1행 2열 = 1→2 직항 2편', { size: 8.5, fill: K.a, pop: 2.1 })}</svg>`,
  // 동물 수: 새끼·어른과 해마다 바뀌는 규칙(화살표 ×0.5, ×2, ×0.8), 올해 → 내년
  population: `<svg viewBox="0 0 240 120"><circle cx="52" cy="56" r="20" fill="#fff" stroke="${K.l}" stroke-width="1.6"/><circle cx="124" cy="56" r="24" fill="#fff" stroke="${K.l}" stroke-width="1.6"/>${critter(48, 56, 0.8)}${critter(118, 56, 1.1)}${tx(52, 90, '새끼 10', { size: 9.5, bold: true, fill: K.ink })}${tx(124, 94, '어른 20', { size: 9.5, bold: true, fill: K.ink })}${dr('M66 40Q88 18 106 36M100.2 34.4L106 36L104.4 30.2', 0.2, { color: K.p, w: 1.8 })}${dr('M110 74Q88 96 68 72M69 77.9L68 72L73.6 74.1', 0.6, { color: K.p, w: 1.8 })}${dr('M144 42C164 28 172 68 148 70M153 66.6L148 70L153.4 72.6', 1, { color: K.p, w: 1.8 })}${tx(86, 22, '× 0.5', { math: true, size: 11, pop: 0.6 })}${tx(88, 106, '× 2', { math: true, size: 11, pop: 1 })}${tx(170, 30, '× 0.8', { math: true, size: 11, anchor: 'start', pop: 1.4 })}${tx(206, 46, '올해', { size: 8.5 })}${tx(206, 60, '(10, 20)', { math: true, size: 11, fill: K.p })}${dr('M206 66V80M201 75L206 81L211 75', 1.6, { w: 1.8 })}${tx(206, 96, '내년', { size: 8.5, pop: 1.8 })}${tx(206, 111, '(40, 21)', { math: true, size: 12.5, pop: 1.9 })}</svg>`,
  // 체력 기록: 윗몸일으키기·멀리뛰기(장면), 7월 − 3월을 같은 칸끼리 빼서 늘어난 만큼
  fitness: `<svg viewBox="0 0 240 120"><path d="M10 31H70" stroke="${K.l}" stroke-width="3" stroke-linecap="round"/><path d="M42 29L52 19L60 29M42 29L34 17M35 19L43 15" fill="none" stroke="${K.p}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="12" r="4" fill="${K.p}"/><rect x="150" y="27" width="74" height="5" rx="2" fill="${K.am}" opacity=".5"/><rect x="128" y="28" width="9" height="4" fill="${K.l}"/><path d="M134 26Q162 -4 192 24" fill="none" stroke="${K.m}" stroke-width="1.3" stroke-dasharray="3 3"/><g fill="${K.p}"><ellipse cx="194" cy="28.5" rx="2.6" ry="1.4"/><ellipse cx="200" cy="28.5" rx="2.6" ry="1.4"/></g>${tx(42, 48, '7월', { bold: true, fill: K.ink })}${tx(110, 48, '3월', { bold: true, fill: K.ink })}${tx(178, 48, '늘어난 만큼', { size: 9.5, bold: true, fill: K.a })}${tx(8, 70, 'A', { size: 9 })}${tx(8, 89, 'B', { size: 9 })}${brackets(16, 68, 55, 95)}${brackets(84, 136, 55, 95)}${[[36, 185], [31, 172]].flatMap((r, i) => r.map((v, j) => tx(30 + j * 24, 70 + i * 19, String(v), { size: 10.5, fill: K.p }))).join('')}${[[30, 180], [25, 165]].flatMap((r, i) => r.map((v, j) => tx(98 + j * 24, 70 + i * 19, String(v), { size: 10.5, fill: K.p }))).join('')}${tx(76, 78, '−', { size: 13, fill: K.ink })}${tx(144, 78, '=', { size: 13, fill: K.ink })}${dr('M156 55H152V95H156M200 55H204V95H200', 0.1, { w: 1.6 })}${[[6, 5], [6, 7]].flatMap((r, i) => r.map((v, j) => tx(166 + j * 24, 70 + i * 19, `+${v}`, { size: 11, bold: true, fill: K.a, pop: 0.5 + (i * 2 + j) * 0.3 }))).join('')}${tx(120, 114, '왼쪽 칸: 윗몸일으키기(회) · 오른쪽 칸: 멀리뛰기(cm)', { size: 8 })}</svg>`,
};

/** 장면 그림 조각: 여행 가방(예산 표 '60만') */
function suitcase() {
  return `<path d="M36 38V31Q36 26 41 26H51Q56 26 56 31V38" fill="none" stroke="${K.p}" stroke-width="2.2"/><rect x="18" y="38" width="56" height="58" rx="8" fill="#fff" stroke="${K.p}" stroke-width="2.2"/><path d="M29 41V93M63 41V93" stroke="${K.l}" stroke-width="2"/><rect x="34" y="56" width="24" height="14" rx="3" fill="${K.f}" stroke="${K.a}" stroke-width="1.4"/><text x="46" y="66.5" font-size="9" font-weight="700" text-anchor="middle" fill="${K.a}" font-family="sans-serif">60만</text><g fill="${K.p}"><circle cx="28" cy="100" r="3.5"/><circle cx="64" cy="100" r="3.5"/></g>`;
}

/** 장면 그림 조각: 침대 하나(1박), 값은 x */
function bed(x: number) {
  return `<rect x="${x}" y="16" width="4" height="30" rx="1.5" fill="${K.p}"/><path d="M${x + 32} 38V46" stroke="${K.p}" stroke-width="3" stroke-linecap="round"/><rect x="${x + 2}" y="31" width="31" height="8" rx="2" fill="#fff" stroke="${K.p}" stroke-width="1.8"/><rect x="${x + 6}" y="25.5" width="9" height="6" rx="2.5" fill="${K.f}" stroke="${K.p}" stroke-width="1.3"/><rect x="${x + 15}" y="28" width="18" height="11" rx="2" fill="#E3E9F3" stroke="${K.p}" stroke-width="1.5"/><text x="${x + 24}" y="23" font-size="11.5" text-anchor="middle" fill="${K.a}" font-family="serif" font-style="italic">x</text>`;
}

/** 장면 그림 조각: 옆에서 본 강아지 */
function dog(cx: number, cy: number) {
  return `<g transform="translate(${cx} ${cy})"><path d="M-16-3Q-23-10-20-15" fill="none" stroke="${K.am}" stroke-width="3" stroke-linecap="round"/><g stroke="${K.am}" stroke-width="3" stroke-linecap="round"><path d="M-11 4V13M-4 4V13M5 4V13M10 4V13"/></g><rect x="-16" y="-6" width="28" height="12" rx="6" fill="${K.am}"/><circle cx="15" cy="-9" r="7" fill="${K.am}"/><path d="M11-15Q8-8 12-5" fill="none" stroke="${K.ink}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><circle cx="17" cy="-11" r="1.2" fill="${K.ink}"/><circle cx="22" cy="-7.5" r="1.6" fill="${K.ink}"/></g>`;
}

/* ---- 그림을 짧게 쓰기 위한 도우미 ---- */

/** 글자(기본 가운데 맞춤). math면 세리프 기울임·강조색, pop을 주면 그 시각(초)에 나타남 */
function tx(x: number, y: number, s: string, o: { size?: number; fill?: string; math?: boolean; bold?: boolean; anchor?: 'start' | 'middle' | 'end'; pop?: number } = {}) {
  const pop = o.pop === undefined ? '' : ` class="pop" style="--d:${o.pop.toFixed(2)}s"`;
  const font = o.math ? ' font-family="serif" font-style="italic"' : ' font-family="sans-serif"';
  return `<text${pop} x="${x}" y="${y}" font-size="${o.size ?? (o.math ? 12.5 : 10)}" fill="${o.fill ?? (o.math ? K.a : K.m)}" text-anchor="${o.anchor ?? 'middle'}"${o.bold ? ' font-weight="700"' : ''}${font}>${s}</text>`;
}

/** 그려지는 선(수학 부분). at초에 시작 */
function dr(d: string, at: number, o: { color?: string; w?: number; opacity?: number } = {}) {
  return `<path class="draw" pathLength="1" style="--d:${at.toFixed(2)}s" d="${d}" fill="none" stroke="${o.color ?? K.a}" stroke-width="${o.w ?? 2.5}" stroke-linecap="round" stroke-linejoin="round"${o.opacity ? ` stroke-opacity="${o.opacity}"` : ''}/>`;
}

/** 원을 선 하나로(그려지는 동그라미용) */
function ring(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
}

/** 행렬 괄호 */
function brackets(x1: number, x2: number, y1: number, y2: number) {
  return `<path d="M${x1 + 4} ${y1}H${x1}V${y2}H${x1 + 4}M${x2 - 4} ${y1}H${x2}V${y2}H${x2 - 4}" fill="none" stroke="${K.ink}" stroke-width="1.5"/>`;
}

/** 장면 그림 조각: 음표 */
function note(x: number, y: number, c: string) {
  return `<ellipse cx="${x}" cy="${y}" rx="5" ry="3.8" transform="rotate(-20 ${x} ${y})" fill="${c}"/><path d="M${x + 4.3} ${y - 1}V${y - 16}Q${x + 9} ${y - 13} ${x + 10} ${y - 8}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`;
}

/** 장면 그림 조각: 지도 핀(끝이 (x, y)) */
function pin(x: number, y: number) {
  return `<path d="M${x} ${y}c-3-4-6-7-6-10a6 6 0 1 1 12 0c0 3-3 6-6 10z" fill="${K.p}"/><circle cx="${x}" cy="${y - 10}" r="2.2" fill="#fff"/>`;
}

/** 장면 그림 조각: DNA 이중 나선과 염기 짝(색 막대) */
function helix() {
  const xs = (y: number, s: number) => (40 + s * 14 * Math.sin(((y - 8) / 104) * 3 * Math.PI)).toFixed(1);
  const ys = Array.from({ length: 53 }, (_, i) => 8 + i * 2);
  const strand = (s: number) => `M${ys.map((y) => `${xs(y, s)} ${y}`).join('L')}`;
  const rungs = Array.from({ length: 13 }, (_, i) => 12 + i * 8).map((y, i) => `<path d="M${xs(y, 1)} ${y}H${xs(y, -1)}" stroke="${[K.a, K.am, K.p, K.m][i % 4]}" stroke-width="2.4"/>`).join('');
  return `${rungs}<path d="${strand(1)}" fill="none" stroke="${K.p}" stroke-width="2.2"/><path d="${strand(-1)}" fill="none" stroke="${K.m}" stroke-width="2.2"/>`;
}

/** 장면 그림 조각: 염기 글자 칸 */
function letterBox(x: number, y: number, c: string) {
  return `<rect x="${x}" y="${y}" width="14" height="16" rx="2" fill="#fff" stroke="${K.p}" stroke-width="1.4"/>${tx(x + 7, y + 12, c, { size: 10, bold: true, fill: K.p })}`;
}

/** 장면 그림 조각: 밤 사진 한 장(노이즈 점이 자글자글) */
function nightFrame(x: number, y: number, seed: number) {
  const r = seeded(seed * 7919);
  const dots = Array.from({ length: 14 }, (_, i) => `<rect x="${(x + 2 + r() * 24).toFixed(1)}" y="${(y + 2 + r() * 30).toFixed(1)}" width="1.8" height="1.8" fill="${i % 2 ? '#fff' : K.am}"/>`).join('');
  return `<rect x="${x}" y="${y}" width="28" height="34" rx="2" fill="${K.p}"/><path d="M${x} ${y + 34}L${x + 9} ${y + 21}L${x + 15} ${y + 27}L${x + 21} ${y + 19}L${x + 28} ${y + 34}Z" fill="${K.ink}" opacity=".55"/>${dots}`;
}

/** 장면 그림 조각: 작은 동물(새끼·어른), s는 크기 */
function critter(cx: number, cy: number, s: number) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-10 4q-7-1-7-9" fill="none" stroke="${K.am}" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="0" cy="4" rx="10" ry="7" fill="${K.am}"/><circle cx="9" cy="-5" r="6" fill="${K.am}"/><path d="M5-9L6-16L9.5-10ZM10-10L13-15L13.5-8Z" fill="${K.am}"/><circle cx="11" cy="-6" r="1" fill="${K.ink}"/><path d="M-6 10V14M5 10V14" stroke="${K.am}" stroke-width="2.4" stroke-linecap="round"/></g>`;
}

/** 콘텐츠 파일의 svg는 저장소에 들어 있는 신뢰한 값만 쓰되, 스크립트·이벤트·외부 참조가 있으면 버린다. */
export function safeSvg(svg: string | null | undefined): string | null {
  if (!svg || !svg.trim().startsWith('<svg')) return null;
  if (/<script|on[a-z]+\s*=|href\s*=|<foreignObject|<style|javascript:/i.test(svg)) return null;
  return svg;
}
