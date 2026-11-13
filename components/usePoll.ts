'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** 몇 초마다 서버에 새 소식을 물어본다(폴링). 탭이 숨겨져 있으면 쉬었다가 돌아오면 바로 확인한다. */
export function usePoll<T>(url: string, initial: T, ms = 3000) {
  const [data, setData] = useState<T>(initial);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 401) { setError('login'); return; }
      if (!res.ok) { setError('서버와 연결이 잠시 끊겼어요'); return; }
      const json = (await res.json()) as T;
      if (alive.current) { setData(json); setError(null); }
    } catch {
      if (alive.current) setError('서버와 연결이 잠시 끊겼어요');
    }
  }, [url]);
  useEffect(() => {
    alive.current = true;
    const id = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, ms);
    const onVis = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { alive.current = false; clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [refresh, ms]);
  return { data, error, refresh, setData };
}
