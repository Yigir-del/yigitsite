import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { MEMORIAL_PATH, useMemorial } from '../../context/MemorialContext';

const leftItems = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/hakkimda', label: 'Hakkımda' },
  { path: '/projeler', label: 'Projeler' },
];

const rightItems = [
  { path: '/dusunceler', label: 'Düşünceler' },
  { path: '/studyom', label: 'Stüdyom' },
  { path: '/iletisim', label: 'İletişim' },
];

const memorialItem = { path: MEMORIAL_PATH, label: '' };

const allItems = [...leftItems, memorialItem, ...rightItems];

/** Minimal Anıtkabir silhouette — Hall of Honor only (no flanking towers) */
function AnitkabirIcon() {
  return (
    <svg
      className="site-nav__anitkabir"
      width="36"
      height="22"
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Central hall roof */}
      <path d="M1 5.5 L10 0.8 L19 5.5 Z" fill="currentColor" />
      {/* Columns */}
      <rect x="2" y="5.5" width="1.6" height="7.2" fill="currentColor" opacity="0.9" />
      <rect x="5" y="5.5" width="1.6" height="7.2" fill="currentColor" opacity="0.9" />
      <rect x="8.2" y="5.5" width="1.6" height="7.2" fill="currentColor" opacity="0.9" />
      <rect x="11.4" y="5.5" width="1.6" height="7.2" fill="currentColor" opacity="0.9" />
      <rect x="14.6" y="5.5" width="1.6" height="7.2" fill="currentColor" opacity="0.9" />
      <rect x="17" y="5.5" width="1.6" height="7.2" fill="currentColor" opacity="0.9" />
      {/* Base / steps */}
      <rect x="0.5" y="12.7" width="19" height="1.1" rx="0.3" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export default function Navigation() {
  const location = useLocation();
  const { navigateRespectfully, isQuiet } = useMemorial();
  const [active, setActive] = useState(location.pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setActive(location.pathname === '/atam' ? MEMORIAL_PATH : location.pathname);
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

  const renderLink = (item: { path: string; label: string }, variant: 'desktop' | 'panel') => {
    const isMemorial = item.path === MEMORIAL_PATH;
    const base = variant === 'desktop' ? 'site-nav__link' : 'site-nav__panel-link';
    const memorialClass = isMemorial
      ? variant === 'desktop'
        ? ' site-nav__link--anitkabir'
        : ' site-nav__panel-link--anitkabir'
      : '';

    return (
      <a
        key={item.path}
        href={item.path}
        className={`${base}${active === item.path ? ' is-active' : ''}${memorialClass}`}
        onClick={handleNav(item.path)}
        aria-label={isMemorial ? 'Anıtkabir — Atatürk' : undefined}
        title={isMemorial ? 'Anıtkabir' : undefined}
      >
        {isMemorial ? <AnitkabirIcon /> : <span>{item.label}</span>}
      </a>
    );
  };

  return (
    <nav className={`site-nav${isQuiet ? ' site-nav--quiet' : ''}`} aria-label="Ana menü">
      <div className="site-nav__desktop">
        {leftItems.map((item) => renderLink(item, 'desktop'))}
        {renderLink(memorialItem, 'desktop')}
        {rightItems.map((item) => renderLink(item, 'desktop'))}
      </div>

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

      <div
        id="site-nav-panel"
        className={`site-nav__panel${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        hidden={!open}
      >
        <div className="site-nav__panel-inner">
          {allItems.map((item) => renderLink(item, 'panel'))}
        </div>
      </div>
    </nav>
  );
}
