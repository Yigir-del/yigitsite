export default function Hero() {
  return (
    <section style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '1.5rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent-muted-blue)', marginBottom: '1rem', opacity: 0.8 }}>
        Domain Expansion
      </div>
      <h1 className="glitch" data-text="Ryōiki Tenkai." style={{ marginBottom: '1rem', fontSize: 'clamp(4rem, 10vw, 8rem)' }}>
        Ryōiki Tenkai.
      </h1>
      <h2 style={{ color: 'var(--text-main)', fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '2px', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
        Muryōkūsho.
      </h2>
      <div className="handwriting" style={{ marginTop: '3rem', opacity: 0.5 }}>
        (Domain Expansion: Infinite Void)
      </div>
    </section>
  );
}
