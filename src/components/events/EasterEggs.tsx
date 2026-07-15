import { useEffect, useState } from 'react';

export default function EasterEggs() {
  const [, setInputBuffer] = useState('');
  const [terminalMode, setTerminalMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setInputBuffer(prev => {
        const newBuffer = (prev + e.key).slice(-15);
        
        if (newBuffer.includes('sudo')) {
          setTerminalMode(true);
        } else if (newBuffer.includes('yardim') || newBuffer.includes('help')) {
          alert('Yardım edecek kimse yok.');
        } else if (newBuffer.includes('42')) {
          alert('Hayatın anlamını buldun. Ama gizli sayfayı henüz değil.');
        }
        
        return newBuffer;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (terminalMode) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#000', color: '#0f0', fontFamily: 'monospace',
        zIndex: 10000, padding: '2rem'
      }}>
        <p>root@oda:~# Bağlantı kuruldu.</p>
        <p>Geri dönmek için exit yaz.</p>
        <input 
          autoFocus 
          style={{ background: 'transparent', border: 'none', color: '#0f0', outline: 'none', width: '100%' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value === 'exit') {
              setTerminalMode(false);
            }
          }}
        />
      </div>
    );
  }

  return null;
}
