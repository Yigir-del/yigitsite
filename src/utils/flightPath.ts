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
