import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrowableEdgeFlight } from '../../hooks/useThrowableEdgeFlight';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import {
  BEGGAR_OWN,
  BEGGAR_TO_SAGE,
  BEGGAR_REPLY_TO_SAGE,
  FLYER_SPEAK,
  pickRandom,
  shouldJab,
  type FlyerSpeakDetail,
} from '../../utils/flyerDialogue';
import BeggarActorSvg from '../../features/oyuk/BeggarActorSvg';
import BeggarCoin from '../../features/oyuk/BeggarCoin';
import { useCoinSound } from '../../features/oyuk/useCoinSound';
import '../../features/oyuk/oyuk.css';
import {
  commitPendingOyukCinematic,
  isCinematicActive,
  recordBeggarDonation,
  recordLastPointer,
  setOyukReturnPath,
  useOyukState,
  type CoinPoint,
  type DonationOutcome,
} from '../../features/oyuk/oyukState';
import {
  recordWorldMemoryEncounter,
  selectContextualMemoryLine,
} from '../../features/worldMemory/worldMemoryStore';
import {
  cancelActiveEncounter,
  checkAndTriggerEncounter,
  ENCOUNTER_EXCHANGES,
  isEncounterActive,
  registerEncounterActor,
  type ActorFacing,
} from '../../features/characterEncounters/encounterManager';

interface ActiveCoinToss {
  id: number;
  startPoint: CoinPoint;
  fallbackTarget: CoinPoint;
  outcome: DonationOutcome;
}

