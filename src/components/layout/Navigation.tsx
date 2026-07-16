import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/hakkimda', label: 'Hakkımda' },
  { path: '/projeler', label: 'Projeler' },
  { path: '/dusunceler', label: 'Düşünceler' },
  { path: '/studyom', label: 'Stüdyom' },
  { path: '/iletisim', label: 'İletişim' },
];

export default function Navigation() {
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setActive(location.pathname);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <nav className="site-nav" aria-label="Ana menü">
      {/* Desktop pill */}
      <div className="site-nav__desktop">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`site-nav__link${active === item.path ? ' is-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className={`site-nav__burger${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls="site-nav-panel"
        aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile panel */}
      <div
        id="site-nav-panel"
        className={`site-nav__panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        hidden={!open}
      >
        <div className="site-nav__panel-inner">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`site-nav__panel-link${active === item.path ? ' is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
