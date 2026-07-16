/** Static watermark only — no theme switching */
export default function ThemeSelector() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '1.75rem',
        left: '1.75rem',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.55rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          opacity: 0.55,
          marginBottom: '0.25rem',
        }}
      >
        RYOIKI TENKAI
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          fontWeight: 300,
          color: 'var(--text-main)',
          letterSpacing: '0.18em',
          opacity: 0.9,
        }}
      >
        MURYOKUSHO
      </div>
    </div>
  );
}
