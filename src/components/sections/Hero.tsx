export default function Hero() {
  return (
    <section
      style={{
        minHeight: '130vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        paddingBottom: '18vh',
      }}
    >
      <h1
        className="glitch"
        data-text="Düşüncelerimi biriktiriyorum."
        style={{ marginBottom: '1rem' }}
      >
        Düşüncelerimi biriktiriyorum.
      </h1>
      <h2 style={{ color: 'var(--text-muted)' }}>Bazıları bana ait.</h2>
      <div className="handwriting" style={{ marginTop: '3rem', opacity: 0.7 }}>
        (buralarda bir şeyler gizli)
      </div>
    </section>
  );
}
