'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const GRAPH = 'M92 202C119 202 127 158 152 158S185 191 208 153S247 112 274 116';

/** 완성 그림을 기본으로 둬서 스크립트·움직임 없이도 첫 화면을 사용할 수 있다. */
export function LandingIntro({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(15);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (preference?.matches) return;

    const started = Date.now();
    const finish = () => {
      window.clearInterval(timer.current);
      timer.current = undefined;
      setPlaying(false);
    };
    const onPreference = (event: MediaQueryListEvent) => {
      if (event.matches) finish();
    };
    setRemaining(15);
    setPlaying(true);
    timer.current = window.setInterval(() => {
      const left = Math.max(0, 15 - Math.floor((Date.now() - started) / 1000));
      setRemaining(left);
      if (left === 0) finish();
    }, 1000);
    preference?.addEventListener?.('change', onPreference);
    return () => {
      window.clearInterval(timer.current);
      preference?.removeEventListener?.('change', onPreference);
    };
  }, []);

  function skip() {
    window.clearInterval(timer.current);
    timer.current = undefined;
    setPlaying(false);
    document.getElementById('landing-login')?.focus({ preventScroll: true });
  }

  return (
    <div className="landing-art landing-intro" data-playing={playing ? 'true' : 'false'}>
      <div className="intro-tools">
        {playing && <>
          <span aria-live="off">소개 · {remaining}초 남음</span>
          <button type="button" onClick={skip}>건너뛰기</button>
        </>}
      </div>
      <div className="intro-stage">
        {playing && (
          <svg className="intro-scene" viewBox="0 0 360 300" aria-hidden="true">
            <rect className="intro-shape" x="153" y="123" width="54" height="54" rx="27" />
            <g className="intro-music">
              <text x="96" y="126">음악</text>
              <path className="intro-stave" d="M96 148H264 M96 164H264 M96 180H264" />
              <path className="intro-note" d="M208 173V130L234 124V163 M208 139L234 133" />
              <ellipse cx="201" cy="174" rx="7" ry="5" />
              <ellipse cx="227" cy="164" rx="7" ry="5" />
            </g>
            <g className="intro-graph">
              <text x="80" y="88">함수</text>
              <path className="intro-axes" d="M86 108V218H280" />
              <path className="intro-curve" pathLength="1" d={GRAPH} />
              <circle className="intro-trace" cx="0" cy="0" r="5" style={{ offsetPath: `path("${GRAPH}")` }} />
            </g>
          </svg>
        )}
        {children}
      </div>
      <div className="intro-progress-slot">
        {playing && <progress className="intro-progress" max="15" value={15 - remaining} aria-label="소개 진행" />}
      </div>
    </div>
  );
}
