import type { AchievementIconKind } from './definitions';

interface TrophySvgProps {
  size?: number;
  className?: string;
}

/**
 * Muted silver/slate trophy outline shown before all 26 required achievements are unlocked (§14.2).
 */
export function LockedTrophySvg({ size = 22, className }: TrophySvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="locked-trophy-metal" x1="16" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#64748b" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Left & Right handles */}
      <path
        d="M19 16 H13 C10.5 16 9 18 9 21 C9 27 13.5 31 19.5 31.5"
        stroke="url(#locked-trophy-metal)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M45 16 H51 C53.5 16 55 18 55 21 C55 27 50.5 31 44.5 31.5"
        stroke="url(#locked-trophy-metal)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Chalice cup */}
      <path
        d="M19 12 H45 V24 C45 32.5 39.2 38.5 32 38.5 C24.8 38.5 19 32.5 19 24 V12 Z"
        fill="rgba(30, 41, 59, 0.55)"
        stroke="url(#locked-trophy-metal)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Rim */}
      <rect
        x="17.5"
        y="10.5"
        width="29"
        height="3.2"
        rx="1.6"
        fill="#94a3b8"
        fillOpacity="0.55"
      />

      {/* Stem */}
      <path
        d="M29 38.5 H35 L36.5 47.5 H27.5 L29 38.5 Z"
        fill="rgba(51, 65, 85, 0.7)"
        stroke="url(#locked-trophy-metal)"
        strokeWidth="2.2"
      />

      {/* Pedestal base */}
      <rect
        x="21"
        y="47.5"
        width="22"
        height="5.5"
        rx="2"
        fill="rgba(30, 41, 59, 0.85)"
        stroke="url(#locked-trophy-metal)"
        strokeWidth="2.4"
      />
      <line
        x1="18"
        y1="54"
        x2="46"
        y2="54"
        stroke="#64748b"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * High-Definition Metallic Golden Trophy SVG ("Hiçliğin Kralı", §15.3).
 * Uses rich gold gradients, rim specular highlight, engraved emblem, and dark pedestal base.
 */
export function GoldenTrophySvg({ size = 28, className }: TrophySvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="gold-trophy-aura" cx="50%" cy="44%" r="50%">
          <stop offset="0%" stopColor="#FFD43B" stopOpacity="0.34" />
          <stop offset="68%" stopColor="#D89B13" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#A96B08" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="gold-trophy-body" x1="16" y1="10" x2="48" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7BF" />
          <stop offset="28%" stopColor="#FFD43B" />
          <stop offset="68%" stopColor="#D89B13" />
          <stop offset="100%" stopColor="#9E6206" />
        </linearGradient>

        <linearGradient id="gold-trophy-rim" x1="16" y1="9" x2="48" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF9D2" />
          <stop offset="52%" stopColor="#FFD43B" />
          <stop offset="100%" stopColor="#B87A0B" />
        </linearGradient>

        <linearGradient id="gold-trophy-pedestal" x1="20" y1="46" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B2D1D" />
          <stop offset="50%" stopColor="#231A10" />
          <stop offset="100%" stopColor="#140E08" />
        </linearGradient>
      </defs>

      {/* Subtle ambient golden halo inside SVG bounds */}
      <circle cx="32" cy="30" r="29" fill="url(#gold-trophy-aura)" />

      {/* Ornate left & right handles */}
      <path
        d="M19 15 H12.5 C9.5 15 7.8 17.4 8.2 20.8 C8.8 27.2 14 31.8 20.5 32.4"
        stroke="url(#gold-trophy-body)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M45 15 H51.5 C54.5 15 56.2 17.4 55.8 20.8 C55.2 27.2 50 31.8 43.5 32.4"
        stroke="url(#gold-trophy-body)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Main golden chalice */}
      <path
        d="M18.5 11.5 H45.5 V23.5 C45.5 32.8 39.5 39 32 39 C24.5 39 18.5 32.8 18.5 23.5 V11.5 Z"
        fill="url(#gold-trophy-body)"
        stroke="#7A4903"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Left-side specular reflection inside chalice */}
      <path
        d="M22.2 14.5 V23 C22.2 28.6 25 33.2 29 35.2"
        stroke="#FFFDF0"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity="0.82"
      />

      {/* Top lip / rim */}
      <rect
        x="16.8"
        y="9.5"
        width="30.4"
        height="3.8"
        rx="1.9"
        fill="url(#gold-trophy-rim)"
        stroke="#7A4903"
        strokeWidth="1.1"
      />

      {/* Center engraved royal star / void emblem */}
      <path
        d="M32 17.5 L34.1 22.4 L39.2 24.5 L34.1 26.6 L32 31.5 L29.9 26.6 L24.8 24.5 L29.9 22.4 Z"
        fill="#FFF7BF"
        stroke="#8C5404"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Stem collar & column */}
      <ellipse cx="32" cy="39.5" rx="4.8" ry="1.6" fill="#FFF2A6" stroke="#7A4903" strokeWidth="1" />
      <path
        d="M29 40.5 H35 L36.8 47.5 H27.2 L29 40.5 Z"
        fill="url(#gold-trophy-body)"
        stroke="#7A4903"
        strokeWidth="1.4"
      />

      {/* Dark obsidian/bronze pedestal base with gold plaque */}
      <rect
        x="19.5"
        y="47.5"
        width="25"
        height="7"
        rx="2.2"
        fill="url(#gold-trophy-pedestal)"
        stroke="#D89B13"
        strokeWidth="1.5"
      />
      <rect
        x="25.5"
        y="49.7"
        width="13"
        height="2.6"
        rx="1"
        fill="url(#gold-trophy-rim)"
      />
      <line
        x1="16.5"
        y1="55.5"
        x2="47.5"
        y2="55.5"
        stroke="#FFD43B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface AchievementIconProps {
  kind: AchievementIconKind;
  unlocked: boolean;
  size?: number;
}

