import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: pos.y,
      left: pos.x,
      width: '8px',
      height: '8px',
      background: 'var(--text-main)',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 9999,
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.2s, height 0.2s',
      mixBlendMode: 'difference'
    }} />
  );
}
