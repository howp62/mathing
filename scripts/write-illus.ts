/**
 * 그림 원본(scripts/illus/<세트ID>.ts)을 콘텐츠 JSON의 svg 칸에 써 넣는다.
 * 사용: node scripts/write-illus.ts cm2-functions
 * 예시 ID가 하나라도 맞지 않으면 아무것도 쓰지 않는다. 그림 외의 칸은 건드리지 않는다.
 */
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('세트 ID를 주세요. 예: node scripts/write-illus.ts cm2-functions');
const { default: drawings } = (await import(`./illus/${id}.ts`)) as { default: Record<string, string> };
const file = path.join(process.cwd(), 'content', 'sets', `${id}.json`);
const set = JSON.parse(fs.readFileSync(file, 'utf8')) as { examples: { id: string; svg?: string | null; illus: string | null }[] };
const ids = set.examples.map((e) => e.id);
const missing = ids.filter((e) => !drawings[e]);
const extra = Object.keys(drawings).filter((k) => !ids.includes(k));
if (missing.length || extra.length) throw new Error(`그림 없음: ${missing.join(', ') || '-'} / 카드 없음: ${extra.join(', ') || '-'}`);
for (const e of set.examples) { e.svg = drawings[e.id]; e.illus = null; }
fs.writeFileSync(file, JSON.stringify(set, null, 2) + '\n');
console.log(`${id}: 그림 ${ids.length}장 기록`);
