/** Shared flight helpers for floating UI icons */

export type Edge = 'left' | 'right' | 'top' | 'bottom';

export function pointOnEdge(edge: Edge, w: number, h: number, pad = 90) {
  switch (edge) {
    case 'left':
      return { x: -pad, y: Math.random() * h };
    case 'right':
      return { x: w + pad, y: Math.random() * h };
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
 * Edge → opposite/other edge flight so icons leave the page and re-enter elsewhere.
 * Prefer left↔right so they keep sweeping instead of clustering mid-screen.
 */
export function planCrossFlight(
  lastExit?: Edge,
  opts: { durationMin?: number; durationMax?: number; preferHorizontal?: boolean } = {}
): CrossFlight {
  const {
    durationMin = 9,
    durationMax = 14,
    preferHorizontal = true,
  } = opts;

  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;

  let enter: Edge;
  let exit: Edge;

  if (preferHorizontal && Math.random() < 0.75) {
    // Re-enter from a side (avoid coming back from the edge we just exited when possible)
    const sides: Edge[] = ['left', 'right'];
    enter =
      lastExit === 'left' || lastExit === 'right'
        ? (lastExit === 'left' ? 'right' : 'left')
        : sides[Math.floor(Math.random() * 2)];
    exit = enter === 'left' ? 'right' : 'left';
  } else {
    enter = randomEdge(lastExit);
    exit = randomEdge(enter);
  }

  const from = pointOnEdge(enter, w, h, 110);
  const to = pointOnEdge(exit, w, h, 110);
  // Drift vertically a bit so paths aren't flat tunnels through the hero
  if (enter === 'left' || enter === 'right') {
    from.y = h * (0.08 + Math.random() * 0.84);
    to.y = h * (0.08 + Math.random() * 0.84);
  }

  const duration = durationMin + Math.random() * (durationMax - durationMin);
  return { from, to, enter, exit, duration };
}
