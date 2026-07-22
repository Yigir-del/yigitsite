import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { MEMORIAL_PATH, useMemorial } from '../../context/MemorialContext';

const navItems = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/hakkimda', label: 'Hakkımda' },
  { path: '/projeler', label: 'Projeler' },
  { path: '/dusunceler', label: 'Düşünceler' },
  { path: '/studyom', label: 'Stüdyom' },
  { path: '/iletisim', label: 'İletişim' },
  { path: MEMORIAL_PATH, label: 'ATAM' },
];

export default function Navigation() {
  const location = useLocation();
  const { navigateRespectfully, isQuiet } = useMemorial();
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

  const handleNav = (path: string) => (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    navigateRespectfully(path);
  };

  return (
    <nav className={`site-nav${isQuiet ? ' site-nav--memorial' : ''}`} aria-label="Ana menü">
      {/* Desktop pill */}
      <div className="site-nav__desktop">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`site-nav__link${active === item.path ? ' is-active' : ''}${
              item.path === MEMORIAL_PATH ? ' site-nav__link--atam' : ''
            }`}
            onClick={handleNav(item.path)}
          >
            {item.label}
          </a>
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
            <a
              key={item.path}
              href={item.path}
              className={`site-nav__panel-link${active === item.path ? ' is-active' : ''}${
                item.path === MEMORIAL_PATH ? ' site-nav__panel-link--atam' : ''
              }`}
              onClick={handleNav(item.path)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
