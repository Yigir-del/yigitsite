import type { LeagueMatch, PlayerSummary } from '../../types/league';
import { formatDuration, formatWinRate } from '../../utils/leagueAssets';

interface CurrentFormProps {
  form: PlayerSummary['recentForm'];
  matches: LeagueMatch[];
}

export default function CurrentForm({ form, matches }: CurrentFormProps) {
  if (form.sampleSize === 0) return null;

  const formSequence = matches.slice(0, form.sampleSize).map((m) => (m.win ? 'W' : 'L') as 'W' | 'L');

  return (
    <section className="league-section" aria-label="Current form">
      <h2 className="league-section-title">Current Form</h2>
      <div className="league-form-card card-surface">
        <div className="league-form-card__main">
          <div>
            <p className="league-stat-label">Last {form.sampleSize} Games</p>
            <p className="league-form-card__record">
              <span className="league-form-card__wins">{form.wins}W</span>
              <span className="league-form-card__sep"> — </span>
              <span className="league-form-card__losses">{form.losses}L</span>
            </p>
            <p className="league-form-card__summary">
              {formatWinRate(form.winRate)} Win Rate · Last {form.sampleSize} Games
            </p>
          </div>

          {form.streak >= 2 && form.streakType !== 'none' && (
            <div className="league-form-card__streak-block">
              <p className="league-stat-label">Current Streak</p>
              <p className="league-form-card__streak">
                {form.streak} Game {form.streakType === 'win' ? 'Win' : 'Loss'} Streak
              </p>
            </div>
          )}
        </div>

        {formSequence.length > 0 && (
          <div className="league-form-dots" aria-label="Son maç formu">
            {formSequence.map((r, i) => (
              <span
                key={i}
                className={`league-form-dot league-form-dot--${r.toLowerCase()}`}
                title={r === 'W' ? 'Win' : 'Loss'}
              >
                {r}
              </span>
            ))}
          </div>
        )}

        <div className="league-form-card__overview">
          <div className="league-form-card__overview-item">
            <p className="league-stat-label">Avg KDA</p>
            <p className="league-form-card__overview-value">{form.avgKda.toFixed(1)}</p>
          </div>
          <div className="league-form-card__overview-item">
            <p className="league-stat-label">Avg CS</p>
            <p className="league-form-card__overview-value">{form.avgCs}</p>
          </div>
          {form.avgDurationSeconds > 0 && (
            <div className="league-form-card__overview-item">
              <p className="league-stat-label">Avg Duration</p>
              <p className="league-form-card__overview-value">
                {formatDuration(form.avgDurationSeconds)}
              </p>
            </div>
          )}
          {form.bestChampion && (
            <div className="league-form-card__overview-item">
              <p className="league-stat-label">Best WR</p>
              <p className="league-form-card__overview-value">{form.bestChampion}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
