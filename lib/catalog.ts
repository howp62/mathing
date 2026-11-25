/** 대단원 16세트 목록. 파일이 있는 세트만 수업에서 열 수 있다. */
export const CATALOG: { subject: string; units: { id: string; unit: string }[] }[] = [
  { subject: '공통수학1', units: [
    { id: 'cm1-polynomial', unit: '다항식' },
    { id: 'cm1-equations', unit: '방정식과 부등식' },
    { id: 'cm1-counting', unit: '경우의 수' },
    { id: 'cm1-matrices', unit: '행렬' },
  ] },
  { subject: '공통수학2', units: [
    { id: 'cm2-figures', unit: '도형의 방정식' },
    { id: 'cm2-sets', unit: '집합과 명제' },
    { id: 'cm2-functions', unit: '함수와 그래프' },
  ] },
  { subject: '대수', units: [
    { id: 'al-explog', unit: '지수함수와 로그함수' },
    { id: 'al-trig', unit: '삼각함수' },
    { id: 'al-sequences', unit: '수열' },
  ] },
  { subject: '미적분I', units: [
    { id: 'c1-limits', unit: '함수의 극한과 연속' },
    { id: 'c1-derivatives', unit: '미분' },
    { id: 'c1-integrals', unit: '적분' },
  ] },
  { subject: '확률과 통계', units: [
    { id: 'ps-counting', unit: '경우의 수' },
    { id: 'ps-probability', unit: '확률' },
    { id: 'ps-statistics', unit: '통계' },
  ] },
];
