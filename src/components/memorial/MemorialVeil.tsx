import { useMemorial } from '../../context/MemorialContext';

/**
 * Full-screen veil that darkens the living world into silence,
 * then lifts when life returns after leaving the memorial.
 */
export default function MemorialVeil() {
  const { phase } = useMemorial();
  const active = phase === 'freezing' || phase === 'thawing' || phase === 'memorial';

  return (
    <div
      className={`memorial-veil memorial-veil--${phase}${active ? ' is-active' : ''}`}
      aria-hidden
    />
  );
}
