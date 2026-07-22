/**
 * Bilge & Dilenci — side by side, equal before Atatürk.
 * No king. Only respect.
 */
export default function SilentGuardians() {
  return (
    <div className="silent-guardians" aria-hidden>
      <div className="silent-guardians__figure silent-guardians__figure--sage" title="Bilge">
        <div className="silent-guardians__face">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="28" r="20" fill="#1e2a32" stroke="var(--accent-pale-gray)" strokeWidth="2" />
            <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="28" r="2.5" fill="#e2e8f0" />
            <circle cx="40" cy="28" r="2.5" fill="#e2e8f0" />
            <path d="M26 37 H38" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
            <rect x="48" y="44" width="10" height="14" rx="1.5" fill="#c4b8a0" stroke="#8a7a60" strokeWidth="1" />
            <line x1="50" y1="48" x2="56" y2="48" stroke="#8a7a60" strokeWidth="0.8" />
            <line x1="50" y1="51" x2="56" y2="51" stroke="#8a7a60" strokeWidth="0.8" />
          </svg>
        </div>
        <span className="silent-guardians__label">bilge</span>
      </div>

      <div className="silent-guardians__figure silent-guardians__figure--beggar" title="Dilenci">
        <div className="silent-guardians__face">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
            <path d="M18 24 L28 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <path d="M46 24 L36 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="30" r="3" fill="#f8fafc" />
            <circle cx="40" cy="30" r="3" fill="#f8fafc" />
            <path d="M26 42 H40" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 52 H42 L40 58 H24 Z" fill="#8a7a60" stroke="#c4b8a0" strokeWidth="1" />
            <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#a89870" />
          </svg>
        </div>
        <span className="silent-guardians__label">dilenci</span>
      </div>
    </div>
  );
}