/**
 * Renders the icon for an individual achievement card or toast.
 * Locked slots strictly show a mysterious question mark silhouette ("???") without leaking the icon (§16.2).
 */
export function AchievementCategoryIcon({
  kind,
  unlocked,
  size = 22,
}: AchievementIconProps) {
  if (!unlocked) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2.5 2.5"
          opacity="0.45"
        />
        <path
          d="M9.6 9.4C9.6 8.1 10.65 7.2 12.05 7.2C13.4 7.2 14.4 8.05 14.4 9.3C14.4 10.25 13.85 10.85 12.95 11.35C12.25 11.75 11.95 12.2 11.95 13.05V13.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.65"
        />
        <circle cx="12" cy="16.4" r="1" fill="currentColor" opacity="0.65" />
      </svg>
    );
  }

  switch (kind) {
    case 'crown':
      return <GoldenTrophySvg size={size} />;
    case 'coin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="rgba(255, 212, 59, 0.16)" stroke="#FFD43B" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="6.2" stroke="#FFF2A6" strokeWidth="1" strokeDasharray="2 1.5" />
          <rect x="10.8" y="7.5" width="2.4" height="9" rx="1.2" fill="#FFD43B" />
        </svg>
      );
    case 'cave':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 20 V11.5 C4 6.8 7.5 3.5 12 3.5 C16.5 3.5 20 6.8 20 11.5 V20"
            stroke="#e2c07d"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M8 20 V13 C8 10.2 9.8 8.2 12 8.2 C14.2 8.2 16 10.2 16 13 V20"
            fill="rgba(226, 192, 125, 0.14)"
            stroke="#f6e3ba"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'torch':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 C14.5 6.4 15.6 8.5 15.6 10.4 C15.6 12.5 14 14 12 14 C10 14 8.4 12.5 8.4 10.4 C8.4 8.5 9.5 6.4 12 3.5 Z"
            fill="rgba(255, 212, 59, 0.22)"
            stroke="#FFD43B"
            strokeWidth="1.6"
          />
          <path d="M10.5 14 H13.5 L12.8 20.5 H11.2 L10.5 14 Z" stroke="#e2c07d" strokeWidth="1.5" />
        </svg>
      );
    case 'quill':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M19.5 4.5 C14.5 4.8 10.2 8.2 8 13.5 L6 18.5 L11 16.5 C16.2 14.3 19.2 9.8 19.5 4.5 Z"
            fill="rgba(226, 232, 240, 0.12)"
            stroke="#f1f5f9"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M5 19.5 L13.5 11" stroke="#FFD43B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'music':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 17.5 V6.5 L19 4.5 V15.5" stroke="#e2e8f0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6.8" cy="17.5" r="2.4" fill="rgba(255, 212, 59, 0.2)" stroke="#FFD43B" strokeWidth="1.6" />
          <circle cx="16.8" cy="15.5" r="2.4" fill="rgba(255, 212, 59, 0.2)" stroke="#FFD43B" strokeWidth="1.6" />
        </svg>
      );
    case 'cosmos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" fill="#FFD43B" />
          <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(-24 12 12)" stroke="#e2e8f0" strokeWidth="1.4" />
          <ellipse cx="12" cy="12" rx="9.5" ry="4.2" transform="rotate(36 12 12)" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
      );
    case 'terminal':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="#cbd5e1" strokeWidth="1.6" />
          <path d="M7.5 9.5 L10.5 12 L7.5 14.5" stroke="#FFD43B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12.2" y1="14.5" x2="16.2" y2="14.5" stroke="#e2e8f0" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'door':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6.5 20 V5.5 C6.5 4.7 7.2 4 8 4 H16 C16.8 4 17.5 4.7 17.5 5.5 V20" stroke="#e2e8f0" strokeWidth="1.6" />
          <line x1="4" y1="20" x2="20" y2="20" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="14.5" cy="12" r="1.1" fill="#FFD43B" />
        </svg>
      );
    case 'wreath':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8.5 18.5 C5.5 16.5 4.5 12.5 5.8 8.8 C6.8 6.2 8.8 4.8 10.5 4.2"
            stroke="#e2c07d"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M15.5 18.5 C18.5 16.5 19.5 12.5 18.2 8.8 C17.2 6.2 15.2 4.8 13.5 4.2"
            stroke="#e2c07d"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path d="M9.5 18.5 L12 16.8 L14.5 18.5" stroke="#FFD43B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'compass':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="#cbd5e1" strokeWidth="1.6" />
          <polygon points="12,6.5 14.2,12 12,17.5 9.8,12" fill="rgba(255, 212, 59, 0.25)" stroke="#FFD43B" strokeWidth="1.3" />
        </svg>
      );
    case 'spark':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 L14.1 9.9 L20.5 12 L14.1 14.1 L12 20.5 L9.9 14.1 L3.5 12 L9.9 9.9 Z"
            fill="rgba(255, 212, 59, 0.22)"
            stroke="#FFD43B"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
