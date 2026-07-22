import { useEffect, useRef } from 'react';

/** DOM-driven cursor — rAF only while the pointer is moving. */
export default function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const running = useRef(false);
  const idleTimer = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const stop = () => {
      running.current = false;
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      if (glowRef.current) glowRef.current.style.willChange = 'auto';
      if (dotRef.current) dotRef.current.style.willChange = 'auto';
    };

    const tick = () => {
      const { x, y } = pos.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running.current) return;
      running.current = true;
      if (glowRef.current) glowRef.current.style.willChange = 'transform';
      if (dotRef.current) dotRef.current.style.willChange = 'transform';
      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      start();
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(stop, 120);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMove);
      window.clearTimeout(idleTimer.current);
      stop();
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
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
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
          transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)',
        }}
      />
    </>
  );
}
