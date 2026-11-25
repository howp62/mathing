/** 저장소 콘텐츠 구조 검사. 수학·교육과정·장면의 적절성은 교사 검수를 별도로 받는다. */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { CATALOG } from '../lib/catalog.ts';
import { INTERESTS } from '../lib/constants.ts';
import { ILLUS, safeSvg } from '../lib/illus.ts';

const units = CATALOG.flatMap(s => s.units.map(u => ({ ...u, subject: s.subject })));
const palette = new Set(['#2F4D7A','#C8553D','#8A8178','#D8CCB7','#EDE4D3','#D79A2B','#2A2522','#F7F2E8','#FFFFFF']);
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(nonempty);
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** 저장소 SVG의 도형 자체나 도형을 포함한 상위 묶음이 움직이는지 확인한다. */
function hasShapeMotion(svg: string): boolean {
  const shapes = new Set(['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
  const ancestors: boolean[] = [];
  for (const tag of svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)\b([^<>]*?)>/g)) {
    if (tag[1]) { ancestors.pop(); continue; }
    const classes = tag[3].match(/(?:^|\s)class\s*=\s*(['"])(.*?)\1/)?.[2].split(/\s+/) ?? [];
    const moving = !!ancestors[ancestors.length - 1] || classes.some(c => c === 'draw' || c === 'pop');
    if (shapes.has(tag[2]) && moving) return true;
    if (!/\/\s*$/.test(tag[3])) ancestors.push(moving);
  }
  return false;
}

export function validateSet(raw: unknown, fileId: string): string[] {
  const errors: string[] = [];
  const error = (field: string, why: string) => { errors.push(`${fileId}.${field}: ${why}`); };
  const unit = units.find(u => u.id === fileId);
  if (!unit) return [`${fileId}.id: unknown catalog ID`];
  if (!obj(raw)) return [`${fileId}: expected object`];
  const strict = !fileId.startsWith('cm1-');
  for (const k of ['id', 'subject', 'unit'] as const) if (raw[k] !== unit[k]) error(k, 'catalog mismatch');
  if (raw.order !== units.indexOf(unit) + 1) error('order', 'catalog order mismatch');
  for (const k of ['status', 'interestPromptsStatus']) if (!['draft', 'reviewed'].includes(String(raw[k]))) error(k, 'invalid status');
  for (const k of ['topics', 'concepts', 'thinkCards']) if (!strings(raw[k])) error(k, 'nonempty string array required');
  if (!Array.isArray(raw.thinkCards) || raw.thinkCards.length !== 4) error('thinkCards', 'exactly 4 required');
  const prompts = obj(raw.interestPrompts) ? raw.interestPrompts : {};
  for (const tag of INTERESTS) {
    if (!nonempty(prompts[tag])) error('interestPrompts', `${tag} missing`);
    else if (strict && (prompts[tag] as string).length > 90) error('interestPrompts', `${tag} exceeds 90 characters`);
  }
  for (const tag of Object.keys(prompts)) if (!(INTERESTS as readonly string[]).includes(tag)) error('interestPrompts', `unknown interest ${tag}`);
  if (!Array.isArray(raw.examples)) { error('examples', 'array required'); return errors; }
  if (raw.examples.length < 8) error('examples', 'at least 8 required');
  const ids = new Set<string>(); const coverage = new Set<string>();
  raw.examples.forEach((e: unknown, index: number) => {
    const field = `examples[${index}]`;
    if (!obj(e)) { error(field, 'object required'); return; }
    for (const k of ['id', 'title', 'body', 'formula', 'concept']) if (!nonempty(e[k])) error(`${field}.${k}`, 'required');
    if (nonempty(e.id)) {
      if (ids.has(e.id)) error(`${field}.id`, 'duplicate'); ids.add(e.id);
    }
    if (!strings(e.tags)) error(`${field}.tags`, 'nonempty string array required');
    else for (const tag of e.tags) {
      if (!(INTERESTS as readonly string[]).includes(tag)) error(`${field}.tags`, `unknown interest ${tag}`);
      coverage.add(tag);
    }
    if (strict && (!Array.isArray(raw.concepts) || !raw.concepts.includes(e.concept))) error(`${field}.concept`, 'not in concepts');
    const svg = nonempty(e.illus) ? ILLUS[e.illus] : typeof e.svg === 'string' ? safeSvg(e.svg) : null;
    if (!svg || !safeSvg(svg)) { error(`${field}.svg`, 'missing or unsafe svg'); return; }
    if (strict) {
      if (!/viewBox\s*=\s*['"]0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?['"]/.test(svg)) error(`${field}.svg`, 'viewBox required');
      if (!hasShapeMotion(svg)) error(`${field}.motion`, 'mathematical shape/group motion required; caption alone is insufficient');
      for (const c of svg.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) if (!palette.has(c.toUpperCase())) error(`${field}.palette`, `unsupported ${c}`);
      if (/<(?:image|use|animate|set|iframe|object|embed)\b|url\s*\(/i.test(svg)) error(`${field}.svg`, 'external or active elements prohibited');
    }
  });
  if (strict) for (const tag of INTERESTS) if (!coverage.has(tag)) error('coverage', `${tag} missing example`);
  return errors;
}

export function checkDirectory(dir: string, complete = true): { errors: string[]; sets: number; examples: number; prompts: number } {
  const errors: string[]=[]; let sets=0, examples=0, prompts=0;
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
  if (complete) for (const u of units) if (!files.includes(`${u.id}.json`)) errors.push(`${u.id}: missing file`);
  for (const file of files) {
    try {
      const set: unknown=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
      errors.push(...validateSet(set,file.slice(0,-5))); sets++;
      if (obj(set)) { examples+=Array.isArray(set.examples)?set.examples.length:0; prompts+=obj(set.interestPrompts)?Object.keys(set.interestPrompts).length:0; }
    } catch (e) { errors.push(`${file}: ${e instanceof Error ? e.message : 'read failed'}`); }
  }
  return {errors,sets,examples,prompts};
}
if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  const at=process.argv.indexOf('--dir');
  const result=checkDirectory(at>=0 ? process.argv[at+1] : path.join(process.cwd(),'content/sets'),!process.argv.includes('--partial'));
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode=1; }
  else console.log(`통과: ${result.sets}세트 / 예시 ${result.examples}장 / 맞춤 질문 ${result.prompts}개`);
}
