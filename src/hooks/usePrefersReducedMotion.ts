import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function getPrefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(getPrefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
