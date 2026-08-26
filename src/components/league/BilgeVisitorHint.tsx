import { useEffect, useRef, useState } from 'react';
import type { PlayerStateAnalysis } from '../../types/league';
import { pickRandomBilgeVisitorLine } from '../../utils/bilgeVisitorLines';
import { SageAvatar } from './CharacterAvatars';

const BUBBLE_HOLD_MS = 4500;

interface BilgeVisitorHintProps {
  analysis: PlayerStateAnalysis;
}

/** Sağ üst köşede küçük Bilge — tıkla, troll uyarı aç/kapa. */
export default function BilgeVisitorHint({ analysis }: BilgeVisitorHintProps) {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState('');
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  const handleClick = () => {
    if (hideRef.current) clearTimeout(hideRef.current);

    if (open) {
      setOpen(false);
      return;
    }

    setLine(pickRandomBilgeVisitorLine(analysis.state));
    setOpen(true);
    hideRef.current = setTimeout(() => setOpen(false), BUBBLE_HOLD_MS);
  };

  return (
    <div
      className={`league-bilge-hint${open ? ' league-bilge-hint--open' : ''}`}
      aria-label="Bilge uyarısı"
    >
      <p
        className="league-bilge-hint__bubble"
        role="status"
        aria-live="polite"
        hidden={!open}
      >
        {line}
      </p>
      <button
        type="button"
        className="league-bilge-hint__avatar"
        onClick={handleClick}
        aria-label="Bilge'ye tıkla"
        aria-expanded={open}
      >
        <SageAvatar />
      </button>
    </div>
  );
}
