import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { MEMORIAL_PATH, useMemorial } from '../../context/MemorialContext';

/** Center jewel — eyes only, no label */
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

const eyesItem = { path: MEMORIAL_PATH, label: '' };

const allItems = [...leftItems, eyesItem, ...rightItems];

/** Two blue eyes — Atatürk's gaze */
function EyesIcon() {
  return (
    <svg
      className="site-nav__eyes"
      width="28"
      height="12"
      viewBox="0 0 28 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="7" cy="6" rx="5.2" ry="4.6" fill="#1e3a5f" stroke="#5b8fbf" strokeWidth="1" />
      <circle cx="7.6" cy="6" r="2.1" fill="#7eb6e8" />
      <circle cx="8.1" cy="5.4" r="0.7" fill="#e8f4ff" opacity="0.9" />

      <ellipse cx="21" cy="6" rx="5.2" ry="4.6" fill="#1e3a5f" stroke="#5b8fbf" strokeWidth="1" />
      <circle cx="21.6" cy="6" r="2.1" fill="#7eb6e8" />
      <circle cx="22.1" cy="5.4" r="0.7" fill="#e8f4ff" opacity="0.9" />
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
    const isEyes = item.path === MEMORIAL_PATH;
    const base = variant === 'desktop' ? 'site-nav__link' : 'site-nav__panel-link';
    const eyesClass = isEyes
      ? variant === 'desktop'
        ? ' site-nav__link--eyes'
        : ' site-nav__panel-link--eyes'
      : '';

    return (
      <a
        key={item.path}
        href={item.path}
        className={`${base}${active === item.path ? ' is-active' : ''}${eyesClass}`}
        onClick={handleNav(item.path)}
        aria-label={isEyes ? 'Atatürk' : undefined}
        title={isEyes ? 'Atatürk' : undefined}
      >
        {isEyes ? <EyesIcon /> : <span>{item.label}</span>}
      </a>
    );
  };

  return (
    <nav className={`site-nav${isQuiet ? ' site-nav--quiet' : ''}`} aria-label="Ana menü">
      <div className="site-nav__desktop">
        {leftItems.map((item) => renderLink(item, 'desktop'))}
        {renderLink(eyesItem, 'desktop')}
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
