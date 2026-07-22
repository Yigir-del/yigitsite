import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { MEMORIAL_PATH, useMemorial } from '../../context/MemorialContext';

/** Miras sits dead-center of the bar */
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

const mirasItem = { path: MEMORIAL_PATH, label: 'Miras' };

const allItems = [...leftItems, mirasItem, ...rightItems];

function CrownIcon() {
  return (
    <svg
      className="site-nav__crown"
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1.2 9.2 L2.1 3.4 L4.8 6.2 L7 1.6 L9.2 6.2 L11.9 3.4 L12.8 9.2 Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M1.2 9.2 H12.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
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
    const isMiras = item.path === MEMORIAL_PATH;
    const base = variant === 'desktop' ? 'site-nav__link' : 'site-nav__panel-link';
    const mirasClass = isMiras
      ? variant === 'desktop'
        ? ' site-nav__link--miras'
        : ' site-nav__panel-link--miras'
      : '';

    return (
      <a
        key={item.path}
        href={item.path}
        className={`${base}${active === item.path ? ' is-active' : ''}${mirasClass}`}
        onClick={handleNav(item.path)}
      >
        {isMiras && <CrownIcon />}
        <span>{item.label}</span>
      </a>
    );
  };

  return (
    <nav className={`site-nav${isQuiet ? ' site-nav--quiet' : ''}`} aria-label="Ana menü">
      <div className="site-nav__desktop">
        {leftItems.map((item) => renderLink(item, 'desktop'))}
        {renderLink(mirasItem, 'desktop')}
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
