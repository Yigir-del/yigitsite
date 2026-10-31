import { Link } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import {
  ACHIEVEMENT_CATEGORIES,
  REQUIRED_ACHIEVEMENT_DEFINITIONS,
  GOLDEN_TROPHY_DEFINITION,
} from './definitions';
import {
  useAchievementProgress,
  useAchievementState,
} from './achievementStore';
import {
  AchievementCategoryIcon,
  GoldenTrophySvg,
  LockedTrophySvg,
} from './AchievementIcons';
import './achievements.css';

function formatTurkishDate(timestamp?: number): string {
  if (!timestamp || !Number.isFinite(timestamp)) return '';
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(timestamp));
  } catch {
    return '';
  }
}

/**
 * Hidden Achievements Archive Page (`/basarimlar`, §16).
 * Preserves strict mystery for locked slots ("???" / "Henüz keşfedilmedi")
 * while celebrating discovered traces and the ultimate Golden Trophy ("Hiçliğin Kralı").
 */
export default function AchievementsPage() {
  const state = useAchievementState();
  const progress = useAchievementProgress();
  const isGolden = state.goldenTrophyAwarded;
  const goldenRecord = state.unlocked.golden_trophy;

  const completionRatio =
    progress.totalRequired > 0
      ? Math.min(100, Math.round((progress.unlockedCount / progress.totalRequired) * 100))
      : 0;

  return (
    <section className="achievements-page" aria-labelledby="achievements-heading">
      <SEOHead page="achievements" />

      <div className="achievements-page__container">
        <header className="achievements-page__header">
          <div className="achievements-page__top-nav">
            <Link to="/" className="achievements-page__back-link">
              ← boşluğa dön
            </Link>
            <span className="achievements-page__progress-pill" aria-live="polite">
              {progress.unlockedCount} / {progress.totalRequired} iz keşfedildi
            </span>
          </div>

          <h1 id="achievements-heading" className="achievements-page__title">
            İzlerin
          </h1>
          <p className="achievements-page__subtitle">
            “Bazılarını bıraktın. Bazılarını buldun.”
          </p>

          <div
            className="achievements-page__progress-track"
            role="progressbar"
            aria-valuenow={progress.unlockedCount}
            aria-valuemin={0}
            aria-valuemax={progress.totalRequired}
            aria-label="Keşfedilen iz ilerlemesi"
          >
            <div
              className={
                isGolden
                  ? 'achievements-page__progress-fill achievements-page__progress-fill--golden'
                  : 'achievements-page__progress-fill'
              }
              style={{ width: `${completionRatio}%` }}
            />
          </div>
        </header>

        {/* Dedicated Golden Trophy Showcase (§15.3 & §16.4) */}
        <section
          className={
            isGolden
              ? 'achievements-golden-banner achievements-golden-banner--unlocked'
              : 'achievements-golden-banner achievements-golden-banner--locked'
          }
          aria-label={
            isGolden
              ? `${GOLDEN_TROPHY_DEFINITION.title} — ${GOLDEN_TROPHY_DEFINITION.description}`
              : 'Kilitli nihai kupa — Bütün izler tamamlandığında açılır'
          }
        >
          <div className="achievements-golden-banner__emblem">
            {isGolden ? (
              <GoldenTrophySvg size={58} />
            ) : (
              <LockedTrophySvg size={48} />
            )}
          </div>

          <div className="achievements-golden-banner__content">
            <span className="achievements-golden-banner__kicker">
              {isGolden ? 'Nihai Ödül · Altın Kupa' : 'Nihai Ödül · Kilitli'}
            </span>
            <h2 className="achievements-golden-banner__title">
              {isGolden ? GOLDEN_TROPHY_DEFINITION.title : '???'}
            </h2>
            <p className="achievements-golden-banner__desc">
              {isGolden
                ? `“${GOLDEN_TROPHY_DEFINITION.description}”`
                : 'Bütün izler tamamlandığında açılır.'}
            </p>
          </div>

          <div className="achievements-golden-banner__meta">
            {isGolden && goldenRecord ? (
              <span className="achievements-golden-banner__date">
                {formatTurkishDate(goldenRecord)}
              </span>
            ) : (
              <span className="achievements-golden-banner__counter">
                {progress.unlockedCount} / {progress.totalRequired}
              </span>
            )}
          </div>
        </section>

        {/* Category Grids (§16.2 & §16.3) */}
        <div className="achievements-categories">
          {ACHIEVEMENT_CATEGORIES.map((cat) => {
            const items = REQUIRED_ACHIEVEMENT_DEFINITIONS.filter(
              (def) => def.category === cat.key,
            );
            const unlockedInCat = items.filter((def) =>
              Boolean(state.unlocked[def.id]),
            ).length;

            return (
              <section
                key={cat.key}
                className="achievements-category"
                aria-labelledby={`cat-heading-${cat.key}`}
              >
                <div className="achievements-category__header">
                  <div>
                    <h2
                      id={`cat-heading-${cat.key}`}
                      className="achievements-category__title"
                    >
                      {cat.label}
                    </h2>
                    <p className="achievements-category__subtitle">
                      {cat.subtitle}
                    </p>
                  </div>
                  <span className="achievements-category__count">
                    {unlockedInCat} / {items.length}
                  </span>
                </div>

                <div className="achievements-grid">
                  {items.map((def) => {
                    const record = state.unlocked[def.id];
                    const isUnlocked = Boolean(record);

                    if (!isUnlocked) {
                      // STRICT LOCKED STATE (§16.2): Never reveal title, hint, or unlock condition
                      return (
                        <article
                          key={def.id}
                          className="achievement-card achievement-card--locked"
                          aria-label="Kilitli başarım — henüz keşfedilmedi"
                        >
                          <div className="achievement-card__icon achievement-card__icon--locked">
                            <AchievementCategoryIcon
                              kind={def.icon}
                              unlocked={false}
                              size={22}
                            />
                          </div>
                          <div className="achievement-card__body">
                            <h3 className="achievement-card__title">???</h3>
                            <p className="achievement-card__desc">
                              Henüz keşfedilmedi
                            </p>
                          </div>
                        </article>
                      );
                    }

                    return (
                      <article
                        key={def.id}
                        className="achievement-card achievement-card--unlocked"
                        aria-label={`${def.title} — ${def.description}`}
                      >
                        <div className="achievement-card__icon achievement-card__icon--unlocked">
                          <AchievementCategoryIcon
                            kind={def.icon}
                            unlocked={true}
                            size={22}
                          />
                        </div>
                        <div className="achievement-card__body">
                          <div className="achievement-card__top-row">
                            <h3 className="achievement-card__title">
                              {def.title}
                            </h3>
                            {record && (
                              <time
                                className="achievement-card__date"
                                dateTime={new Date(record).toISOString()}
                              >
                                {formatTurkishDate(record)}
                              </time>
                            )}
                          </div>
                          <p className="achievement-card__desc">
                            {def.description}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
