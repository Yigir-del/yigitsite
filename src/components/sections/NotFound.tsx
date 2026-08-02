import { Link } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import { Home, FolderGit2 } from 'lucide-react';

export default function NotFound() {
  return (
    <section
      className="not-found-section"
      aria-label="Sayfa Bulunamadı"
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
      }}
    >
      <SEOHead page="notFound" />

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <h1
          className="glitch"
          data-text="404"
          style={{
            fontSize: 'clamp(5rem, 15vw, 9rem)',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
            color: 'var(--text-primary)',
            letterSpacing: '4px',
          }}
        >
          404
        </h1>
      </div>

      <h2
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          marginBottom: '1rem',
          color: 'var(--text-primary)',
        }}
      >
        Sayfa Bulunamadı
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '480px',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}
      >
        Aradığınız adres silinmiş, değiştirilmiş veya hiç var olmamış olabilir.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            background: 'var(--accent-muted-blue, #3b82f6)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'transform 0.2s, opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Home size={18} aria-hidden="true" />
          Ana Sayfaya Dön
        </Link>

        <Link
          to="/projeler"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.15))',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'transform 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <FolderGit2 size={18} aria-hidden="true" />
          Projelerim
        </Link>
      </div>
    </section>
  );
}
