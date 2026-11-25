'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { ILLUS, safeSvg } from '@/lib/illus';
import type { ExampleCard } from '@/lib/constants';
import { ILLUSTRATION_VISIBLE_RATIO, shouldStartIllustration } from '@/lib/illustration-motion';

/**
 * 예시 카드 그림. 움직이는 부분(class="draw"·"pop")이 있으면, 카드가 화면에 보일 때 한 번만 그린다.
 * 휴대폰의 '동작 줄이기'가 켜져 있거나 화면 감지를 못 하는 브라우저에서는 처음부터 다 그린 그림을 보여 준다.
 */
export function Illus({ card }: { card: ExampleCard }) {
  const svg = card.illus ? ILLUS[card.illus] : safeSvg(card.svg);
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'' | 'wait' | 'wait play'>('');
  useLayoutEffect(() => {
    // 이전 그림이 감지를 기다리던 중이어도, 정적 대체로 넘어가면 숨긴 상태를 남기지 않는다.
    setMode('');
    const el = box.current;
    if (!el || !el.querySelector('.draw, .pop')) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setMode('wait');
    let active = true;
    const io = new IntersectionObserver((entries) => {
      if (!active) return;
      // 가장자리에 조금만 걸친 알림도 온다. 마지막 관찰에서 충분히 보여야 시작한다.
      if (shouldStartIllustration(entries)) {
        active = false;
        setMode('wait play');
        io.disconnect();
      }
    }, { threshold: ILLUSTRATION_VISIBLE_RATIO });
    io.observe(el);
    return () => { active = false; io.disconnect(); };
  }, [svg]);
  if (!svg) return null;
  return <div ref={box} className={`illus ${mode}`.trim()} dangerouslySetInnerHTML={{ __html: svg }} />;
}
