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
      <h1 className="glitch" data-text="İzler burada kalır." style={{ marginBottom: '1rem' }}>
        İzler burada kalır.
      </h1>
      <h2 style={{ color: 'var(--text-muted)' }}>
        Bazıları senin olabilir.
      </h2>
      <div className="handwriting" style={{ marginTop: '3rem', opacity: 0.7 }}>
        (aşağıda bir defter var)
      </div>
    </section>
  );
}
