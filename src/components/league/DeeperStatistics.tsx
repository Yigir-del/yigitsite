import type { ChampionStat, LeagueMatch, PlayerSummary } from '../../types/league';
import { formatWinRate } from '../../utils/leagueAssets';
import LeagueCharts from './LeagueCharts';
import RankProgression from './RankProgression';

interface DeeperStatisticsProps {
  matches: LeagueMatch[];
  championStats: ChampionStat[];
  progression: PlayerSummary['rankProgression'];
  soloRank: PlayerSummary['soloRank'];
  form: PlayerSummary['recentForm'];
}

export default function DeeperStatistics({
  matches,
  championStats,
  progression,
  soloRank,
  form,
}: DeeperStatisticsProps) {
  const totalRanked = soloRank ? soloRank.wins + soloRank.losses : 0;

  return (
    <section className="league-section league-section--deep" aria-label="Detailed statistics">
      <h2 className="league-section-title">Performance Trends</h2>
      <p className="league-section-desc">
        Detaylı grafikler ve sezon özeti — ana odak noktası değil, derinlemesine bakış.
      </p>

      {soloRank && totalRanked > 0 && (
        <div className="league-season-overview card-surface">
          <h3 className="league-season-overview__title">Season Overview</h3>
          <div className="league-season-overview__grid">
            <div className="league-season-overview__item">
              <p className="league-stat-label">Total Ranked Games</p>
              <p className="league-season-overview__value">{totalRanked}</p>
            </div>
            <div className="league-season-overview__item">
              <p className="league-stat-label">Win Rate</p>
              <p className="league-season-overview__value">{formatWinRate(soloRank.winRate)}</p>
            </div>
            {form.sampleSize > 0 && (
              <div className="league-season-overview__item">
                <p className="league-stat-label">Avg KDA</p>
                <p className="league-season-overview__value">{form.avgKda.toFixed(1)}</p>
                <p className="league-stat-sublabel">Last {form.sampleSize} games</p>
              </div>
            )}
            {form.sampleSize > 0 && (
              <div className="league-season-overview__item">
                <p className="league-stat-label">Avg CS</p>
                <p className="league-season-overview__value">{form.avgCs}</p>
                <p className="league-stat-sublabel">Last {form.sampleSize} games</p>
              </div>
            )}
          </div>
        </div>
      )}

      <LeagueCharts matches={matches} championStats={championStats} embedded />
      <RankProgression progression={progression} embedded />
    </section>
  );
}
