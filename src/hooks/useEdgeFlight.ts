import { useEffect, useState, useRef } from 'react';
import {
  planCrossFlight,
  randomOffscreenStart,
  type Edge,
} from '../utils/flightPath';

/** Continuous edge→edge flight: leave the page, re-enter elsewhere. */
export function useEdgeFlight(opts: {
  startDelay?: number;
  durationMin?: number;
  durationMax?: number;
  preferHorizontal?: boolean;
} = {}) {
  const {
    startDelay = 200,
    durationMin = 9,
    durationMax = 14,
    preferHorizontal = true,
  } = opts;

  const [position, setPosition] = useState(randomOffscreenStart);
  const [duration, setDuration] = useState(10);
  const [snap, setSnap] = useState(false);
  const lastExitRef = useRef<Edge | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = () => {
      if (cancelled) return;

      const flight = planCrossFlight(lastExitRef.current, {
        durationMin,
        durationMax,
        preferHorizontal,
      });
      lastExitRef.current = flight.exit;

      setSnap(true);
      setPosition(flight.from);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setSnap(false);
          setDuration(flight.duration);
          setPosition(flight.to);
          timer = setTimeout(run, flight.duration * 1000 + 120);
        });
      });
    };

    timer = setTimeout(run, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [startDelay, durationMin, durationMax, preferHorizontal]);

  return {
    position,
    transition: snap
      ? { duration: 0 }
      : { duration, ease: 'linear' as const },
  };
}
