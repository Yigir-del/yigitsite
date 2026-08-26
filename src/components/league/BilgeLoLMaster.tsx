import type { PlayerStateKind } from '../../types/league';

interface BilgeLoLMasterProps {
  state: PlayerStateKind;
}

/** Bilge as experienced mid-lane LoL sage — desk scene, site aesthetic. */
export function BilgeLoLMaster({ state }: BilgeLoLMasterProps) {
  const glow =
    state === 'ON_FIRE'
      ? '#fbbf24'
      : state === 'AGGRESSIVE'
        ? '#f87171'
        : state === 'TILTED' || state === 'STRUGGLING'
          ? '#94a3b8'
          : '#7dd3fc';

  return (
    <svg
      className="league-bilge__illustration"
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="bilge-desk-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.18" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bilge-robes" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3a48" />
          <stop offset="100%" stopColor="#1a242e" />
        </linearGradient>
      </defs>

      {/* ambient glow */}
      <ellipse cx="100" cy="72" rx="78" ry="58" fill="url(#bilge-desk-glow)" />

      {/* desk surface */}
      <rect x="24" y="108" width="152" height="10" rx="2" fill="#1c1612" stroke="#3d3428" strokeWidth="1" />
      <rect x="28" y="118" width="144" height="28" rx="3" fill="#141010" stroke="#2a2218" strokeWidth="1" />

      {/* mini Summoner's Rift map */}
      <rect x="118" y="96" width="44" height="28" rx="2" fill="#1a2838" stroke="#4a6a8a" strokeWidth="0.8" />
      <path
        d="M124 110 Q140 102 156 110 Q140 118 124 110"
        stroke="#5a8ab0"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <circle cx="140" cy="110" r="3" fill="#7dd3fc" opacity="0.5" />
      <line x1="132" y1="104" x2="148" y2="116" stroke="#3d5a70" strokeWidth="0.6" opacity="0.6" />

      {/* rune scroll */}
      <rect x="34" y="92" width="22" height="30" rx="2" fill="#c4b8a0" stroke="#8a7a60" strokeWidth="0.8" />
      <path d="M38 98 H52" stroke="#6a5a48" strokeWidth="0.6" />
      <path d="M38 102 H50" stroke="#6a5a48" strokeWidth="0.6" />
      <path d="M38 106 H51" stroke="#6a5a48" strokeWidth="0.6" />
      <circle cx="45" cy="114" r="4" fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity="0.8" />

      {/* strategy notes */}
      <rect x="62" y="100" width="28" height="20" rx="1" fill="#e8e0d0" stroke="#a89878" strokeWidth="0.6" transform="rotate(-4 76 110)" />
      <path d="M66 106 H84" stroke="#8a8070" strokeWidth="0.5" transform="rotate(-4 76 110)" />
      <path d="M66 110 H82" stroke="#8a8070" strokeWidth="0.5" transform="rotate(-4 76 110)" />

      {/* replay crystal / match review orb */}
      <circle cx="168" cy="102" r="7" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="0.8" className="league-bilge__orb" />
      <circle cx="168" cy="102" r="3" fill="#93c5fd" opacity="0.6" className="league-bilge__orb-core" />

      {/* Bilge body — sage silhouette, mid-lane master */}
      <ellipse cx="100" cy="128" rx="38" ry="8" fill="#0a0a0c" opacity="0.5" />

      {/* robes */}
      <path
        d="M72 78 Q100 68 128 78 L132 118 Q100 128 68 118 Z"
        fill="url(#bilge-robes)"
        stroke="#4a5a68"
        strokeWidth="1"
      />

      {/* head */}
      <circle cx="100" cy="58" r="22" fill="#1e2a32" stroke="#64748b" strokeWidth="1.5" />

      {/* hood / hair wisps */}
      <path d="M78 48 Q100 32 122 48" stroke="#94a3b8" strokeWidth="2" fill="none" />
      <path d="M82 42 Q100 28 118 42" stroke="#64748b" strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* eyes — subtle glow */}
      <circle cx="91" cy="58" r="3" fill="#f8fafc" className="league-bilge__eye" />
      <circle cx="109" cy="58" r="3" fill="#f8fafc" className="league-bilge__eye" />
      <circle cx="91" cy="58" r="1.2" fill={glow} opacity="0.8" />
      <circle cx="109" cy="58" r="1.2" fill={glow} opacity="0.8" />

      {/* calm knowing expression */}
      <path d="M92 68 Q100 72 108 68" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* beard */}
      <path d="M88 72 Q100 88 112 72" stroke="#94a3b8" strokeWidth="2.5" fill="none" opacity="0.7" />

      {/* hand on scroll / reviewing */}
      <ellipse cx="56" cy="108" rx="8" ry="5" fill="#2a3540" stroke="#64748b" strokeWidth="0.8" transform="rotate(-15 56 108)" />
    </svg>
  );
}
