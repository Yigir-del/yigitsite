import { ExternalLink, RefreshCw } from 'lucide-react';
import type { PlayerSummary } from '../../types/league';
import {
  formatRelativeUpdate,
  formatWinRate,
  profileIcon,
  tierDisplay,
} from '../../utils/leagueAssets';
import BilgeVisitorHint from './BilgeVisitorHint';
import RankEmblem from './RankEmblem';

interface ProfileHeaderProps {
  data: PlayerSummary;
  fetchedAt: number;
}

export default function ProfileHeader({ data, fetchedAt }: ProfileHeaderProps) {
  const solo = data.soloRank;
  const form = data.recentForm;

  return (
    <div className="league-hero-wrap">
      <header className="league-hero card-surface glass" aria-label="Oyuncu profili">
        <div className="league-hero__col league-hero__col--identity">
          <img
            className="league-hero__icon"
            src={profileIcon(data.ddragonVersion, data.profileIconId)}
            alt=""
            loading="lazy"
          />
          <div className="league-hero__identity-text">
            <h1 className="league-hero__name">{data.gameName}</h1>
            <p className="league-hero__meta">
              {data.region} · Seviye {data.summonerLevel}
            </p>
            <p className="league-hero__updated">
              OP.GG · {formatRelativeUpdate(fetchedAt)}
            </p>
            <a
              className="league-hero__opgg"
              href={data.opggUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on OP.GG <ExternalLink size={13} aria-hidden />
            </a>
          </div>
        </div>

        <div className="league-hero__col league-hero__col--rank">
          {solo ? (
            <>
              <RankEmblem tier={solo.tier} size="hero" />
              <p className="league-stat-label">Current Rank</p>
              <p className="league-hero__tier">{tierDisplay(solo.tier, solo.rank)}</p>
              <p className="league-hero__lp">
                <span className="league-hero__lp-value">{solo.lp}</span>
                <span className="league-hero__lp-unit"> LP</span>
              </p>
            </>
          ) : (
            <>
              <p className="league-stat-label">Current Rank</p>
              <p className="league-hero__tier">Unranked</p>
            </>
          )}
        </div>

        {solo && (
          <div className="league-hero__col league-hero__col--stats">
            <div className="league-hero__stat-block">
              <p className="league-stat-label">Win Rate</p>
              <p className="league-hero__stat-value">{formatWinRate(solo.winRate)}</p>
            </div>
            <div className="league-hero__stat-block">
              <p className="league-stat-label">Ranked Record</p>
              <p className="league-hero__stat-value league-hero__stat-value--sm">
                {solo.wins}W — {solo.losses}L
              </p>
            </div>
            {form.streak >= 2 && form.streakType !== 'none' && (
              <div className="league-hero__stat-block">
                <p className="league-stat-label">Current Streak</p>
                <p className="league-hero__stat-value league-hero__stat-value--sm">
                  {form.streak}
                  {form.streakType === 'win' ? 'W' : 'L'}
                </p>
                {form.last5Form.length > 0 && (
                  <div className="league-form-dots league-form-dots--compact" aria-hidden>
                    {form.last5Form.map((r, i) => (
                      <span
                        key={i}
                        className={`league-form-dot league-form-dot--${r.toLowerCase()}`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {form.mostPlayedChampion && (
              <div className="league-hero__stat-block">
                <p className="league-stat-label">Most Played</p>
                <p className="league-hero__stat-value league-hero__stat-value--sm">
                  {form.mostPlayedChampion}
                </p>
              </div>
            )}
          </div>
        )}
      </header>

      {data.playerState && (
        <BilgeVisitorHint analysis={data.playerState} />
      )}
    </div>
  );
}

export function LeagueToolbar({
  stale,
  loading,
  onRefresh,
}: {
  stale: boolean;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="league-toolbar">
      <span className="league-toolbar__hint">League of Legends profili</span>
      {stale && <span className="league-stale-badge">Önbellek</span>}
      <button
        type="button"
        className="league-toolbar__refresh"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Verileri yenile"
      >
        <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden />
        Refresh
      </button>
    </div>
  );
}
