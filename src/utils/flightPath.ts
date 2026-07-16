/** Shared flight helpers for floating UI icons */

export type Edge = 'left' | 'right' | 'top' | 'bottom';

/** Prefer top/bottom bands so flyers don't hang over the hero center. */
function peripheralY(h: number) {
  if (Math.random() < 0.5) return h * (0.06 + Math.random() * 0.2);
  return h * (0.72 + Math.random() * 0.2);
}

export function pointOnEdge(edge: Edge, w: number, h: number, pad = 120) {
  switch (edge) {
    case 'left':
      return { x: -pad, y: peripheralY(h) };
    case 'right':
      return { x: w + pad, y: peripheralY(h) };
    case 'top':
      return { x: Math.random() * w, y: -pad };
    case 'bottom':
    default:
      return { x: Math.random() * w, y: h + pad };
  }
}

export function randomEdge(exclude?: Edge): Edge {
  const edges: Edge[] = ['left', 'right', 'top', 'bottom'].filter(
    (e) => e !== exclude
  ) as Edge[];
  return edges[Math.floor(Math.random() * edges.length)];
}

export function randomOnScreen(margin = 0.12) {
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  return {
    x: w * margin + Math.random() * w * (1 - margin * 2),
    y: h * margin + Math.random() * h * (1 - margin * 2),
  };
}

/** Start just off a random edge (never top-left 0,0) */
export function randomOffscreenStart() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  return pointOnEdge(randomEdge(), w, h);
}

export type CrossFlight = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  enter: Edge;
  exit: Edge;
  duration: number;
};

/**
 * Full edge→edge sweep. Always leaves the viewport; never parks mid-screen.
 */
export function planCrossFlight(
  lastExit?: Edge,
  opts: { durationMin?: number; durationMax?: number; preferHorizontal?: boolean } = {}
): CrossFlight {
  const {
    durationMin = 7,
    durationMax = 11,
    preferHorizontal = true,
  } = opts;

  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  const pad = 140;

  let enter: Edge;
  let exit: Edge;

  if (preferHorizontal && Math.random() < 0.85) {
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
    enter = randomEdge(lastExit);
    // Prefer opposite edge so they always cross the whole page
    const opposite: Record<Edge, Edge> = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top',
    };
    exit = Math.random() < 0.8 ? opposite[enter] : randomEdge(enter);
  }

  const from = pointOnEdge(enter, w, h, pad);
  const to = pointOnEdge(exit, w, h, pad);

  // Keep a clear vertical lane for the whole crossing
  if ((enter === 'left' || enter === 'right') && (exit === 'left' || exit === 'right')) {
    const y = peripheralY(h);
    from.y = y;
    to.y = y + (Math.random() - 0.5) * h * 0.12;
  }

  const duration = durationMin + Math.random() * (durationMax - durationMin);
  return { from, to, enter, exit, duration };
}
