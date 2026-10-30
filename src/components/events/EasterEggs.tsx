import { useEffect, useRef, useState } from 'react';
import { isEditableTarget } from '../../utils/events';

export default function EasterEggs() {
  const bufferRef = useRef('');
  const [terminalMode, setTerminalMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (terminalMode) return;
      if (isEditableTarget(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;

      const nextBuffer = (bufferRef.current + e.key.toLowerCase()).slice(-15);

      if (nextBuffer.includes('sudo')) {
        bufferRef.current = '';
        setTerminalMode(true);
      } else if (nextBuffer.includes('yardim') || nextBuffer.includes('help')) {
        bufferRef.current = '';
        alert('Yardım edecek kimse yok.');
      } else if (nextBuffer.includes('42')) {
        bufferRef.current = '';
        alert('Hayatın anlamını buldun. Ama gizli sayfayı henüz değil.');
      } else {
        bufferRef.current = nextBuffer;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [terminalMode]);

  if (terminalMode) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#000',
          color: '#0f0',
          fontFamily: 'monospace',
          zIndex: 10000,
          padding: '2rem',
        }}
      >
        <p>root@oda:~# Bağlantı kuruldu.</p>
        <p>Geri dönmek için exit yaz.</p>
        <input
          autoFocus
          aria-label="Terminal komut satırı"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#0f0',
            outline: 'none',
            width: '100%',
            fontFamily: 'monospace',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setTerminalMode(false);
            } else if (
              e.key === 'Enter' &&
              e.currentTarget.value.trim().toLowerCase() === 'exit'
            ) {
              setTerminalMode(false);
            }
          }}
        />
      </div>
    );
  }

  return null;
}
