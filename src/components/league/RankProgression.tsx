import type { PlayerSummary } from '../../types/league';
import { rankEmblem, tierDisplay } from '../../utils/leagueAssets';

interface RankProgressionProps {
  progression: PlayerSummary['rankProgression'];
  embedded?: boolean;
}

export default function RankProgression({ progression, embedded }: RankProgressionProps) {
  const { tiers, currentTierIndex, currentTier } = progression;

  if (currentTier === 'UNRANKED' || currentTierIndex < 0) {
    return null;
  }

  const visibleTiers = tiers.filter((_, i) => i <= Math.max(currentTierIndex, 2));

  return (
    <div className={`league-rank-ladder-wrap${embedded ? ' league-rank-ladder-wrap--embedded' : ''}`}>
      {!embedded && (
        <h3 className="league-section-title">Rank Tiers</h3>
      )}
      <p className="league-section-desc league-section-desc--tight">
        Mevcut tier: {tierDisplay(currentTier, '')} — LP geçmişi olmadığı için sahte progression grafiği gösterilmiyor.
      </p>
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
    </div>
  );
}
