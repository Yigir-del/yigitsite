import type { PlayerSummary } from '../../types/league';
import { rankEmblem } from '../../utils/leagueAssets';

interface RankProgressionProps {
  progression: PlayerSummary['rankProgression'];
}

export default function RankProgression({ progression }: RankProgressionProps) {
  const { tiers, currentTierIndex, currentTier } = progression;

  if (currentTier === 'UNRANKED' || currentTierIndex < 0) {
    return null;
  }

  const visibleTiers = tiers.filter((_, i) => i <= Math.max(currentTierIndex, 2));

  return (
    <section aria-label="Rank progression">
      <h3 className="league-section-title">Rank Progression</h3>
      <div className="league-rank-ladder card-surface">
        {visibleTiers.map((tier, i) => (
          <span key={tier} style={{ display: 'contents' }}>
            {i > 0 && <span className="league-rank-ladder__arrow" aria-hidden>→</span>}
            <div
              className={`league-rank-ladder__step${
                i < currentTierIndex ? ' is-reached' : ''
              }${i === currentTierIndex ? ' is-current' : ''}`}
            >
              <img src={rankEmblem(tier)} alt="" loading="lazy" />
              <span className="league-rank-ladder__label">{tier}</span>
            </div>
          </span>
        ))}
      </div>
    </section>
  );
}
