import { useCallback, useEffect, useRef, useState } from 'react';
import {
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
} from 'framer-motion';
import {
  planCrossFlight,
  planFlightFromPoint,
  type Edge,
} from '../utils/flightPath';

/**
 * Edge flight on motion values — drag interrupts in one gesture
 * (fixes “first grab freezes, second grab throws”).
 */
export function useThrowableEdgeFlight(opts: {
  startDelay?: number;
  durationMin?: number;
  durationMax?: number;
  preferHorizontal?: boolean;
  paused?: boolean;
} = {}) {
  const {
    startDelay = 0,
    durationMin = 16,
    durationMax = 24,
    preferHorizontal = true,
    paused = false,
  } = opts;

  const [ready, setReady] = useState(startDelay <= 0);
  const [dragging, setDragging] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const exitRef = useRef<Edge | undefined>(undefined);
  const draggingRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const controlsRef = useRef<AnimationPlaybackControls[]>([]);
  const throwResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);
  const optsRef = useRef({ durationMin, durationMax, preferHorizontal });
  optsRef.current = { durationMin, durationMax, preferHorizontal };

  useEffect(() => {
    if (startDelay <= 0) return;
    const t = setTimeout(() => setReady(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  const stopFlightAnim = useCallback(() => {
    controlsRef.current.forEach((c) => c.stop());
    controlsRef.current = [];
    runIdRef.current += 1;
  }, []);

  const freezeFlight = useCallback(() => {
    if (throwResumeRef.current) {
      clearTimeout(throwResumeRef.current);
      throwResumeRef.current = null;
    }
    stopFlightAnim();
    draggingRef.current = false;
    setDragging(false);
  }, [stopFlightAnim]);

  const holdFlight = useCallback(() => {
    if (throwResumeRef.current) {
      clearTimeout(throwResumeRef.current);
      throwResumeRef.current = null;
    }
    stopFlightAnim();
  }, [stopFlightAnim]);

  const playFlight = useCallback(
    (fromExit?: Edge, fromPoint?: { x: number; y: number }) => {
      stopFlightAnim();
      if (pausedRef.current) return;
      const runId = runIdRef.current;
      const { durationMin: dMin, durationMax: dMax, preferHorizontal: horiz } = optsRef.current;

      const next = fromPoint
        ? planFlightFromPoint(fromPoint, {
            durationMin: Math.max(10, dMin - 4),
            durationMax: Math.max(14, dMax - 4),
          })
        : planCrossFlight(fromExit, {
            durationMin: dMin,
            durationMax: dMax,
            preferHorizontal: horiz,
          });

      exitRef.current = next.exit;
      x.set(next.x[0]);
      y.set(next.y[0]);

      const cx = animate(x, next.x, {
        duration: next.duration,
        times: next.times,
        ease: 'easeInOut',
      });
      const cy = animate(y, next.y, {
        duration: next.duration,
        times: next.times,
        ease: 'easeInOut',
      });
      controlsRef.current = [cx, cy];

      void Promise.all([cx, cy]).then(() => {
        if (runId !== runIdRef.current) return;
        if (draggingRef.current || pausedRef.current) return;
        playFlight(exitRef.current);
      });
    },
    [stopFlightAnim, x, y]
  );

  useEffect(() => {
    if (!ready) return;
    if (paused) {
      freezeFlight();
      return;
    }
    playFlight(undefined);
    return () => {
      stopFlightAnim();
      if (throwResumeRef.current) clearTimeout(throwResumeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, paused]);

  const onDragStart = useCallback(() => {
    if (pausedRef.current) return;
    if (throwResumeRef.current) clearTimeout(throwResumeRef.current);
    stopFlightAnim();
    draggingRef.current = true;
    setDragging(true);
  }, [stopFlightAnim]);

  const onDragEnd = useCallback(() => {
    if (throwResumeRef.current) clearTimeout(throwResumeRef.current);
    if (pausedRef.current) return;
    throwResumeRef.current = setTimeout(() => {
      if (pausedRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      playFlight(undefined, { x: x.get(), y: y.get() });
    }, 380);
  }, [playFlight, x, y]);

  const resumeFlight = useCallback(
    (delayMs = 280) => {
      if (throwResumeRef.current) clearTimeout(throwResumeRef.current);
      if (pausedRef.current || draggingRef.current) return;
      throwResumeRef.current = setTimeout(() => {
        if (pausedRef.current || draggingRef.current) return;
        playFlight(undefined, { x: x.get(), y: y.get() });
      }, delayMs);
    },
    [playFlight, x, y]
  );

  return {
    x,
    y,
    visible: ready,
    dragging,
    onDragStart,
    onDragEnd,
    freezeFlight,
    holdFlight,
    resumeFlight,
  };
}
