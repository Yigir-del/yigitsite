import { useEffect, useState } from 'react';

type Speaker = 'sage' | 'beggar';

/** Respect for Atatürk first; bite reserved for the world / each other */
const SAGE_LINES = [
  'Yıldızlar bile saygı duruşunda.',
  'Bu portrede dünya susturulmuş.',
  'Atatürk’ün önünde öğüdüm bile kısa keser.',
  'Tarih buraya eğilir; boş laf dışarıda kalsın.',
  'Hitabe okunurken çeneni kapa — önce dinle.',
  'Millet yaptı, biz laf ediyoruz; o işi bitirdi.',
  'Gökteki ışıklar eğildi. Sen hâlâ dik bakıyorsan, dünyaya bak.',
  'Bilgelik burada susmayı da bilir.',
  'Dilenci, bugün dilenme; saygı dur.',
  'O bir lider. Geri kalanınız… kalabalık.',
  'Çelenk bırakmak söz değil, duruştur.',
  'Bu adam millete yol açtı; dünya hâlâ yol arıyor.',
] as const;

const BEGGAR_LINES = [
  'Gözün lider görsün kral — gerisi gürültü.',
  'Kral, burada cebini değil gönlünü aç.',
  'Bu adama kuruş değil; duruş borçluyuz.',
  'Dünya bağış istemiş; o millete vermiş.',
  'Açım ama bu portrede tok oluyorum.',
  'Bilge sus, Atatürk konuşuyor.',
  'Yalvarırım herkese; ona saygı duyarım.',
  'Çelenk bırak kral — dilencilik değil, borç.',
  'Lider burada. Sen hâlâ “kral” mısın?',
  'Teneke kutum sessiz; burası pazar değil.',
  'Dünya zengin, gönlü fakir. O tersini yaptı.',
  'Bu sefer bilgeye katılıyorum — nadirdir.',
] as const;

function pickLine(lines: readonly string[], avoid?: string) {
  if (lines.length === 1) return lines[0];
  let next = lines[Math.floor(Math.random() * lines.length)];
  let guard = 0;
  while (next === avoid && guard < 6) {
    next = lines[Math.floor(Math.random() * lines.length)];
    guard += 1;
  }
  return next;
}

function SageFace() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  );
}

function BeggarFace() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
      <path d="M18 24 L28 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 24 L36 24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="30" r="3" fill="#f8fafc" />
      <circle cx="40" cy="30" r="3" fill="#f8fafc" />
      <path d="M26 42 H40" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 52 H42 L40 58 H24 Z" fill="#8a7a60" stroke="#c4b8a0" strokeWidth="1" />
      <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#a89870" />
    </svg>
  );
}

/**
 * Bilge & Dilenci before Atatürk.
 * Speech sits in-flow under the pair so overflow-x never clips it.
 */
export default function SilentGuardians() {
  const [speaker, setSpeaker] = useState<Speaker>('sage');
  const [line, setLine] = useState<string>(SAGE_LINES[0]);
  const [live, setLive] = useState(true);

  useEffect(() => {
    let pauseTimer: number | undefined;
    let nextSpeaker: Speaker = 'beggar';

    const speak = () => {
      const who = nextSpeaker;
      const pool = who === 'sage' ? SAGE_LINES : BEGGAR_LINES;
      setSpeaker(who);
      setLine((prev) => pickLine(pool, prev));
      setLive(true);
      nextSpeaker = who === 'sage' ? 'beggar' : 'sage';

      window.clearTimeout(pauseTimer);
      pauseTimer = window.setTimeout(() => setLive(false), 4800);
    };

    const startDelay = window.setTimeout(speak, 2600);
    const interval = window.setInterval(speak, 6200);

    return () => {
      window.clearTimeout(startDelay);
      window.clearTimeout(pauseTimer);
      window.clearInterval(interval);
    };
  }, []);

  const onSageClick = () => {
    setSpeaker('sage');
    setLine((prev) => pickLine(SAGE_LINES, prev));
    setLive(true);
  };

  const onBeggarClick = () => {
    setSpeaker('beggar');
    setLine((prev) => pickLine(BEGGAR_LINES, prev));
    setLive(true);
  };

  return (
    <div className="silent-guardians">
      <div className="silent-guardians__row">
        <button
          type="button"
          className={`silent-guardians__figure silent-guardians__figure--sage${speaker === 'sage' && live ? ' is-speaking' : ''}`}
          title="Bilge"
          aria-label="Bilge konuşsun"
          onClick={onSageClick}
        >
          <div className="silent-guardians__face" aria-hidden>
            <SageFace />
          </div>
          <span className="silent-guardians__label">bilge</span>
        </button>

        <button
          type="button"
          className={`silent-guardians__figure silent-guardians__figure--beggar${speaker === 'beggar' && live ? ' is-speaking' : ''}`}
          title="Dilenci"
          aria-label="Dilenci konuşsun"
          onClick={onBeggarClick}
        >
          <div className="silent-guardians__face" aria-hidden>
            <BeggarFace />
          </div>
          <span className="silent-guardians__label">dilenci</span>
        </button>
      </div>

      <p className={`silent-guardians__speech${live ? ' is-live' : ' is-idle'}`} aria-live="polite">
        <span className="silent-guardians__speech-text">“{line}”</span>
        <span className="silent-guardians__speech-by">
          — {speaker === 'sage' ? 'bilge' : 'dilenci'}
        </span>
      </p>
    </div>
  );
}
