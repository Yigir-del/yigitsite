import { useEffect, useState, useRef } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  type AnimationPlaybackControls,
} from 'framer-motion';
import { pointOnEdge, randomEdge, type Edge } from '../../utils/flightPath';
import { useMemorial } from '../../context/MemorialContext';

interface Drifter {
  id: string;
  type: 'github' | 'linkedin';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  rotation: number;
  tooltip: string;
  link: string;
}

const DRAG_CLICK_THRESHOLD = 8;

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function randomFlightPath(w: number, h: number) {
  const startEdge = randomEdge();
  const endEdge = randomEdge(startEdge);
  return {
    start: pointOnEdge(startEdge as Edge, w, h),
    end: pointOnEdge(endEdge, w, h),
  };
}

function ThrowableDrifter({
  d,
  onExpire,
}: {
  d: Drifter;
  onExpire: (id: string) => void;
}) {
  const x = useMotionValue(d.startX);
  const y = useMotionValue(d.startY);
  const rotate = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls[]>([]);
  const expireRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggedRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const cx = animate(x, d.endX, { duration: d.duration, ease: 'linear' });
    const cy = animate(y, d.endY, { duration: d.duration, ease: 'linear' });
    const cr = animate(rotate, d.rotation > 180 ? 360 : -360, {
      duration: d.duration,
      ease: 'linear',
    });
    controlsRef.current = [cx, cy, cr];

    expireRef.current = setTimeout(() => onExpire(d.id), d.duration * 1000);

    return () => {
      controlsRef.current.forEach((c) => c.stop());
      if (expireRef.current) clearTimeout(expireRef.current);
    };
  }, [d, onExpire, x, y, rotate]);

  const stopPath = () => {
    controlsRef.current.forEach((c) => c.stop());
    controlsRef.current = [];
    if (expireRef.current) clearTimeout(expireRef.current);
  };

  return (
    <motion.div
      role="link"
      tabIndex={0}
      title={d.tooltip}
      drag
      dragMomentum
      dragElastic={0.25}
      whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 80 }}
      style={{
        x,
        y,
        rotate,
        position: 'absolute',
        left: 0,
        top: 0,
        color: 'var(--text-muted)',
        pointerEvents: 'auto',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        padding: '1rem',
        borderRadius: '50%',
        zIndex: dragging ? 80 : 50,
        opacity: 1,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ opacity: { duration: 0.8 } }}
      onDragStart={() => {
        draggedRef.current = false;
        setDragging(true);
        stopPath();
      }}
      onDrag={(_e, info) => {
        if (Math.hypot(info.offset.x, info.offset.y) > DRAG_CLICK_THRESHOLD) {
          draggedRef.current = true;
        }
      }}
      onDragEnd={() => {
        setDragging(false);
        // After throw, linger then despawn (don't open link)
        expireRef.current = setTimeout(() => onExpire(d.id), 8000);
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedRef.current) return;
        window.open(d.link, '_blank', 'noopener,noreferrer');
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (draggedRef.current) return;
        window.open(d.link, '_blank', 'noopener,noreferrer');
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-main)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)';
      }}
    >
      {d.type === 'github' ? <GithubIcon /> : <LinkedinIcon />}
    </motion.div>
  );
}

export default function SocialDrifters() {
  const { isQuiet } = useMemorial();
  const [drifters, setDrifters] = useState<Drifter[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (isQuiet) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setDrifters([]);
      return;
    }

    let cancelled = false;

    const spawnDrifter = () => {
      if (cancelled) return;
      setDrifters((prev) => {
        if (prev.length >= 2) return prev;

        const type = Math.random() > 0.5 ? 'github' : 'linkedin';
        const tooltip = type === 'github' ? "GitHub'a uğra." : 'LinkedIn tarafı.';
        const link =
          type === 'github'
            ? 'https://github.com/Yigir-del'
            : 'https://www.linkedin.com/in/yigit-efe-altuntas/';

        const { start, end } = randomFlightPath(window.innerWidth, window.innerHeight);
        const duration = 18 + Math.random() * 16;

        return [
          ...prev,
          {
            id: Math.random().toString(36).slice(2, 11),
            type,
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
            duration,
            rotation: Math.random() * 360,
            tooltip,
            link,
          } satisfies Drifter,
        ];
      });
    };

    const first = setTimeout(function loop() {
      spawnDrifter();
      const next = setTimeout(loop, 9000 + Math.random() * 12000);
      timersRef.current.push(next);
    }, 3000);
    timersRef.current.push(first);

    return () => {
      cancelled = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isQuiet]);

  const expire = (id: string) => {
    setDrifters((prev) => prev.filter((d) => d.id !== id));
  };

  if (isQuiet) {
    return (
      <div className="social-respect">
        <a
          className="social-respect__icon social-respect__icon--github"
          href="https://github.com/Yigir-del"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <GithubIcon />
        </a>
        <a
          className="social-respect__icon social-respect__icon--linkedin"
          href="https://www.linkedin.com/in/yigit-efe-altuntas/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          <LinkedinIcon />
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {drifters.map((d) => (
        <ThrowableDrifter key={d.id} d={d} onExpire={expire} />
      ))}
    </div>
  );
}
