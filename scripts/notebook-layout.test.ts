import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../lib/catalog.ts';
import { notebookPath } from '../lib/notebook-layout.ts';
test('16단원 이름표가 경계 안에 있고 서로 겹치지 않는다',()=>{
 const layout=notebookPath(CATALOG),points=layout.groups.flatMap(g=>g.points);
 assert.equal(points.length,16);assert.equal(layout.groups.length,5);
 for(const p of points){assert(p.x-28>=0);assert(p.x+28<=layout.width);assert(p.y-58>=0);assert(p.y+22<=layout.height);}
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
  const a=points[i],b=points[j];assert(Math.abs(a.x-b.x)>=56||Math.abs(a.y-b.y)>=20,`${a.id}, ${b.id} badges overlap`);
 }
});
test('같은 단원 이름도 과목과 ID로 구별한다',()=>{
 const layout=notebookPath(CATALOG);const c=layout.groups.flatMap(g=>g.points.map(p=>({subject:g.subject,...p}))).filter(p=>p.unit==='경우의 수');
 assert.equal(c.length,2);assert.notEqual(c[0].subject,c[1].subject);assert.notEqual(c[0].id,c[1].id);
});
