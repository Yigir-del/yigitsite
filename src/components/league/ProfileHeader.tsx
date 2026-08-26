import { ExternalLink, RefreshCw } from 'lucide-react';
import type { PlayerSummary } from '../../types/league';
import {
  formatMastery,
  formatWinRate,
  profileIcon,
  rankEmblem,
  tierLabel,
  formatRelativeUpdate,
} from '../../utils/leagueAssets';

interface ProfileHeaderProps {
  data: PlayerSummary;
}

export default function ProfileHeader({ data }: ProfileHeaderProps) {
  const solo = data.soloRank;
  const flex = data.flexRank;

  return (
    <div className="league-profile card-surface glass">
      <img
        className="league-profile__icon"
        src={profileIcon(data.ddragonVersion, data.profileIconId)}
        alt=""
        loading="lazy"
      />

      <div>
        <h2 className="league-profile__riot-id">{data.riotId}</h2>
        <p className="league-profile__meta">
          {data.region} · Seviye {data.summonerLevel} · Toplam ustalık{' '}
          {formatMastery(data.totalChampionMastery)}
        </p>

        {solo ? (
          <>
            <p className="league-profile__rank">
              {solo.tier} {solo.rank}
            </p>
            <p className="league-profile__stats">
              <span>{solo.lp} LP</span>
              <span>
                {solo.wins}W — {solo.losses}L
              </span>
              <span>{formatWinRate(solo.winRate)} Win Rate</span>
            </p>
          </>
        ) : (
          <p className="league-profile__rank">Unranked</p>
        )}

        {flex && (
          <p className="league-profile__meta" style={{ marginTop: '0.5rem' }}>
            Flex: {tierLabel(flex.tier, flex.rank, flex.lp)} ·{' '}
            {flex.wins}W / {flex.losses}L
          </p>
        )}

        <a
          className="league-profile__opgg"
          href={data.opggUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on OP.GG <ExternalLink size={14} aria-hidden />
        </a>
      </div>

      {solo && (
        <img
          className="league-profile__emblem"
          src={rankEmblem(solo.tier)}
          alt={`${solo.tier} emblem`}
          loading="lazy"
        />
      )}
    </div>
  );
}

export function LeagueToolbar({
  fetchedAt,
  stale,
  loading,
  onRefresh,
}: {
  fetchedAt: number;
  stale: boolean;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="league-toolbar">
      <span>
        Last updated: {formatRelativeUpdate(fetchedAt)}
        {stale && <span className="league-stale-badge">Önbellek</span>}
      </span>
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
