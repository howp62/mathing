import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldStartIllustration, ILLUSTRATION_VISIBLE_RATIO } from '../lib/illustration-motion.ts';
const sample=(ratio: number, isIntersecting=true)=>({intersectionRatio:ratio,isIntersecting});
test('화면 밖이거나 빈 알림이면 시작하지 않는다',()=>{
 assert.equal(shouldStartIllustration([]),false);
 assert.equal(shouldStartIllustration([sample(1,false)]),false);
});
test('가장자리에 걸친 알림과 60% 미만에서는 기다린다',()=>{
 for(const ratio of [0,.01,.59])assert.equal(shouldStartIllustration([sample(ratio)]),false);
});
test('60% 이상 보이면 재생을 시작한다',()=>{
 assert.equal(ILLUSTRATION_VISIBLE_RATIO,.6);
 for(const ratio of [.6,.8,1])assert.equal(shouldStartIllustration([sample(ratio)]),true);
});
test('모인 알림은 마지막 상태로 판단한다',()=>{
 assert.equal(shouldStartIllustration([sample(.8),sample(.1)]),false);
 assert.equal(shouldStartIllustration([sample(.1),sample(.8)]),true);
});
