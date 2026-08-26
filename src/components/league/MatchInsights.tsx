import type { MatchInsight } from '../../types/league';
import { BeggarAvatar, SageAvatar } from './CharacterAvatars';

interface MatchInsightsProps {
  insights: MatchInsight;
  compact?: boolean;
}

export default function MatchInsights({ insights, compact }: MatchInsightsProps) {
  const hasSage = insights.sage.length > 0;
  const hasBeggar = insights.beggar.length > 0;

  if (!hasSage && !hasBeggar) return null;

  return (
    <div style={{ marginTop: compact ? '1rem' : '2rem' }}>
      {!compact && <h3 className="league-section-title">Maç Analizi</h3>}
      <div className="card-surface" style={{ padding: '0.75rem 1rem', borderRadius: 12 }}>
        {insights.sage.map((line) => (
          <div key={`s-${line}`} className="league-insight-row">
            <div className="league-insight-avatar">
              <SageAvatar />
            </div>
            <div>
              <p className="league-insight-label">bilge</p>
              <p className="league-insight-text">{line}</p>
            </div>
          </div>
        ))}
        {insights.beggar.map((line) => (
          <div key={`b-${line}`} className="league-insight-row">
            <div className="league-insight-avatar">
              <BeggarAvatar />
            </div>
            <div>
              <p className="league-insight-label">dilenci</p>
              <p className="league-insight-text">{line}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
