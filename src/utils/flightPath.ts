/** Shared flight helpers for floating UI icons */

export type Edge = 'left' | 'right' | 'top' | 'bottom';

function peripheralY(h: number) {
  if (Math.random() < 0.5) return h * (0.08 + Math.random() * 0.18);
  return h * (0.72 + Math.random() * 0.18);
}

function midScreenPoint(w: number, h: number) {
  return {
    x: w * (0.28 + Math.random() * 0.44),
    y: h * (0.22 + Math.random() * 0.46),
  };
}

/** Spawn well outside the viewport so entry is never visible as a pop-in. */
export function pointOnEdge(edge: Edge, w: number, h: number, pad = 160) {
  switch (edge) {
    case 'left':
      return { x: -pad, y: peripheralY(h) };
    case 'right':
      return { x: w + pad, y: peripheralY(h) };
    case 'top':
      return { x: w * (0.1 + Math.random() * 0.8), y: -pad };
    case 'bottom':
    default:
      return { x: w * (0.1 + Math.random() * 0.8), y: h + pad };
  }
}

export function randomEdge(exclude?: Edge | Edge[]): Edge {
  const blocked = new Set(Array.isArray(exclude) ? exclude : exclude ? [exclude] : []);
  const edges = (['left', 'right', 'top', 'bottom'] as Edge[]).filter((e) => !blocked.has(e));
  const pool = edges.length ? edges : (['left', 'right', 'top', 'bottom'] as Edge[]);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomOnScreen(margin = 0.12) {
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  return {
    x: w * margin + Math.random() * w * (1 - margin * 2),
    y: h * margin + Math.random() * h * (1 - margin * 2),
  };
}

export function randomOffscreenStart(exclude?: Edge | Edge[]) {
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  return pointOnEdge(randomEdge(exclude), w, h, 180);
}

/** Wander: leave through an edge, then re-enter from a different edge onto the screen. */
export function planWanderHop(opts: { preferLeave?: boolean } = {}): {
  point: { x: number; y: number };
  duration: number;
} {
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  const leave = opts.preferLeave ?? Math.random() < 0.45;

  if (leave) {
    return {
      point: pointOnEdge(randomEdge(), w, h, 180),
      duration: 10 + Math.random() * 6,
    };
  }

  return {
    point: randomOnScreen(0.14),
    duration: 11 + Math.random() * 7,
  };
}

export type CrossFlight = {
  enter: Edge;
  exit: Edge;
  /** Keyframe positions for Framer Motion */
  x: number[];
  y: number[];
  times: number[];
  duration: number;
};

/** Continue from a thrown/dragged point toward a random exit edge. */
export function planFlightFromPoint(
  point: { x: number; y: number },
  opts: { durationMin?: number; durationMax?: number } = {}
): CrossFlight {
  const { durationMin = 12, durationMax = 18 } = opts;
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;

  const exit = randomEdge();
  const to = pointOnEdge(exit, w, h, 140);
  const duration = durationMin + Math.random() * (durationMax - durationMin);

  // Sometimes drift through mid before leaving
  if (Math.random() < 0.4) {
    const mid = midScreenPoint(w, h);
    return {
      enter: 'left',
      exit,
      x: [point.x, mid.x, mid.x, to.x],
      y: [point.y, mid.y, mid.y, to.y],
      times: [0, 0.3, 0.5, 1],
      duration,
    };
  }

  return {
    enter: 'left',
    exit,
    x: [point.x, to.x],
    y: [point.y, to.y],
    times: [0, 1],
    duration,
  };
}

/**
 * Slow edge flight. Often detours to mid-screen, hangs a bit, then leaves.
 */
export function planCrossFlight(
  lastExit?: Edge,
  opts: { durationMin?: number; durationMax?: number; preferHorizontal?: boolean } = {}
): CrossFlight {
  const {
    durationMin = 16,
    durationMax = 24,
    preferHorizontal = true,
  } = opts;

  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  const pad = 180;

  let enter: Edge;
  let exit: Edge;

  if (preferHorizontal && Math.random() < 0.8) {
    enter =
      lastExit === 'left'
        ? 'right'
        : lastExit === 'right'
          ? 'left'
          : Math.random() < 0.5
            ? 'left'
            : 'right';
    exit = enter === 'left' ? 'right' : 'left';
  } else {
    const opposite: Record<Edge, Edge> = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top',
    };
    enter = randomEdge(lastExit);
    exit = Math.random() < 0.75 ? opposite[enter] : randomEdge(enter);
  }

  const from = pointOnEdge(enter, w, h, pad);
  const to = pointOnEdge(exit, w, h, pad);

  if ((enter === 'left' || enter === 'right') && (exit === 'left' || exit === 'right')) {
    const y = peripheralY(h);
    // If we linger mid, edge Y can differ; otherwise keep a gentle lane
    if (Math.random() >= 0.55) {
      from.y = y;
      to.y = y + (Math.random() - 0.5) * h * 0.1;
    }
  }

  const duration = durationMin + Math.random() * (durationMax - durationMin);
  const linger = Math.random() < 0.55;

  if (linger) {
    const mid = midScreenPoint(w, h);
    // Arrive mid → hold → leave
    const arrive = 0.28 + Math.random() * 0.1;
    const holdEnd = arrive + 0.18 + Math.random() * 0.12; // ~3–6s pause depending on duration
    return {
      enter,
      exit,
      x: [from.x, mid.x, mid.x, to.x],
      y: [from.y, mid.y, mid.y, to.y],
      times: [0, arrive, Math.min(holdEnd, 0.72), 1],
      duration,
    };
  }

  // Soft curve through a mild offset so it isn't a rigid straight dash
  const drift = {
    x: (from.x + to.x) / 2 + (Math.random() - 0.5) * w * 0.15,
    y: (from.y + to.y) / 2 + (Math.random() - 0.5) * h * 0.2,
  };

  return {
    enter,
    exit,
    x: [from.x, drift.x, to.x],
    y: [from.y, drift.y, to.y],
    times: [0, 0.5, 1],
    duration,
  };
}
