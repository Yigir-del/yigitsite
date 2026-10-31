import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { isKnownRoute, isMemorialRoute } from '../../utils/routes';
import { isCinematicActive, useOyukState } from '../oyuk/oyukState';
import { playGoldenTrophySound } from '../oyuk/useCoinSound';
import { ACHIEVEMENT_DEFINITIONS_MAP } from './definitions';
import {
  shiftAchievementToast,
  useAchievementToastQueue,
} from './achievementStore';
import { AchievementCategoryIcon, GoldenTrophySvg } from './AchievementIcons';
import { ACHIEVEMENTS_ROUTE } from './AchievementTrophy';
import './achievements.css';

const ORDINARY_TOAST_MS = 3100;
const GOLDEN_TOAST_MS = 4600;

/**
 * Controlled Achievement Notification Queue (§17 & Additional 404 Update §3.2).
 * Displays one notification at a time, automatically deferring display during
 * the OYUK transition cinematic, while inside the `/miras` memorial route, or
 * while inside the custom 404 (`NotFound`) cinematic experience.
 */
export default function AchievementToast() {
  const queue = useAchievementToastQueue();
  const location = useLocation();
  const navigate = useNavigate();
  const oyuk = useOyukState();
  const playedGoldenChimeForRef = useRef<number | null>(null);

  const onMemorial = isMemorialRoute(location.pathname);
  const on404Cinematic = !isKnownRoute(location.pathname);
  const cinematicActive = isCinematicActive(oyuk.phase);
  const activeItem =
    !onMemorial && !on404Cinematic && !cinematicActive ? (queue[0] ?? null) : null;

  useEffect(() => {
    if (!activeItem) return;

    const isGolden = activeItem.id === 'golden_trophy';
    if (isGolden && playedGoldenChimeForRef.current !== activeItem.unlockedAt) {
      playedGoldenChimeForRef.current = activeItem.unlockedAt;
      playGoldenTrophySound();
    }

    const duration = isGolden ? GOLDEN_TOAST_MS : ORDINARY_TOAST_MS;
    const timer = window.setTimeout(() => {
      shiftAchievementToast();
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeItem]);

  const definition = activeItem ? ACHIEVEMENT_DEFINITIONS_MAP.get(activeItem.id) : null;
  const isGolden = activeItem?.id === 'golden_trophy';

  return (
    <div className="achievement-toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        {activeItem && definition && (
          <motion.div
            key={`${activeItem.id}-${activeItem.unlockedAt}`}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={
              isGolden
                ? 'achievement-toast achievement-toast--golden'
                : 'achievement-toast'
            }
            role="status"
            onClick={() => {
              shiftAchievementToast();
              if (location.pathname !== ACHIEVEMENTS_ROUTE) {
                navigate(ACHIEVEMENTS_ROUTE);
              }
            }}
          >
            <div className="achievement-toast__icon">
              {isGolden ? (
                <GoldenTrophySvg size={32} />
              ) : (
                <AchievementCategoryIcon
                  kind={definition.icon}
                  unlocked={true}
                  size={22}
                />
              )}
            </div>

            <div className="achievement-toast__body">
              <span className="achievement-toast__kicker">
                {isGolden
                  ? 'Altın Kupa Açıldı — Hiçliğin Kralı'
                  : 'Başarım açıldı'}
              </span>
              <strong className="achievement-toast__title">
                {isGolden ? 'Hiçliğin Kralı' : definition.title}
              </strong>
              <p className="achievement-toast__desc">
                {isGolden ? '“Bütün izleri buldun.”' : definition.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
