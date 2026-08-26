import { useState } from 'react';
import type { LeagueMatch } from '../../types/league';
import {
  champIcon,
  formatDate,
  formatDuration,
  formatKda,
} from '../../utils/leagueAssets';
import MatchDetailModal from './MatchDetailModal';

interface MatchHistoryProps {
  matches: LeagueMatch[];
  version: string;
  puuid: string;
}

export default function MatchHistory({ matches, version, puuid }: MatchHistoryProps) {
  const [selected, setSelected] = useState<LeagueMatch | null>(null);

  return (
    <section className="league-section" aria-label="Recent matches">
      <h2 className="league-section-title">Recent Matches</h2>
      <div className="league-match-list">
        {matches.map((m) => (
          <button
            key={m.matchId}
            type="button"
            className="league-match-card"
            onClick={() => setSelected(m)}
          >
            <div
              className={`league-match-card__stripe league-match-card__stripe--${
                m.win ? 'win' : 'loss'
              }`}
            />
            <img
              className="league-match-card__icon"
              src={champIcon(version, m.championName)}
              alt=""
              loading="lazy"
            />
            <div className="league-match-card__body">
              <div
                className={`league-match-card__result league-match-card__result--${
                  m.win ? 'win' : 'loss'
                }`}
              >
                {m.win ? 'WIN' : 'LOSS'}
              </div>
              <p className="league-match-card__champ">{m.championName}</p>
              <p className="league-match-card__kda">
                <span className="league-stat-label league-stat-label--inline">KDA</span>{' '}
                {formatKda(m.kills, m.deaths, m.assists)}
              </p>
              <p className="league-match-card__details">
                {m.durationSeconds > 0 && (
                  <span>{formatDuration(m.durationSeconds)}</span>
                )}
                {m.durationSeconds > 0 && <span className="league-match-card__dot">·</span>}
                <span>
                  <span className="league-stat-label league-stat-label--inline">CS</span> {m.cs}
                </span>
                {m.killParticipation != null && (
                  <>
                    <span className="league-match-card__dot">·</span>
                    <span>
                      <span className="league-stat-label league-stat-label--inline">KP</span>{' '}
                      {Math.round(m.killParticipation * 100)}%
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="league-match-card__meta">
              <span className="league-stat-label">Played</span>
              <span>{formatDate(m.gameCreation)}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <MatchDetailModal
          match={selected}
          version={version}
          puuid={puuid}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
