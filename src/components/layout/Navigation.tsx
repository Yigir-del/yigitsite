import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/hakkimda', label: 'Hakkımda' },
    { path: '/projeler', label: 'Projeler' },
    { path: '/dusunceler', label: 'Düşünceler' },
    { path: '/studyom', label: 'Stüdyom' },
    { path: '/iletisim', label: 'İletişim' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <div style={{
        display: 'flex',
        gap: '2rem',
        background: 'rgba(10, 10, 10, 0.4)',
        padding: '1rem 2rem',
        borderRadius: '50px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        pointerEvents: 'auto'
      }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: active === item.path ? 'var(--text-primary)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              letterSpacing: '0.05em',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => {
              if (active !== item.path) {
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
