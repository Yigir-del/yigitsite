import type { ChampionStat } from '../../types/league';
import { champIcon, formatDate, formatWinRate } from '../../utils/leagueAssets';

interface ChampionStatsProps {
  stats: ChampionStat[];
  version: string;
}

export default function ChampionStats({ stats, version }: ChampionStatsProps) {
  if (stats.length === 0) return null;

  const featured = stats.slice(0, 6);

  return (
    <section aria-label="Champion statistics">
      <h3 className="league-section-title">Current Champions</h3>
      <div className="league-champ-grid">
        {featured.map((c) => (
          <article key={c.championName} className="league-champ-card card-surface">
            <div className="league-champ-card__head">
              <img
                className="league-champ-card__icon"
                src={champIcon(version, c.championName)}
                alt=""
                loading="lazy"
              />
              <span className="league-champ-card__name">{c.championName}</span>
            </div>
            <div className="league-champ-card__stat">
              <span>Games</span>
              <span>{c.games}</span>
            </div>
            <div className="league-champ-card__stat">
              <span>Win Rate</span>
              <span>{formatWinRate(c.winRate)}</span>
            </div>
            <div className="league-champ-card__stat">
              <span>KDA</span>
              <span>{c.avgKda.toFixed(2)}</span>
            </div>
            {c.csPerMin > 0 && (
              <div className="league-champ-card__stat">
                <span>CS/min</span>
                <span>{c.csPerMin.toFixed(1)}</span>
              </div>
            )}
            <div className="league-champ-card__stat">
              <span>Son oyun</span>
              <span>{formatDate(c.lastPlayed)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
