import type { ChampionStat, LeagueMatch } from '../../types/league';

interface LeagueChartsProps {
  matches: LeagueMatch[];
  championStats: ChampionStat[];
  embedded?: boolean;
}

export default function LeagueCharts({ matches, championStats, embedded }: LeagueChartsProps) {
  const recent = [...matches].reverse().slice(-15);
  const topChamps = championStats.slice(0, 5);
  const kdaTrend = [...matches].reverse().slice(-10);

  if (recent.length === 0) return null;

  const maxKda = Math.max(...kdaTrend.map((m) => (m.kills + m.assists) / Math.max(m.deaths, 1)), 1);

  return (
    <div className={`league-charts-wrap${embedded ? ' league-charts-wrap--embedded' : ''}`}>
      {!embedded && (
        <h3 className="league-section-title">Performance Trends</h3>
      )}
      <div className="league-charts">
        <div className="league-chart-card card-surface">
          <h4>Recent Game Results</h4>
          <p className="league-stat-sublabel">Win / Loss sequence</p>
          <div className="league-bar-chart" role="img" aria-label="Son maçlar W/L">
            {recent.map((m) => (
              <div
                key={m.matchId}
                className={`league-bar league-bar--${m.win ? 'w' : 'l'}`}
                style={{ height: '100%' }}
                title={m.win ? 'Win' : 'Loss'}
              />
            ))}
          </div>
        </div>

        {topChamps.length > 0 && (
          <div className="league-chart-card card-surface">
            <h4>Champion Win Rate</h4>
            <p className="league-stat-sublabel">Top played champions</p>
            <div className="league-bar-chart">
              {topChamps.map((c) => (
                <div
                  key={c.championName}
                  className="league-bar league-bar--w"
                  style={{ height: `${Math.max(c.winRate * 100, 8)}%`, opacity: 0.85 }}
                  title={`${c.championName} ${Math.round(c.winRate * 100)}%`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="league-chart-card card-surface">
          <h4>KDA Trend</h4>
          <p className="league-stat-sublabel">Last 10 games</p>
          <div className="league-bar-chart">
            {kdaTrend.map((m) => {
              const kda = (m.kills + m.assists) / Math.max(m.deaths, 1);
              return (
                <div
                  key={m.matchId}
                  className="league-bar"
                  style={{
                    height: `${(kda / maxKda) * 100}%`,
                    background: 'var(--accent-muted-blue)',
                  }}
                  title={`${m.championName} KDA ${kda.toFixed(1)}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
