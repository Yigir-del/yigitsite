interface BeggarActorSvgProps {
  size?: number;
  circleSize?: number;
  showLabel?: boolean;
  lookingLeft?: boolean;
}

/**
 * Shared visual primitive for the Angry Beggar (§7.3).
 * Preserves the exact SVG artwork and proportions across desktop flight,
 * mobile badge, and the OYUK cinematic director.
 */
export default function BeggarActorSvg({
  size = 34,
  circleSize = 54,
  showLabel = true,
  lookingLeft = false,
}: BeggarActorSvgProps) {
  const eyeOffset = lookingLeft ? -2.2 : 0;

  return (
    <>
      <div
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px var(--glow)',
          userSelect: 'none',
          position: 'relative',
          zIndex: 0,
        }}
        aria-hidden
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="32"
            cy="30"
            r="22"
            fill="#2a2030"
            stroke="var(--accent-pale-gray)"
            strokeWidth="2"
          />
          <path d="M18 22 L28 26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 22 L36 26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={24 + eyeOffset} cy="30" r="3" fill="#f8fafc" />
          <circle cx={40 + eyeOffset} cy="30" r="3" fill="#f8fafc" />
          <path
            d="M24 42 Q32 36 40 42"
            stroke="#f8fafc"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M22 52 H42 L40 58 H24 Z" fill="#8a7a60" stroke="#c4b8a0" strokeWidth="1" />
          <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#a89870" />
        </svg>
      </div>

      {showLabel && (
        <span
          style={{
            fontSize: '0.55rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        >
          dilenci
        </span>
      )}
    </>
  );
}
