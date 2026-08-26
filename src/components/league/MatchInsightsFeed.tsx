import type { LeagueMatch } from '../../types/league';
import { champIcon, formatKda } from '../../utils/leagueAssets';
import { BeggarAvatar, SageAvatar } from './CharacterAvatars';

interface MatchInsightsFeedProps {
  matches: LeagueMatch[];
  version: string;
}

export default function MatchInsightsFeed({ matches, version }: MatchInsightsFeedProps) {
  const withInsights = matches.filter(
    (m) => m.insights.sage.length > 0 || m.insights.beggar.length > 0,
  );

  if (withInsights.length === 0) return null;

  const featured = withInsights.slice(0, 5);

  return (
    <section className="league-section" aria-label="Match insights">
      <h2 className="league-section-title">Match Insights</h2>
      <p className="league-section-desc">
        Bilge analiz eder, Dilenci yorumlar — son maçlardan seçilmiş yorumlar.
      </p>
      <div className="league-insights-feed">
        {featured.map((m) => (
          <article key={m.matchId} className="league-insight-card card-surface">
            <header className="league-insight-card__match">
              <img src={champIcon(version, m.championName)} alt="" loading="lazy" />
              <div>
                <p className="league-insight-card__champ">{m.championName}</p>
                <p className="league-insight-card__kda">
                  {formatKda(m.kills, m.deaths, m.assists)} KDA ·{' '}
                  <span
                    className={
                      m.win
                        ? 'league-match-card__result--win'
                        : 'league-match-card__result--loss'
                    }
                  >
                    {m.win ? 'WIN' : 'LOSS'}
                  </span>
                </p>
              </div>
            </header>

            {m.insights.sage.map((line) => (
              <div key={`s-${line}`} className="league-insight-row">
                <div className="league-insight-avatar">
                  <SageAvatar />
                </div>
                <div>
                  <p className="league-insight-role">
                    <span className="league-insight-role__name">Bilge</span>
                    <span className="league-insight-role__tag">Analytical Review</span>
                  </p>
                  <blockquote className="league-insight-text">{line}</blockquote>
                </div>
              </div>
            ))}

            {m.insights.beggar.map((line) => (
              <div key={`b-${line}`} className="league-insight-row">
                <div className="league-insight-avatar">
                  <BeggarAvatar />
                </div>
                <div>
                  <p className="league-insight-role">
                    <span className="league-insight-role__name">Dilenci</span>
                    <span className="league-insight-role__tag">Unfiltered Opinion</span>
                  </p>
                  <blockquote className="league-insight-text">{line}</blockquote>
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
