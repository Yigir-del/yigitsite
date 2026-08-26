import type { PlayerStateAnalysis } from '../../types/league';
import { pickBilgeVisitorLine } from '../../utils/bilgeVisitorLines';
import { SageAvatar } from './CharacterAvatars';

interface BilgeVisitorHintProps {
  analysis: PlayerStateAnalysis;
}

/** Sağ üst köşede küçük Bilge — ziyaretçilere troll uyarı. */
export default function BilgeVisitorHint({ analysis }: BilgeVisitorHintProps) {
  const line = pickBilgeVisitorLine(analysis.state);

  return (
    <div className="league-bilge-hint" aria-label="Bilge uyarısı">
      <p className="league-bilge-hint__bubble">{line}</p>
      <div className="league-bilge-hint__avatar">
        <SageAvatar />
      </div>
    </div>
  );
}
