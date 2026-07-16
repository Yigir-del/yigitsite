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
    <>
      <div
        style={{
          position: 'fixed',
          top: pos.y,
          left: pos.x,
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, var(--cursor-glow) 0%, transparent 70%)`,
          opacity: 0.55,
          transition: 'background 1.2s ease',
        }}
      />
      <div
        style={{
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
          boxShadow: '0 0 12px var(--cursor-glow)',
          transition: 'background 1.2s ease, box-shadow 1.2s ease',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
}
