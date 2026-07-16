import { useEffect, useState } from 'react';

const QUERY = '(max-width: 860px), (pointer: coarse)';

/** True on phones/tablets — desktop fine+wide pointers stay on full-fidelity path. */
export function useIsMobilePerf() {
  const [isMobilePerf, setIsMobilePerf] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setIsMobilePerf(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobilePerf;
}

/** Sync check for non-React modules / effects (call only in browser). */
export function getIsMobilePerf() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}
