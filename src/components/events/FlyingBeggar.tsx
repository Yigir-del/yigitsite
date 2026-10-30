import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrowableEdgeFlight } from '../../hooks/useThrowableEdgeFlight';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
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
import {
  isCinematicActive,
  recordBeggarDonation,
  recordLastPointer,
  setOyukReturnPath,
  useOyukState,
} from '../../features/oyuk/oyukState';

/** Angry beggar — mostly heckles the king; on the 5th donation, unlocks OYUK */
export default function FlyingBeggar() {
  const isMobilePerf = useIsMobilePerf();
  const location = useLocation();
  const navigate = useNavigate();
  const oyuk = useOyukState();
  const cinematicRunning = isCinematicActive(oyuk.phase);

  const { x, y, visible, dragging, onDragStart, onDragEnd, freezeFlight } =
    useThrowableEdgeFlight({
      durationMin: 16,
      durationMax: 24,
      paused: isMobilePerf || cinematicRunning,
    });

  const [line, setLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const draggedRef = useRef(false);

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
      clearSpeechTimers();
      setShowBubble(false);
      freezeFlight();
    }
  }, [cinematicRunning, clearSpeechTimers, freezeFlight]);

  useEffect(() => {
    if (isMobilePerf || cinematicRunning) return;

    const emit = (detail: FlyerSpeakDetail) => {
      window.dispatchEvent(new CustomEvent(FLYER_SPEAK, { detail }));
    };

    const speak = () => {
      if (busyRef.current || document.hidden || isCinematicActive()) return;

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
      if (isCinematicActive()) return;
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

  const measureActorRect = () => {
    const el = actorRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width || 54,
      height: rect.height || 70,
    };
  };

  const giveAlms = (clientX?: number, clientY?: number) => {
    if (draggedRef.current || cinematicRunning) return;
    if (typeof clientX === 'number' && typeof clientY === 'number' && clientX > 0 && clientY > 0) {
      recordLastPointer(clientX, clientY);
    }

    const originRect = measureActorRect();
    const outcome = recordBeggarDonation({
      isDragging: draggedRef.current,
      originRect,
      returnPath: location.pathname,
    });

    if (!outcome.accepted) return;

    if (outcome.triggeredCinematic) {
      // Handoff to OyukDirector — suppress ordinary line immediately (§5 & §7.1)
      clearSpeechTimers();
      setShowBubble(false);
      freezeFlight();
      return;
    }

    if (outcome.alreadyUnlockedBefore && outcome.alms % 2 === 0) {
      say('O deliği hâlâ hatırlıyor musun kral?', 3400);
      return;
    }

    say('Kral lütfetti. Hâlâ açım.', 2800);
  };

  const revisitOyuk = () => {
    if (cinematicRunning) return;
    setOyukReturnPath(location.pathname);
    navigate('/oyuk');
  };

  const almsFooter = (
    <div className="beggar-alms" aria-live="polite">
      <span>Toplam bağış · oyun: {oyuk.alms.toLocaleString('tr-TR')}</span>
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
            <BeggarActorSvg size={28} circleSize={44} showLabel={false} />
          </div>
        )}
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
        drag={!cinematicRunning}
        dragMomentum
        dragElastic={0.2}
        whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 200 }}
        onDragStart={() => {
          draggedRef.current = true;
          onDragStart();
        }}
        onDragEnd={() => {
          onDragEnd();
          if (dragResetRef.current) clearTimeout(dragResetRef.current);
          dragResetRef.current = setTimeout(() => {
            draggedRef.current = false;
            dragResetRef.current = null;
          }, 60);
        }}
        onClick={(e) => giveAlms(e.clientX, e.clientY)}
        onKeyDown={(e) => {
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

        <BeggarActorSvg />
      </motion.div>
      {almsFooter}
    </>
  );
}
