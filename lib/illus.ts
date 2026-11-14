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
};

/** 콘텐츠 파일의 svg는 저장소에 들어 있는 신뢰한 값만 쓰되, 스크립트·이벤트·외부 참조가 있으면 버린다. */
export function safeSvg(svg: string | null | undefined): string | null {
  if (!svg || !svg.trim().startsWith('<svg')) return null;
  if (/<script|on[a-z]+\s*=|href\s*=|<foreignObject|<style|javascript:/i.test(svg)) return null;
  return svg;
}
