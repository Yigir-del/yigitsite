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
    <div className={compact ? 'league-insights-compact' : ''}>
      {!compact && <h3 className="league-section-title">Match Insights</h3>}
      <div className="card-surface league-insights-compact__card">
        {insights.sage.map((line) => (
          <div key={`s-${line}`} className="league-insight-row">
            <div className="league-insight-avatar">
              <SageAvatar />
            </div>
            <div>
              <p className="league-insight-role">
                <span className="league-insight-role__name">Bilge</span>
                <span className="league-insight-role__tag">Analytical Review</span>
              </p>
              <blockquote className="league-insight-text">{line}</blockquote>
            </div>
          </div>
        ))}
        {insights.beggar.map((line) => (
          <div key={`b-${line}`} className="league-insight-row">
            <div className="league-insight-avatar">
              <BeggarAvatar />
            </div>
            <div>
              <p className="league-insight-role">
                <span className="league-insight-role__name">Dilenci</span>
                <span className="league-insight-role__tag">Unfiltered Opinion</span>
              </p>
              <blockquote className="league-insight-text">{line}</blockquote>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
