import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INTERESTS } from '../lib/constants.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateSet, checkDirectory } from './check-content.ts';

function fixture(): Record<string, any> {
  return { id: 'cm2-figures', subject: '공통수학2', unit: '도형의 방정식', order: 5,
    status: 'draft', interestPromptsStatus: 'draft', topics: ['원의 방정식'], concepts: ['원의 방정식'],
    thinkCards: ['질문1', '질문2', '질문3', '질문4'],
    interestPrompts: Object.fromEntries(INTERESTS.map(t => [t, `${t}에서 무엇이 궁금해?`])),
    examples: INTERESTS.map((t, i) => ({ id: `circle-${i}`, tags: [t], title: `${t} 속 원 찾기`, body: '반지름을 2라고 해 볼게. 원 위의 점을 찾아봐. 좌표로 나타낼 수 있어.', formula: 'x²+y²=4', concept: '원의 방정식', illus: null,
      svg: '<svg viewBox="0 0 240 120"><circle class="pop" cx="120" cy="60" r="20" fill="#2F4D7A"/></svg>' })) };
}
test('완성된 신규 초안은 통과', () => assert.deepEqual(validateSet(fixture(), 'cm2-figures'), []));
const invalid: [string, (s: Record<string, any>) => void, string][] = [
  ['단원 ID 불일치', s => { s.id = 'cm1-counting'; }, 'id'],
  ['과목 불일치', s => { s.subject = '대수'; }, 'subject'],
  ['순서 불일치', s => { s.order = 1; }, 'order'],
  ['관심사 오타', s => { s.examples[0].tags = ['게입']; }, 'tags'],
  ['예시 ID 중복', s => { s.examples[1].id = s.examples[0].id; }, 'duplicate'],
  ['필수 필드 누락', s => { delete s.examples[0].body; }, 'body'],
  ['맞춤 질문 누락', s => { delete s.interestPrompts['게임']; }, 'interestPrompts'],
  ['90자 초과 질문', s => { s.interestPrompts['게임'] = '가'.repeat(91); }, '90'],
  ['공통 질문 부족', s => { s.thinkCards.pop(); }, 'thinkCards'],
  ['관심사 예시 연결 누락', s => { s.examples[0].tags = ['음악']; }, 'coverage'],
  ['목록 밖 개념', s => { s.examples[0].concept = '행렬'; }, 'concept'],
  ['unsafe SVG', s => { s.examples[0].svg = '<svg onload="alert(1)"></svg>'; }, 'svg'],
  ['외부 이미지 SVG', s => { s.examples[0].svg = '<svg><image href="https://x.invalid/a"/></svg>'; }, 'svg'],
  ['그림 없음', s => { s.examples[0].svg = null; }, 'svg'],
  ['아래 결과 문구만 나타나는 그림', s => { s.examples[0].svg = '<svg viewBox="0 0 240 120"><rect x="10" y="10" width="20" height="20"/><text class="pop" x="120" y="108">결과</text></svg>'; }, 'motion'],
  ['설명만 움직이는 묶음도 거부', s => { s.examples[0].svg = '<svg viewBox="0 0 240 120"><rect x="10" y="10" width="20" height="20"/><g class="pop"><text x="120" y="108">결과</text></g></svg>'; }, 'motion'],
  ['빈 움직임 묶음도 거부', s => { s.examples[0].svg = '<svg viewBox="0 0 240 120"><rect x="10" y="10" width="20" height="20"/><g class="pop"/></svg>'; }, 'motion'],
  ['움직임 대상 없음', s => { s.examples[0].svg = '<svg viewBox="0 0 240 120"><circle cx="1" cy="1" r="1"/></svg>'; }, 'motion'],
  ['허용 밖 색상', s => { s.examples[0].svg = s.examples[0].svg.replace('#2F4D7A', '#00FF00'); }, 'palette'],
  ['알 수 없는 검수 상태', s => { s.status = 'done'; }, 'status'],
];
for (const [name, mutate, needle] of invalid) test(name, () => {
  const s = fixture(); mutate(s);
  assert.ok(validateSet(s, 'cm2-figures').some(x => x.includes(needle)), needle);
});
test('개별 신규 세트는 reviewed 상태도 형식상 허용한다', () => {
  const s=fixture(); s.status='reviewed'; s.interestPromptsStatus='reviewed';
  assert.deepEqual(validateSet(s,'cm2-figures'), []);
});
test('알 수 없는 파일은 거부한다', () => assert.ok(validateSet(fixture(),'unknown').length));

test('기본 검사도 단원 파일 누락을 거부하고 명시적 부분 검사만 허용',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mathing-content-test-'));
 try { fs.writeFileSync(path.join(dir,'cm2-figures.json'),JSON.stringify(fixture()));
 assert(checkDirectory(dir).errors.some(x=>x.includes('missing file')));
 assert.deepEqual(checkDirectory(dir,false).errors,[]);
 } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});

test('도형과 설명을 함께 움직이는 묶음은 허용한다',()=>{
 const s=fixture();s.examples[0].svg='<svg viewBox="0 0 240 120"><g class="pop"><rect x="10" y="10" width="20" height="20"/><text x="120" y="108">결과</text></g></svg>';
 assert.deepEqual(validateSet(s,'cm2-figures'),[]);
});
