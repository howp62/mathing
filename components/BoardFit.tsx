'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/** 1280×720 칠판 캔버스를 창 크기에 맞춰 키우거나 줄인다 */
export function BoardFit({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1280, window.innerHeight / 720));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="board-page">
      <div className="board-fit" ref={ref} style={{ width: 1280 * scale, height: 720 * scale }}>
        <div className="board" style={{ transform: `scale(${scale})` }}>{children}</div>
      </div>
    </div>
  );
}
