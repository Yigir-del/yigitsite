import { useCallback, useEffect, useRef, useState } from 'react';
import { APP_EVENTS, isEditableTarget } from '../../utils/events';
import { unlockAchievement } from '../../features/achievements/achievementStore';

export default function EasterEggs() {
  const bufferRef = useRef('');
  const [terminalMode, setTerminalMode] = useState(false);

  const activateSudoTerminal = useCallback(() => {
    bufferRef.current = '';
    unlockAchievement('sudo_discovered');
    setTerminalMode(true);
  }, []);

  const activateMeaning42 = useCallback(() => {
    bufferRef.current = '';
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert('Hayatın anlamını buldun. Ama gizli sayfayı henüz değil.');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (terminalMode) return;
      if (isEditableTarget(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;

      const nextBuffer = (bufferRef.current + e.key.toLowerCase()).slice(-15);

      if (nextBuffer.includes('sudo')) {
        activateSudoTerminal();
      } else if (nextBuffer.includes('yardim') || nextBuffer.includes('help')) {
        bufferRef.current = '';
        if (typeof window !== 'undefined' && typeof window.alert === 'function') {
          window.alert('Yardım edecek kimse yok.');
        }
      } else if (nextBuffer.includes('42')) {
        activateMeaning42();
      } else {
        bufferRef.current = nextBuffer;
      }
    };

    const handleSudoEvent = () => activateSudoTerminal();
    const handle42Event = () => activateMeaning42();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(APP_EVENTS.SUDO_TERMINAL, handleSudoEvent);
    window.addEventListener(APP_EVENTS.MEANING_42, handle42Event);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(APP_EVENTS.SUDO_TERMINAL, handleSudoEvent);
      window.removeEventListener(APP_EVENTS.MEANING_42, handle42Event);
    };
  }, [terminalMode, activateSudoTerminal, activateMeaning42]);

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.75rem',
          }}
        >
          <p style={{ margin: 0 }}>root@oda:~# Bağlantı kuruldu.</p>
          <button
            type="button"
            onClick={() => setTerminalMode(false)}
            aria-label="Terminalden çık"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 255, 0, 0.45)',
              color: '#0f0',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            [exit]
          </button>
        </div>
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
