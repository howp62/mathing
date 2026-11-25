/** 가장자리에 걸친 순간 재생이 끝나지 않도록 그림이 충분히 보일 때 시작한다. */
export const ILLUSTRATION_VISIBLE_RATIO = 0.6;
type VisibilitySample = Pick<IntersectionObserverEntry, 'intersectionRatio' | 'isIntersecting'>;

export function shouldStartIllustration(entries: readonly VisibilitySample[]): boolean {
  const latest = entries[entries.length - 1];
  return !!latest?.isIntersecting && latest.intersectionRatio >= ILLUSTRATION_VISIBLE_RATIO;
}
