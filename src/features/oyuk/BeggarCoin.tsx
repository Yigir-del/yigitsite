import { useEffect, useRef, useState } from 'react';
import { computeCoinTrajectoryFrame, type CoinPoint } from './oyukState';

interface BeggarCoinProps {
  /** Unique id for the active donation toss */
  coinId: number;
  /** Initial launch position near the user interaction point */
  startPoint: CoinPoint;
  /** Live resolver for the center of the beggar's donation container */
  getTargetPoint: () => CoinPoint | null;
  /** Fallback target point if DOM measurement is unavailable */
  fallbackTarget: CoinPoint;
  /** Respects prefers-reduced-motion */
  reducedMotion?: boolean;
  /** Mobile / compact viewport adjustment */
  isMobile?: boolean;
  /** Fired once when the coin physically lands in the container */
  onImpact: () => void;
  /** Fired once after the landing impact response finishes */
  onComplete: () => void;
}

/**
 * Isolated pointer-events-none visual layer that animates an antique-gold coin
 * from the click/interaction origin into the beggar's actual donation bowl,
 * followed by a restrained metallic glint upon impact (§1–§4, §7).
 */
export default function BeggarCoin({
  coinId,
  startPoint,
  getTargetPoint,
  fallbackTarget,
  reducedMotion = false,
  isMobile = false,
  onImpact,
  onComplete,
}: BeggarCoinProps) {
  const coinNodeRef = useRef<HTMLDivElement | null>(null);
  const sheenNodeRef = useRef<SVGPathElement | null>(null);
  const [impactPoint, setImpactPoint] = useState<CoinPoint | null>(null);

  const onImpactRef = useRef(onImpact);
  const onCompleteRef = useRef(onComplete);
  const getTargetRef = useRef(getTargetPoint);
  onImpactRef.current = onImpact;
  onCompleteRef.current = onComplete;
  getTargetRef.current = getTargetPoint;

  useEffect(() => {
    let rafId = 0;
    let impactTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let impactFired = false;

    const resolveTarget = (): CoinPoint => {
      return getTargetRef.current() ?? fallbackTarget;
    };

    // Reduced-motion path: skip long parabolic flight, show brief container glint & complete
    if (reducedMotion) {
      const target = resolveTarget();
      impactFired = true;
      setImpactPoint(target);
      onImpactRef.current();
      impactTimer = setTimeout(() => {
        if (!cancelled) {
          onCompleteRef.current();
        }
      }, 170);

      return () => {
        cancelled = true;
        if (impactTimer) clearTimeout(impactTimer);
      };
    }

    const durationMs = isMobile ? 720 : 800;
    const riseHeight = isMobile ? 48 : 60;
    const startTime = performance.now();

    const step = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startTime;
      const t = Math.min(1, Math.max(0, elapsed / durationMs));
      const liveTarget = resolveTarget();

      const frame = computeCoinTrajectoryFrame({
        t,
        startPoint,
        targetPoint: liveTarget,
        riseHeight,
      });

      const el = coinNodeRef.current;
      if (el) {
        el.style.transform = `translate3d(${frame.x.toFixed(1)}px, ${frame.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${frame.rotateZ.toFixed(1)}deg) scale(${frame.scale.toFixed(3)}, ${(frame.scale * frame.scaleY).toFixed(3)})`;
        el.style.opacity = frame.opacity.toFixed(3);
      }

      if (sheenNodeRef.current) {
        sheenNodeRef.current.style.opacity = (0.42 + frame.apexLight * 0.58).toFixed(2);
      }

      if (t < 1) {
        rafId = requestAnimationFrame(step);
        return;
      }

      // Coin has reached the donation container (t === 1)
      if (!impactFired) {
        impactFired = true;
        if (el) {
          el.style.opacity = '0';
        }
        setImpactPoint(liveTarget);
        onImpactRef.current();
        impactTimer = setTimeout(() => {
          if (!cancelled) {
            onCompleteRef.current();
          }
        }, 165);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (impactTimer) clearTimeout(impactTimer);
    };
  }, [coinId, startPoint, fallbackTarget, reducedMotion, isMobile]);

  const coinDiameter = isMobile ? 19 : 21;
  const gradId = `beggar-coin-grad-${coinId}`;
  const rimGradId = `beggar-coin-rim-${coinId}`;

  return (
    <div className="beggar-coin-layer" aria-hidden="true">
      {!reducedMotion && !impactPoint && (
        <div
          ref={coinNodeRef}
          className="beggar-coin"
          style={{
            width: `${coinDiameter}px`,
            height: `${coinDiameter}px`,
            transform: `translate3d(${startPoint.x}px, ${startPoint.y}px, 0) translate(-50%, -50%)`,
          }}
        >
          <svg
            width={coinDiameter}
            height={coinDiameter}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={rimGradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c7a968" />
                <stop offset="52%" stopColor="#8f6f32" />
                <stop offset="100%" stopColor="#594319" />
              </linearGradient>
              <radialGradient id={gradId} cx="34%" cy="30%" r="68%">
                <stop offset="0%" stopColor="#e6cf94" />
                <stop offset="48%" stopColor="#b5944f" />
                <stop offset="100%" stopColor="#7a5e26" />
              </radialGradient>
            </defs>

            {/* Outer antique-brass coin disc & dark rim */}
            <circle
              cx="12"
              cy="12"
              r="10.4"
              fill={`url(#${rimGradId})`}
              stroke="#463412"
              strokeWidth="1.15"
            />

            {/* Recessed face */}
            <circle
              cx="12"
              cy="12"
              r="8.3"
              fill={`url(#${gradId})`}
              stroke="#5c451b"
              strokeWidth="0.65"
            />

            {/* Engraved circular detail */}
            <circle
              cx="12"
              cy="12"
              r="6.2"
              stroke="#dfca92"
              strokeWidth="0.55"
              strokeDasharray="1.7 1.15"
              opacity="0.72"
            />

            {/* Stamped central mint mark */}
            <rect
              x="10.45"
              y="10.45"
              width="3.1"
              height="3.1"
              rx="0.45"
              transform="rotate(45 12 12)"
              fill="rgba(236, 214, 160, 0.28)"
              stroke="#533d16"
              strokeWidth="0.75"
            />

            {/* Subtle metallic highlight that catches light at apex */}
            <path
              ref={sheenNodeRef}
              d="M 6.9 8.1 A 6.9 6.9 0 0 1 15.5 5.9"
              stroke="#fbf1d4"
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity="0.55"
            />
          </svg>
        </div>
      )}

      {impactPoint && (
        <div
          className="beggar-coin-impact"
          style={{
            left: `${impactPoint.x}px`,
            top: `${impactPoint.y}px`,
          }}
        >
          <span className="beggar-coin-impact__glint" />
          <span className="beggar-coin-impact__spark beggar-coin-impact__spark--left" />
          <span className="beggar-coin-impact__spark beggar-coin-impact__spark--right" />
        </div>
      )}
    </div>
  );
}
