import { useCallback, useEffect, useRef, useState } from 'react';
import {
  planCrossFlight,
  planFlightFromPoint,
  type CrossFlight,
  type Edge,
} from '../utils/flightPath';

/** Slow edge flights; sometimes pause mid-page, then leave again. */
export function useEdgeFlight(opts: {
  startDelay?: number;
  durationMin?: number;
  durationMax?: number;
  preferHorizontal?: boolean;
} = {}) {
  const {
    startDelay = 0,
    durationMin = 16,
    durationMax = 24,
    preferHorizontal = true,
  } = opts;

  const [flight, setFlight] = useState<CrossFlight>(() =>
    planCrossFlight(undefined, { durationMin, durationMax, preferHorizontal })
  );
  const [flightKey, setFlightKey] = useState(0);
  const [ready, setReady] = useState(startDelay <= 0);
  const [paused, setPaused] = useState(false);
  const exitRef = useRef<Edge | undefined>(flight.exit);

  useEffect(() => {
    if (startDelay <= 0) return;
    const t = setTimeout(() => setReady(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!ready || paused) return;

    const t = setTimeout(() => {
      const next = planCrossFlight(exitRef.current, {
        durationMin,
        durationMax,
        preferHorizontal,
      });
      exitRef.current = next.exit;
      setFlight(next);
      setFlightKey((k) => k + 1);
    }, flight.duration * 1000);

    return () => clearTimeout(t);
  }, [
    ready,
    paused,
    flightKey,
    flight.duration,
    durationMin,
    durationMax,
    preferHorizontal,
  ]);

  const resumeFrom = useCallback(
    (point: { x: number; y: number }) => {
      const next = planFlightFromPoint(point, {
        durationMin: Math.max(10, durationMin - 4),
        durationMax: Math.max(14, durationMax - 4),
      });
      exitRef.current = next.exit;
      setFlight(next);
      setFlightKey((k) => k + 1);
      setPaused(false);
    },
    [durationMin, durationMax]
  );

  return {
    flightKey,
    x: flight.x,
    y: flight.y,
    times: flight.times,
    duration: flight.duration,
    visible: ready,
    paused,
    setPaused,
    resumeFrom,
  };
}
