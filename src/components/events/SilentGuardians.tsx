/**
 * Bilge and Dilenci — standing at attention in respectful silence.
 * No motion, no speech, no interaction.
 */
export default function SilentGuardians() {
  return (
    <div className="silent-guardians" aria-hidden>
      <div className="silent-guardians__figure silent-guardians__figure--sage" title="Bilge">
        <div className="silent-guardians__face">
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="28" r="20" fill="#1a2228" stroke="#6b7280" strokeWidth="2" />
            <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="28" r="2.5" fill="#cbd5e1" />
            <circle cx="40" cy="28" r="2.5" fill="#cbd5e1" />
            {/* Neutral — no smile */}
            <path d="M26 37 H38" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
            <rect x="48" y="44" width="10" height="14" rx="1.5" fill="#a89880" stroke="#6b5e48" strokeWidth="1" />
            <line x1="50" y1="48" x2="56" y2="48" stroke="#6b5e48" strokeWidth="0.8" />
            <line x1="50" y1="51" x2="56" y2="51" stroke="#6b5e48" strokeWidth="0.8" />
          </svg>
        </div>
        <span className="silent-guardians__label">bilge</span>
      </div>

      <div className="silent-guardians__figure silent-guardians__figure--beggar" title="Dilenci">
        <div className="silent-guardians__face">
          <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="30" r="22" fill="#1f1a24" stroke="#6b7280" strokeWidth="2" />
            {/* Calm brows — not angry */}
            <path d="M18 24 L28 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M46 24 L36 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="30" r="3" fill="#e2e8f0" />
            <circle cx="40" cy="30" r="3" fill="#e2e8f0" />
            {/* Neutral mouth */}
            <path d="M26 42 H40" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 52 H42 L40 58 H24 Z" fill="#6b5e48" stroke="#a89880" strokeWidth="1" />
            <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#8a7a60" />
          </svg>
        </div>
        <span className="silent-guardians__label">dilenci</span>
      </div>
    </div>
  );
}