/** Angry beggar — mostly heckles the king; on the 5th donation, unlocks OYUK */
export default function FlyingBeggar() {
  const isMobilePerf = useIsMobilePerf();
  const reducedMotion = usePrefersReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const oyuk = useOyukState();
  const cinematicRunning = isCinematicActive(oyuk.phase);
  const { muted: coinMuted, prime: primeCoinAudio, playImpact: playCoinImpact, toggleMute: toggleCoinMute } =
    useCoinSound();

  const {
    x,
    y,
    visible,
    dragging,
    onDragStart,
    onDragEnd,
    freezeFlight,
    holdFlight,
    resumeFlight,
  } = useThrowableEdgeFlight({
    durationMin: 16,
    durationMax: 24,
    paused: isMobilePerf || cinematicRunning,
  });

  const [line, setLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [activeCoin, setActiveCoin] = useState<ActiveCoinToss | null>(null);
  const [cupImpact, setCupImpact] = useState(false);
  const [encounterFacing, setEncounterFacing] = useState<ActorFacing>(null);

  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cupImpactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileEncounterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const cupRef = useRef<SVGGElement | null>(null);
  const busyRef = useRef(false);
  const draggedRef = useRef(false);
  const coinInFlightRef = useRef(false);
  const coinSeqRef = useRef(0);

  const clearSpeechTimers = useCallback(() => {
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    if (replyRef.current) {
      clearTimeout(replyRef.current);
      replyRef.current = null;
    }
    busyRef.current = false;
  }, []);

  const say = useCallback(
    (text: string, holdMs = 5000) => {
      if (isCinematicActive()) return;
      if (replyRef.current) {
        clearTimeout(replyRef.current);
        replyRef.current = null;
      }
      busyRef.current = true;
      setLine(text);
      setShowBubble(true);
      if (hideRef.current) clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => {
        setShowBubble(false);
        busyRef.current = false;
      }, holdMs);
    },
    [],
  );

  useEffect(() => {
    if (cinematicRunning) {
      cancelActiveEncounter();
      clearSpeechTimers();
      setShowBubble(false);
      setEncounterFacing(null);
      freezeFlight();
    }
  }, [cinematicRunning, clearSpeechTimers, freezeFlight]);

  useEffect(() => {
    return () => {
      if (cupImpactTimerRef.current) clearTimeout(cupImpactTimerRef.current);
      if (mobileEncounterTimerRef.current) clearTimeout(mobileEncounterTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isMobilePerf || cinematicRunning) return;

    const emit = (detail: FlyerSpeakDetail) => {
      window.dispatchEvent(new CustomEvent(FLYER_SPEAK, { detail }));
    };

    const speak = () => {
      if (
        busyRef.current ||
        coinInFlightRef.current ||
        isEncounterActive() ||
        document.hidden ||
        isCinematicActive()
      ) {
        return;
      }

      // Living Universe (§4.4): Occasionally acknowledge visitor's past discoveries
      const memoryLine = selectContextualMemoryLine('beggar');
      if (memoryLine) {
        say(memoryLine, 4800);
        emit({ from: 'beggar', kind: 'own', line: memoryLine });
        return;
      }

      if (shouldJab(0.15)) {
        const jab = pickRandom(BEGGAR_TO_SAGE);
        say(jab, 5000);
        emit({ from: 'beggar', kind: 'jab', line: jab });
        return;
      }

      const own = pickRandom(BEGGAR_OWN);
      say(own);
      emit({ from: 'beggar', kind: 'own', line: own });
    };

    const firstSpeak = setTimeout(speak, 2500);
    const speakLoop = setInterval(speak, 10000 + Math.random() * 4000);

    const onFlyerSpeak = (e: Event) => {
      if (isCinematicActive() || coinInFlightRef.current || isEncounterActive()) return;
      const detail = (e as CustomEvent<FlyerSpeakDetail>).detail;
      if (!detail || detail.from !== 'sage' || detail.kind !== 'jab') return;

      const reply = BEGGAR_REPLY_TO_SAGE[detail.line];
      if (!reply) return;

      if (replyRef.current) clearTimeout(replyRef.current);
      busyRef.current = true;
      replyRef.current = setTimeout(() => {
        replyRef.current = null;
        say(reply, 5000);
      }, 1500);
    };

    window.addEventListener(FLYER_SPEAK, onFlyerSpeak);

    return () => {
      clearTimeout(firstSpeak);
      clearInterval(speakLoop);
      clearSpeechTimers();
      if (dragResetRef.current) clearTimeout(dragResetRef.current);
      window.removeEventListener(FLYER_SPEAK, onFlyerSpeak);
    };
  }, [isMobilePerf, cinematicRunning, say, clearSpeechTimers]);

  const measureActorRect = useCallback(() => {
    const el = actorRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width || 54,
      height: rect.height || 70,
    };
  }, []);

  // Register Beggar actor with character encounter manager (§5)
  useEffect(() => {
    if (isMobilePerf) return;
    return registerEncounterActor('beggar', {
      getCenter: () => {
        const rect = measureActorRect();
        if (!rect) return null;
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.5,
        };
      },
      isReady: () =>
        visible && !cinematicRunning && !coinInFlightRef.current,
      hold: (facing) => {
        clearSpeechTimers();
        setShowBubble(false);
        setEncounterFacing(facing);
        holdFlight();
      },
      sayLine: (text, holdMs) => {
        say(text, holdMs);
      },
      clearSpeech: () => {
        clearSpeechTimers();
        setShowBubble(false);
      },
      resume: () => {
        setEncounterFacing(null);
        resumeFlight(240);
      },
    });
  }, [
    isMobilePerf,
    visible,
    cinematicRunning,
    measureActorRect,
    clearSpeechTimers,
    holdFlight,
    say,
    resumeFlight,
  ]);

  /**
   * Resolves the live viewport coordinates of the beggar's actual donation bowl SVG element.
   */
  const measureCupCenter = useCallback((): CoinPoint | null => {
    const cupEl = cupRef.current;
    if (cupEl) {
      const rect = cupEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.36,
        };
      }
    }
    const actorEl = actorRef.current;
    if (actorEl) {
      const rect = actorEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.62,
        };
      }
    }
    return null;
  }, []);

  const triggerCupBounce = useCallback(() => {
    setCupImpact(true);
    if (cupImpactTimerRef.current) clearTimeout(cupImpactTimerRef.current);
    cupImpactTimerRef.current = setTimeout(() => {
      setCupImpact(false);
      cupImpactTimerRef.current = null;
    }, 240);
  }, []);

  const handleCoinImpact = useCallback(() => {
    if (!activeCoin) return;

    // 1. Play synchronized metallic coin "çınk!" on impact (§1.6 & §5)
    playCoinImpact();

    // 2. Trigger small bounce & brass glint on the donation container (§1.7 & §4)
    triggerCupBounce();

    // 3. For ordinary donations (1–4, or >=6 post-unlock), deliver beggar's dialogue on impact (§1.8)
    //    For the 5th donation, wait for the impact glint to complete before starting the OYUK invitation (§7)
    const { outcome } = activeCoin;
    if (!outcome.triggeredCinematic) {
      if (outcome.alreadyUnlockedBefore && outcome.alms % 2 === 0) {
        say('O deliği hâlâ hatırlıyor musun kral?', 3400);
      } else {
        say('Kral lütfetti. Hâlâ açım.', 2800);
      }
    }
  }, [activeCoin, playCoinImpact, triggerCupBounce, say]);

  const handleCoinComplete = useCallback(() => {
    const finishedCoin = activeCoin;
    coinInFlightRef.current = false;
    setActiveCoin(null);

    if (!finishedCoin) return;

    if (finishedCoin.outcome.triggeredCinematic) {
      // 5th coin has landed, played its sound, and finished its impact response (§7):
      // Stop ordinary flight, capture current coordinates, and launch the OYUK invitation & cinematic!
      clearSpeechTimers();
      setShowBubble(false);
      freezeFlight();
      commitPendingOyukCinematic(measureActorRect());
      return;
    }

    // Ordinary donation completed — smoothly resume flight from current position
    resumeFlight(320);
  }, [activeCoin, clearSpeechTimers, freezeFlight, measureActorRect, resumeFlight]);

  const giveAlms = (clientX?: number, clientY?: number) => {
    // Guard against dragging, active cinematic, or overlapping rapid clicks while a coin is in the air (§6)
    if (draggedRef.current || cinematicRunning || coinInFlightRef.current) return;

    if (typeof clientX === 'number' && typeof clientY === 'number' && clientX > 0 && clientY > 0) {
      recordLastPointer(clientX, clientY);
    }

    // Unlock/resume singleton Web Audio context synchronously inside user gesture (§5)
    primeCoinAudio();

    const originRect = measureActorRect();
    const outcome = recordBeggarDonation({
      isDragging: draggedRef.current,
      originRect,
      returnPath: location.pathname,
      deferCinematicStart: true,
    });

    if (!outcome.accepted) return;

    // Hold beggar in place while the coin arcs into his container (§3 & §7)
    coinInFlightRef.current = true;
    holdFlight();
    if (outcome.triggeredCinematic) {
      clearSpeechTimers();
      setShowBubble(false);
    }

    coinSeqRef.current += 1;
    const seq = coinSeqRef.current;

    const target = measureCupCenter() ?? {
      x: originRect ? originRect.left + originRect.width * 0.5 : 120,
      y: originRect ? originRect.top + originRect.height * 0.62 : 120,
    };

    const hasPointer =
      typeof clientX === 'number' &&
      typeof clientY === 'number' &&
      clientX > 0 &&
      clientY > 0;

    const rawDx = hasPointer ? clientX - target.x : 0;
    const side =
      Math.abs(rawDx) < 6 ? (seq % 2 === 0 ? -1 : 1) : Math.sign(rawDx);
    const offsetX = side * Math.min(26, Math.max(15, Math.abs(rawDx)));
    const startPoint: CoinPoint = {
      x: target.x + offsetX,
      y: hasPointer
        ? Math.min(target.y + 6, Math.max(target.y - 18, clientY))
        : target.y - 10,
    };

    setActiveCoin({
      id: seq,
      startPoint,
      fallbackTarget: target,
      outcome,
    });
  };

  const revisitOyuk = () => {
    if (cinematicRunning || coinInFlightRef.current) return;
    setOyukReturnPath(location.pathname);
    navigate('/oyuk');
  };

  const triggerMobileEncounter = () => {
    if (cinematicRunning || coinInFlightRef.current) return;
    recordWorldMemoryEncounter();
    const exchange = ENCOUNTER_EXCHANGES[0];
    if (mobileEncounterTimerRef.current) {
      clearTimeout(mobileEncounterTimerRef.current);
      mobileEncounterTimerRef.current = null;
    }
    say(exchange[0].text, 1750);
    mobileEncounterTimerRef.current = setTimeout(() => {
      say(`Bilge: “${exchange[1].text}” — “${exchange[2].text}”`, 3200);
      mobileEncounterTimerRef.current = null;
    }, 1800);
  };

  const almsFooter = (
    <div className="beggar-alms" aria-live="polite">
      <span>Verdiğin altın: {oyuk.alms.toLocaleString('tr-TR')}</span>
      <button
        type="button"
        className="beggar-coin-mute-btn"
        onClick={toggleCoinMute}
        aria-pressed={coinMuted}
        title={coinMuted ? 'Para sesini aç' : 'Para sesini kapat'}
        aria-label={coinMuted ? 'Dilenci para sesini aç' : 'Dilenci para sesini kapat'}
      >
        {coinMuted ? '· ♪ sessiz' : '· ♪ çınk'}
      </button>
      {isMobilePerf && !cinematicRunning && (
        <button
          type="button"
          className="beggar-coin-mute-btn"
          onClick={triggerMobileEncounter}
          title="Dilenciyi bilgeyle yüzleştir"
          aria-label="Dilenciyi bilgeyle yüzleştir"
        >
          · bilgeyle yüzleştir
        </button>
      )}
      {oyuk.unlocked && !cinematicRunning && (
        <button
          type="button"
          className="beggar-oyuk-revisit"
          onClick={revisitOyuk}
          title="O deliği hâlâ hatırlıyor musun kral?"
          aria-label="Oyuk mağarasına dön"
        >
          · oyuk&apos;a in ↘
        </button>
      )}
    </div>
  );

  const coinOverlay = activeCoin ? (
    <BeggarCoin
      key={activeCoin.id}
      coinId={activeCoin.id}
      startPoint={activeCoin.startPoint}
      getTargetPoint={measureCupCenter}
      fallbackTarget={activeCoin.fallbackTarget}
      reducedMotion={reducedMotion}
      isMobile={isMobilePerf}
      onImpact={handleCoinImpact}
      onComplete={handleCoinComplete}
    />
  ) : null;

  // Lightweight mobile beggar badge (§12.2) — no continuous edge-flight loop
  if (isMobilePerf) {
    return (
      <>
        {!cinematicRunning && (
          <div
            ref={actorRef}
            role="button"
            tabIndex={0}
            aria-label="Sinirli dilenci — bağış bırak"
            title="Sinirli dilenci — kral bağışlasın"
            className="beggar-mobile-badge"
            onClick={(e) => giveAlms(e.clientX, e.clientY)}
            onKeyDown={(e) => {
              if (e.repeat) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                giveAlms();
              }
            }}
          >
            <AnimatePresence mode="wait">
              {showBubble && line && (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.18 }}
                  className="flyer-bubble beggar-mobile-bubble"
                >
                  {line}
                </motion.div>
              )}
            </AnimatePresence>
            <BeggarActorSvg
              size={28}
              circleSize={44}
              showLabel={false}
              cupRef={cupRef}
              cupImpact={cupImpact}
            />
          </div>
        )}
        {coinOverlay}
        {almsFooter}
      </>
    );
  }

  if (!visible) {
    return almsFooter;
  }

  return (
    <>
      <motion.div
        ref={actorRef}
        role="button"
        tabIndex={cinematicRunning ? -1 : 0}
        aria-label="Sinirli dilenci — bağış bırak"
        aria-hidden={cinematicRunning}
        style={{
          x,
          y,
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: dragging ? 200 : 40,
          cursor: 'grab',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
          pointerEvents: cinematicRunning ? 'none' : 'auto',
          opacity: cinematicRunning ? 0 : 1,
        }}
        drag={!cinematicRunning && !coinInFlightRef.current}
        dragMomentum
        dragElastic={0.2}
        whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 200 }}
        onDragStart={() => {
          draggedRef.current = true;
          setEncounterFacing(null);
          onDragStart();
        }}
        onDrag={() => {
          checkAndTriggerEncounter('beggar', { wasDragged: true });
        }}
        onDragEnd={() => {
          onDragEnd();
          checkAndTriggerEncounter('beggar', { wasDragged: true });
          if (dragResetRef.current) clearTimeout(dragResetRef.current);
          dragResetRef.current = setTimeout(() => {
            draggedRef.current = false;
            dragResetRef.current = null;
          }, 60);
        }}
        onClick={(e) => giveAlms(e.clientX, e.clientY)}
        onKeyDown={(e) => {
          if (e.repeat) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            giveAlms();
          }
        }}
        title="Sinirli dilenci — kral bağışlasın"
      >
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '0.4rem',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <AnimatePresence mode="wait">
            {showBubble && line && (
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  padding: '0.45rem 0.7rem',
                  borderRadius: '10px',
                  maxWidth: '180px',
                  width: 'max-content',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px var(--shadow)',
                  whiteSpace: 'normal',
                  lineHeight: 1.35,
                }}
                className="flyer-bubble"
              >
                {line}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          style={{
            transform:
              encounterFacing === 'right'
                ? 'rotate(4deg) translateX(2px)'
                : encounterFacing === 'left'
                  ? 'rotate(-4deg) translateX(-2px)'
                  : undefined,
            transition: 'transform 0.28s ease',
          }}
        >
          <BeggarActorSvg cupRef={cupRef} cupImpact={cupImpact} />
        </div>
      </motion.div>
      {coinOverlay}
      {almsFooter}
    </>
  );
}
