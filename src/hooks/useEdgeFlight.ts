import { useEffect, useRef, useState } from 'react';
import { planCrossFlight, type CrossFlight, type Edge } from '../utils/flightPath';

/** Continuous edge→edge flight via remounted initial→animate (no mid-screen parking). */
export function useEdgeFlight(opts: {
  startDelay?: number;
  durationMin?: number;
  durationMax?: number;
  preferHorizontal?: boolean;
} = {}) {
  const {
    startDelay = 0,
    durationMin = 7,
    durationMax = 11,
    preferHorizontal = true,
  } = opts;

  const [flight, setFlight] = useState<CrossFlight>(() =>
    planCrossFlight(undefined, { durationMin, durationMax, preferHorizontal })
  );
  const [flightKey, setFlightKey] = useState(0);
  const [ready, setReady] = useState(startDelay <= 0);
  const exitRef = useRef<Edge | undefined>(flight.exit);

  useEffect(() => {
    if (startDelay <= 0) return;
    const t = setTimeout(() => setReady(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!ready) return;

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
  }, [ready, flightKey, flight.duration, durationMin, durationMax, preferHorizontal]);

  return {
    flightKey,
    from: flight.from,
    to: flight.to,
    duration: flight.duration,
    // Hide until startDelay so sage doesn't spawn on top of beggar
    visible: ready,
  };
}
