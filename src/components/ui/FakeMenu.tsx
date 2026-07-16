import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function FakeMenu() {
  const [menuData, setMenuData] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setMenuData({ x: e.clientX, y: e.clientY, show: true });
    };
    const handleClick = () => setMenuData(prev => ({ ...prev, show: false }));

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 2500);
  };

  return (
    <>
      {menuData.show && (
        <div style={{
          position: 'fixed',
          top: menuData.y,
          left: menuData.x,
          background: 'var(--bg-soft-gray)',
          border: '1px solid var(--accent-muted-blue)',
          padding: '0.5rem',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          minWidth: '150px'
        }}>
          <div style={{ padding: '0.5rem', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '4px' }} className="menu-item" onClick={() => triggerAlert('Gerçekliği inceliyorum... 👁️')}>Öğeyi İncele</div>
          <div style={{ padding: '0.5rem', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '4px' }} className="menu-item" onClick={() => triggerAlert('Aslında her şey bir hiçlikten ibaret. 🌌')}>Kaynağı Görüntüle</div>
          <div style={{ padding: '0.5rem', cursor: 'pointer', color: 'var(--accent-soft-white)', transition: 'background 0.2s', borderRadius: '4px' }} className="menu-item" onClick={() => window.dispatchEvent(new Event('world-flip'))}>Siteyi Boz / Düzenle</div>
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
            fontSize: '3rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            textAlign: 'center',
            textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          {alertMsg}
        </motion.div>
      )}
    </>
  );
}
