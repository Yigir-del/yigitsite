import { useState } from 'react';
import SEOHead from '../../seo/SEOHead';

export default function Contact() {
  const [identity, setIdentity] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('misafir@oda:~$ ./mesaj_gonder.sh');
  const [busy, setBusy] = useState(false);

  const handleAction = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: identity.trim(), passphrase: message }),
      });
      if (res.ok) {
        try {
          localStorage.setItem('yigit_admin', 'true');
        } catch {
          /* private mode */
        }
        setStatus('root@oda:~$ Yetki doğrulandı. Admin moduna geçildi.');
        window.setTimeout(() => {
          alert('Sisteme Hoş Geldin Yaratıcı!');
          window.location.reload();
        }, 500);
        return;
      }
    } catch {
      /* fall through to mail */
    }

    setStatus('misafir@oda:~$ Mail sayfası açılıyor...');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=81altuntas38@gmail.com&su=${encodeURIComponent('Yiğit Altuntaş İletişim')}&body=${encodeURIComponent(message)}`;
    const link = document.createElement('a');
    link.href = gmailUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      setIdentity('');
      setMessage('');
      setStatus('misafir@oda:~$ ./mesaj_gonder.sh');
      setBusy(false);
    }, 2000);
  };

  return (
    <section className="contact-section" aria-label="İletişim" style={{
      minHeight: '100vh',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <SEOHead page="contact" />
      <h1 className="glitch" data-text="İletişim" style={{ marginBottom: '3rem' }}>İletişim</h1>
      
      <div className="contact-terminal" style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        color: '#0f0',
        fontFamily: 'monospace',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid rgba(0, 255, 0, 0.2)',
        boxSizing: 'border-box',
      }}>
        <p style={{ overflowWrap: 'anywhere' }}>{status}</p>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="contact-identity">Kimlik: </label>
          <input 
            id="contact-identity"
            type="text" 
            value={identity}
            onChange={e => setIdentity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleAction();
              }
            }}
            className="contact-id-input"
            autoComplete="username"
            maxLength={80}
            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(0, 255, 0, 0.5)', color: '#0f0', outline: 'none', width: '200px' }} 
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="contact-message">Mesaj: </label>
          <textarea 
            id="contact-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={2000}
            style={{ background: 'transparent', border: '1px solid rgba(0, 255, 0, 0.5)', color: '#0f0', outline: 'none', minHeight: '100px', marginTop: '0.5rem', padding: '0.5rem', width: '100%', boxSizing: 'border-box' }} 
          />
        </div>
        <button 
          type="button"
          onClick={() => void handleAction()}
          disabled={busy}
          style={{ marginTop: '1.5rem', background: 'rgba(0, 255, 0, 0.1)', color: '#0f0', border: '1px solid #0f0', padding: '0.5rem 1rem', cursor: busy ? 'wait' : 'pointer', transition: 'background 0.3s' }} 
          onMouseEnter={e => e.currentTarget.style.background = '#0f0'} 
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'}
        >
          ÇALIŞTIR
        </button>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Veya doğrudan bana ulaş:</p>
        <a href="mailto:81altuntas38@gmail.com" className="contact-mail-link" style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-title)', 
          color: 'var(--text-primary)', 
          textDecoration: 'none',
          borderBottom: '2px solid var(--accent-muted-blue)',
          paddingBottom: '0.2rem',
          display: 'inline-block',
          marginBottom: '4rem'
        }}>
          81altuntas38@gmail.com
        </a>

        <h3 style={{ fontSize: '1.5rem' }}>
          <a href="mailto:81altuntas38@gmail.com?subject=Kahve%20Ismarla" style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--accent-muted-blue)' }}>Bana bir kahve ısmarla.</a>
        </h3>
        <h3 style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ya da ısmarlama.</h3>
        <h3 style={{ color: 'var(--text-muted)', opacity: 0.5 }}>Su da işimi görür.</h3>
      </div>
    </section>
  );
}
