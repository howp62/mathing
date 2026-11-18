'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { ILLUS, safeSvg } from '@/lib/illus';
import type { ExampleCard } from '@/lib/constants';

/**
 * 예시 카드 그림. 움직이는 부분(class="draw"·"pop")이 있으면, 카드가 화면에 보일 때 한 번만 그린다.
 * 휴대폰의 '동작 줄이기'가 켜져 있거나 화면 감지를 못 하는 브라우저에서는 처음부터 다 그린 그림을 보여 준다.
 */
export function Illus({ card }: { card: ExampleCard }) {
  const svg = card.illus ? ILLUS[card.illus] : safeSvg(card.svg);
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'' | 'wait' | 'wait play'>('');
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !el.querySelector('.draw, .pop')) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setMode('wait');
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setMode('wait play');
        io.disconnect();
      }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [svg]);
  if (!svg) return null;
  return <div ref={box} className={`illus ${mode}`.trim()} dangerouslySetInnerHTML={{ __html: svg }} />;
}
