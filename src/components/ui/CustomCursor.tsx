import { useEffect, useRef } from 'react';

/** DOM-driven cursor — no React re-render per mousemove */
export default function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    const tick = () => {
      const { x, y } = pos.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="custom-cursor custom-cursor--glow"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          background: 'radial-gradient(circle, var(--cursor-glow) 0%, transparent 70%)',
          opacity: 0.45,
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        className="custom-cursor custom-cursor--dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          background: 'var(--text-main)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 0 10px var(--cursor-glow)',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
    </>
  );
}
