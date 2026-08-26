import { AnimatePresence, motion } from 'framer-motion';
import type { LeagueMatch } from '../../types/league';
import {
  champIcon,
  formatDate,
  formatDuration,
  formatKda,
  itemIcon,
  spellIcon,
} from '../../utils/leagueAssets';
import MatchInsights from './MatchInsights';

interface MatchDetailModalProps {
  match: LeagueMatch;
  version: string;
  puuid: string;
  onClose: () => void;
}

export default function MatchDetailModal({
  match,
  version,
  puuid,
  onClose,
}: MatchDetailModalProps) {
  const teams = [100, 200].map((teamId) =>
    match.participants.filter((p) => p.teamId === teamId),
  );

  return (
    <AnimatePresence>
      <motion.div
        className="league-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          className="league-modal card-surface glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Maç detayı — ${match.championName}`}
        >
          <button
            type="button"
            className="league-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>

          <div
            className={`league-match-card__result league-match-card__result--${
              match.win ? 'win' : 'loss'
            }`}
          >
            {match.win ? 'VICTORY' : 'DEFEAT'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
            <img
              src={champIcon(version, match.championName)}
              alt=""
              width={56}
              height={56}
              style={{ borderRadius: '50%' }}
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{match.championName}</h3>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)' }}>
                {formatKda(match.kills, match.deaths, match.assists)} · CS {match.cs}
                {match.durationSeconds > 0 && (
                  <> · {formatDuration(match.durationSeconds)}</>
                )}
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {formatDate(match.gameCreation)}
                {match.killParticipation != null &&
                  ` · KP %${Math.round(match.killParticipation * 100)}`}
              </p>
            </div>
          </div>

          {(match.summonerSpell1 > 0 || match.summonerSpell2 > 0) && (
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem' }}>
              {match.summonerSpell1 > 0 && (
                <img src={spellIcon(version, match.summonerSpell1)} alt="" width={28} height={28} />
              )}
              {match.summonerSpell2 > 0 && (
                <img src={spellIcon(version, match.summonerSpell2)} alt="" width={28} height={28} />
              )}
            </div>
          )}

          {match.items.length > 0 && (
            <div className="league-modal__items">
              {match.items.map((id) => (
                <img key={id} src={itemIcon(version, id)} alt="" loading="lazy" />
              ))}
            </div>
          )}

          <MatchInsights insights={match.insights} compact />

          {match.participants.length > 0 && (
            <div className="league-modal__teams">
              {teams.map((team, ti) => (
                <div key={ti}>
                  <p className="league-modal__team-title">
                    {ti === 0 ? 'Takım 1' : 'Takım 2'}
                  </p>
                  {team.map((p) => (
                    <div
                      key={p.puuid}
                      className="league-modal__player"
                      style={{
                        fontWeight: p.puuid === puuid ? 600 : 400,
                        opacity: p.puuid === puuid ? 1 : 0.85,
                      }}
                    >
                      <img src={champIcon(version, p.championName)} alt="" loading="lazy" />
                      <span>
                        {p.championName}{' '}
                        <span style={{ color: 'var(--text-muted)' }}>
                          {p.kills}/{p.deaths}/{p.assists}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
