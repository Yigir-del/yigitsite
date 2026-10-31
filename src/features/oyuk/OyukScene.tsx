import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { OYUK_DEEPER_SECRET, OYUK_INSCRIPTIONS } from './oyukStory';
import {
  computeOyukLightCoordinates,
  getOyukState,
  readOyukUnlocked,
  recordLastPointer,
  startOyukExit,
  useOyukState,
} from './oyukState';
import {
  recordCaveInscriptionDiscovered,
  recordCaveSecretSymbolDiscovered,
  recordOyukEntered,
  recordOyukExited,
  useAchievementState,
} from '../achievements/achievementStore';
import {
  recordWorldMemoryOyukEntered,
  recordWorldMemoryOyukExited,
} from '../worldMemory/worldMemoryStore';
import './oyuk.css';

interface OyukLocationState {
  fromOyukCinematic?: boolean;
  returnTo?: string;
}

/**
 * OYUK — Subterranean Cave Scene & Cursor Illumination Engine (§10–§15).
 */
export default function OyukScene() {
  const oyuk = useOyukState();
  const achievementState = useAchievementState();
  const isUnlocked = oyuk.unlocked || readOyukUnlocked();
  const isMobilePerf = useIsMobilePerf();
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as OyukLocationState | null) ?? null;

  const sceneRef = useRef<HTMLElement | null>(null);
  const viewportLayerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const vpPosRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const focusIndexRef = useRef(-1);
  const exitedRecordedRef = useRef(false);

  const [lightAwake, setLightAwake] = useState(false);
  const [sealRevealed, setSealRevealed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const discoveredSet = new Set(achievementState.discoveredInscriptions);

  const returnTarget =
    routeState?.returnTo && routeState.returnTo !== '/oyuk'
      ? routeState.returnTo
      : oyuk.returnPath && oyuk.returnPath !== '/oyuk'
        ? oyuk.returnPath
        : '/';

  const handleExitCave = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    if (!exitedRecordedRef.current && isUnlocked) {
      exitedRecordedRef.current = true;
      recordOyukExited();
      recordWorldMemoryOyukExited();
    }
    startOyukExit(returnTarget);
    if (reducedMotion) {
      navigate(returnTarget);
    }
  }, [isExiting, isUnlocked, navigate, reducedMotion, returnTarget]);

  // Track OYUK entry & exit (§19.01 & Living Universe §4)
  useEffect(() => {
    if (!isUnlocked) return;
    exitedRecordedRef.current = false;
    recordOyukEntered();
    recordWorldMemoryOyukEntered();
    return () => {
      if (!exitedRecordedRef.current) {
        exitedRecordedRef.current = true;
        recordOyukExited();
        recordWorldMemoryOyukExited();
      }
    };
  }, [isUnlocked]);

  const checkBeamInscriptionOverlap = useCallback(
    (localX: number, localY: number, wallWidth: number, wallHeight: number) => {
      if (wallWidth <= 0 || wallHeight <= 0) return;
      const hitRadius = isMobilePerf ? 145 : 165;
      for (const item of OYUK_INSCRIPTIONS) {
        const itemX = (item.x / 100) * wallWidth;
        const itemY = (item.y / 100) * wallHeight;
        const dist = Math.hypot(localX - itemX, localY - itemY);
        if (dist <= hitRadius) {
          recordCaveInscriptionDiscovered(item.id);
        }
      }
    },
    [isMobilePerf],
  );

  const flushLightPosition = useCallback(() => {
    rafRef.current = 0;
    const el = sceneRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const { vpX, vpY, localX, localY } = computeOyukLightCoordinates(
      vpPosRef.current.x,
      vpPosRef.current.y,
      rect,
    );

    const vpXStr = `${vpX.toFixed(1)}px`;
    const vpYStr = `${vpY.toFixed(1)}px`;

    el.style.setProperty('--light-x', `${localX.toFixed(1)}px`);
    el.style.setProperty('--light-y', `${localY.toFixed(1)}px`);
    el.style.setProperty('--vp-x', vpXStr);
    el.style.setProperty('--vp-y', vpYStr);

    const vpEl = viewportLayerRef.current;
    if (vpEl) {
      vpEl.style.setProperty('--vp-x', vpXStr);
      vpEl.style.setProperty('--vp-y', vpYStr);
    }

    checkBeamInscriptionOverlap(
      localX,
      localY,
      rect.width || window.innerWidth,
      rect.height || window.innerHeight * 2,
    );
  }, [checkBeamInscriptionOverlap]);

  const scheduleLightUpdate = useCallback(
    (clientX: number, clientY: number) => {
      vpPosRef.current.x = clientX;
      vpPosRef.current.y = clientY;
      recordLastPointer(clientX, clientY);
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushLightPosition);
      }
    },
    [flushLightPosition],
  );

  // Shot 6: Awaken the exploration light and attach pointer/touch/scroll/keyboard listeners
  useEffect(() => {
    if (!isUnlocked) return;

    const root = document.documentElement;
    if (!isMobilePerf) {
      root.classList.add('has-oyuk-cursor');
    }

    // Initialize light once from known pointer or intentional entrance coordinates (§11.5)
    const initialPointer = getOyukState().lastPointer;
    const initX =
      initialPointer && initialPointer.x > 0
        ? initialPointer.x
        : Math.round(window.innerWidth * 0.36);
    const initY =
      initialPointer && initialPointer.y > 0
        ? initialPointer.y
        : Math.round(window.innerHeight * 0.26);

    vpPosRef.current = { x: initX, y: initY };
    flushLightPosition();

    const wakeDelay = reducedMotion ? 60 : 320;
    const wakeTimer = window.setTimeout(() => {
      setLightAwake(true);
      flushLightPosition();
    }, wakeDelay);

    const onPointerMove = (e: PointerEvent) => {
      scheduleLightUpdate(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      scheduleLightUpdate(touch.clientX, touch.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      scheduleLightUpdate(touch.clientX, touch.clientY);
    };

    // Synchronously update local cave coordinates (`clientY - rect.top`) on scroll & resize
    // so the illuminated cave mask stays locked to the physical pointer at all scroll depths (§5.3)
    const onScrollOrResize = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      flushLightPosition();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExitCave();
        return;
      }

      const step = 76;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();
      const nextX = Math.min(Math.max(24, vpPosRef.current.x + dx), window.innerWidth - 24);
      const nextY = vpPosRef.current.y + dy;

      // Scroll viewport when keyboard light approaches top or bottom edges
      if (nextY > window.innerHeight - 90) {
        window.scrollBy({ top: step, behavior: reducedMotion ? 'auto' : 'smooth' });
        scheduleLightUpdate(nextX, window.innerHeight - 100);
      } else if (nextY < 90 && window.scrollY > 0) {
        window.scrollBy({ top: -step, behavior: reducedMotion ? 'auto' : 'smooth' });
        scheduleLightUpdate(nextX, 100);
      } else {
        scheduleLightUpdate(
          nextX,
          Math.min(Math.max(36, nextY), window.innerHeight - 36),
        );
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(wakeTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      root.classList.remove('has-oyuk-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    isUnlocked,
    isMobilePerf,
    reducedMotion,
    flushLightPosition,
    scheduleLightUpdate,
    handleExitCave,
  ]);

  // Step virtual light to next inscription for keyboard-only explorers (§11.6)
  const stepToNextInscription = () => {
    const el = sceneRef.current;
    if (!el) return;
    focusIndexRef.current = (focusIndexRef.current + 1) % OYUK_INSCRIPTIONS.length;
    const item = OYUK_INSCRIPTIONS[focusIndexRef.current];
    const wallHeight = el.offsetHeight || window.innerHeight * 2;
    const wallWidth = el.offsetWidth || window.innerWidth;
    const targetDocY = (item.y / 100) * wallHeight;
    const targetDocX = (item.x / 100) * wallWidth;

    recordCaveInscriptionDiscovered(item.id);

    const desiredScrollY = Math.max(0, targetDocY - window.innerHeight * 0.45);
    window.scrollTo({
      top: desiredScrollY,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });

    window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      scheduleLightUpdate(rect.left + targetDocX, rect.top + targetDocY);
    }, reducedMotion ? 10 : 220);
  };

  const handleToggleSeal = () => {
    setSealRevealed((prev) => {
      const next = !prev;
      recordCaveSecretSymbolDiscovered();
      return next;
    });
  };

  // Locked state for direct URL visitors who haven't discovered OYUK yet (§9.3)
  if (!isUnlocked) {
    return (
      <section className="oyuk-locked" aria-label="Karanlık geçit">
        <SEOHead page="oyuk" />
        <div className="oyuk-locked__inner">
          <p className="oyuk-locked__whisper">karanlık henüz aralanmadı.</p>
          <p className="oyuk-locked__hint">
            bu oyuğun yolunu bilen biri var; önce yukarıda onun gönlünü hoş tut.
          </p>
          <button
            type="button"
            className="oyuk-exit-btn"
            onClick={() => navigate('/')}
          >
            ← yukarı dön
          </button>
        </div>
      </section>
    );
  }

  const viewportOverlay = (
    <div
      ref={viewportLayerRef}
      className={`oyuk-viewport-layer${lightAwake ? ' is-awake' : ''}${
        isExiting ? ' is-exiting' : ''
      }${isMobilePerf ? ' is-touch' : ''}`}
    >
      {/* Subtle persistent top-left exit + keyboard/screen-reader-only focus helper (§4.2 & §4.3) */}
      <header className="oyuk-hud">
        <button
          type="button"
          className="oyuk-exit-btn"
          onClick={handleExitCave}
          aria-label="Mağaradan çık ve yukarı dön"
        >
          ← yukarı dön
        </button>

        <button
          type="button"
          className="oyuk-sr-step-btn"
          onClick={stepToNextInscription}
          aria-label="Sonraki duvar izine odaklan"
        >
          Sonraki duvar izine odaklan
        </button>
      </header>

      {/* Localized Torch Halo & Cursor Orb following true viewport coordinates */}
      <div className="oyuk-torch-halo" aria-hidden />
      {!isMobilePerf && <div className="oyuk-torch-orb" aria-hidden />}
    </div>
  );

  return (
    <section
      ref={sceneRef}
      className={`oyuk-cave${lightAwake ? ' is-awake' : ''}${
        isExiting ? ' is-exiting' : ''
      }${isMobilePerf ? ' is-touch' : ''}`}
      aria-label="Oyuk — Karanlık mağara"
    >
      <SEOHead page="oyuk" />

      {/* Layer 1: Pitch-dark subterranean stone silhouette (barely visible before beam hits) */}
      <div className="oyuk-wall oyuk-wall--ambient" aria-hidden>
        <svg
          className="oyuk-wall__contours"
          viewBox="0 0 1440 2400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L1440,0 L1440,220 C1290,190 1180,250 1020,210 C840,165 690,235 510,185 C330,135 170,210 0,160 Z"
            fill="#020306"
          />
          <path
            d="M0,380 C160,410 95,690 45,980 C15,1160 85,1490 30,1820 L0,1820 Z"
            fill="#020306"
          />
          <path
            d="M1440,340 C1310,430 1365,780 1395,1120 C1420,1410 1335,1720 1405,2080 L1440,2080 Z"
            fill="#020306"
          />
        </svg>
      </div>

      {/* Layer 2: Flashlight-masked cave surface — reveals rock cracks, engravings & writings (§11.3) */}
      <div
        className="oyuk-wall oyuk-wall--illuminated"
        data-discovered-count={discoveredSet.size}
      >
        {/* Carved geological fissures & stone reliefs */}
        <svg
          className="oyuk-wall__fissures"
          viewBox="0 0 1440 2400"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Entrance ceiling cracks */}
          <path
            d="M180,120 L260,210 L235,295 M260,210 L340,245"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M980,95 L920,190 L965,280 L910,360"
            stroke="rgba(148, 163, 184, 0.14)"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Central chamber arch & stone seams */}
          <path
            d="M120,680 Q720,560 1310,700"
            stroke="rgba(148, 163, 184, 0.11)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M420,740 L485,860 L450,980 L510,1080"
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth="1.3"
            fill="none"
          />
          <path
            d="M1080,820 L1015,940 L1050,1045"
            stroke="rgba(148, 163, 184, 0.14)"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Side recess & lower ledges */}
          <path
            d="M80,1280 C340,1230 580,1320 890,1270"
            stroke="rgba(148, 163, 184, 0.12)"
            strokeWidth="1.8"
            fill="none"
          />
          <path
            d="M620,1520 L690,1640 L645,1760 M690,1640 L785,1685"
            stroke="rgba(148, 163, 184, 0.16)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Secluded floor strata */}
          <path
            d="M160,2040 Q740,1960 1290,2090"
            stroke="rgba(148, 163, 184, 0.13)"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Scattered Cave Writings (§13.1 & §13.2) */}
        <div className="oyuk-inscriptions">
          {OYUK_INSCRIPTIONS.map((item) => {
            const isDiscovered = discoveredSet.has(item.id);
            return (
              <p
                key={item.id}
                data-inscription-id={item.id}
                className={`oyuk-writing oyuk-writing--${item.kind}${
                  item.weathered ? ' is-weathered' : ''
                }${isDiscovered ? ' is-discovered' : ''}`}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `rotate(${item.rotate}deg)`,
                }}
              >
                {item.text}
              </p>
            );
          })}

          {/* Secondary Deeper Discovery (§13.3 & §19.03) */}
          <div
            className="oyuk-secret-node"
            style={{
              left: `${OYUK_DEEPER_SECRET.x}%`,
              top: `${OYUK_DEEPER_SECRET.y}%`,
            }}
          >
            <button
              type="button"
              className={`oyuk-seal-btn${sealRevealed ? ' is-revealed' : ''}`}
              onClick={handleToggleSeal}
              aria-expanded={sealRevealed}
              aria-label={OYUK_DEEPER_SECRET.symbolLabel}
              title="Taşa kazınmış mühür"
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <polygon
                  points="24,5 43,39 5,39"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  opacity="0.78"
                />
                <ellipse
                  cx="24"
                  cy="27"
                  rx="8"
                  ry="4.8"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <circle cx="24" cy="27" r="2.2" fill="currentColor" />
              </svg>
            </button>

            {sealRevealed && (
              <p className="oyuk-secret-node__text" aria-live="polite">
                {OYUK_DEEPER_SECRET.revealedText}
              </p>
            )}
          </div>

          {/* Deep cave floor carved route whispers — fair in-world clues for hidden routes */}
          <nav
            className="oyuk-portal-whispers"
            aria-label="Mağara tabanına kazınmış gizli geçitler"
          >
            <Link to="/dusunceler" className="oyuk-portal-whisper">
              · düşünceler defteri ↗
            </Link>
            <Link to="/studyom" className="oyuk-portal-whisper">
              · sessiz stüdyo ↗
            </Link>
            <Link to="/kayip-iz" className="oyuk-portal-whisper">
              · silinmiş geçit (404) ↗
            </Link>
          </nav>
        </div>
      </div>

      {/* Portaled to document.body so no ancestor transform can ever offset fixed viewport coordinates */}
      {typeof document !== 'undefined'
        ? createPortal(viewportOverlay, document.body)
        : viewportOverlay}
    </section>
  );
}
