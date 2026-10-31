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
 * High-Definition Golden Coin Animation Layer (§6 & §7).
 * Uses crisp 64x64 vector geometry (no raster blur filters), rich metallic gold
 * gradients (#FFF2A6 / #FFD43B / #D89B13 / #A96B08), upward pop trajectory,
 * 3D vertical-axis coin spin, and live target tracking into the beggar's container.
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

    // Reduced-motion path (§7 & §27): skip long parabolic flight, show brief container glint & complete
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

    const durationMs = isMobile ? 760 : 830;
    const riseHeight = isMobile ? 56 : 70;
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
        el.style.transform = `translate3d(${frame.x.toFixed(1)}px, ${frame.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${frame.rotateZ.toFixed(1)}deg) scale(${(frame.scale * frame.scaleX).toFixed(3)}, ${frame.scale.toFixed(3)})`;
        el.style.opacity = frame.opacity.toFixed(3);
      }

      if (sheenNodeRef.current) {
        sheenNodeRef.current.style.opacity = (0.55 + frame.apexLight * 0.45).toFixed(2);
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
        }, 175);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (impactTimer) clearTimeout(impactTimer);
    };
  }, [coinId, startPoint, fallbackTarget, reducedMotion, isMobile]);

  const coinDiameter = isMobile ? 24 : 28;
  const outerRimId = `hd-coin-rim-${coinId}`;
  const bevelRingId = `hd-coin-bevel-${coinId}`;
  const faceGradId = `hd-coin-face-${coinId}`;
  const emblemGradId = `hd-coin-emblem-${coinId}`;

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
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
          >
            <defs>
              {/* Outer dark-gold metallic edge */}
              <linearGradient id={outerRimId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFE066" />
                <stop offset="45%" stopColor="#D89B13" />
                <stop offset="100%" stopColor="#7C4D05" />
              </linearGradient>

              {/* Secondary bright-gold bevel border */}
              <linearGradient id={bevelRingId} x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF6B8" />
                <stop offset="38%" stopColor="#FFD43B" />
                <stop offset="78%" stopColor="#D89B13" />
                <stop offset="100%" stopColor="#9E6207" />
              </linearGradient>

              {/* Main radial metallic gold face */}
              <radialGradient id={faceGradId} cx="34%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#FFF7BF" />
                <stop offset="34%" stopColor="#FFE055" />
                <stop offset="72%" stopColor="#E0A115" />
                <stop offset="100%" stopColor="#A96B08" />
              </radialGradient>

              {/* Center vertical emblem gradient */}
              <linearGradient id={emblemGradId} x1="27" y1="18" x2="37" y2="46" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF9CF" />
                <stop offset="48%" stopColor="#FFD43B" />
                <stop offset="100%" stopColor="#B87609" />
              </linearGradient>
            </defs>

            {/* Vector ambient halo (replaces blurry CSS drop-shadow filter for crisp 4K/Retina scaling) */}
            <circle cx="32" cy="32" r="30" fill="rgba(255, 212, 59, 0.16)" />

            {/* 1. Outer dark-gold circular rim */}
            <circle
              cx="32"
              cy="32"
              r="27"
              fill={`url(#${outerRimId})`}
              stroke="#5E3803"
              strokeWidth="1.8"
            />

            {/* 2. Secondary bright-gold bevel border */}
            <circle
              cx="32"
              cy="32"
              r="24.2"
              fill={`url(#${bevelRingId})`}
            />

            {/* 3. Subtle recessed inner shadow */}
            <circle
              cx="32"
              cy="32"
              r="20.4"
              fill="#8C5506"
            />

            {/* 4. Main metallic gold face */}
            <circle
              cx="32"
              cy="32"
              r="19.3"
              fill={`url(#${faceGradId})`}
              stroke="#FFF2A6"
              strokeWidth="0.9"
              strokeOpacity="0.7"
            />

            {/* 5. Fine engraved inner ring */}
            <circle
              cx="32"
              cy="32"
              r="16.2"
              stroke="#9C6007"
              strokeWidth="0.9"
              strokeDasharray="3.2 2"
              opacity="0.6"
            />

            {/* 6. Classic crisp vertical faceted gold emblem in center */}
            <rect
              x="28.6"
              y="19.6"
              width="8.2"
              height="26.2"
              rx="2.6"
              fill="#7A4904"
              opacity="0.65"
            />
            <rect
              x="27.8"
              y="18.6"
              width="8.2"
              height="26.2"
              rx="2.6"
              fill={`url(#${emblemGradId})`}
              stroke="#FFF8C9"
              strokeWidth="1"
            />
            <line
              x1="30.2"
              y1="21.2"
              x2="30.2"
              y2="42.2"
              stroke="#FFFFFF"
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* 7. Specular reflective streak & top-left highlight */}
            <path
              ref={sheenNodeRef}
              d="M 16.5 22.5 A 17.5 17.5 0 0 1 39.5 14.8"
              stroke="#FFFDF2"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.78"
            />
            <circle cx="19.5" cy="18.5" r="1.8" fill="#FFFFFF" opacity="0.88" />
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
          <span className="beggar-coin-impact__spark beggar-coin-impact__spark--mid" />
          <span className="beggar-coin-impact__spark beggar-coin-impact__spark--right" />
        </div>
      )}
    </div>
  );
}
