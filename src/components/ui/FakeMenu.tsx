import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MENU_WIDTH = 185;
const MENU_HEIGHT = 96;
const VIEWPORT_MARGIN = 12;

export default function FakeMenu() {
  const [menuData, setMenuData] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false,
  });
  const [alertMsg, setAlertMsg] = useState('');
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN);
      const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - MENU_HEIGHT - VIEWPORT_MARGIN);
      const clampedX = Math.min(Math.max(VIEWPORT_MARGIN, e.clientX), maxX);
      const clampedY = Math.min(Math.max(VIEWPORT_MARGIN, e.clientY), maxY);
      setMenuData({ x: clampedX, y: clampedY, show: true });
    };
    const handleClose = () => setMenuData((prev) => (prev.show ? { ...prev, show: false } : prev));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setAlertMsg('');
      alertTimerRef.current = null;
    }, 2500);
  };

  return (
    <>
      {menuData.show && (
        <div
          role="menu"
          aria-label="Bağlam menüsü"
          style={{
            position: 'fixed',
            top: menuData.y,
            left: menuData.x,
            background: 'var(--bg-soft-gray)',
            border: '1px solid var(--accent-muted-blue)',
            borderRadius: '8px',
            padding: '0.5rem',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            minWidth: '160px',
            boxShadow: '0 10px 30px var(--shadow)',
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            style={{
              padding: '0.5rem 0.65rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              borderRadius: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              textAlign: 'left',
            }}
            onClick={() => triggerAlert('Gerçekliği inceliyorum... 👁️')}
          >
            Öğeyi İncele
          </button>
          <button
            type="button"
            role="menuitem"
            className="menu-item"
            style={{
              padding: '0.5rem 0.65rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
              borderRadius: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              textAlign: 'left',
            }}
            onClick={() => triggerAlert('Aslında her şey bir hiçlikten ibaret. 🌌')}
          >
            Kaynağı Görüntüle
          </button>
        </div>
      )}

      {alertMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
          animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: 99999,
            pointerEvents: 'none',
            fontFamily: 'var(--font-title)',
            fontSize: 'clamp(1.25rem, 5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--text-main)',
            textAlign: 'center',
            textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
            whiteSpace: 'normal',
            maxWidth: '90vw',
            padding: '0 1rem',
          }}
        >
          {alertMsg}
        </motion.div>
      )}
    </>
  );
}
