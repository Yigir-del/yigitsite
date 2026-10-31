import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isKnownRoute, isMemorialRoute, isOyukRoute } from '../../utils/routes';
import { isCinematicActive, useOyukState } from '../oyuk/oyukState';
import { useAchievementProgress, useAchievementState } from './achievementStore';
import { GoldenTrophySvg, LockedTrophySvg } from './AchievementIcons';
import './achievements.css';

export const ACHIEVEMENTS_ROUTE = '/basarimlar';

/**
 * Discreet bottom-right Trophy Entry Point (§14).
 * Displays a muted silver/stone trophy before completion, and upgrades into the
 * gleaming HD Golden Trophy once all 10 required achievements are unlocked (§8).
 */
export default function AchievementTrophy() {
  const location = useLocation();
  const navigate = useNavigate();
  const oyuk = useOyukState();
  const state = useAchievementState();
  const progress = useAchievementProgress();
  const lastNonTrophyRouteRef = useRef<string>('/');

  const onAchievementsPage = location.pathname === ACHIEVEMENTS_ROUTE;
  const onMemorial = isMemorialRoute(location.pathname);
  const onOyuk = isOyukRoute(location.pathname);
  const on404Cinematic = !isKnownRoute(location.pathname);
  const cinematicActive = isCinematicActive(oyuk.phase);

  useEffect(() => {
    if (
      location.pathname !== ACHIEVEMENTS_ROUTE &&
      !isOyukRoute(location.pathname) &&
      isKnownRoute(location.pathname)
    ) {
      lastNonTrophyRouteRef.current = location.pathname || '/';
    }
  }, [location.pathname]);

  // Keep /oyuk, active OYUK cinematic, 404 cinematic, and /miras memorial completely free of floating trophy chrome
  if (onOyuk || cinematicActive || onMemorial || on404Cinematic) {
    return null;
  }

  const isGolden = state.goldenTrophyAwarded;

  const handleClick = () => {
    if (onAchievementsPage) {
      navigate(lastNonTrophyRouteRef.current || '/');
    } else {
      navigate(ACHIEVEMENTS_ROUTE);
    }
  };

  const label = isGolden
    ? `Altın Kupa — Hiçliğin Kralı (${progress.unlockedCount}/${progress.totalRequired} iz)`
    : `Başarımlar — ${progress.unlockedCount}/${progress.totalRequired} iz keşfedildi`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'achievement-trophy-btn',
        isGolden ? 'achievement-trophy-btn--golden' : 'achievement-trophy-btn--locked',
        onAchievementsPage ? 'achievement-trophy-btn--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      title={label}
      data-golden-trophy={isGolden ? 'true' : 'false'}
    >
      <span className="achievement-trophy-btn__icon-wrap">
        {isGolden ? <GoldenTrophySvg size={24} /> : <LockedTrophySvg size={20} />}
      </span>
      <span className="achievement-trophy-btn__badge" aria-hidden="true">
        {progress.unlockedCount}/{progress.totalRequired}
      </span>
    </button>
  );
}
