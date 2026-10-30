/**
 * Shared semantic motion tokens and easing curves.
 * Preserves distinct durations for environmental flights, world-flip, and memorial transitions
 * while standardizing UI feedback, modals, and route transitions.
 */

export const MOTION_DURATION = {
  instant: 0.12,
  micro: 0.18,
  fast: 0.28,
  standard: 0.42,
  slow: 0.8,
  cinematic: 1.5,
} as const;

export const MOTION_EASE = {
  /** Smooth exponential ease-out used across page transitions, lightboxes, and note home-glide */
  outExpo: [0.22, 1, 0.36, 1] as const,
  /** Crisp deceleration for overlays and panels */
  outQuint: [0.16, 1, 0.3, 1] as const,
  /** Springy overshoot for interactive cards and speech bubbles */
  springPop: [0.175, 0.885, 0.32, 1.275] as const,
} as const;
