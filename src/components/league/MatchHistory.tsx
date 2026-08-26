import { useState } from 'react';
import type { LeagueMatch, PlayerSummary } from '../../types/league';
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
    <section aria-label="Recent matches">
      <h3 className="league-section-title">Recent Matches</h3>
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
            <div>
              <div
                className={`league-match-card__result league-match-card__result--${
                  m.win ? 'win' : 'loss'
                }`}
              >
                {m.win ? 'WIN' : 'LOSS'}
              </div>
              <div className="league-match-card__champ">
                {m.championName}
                {m.champLevel > 0 && (
                  <span style={{ opacity: 0.6, fontWeight: 400 }}> · Lv{m.champLevel}</span>
                )}
              </div>
              <div className="league-match-card__kda">
                {formatKda(m.kills, m.deaths, m.assists)}
                {m.laneOpponentChampion && (
                  <span> vs {m.laneOpponentChampion}</span>
                )}
              </div>
            </div>
            <div className="league-match-card__meta">
              <div>CS {m.cs}</div>
              <div>{formatDuration(m.durationSeconds)}</div>
              <div>{formatDate(m.gameCreation)}</div>
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

export function RecentFormSummary({ form }: { form: PlayerSummary['recentForm'] }) {
  if (form.sampleSize === 0) return null;

  return (
    <section aria-label="Son maçların özeti">
      <h3 className="league-section-title">Son Maçların</h3>
      <div className="league-form-card card-surface">
        {form.streak >= 2 && form.streakType !== 'none' && (
          <p className="league-form-card__streak">
            {form.streakType === 'win' ? '🔥' : '💀'} Form: {form.streak}{' '}
            {form.streakType === 'win' ? 'Win' : 'Loss'} Streak
          </p>
        )}

        <p>
          Son {form.sampleSize} maç: {form.wins}W / {form.losses}L ·{' '}
          {Math.round(form.winRate * 100)}% Win Rate
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Ort. KDA {form.avgKda.toFixed(2)} · Ort. CS {form.avgCs} · Ort. süre{' '}
          {formatDuration(form.avgDurationSeconds)}
        </p>
        {form.mostPlayedChampion && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            En çok oynanan: {form.mostPlayedChampion}
            {form.bestChampion && form.bestChampion !== form.mostPlayedChampion && (
              <> · En iyi WR: {form.bestChampion}</>
            )}
          </p>
        )}

        {form.last5Form.length > 0 && (
          <div className="league-form-dots" aria-label="Son 5 maç formu">
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
    </section>
  );
}
