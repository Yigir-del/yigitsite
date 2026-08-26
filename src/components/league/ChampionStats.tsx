import type { ChampionStat } from '../../types/league';
import { champIcon, formatWinRate } from '../../utils/leagueAssets';

interface ChampionStatsProps {
  stats: ChampionStat[];
  version: string;
}

export default function ChampionStats({ stats, version }: ChampionStatsProps) {
  if (stats.length === 0) return null;

  const featured = stats.slice(0, 6);

  return (
    <section className="league-section" aria-label="Champion performance">
      <h2 className="league-section-title">Champion Performance</h2>
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
              <h3 className="league-champ-card__name">{c.championName.toUpperCase()}</h3>
            </div>
            <p className="league-champ-card__wr">{formatWinRate(c.winRate)} Win Rate</p>
            <div className="league-champ-card__metrics">
              <div className="league-champ-card__metric">
                <span className="league-stat-label">Games</span>
                <span className="league-champ-card__metric-value">{c.games}</span>
              </div>
              <div className="league-champ-card__metric">
                <span className="league-stat-label">KDA</span>
                <span className="league-champ-card__metric-value">{c.avgKda.toFixed(1)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
