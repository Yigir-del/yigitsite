import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { upload } from '@vercel/blob/client';

interface StudioItem {
  id: string;
  type?: 'photo'; // Removed music
  src?: string;
  alt?: string;
  size: string;
  date?: string;
}

// Default items removed

export default function Studio() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<StudioItem[]>([]);
  
  // Photo Admin form state
  const [newAlt, setNewAlt] = useState('');
  const [newSize, setNewSize] = useState('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('yigit_admin') === 'true');
    
    // Fetch from Backend API
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      })
      .catch(() => setItems([]));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: newSize,
      });
      
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      const newItem: StudioItem = {
        id: Date.now().toString(), // temporary id until refresh
        type: 'photo',
        src: newBlob.url,
        alt: newAlt.trim() || 'İsimsiz Eser',
        size: newSize,
        date: formattedDate
      };

      setItems(prev => [newItem, ...prev]);
      
      setNewAlt('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Fotoğraf yüklenirken bir hata oluştu.');
    }
  };

  const deleteItem = async (id: string, src: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic delete
    setItems(prev => prev.filter(p => p.id !== id));
    
    try {
      await fetch(`/api/photos?id=${id}&url=${encodeURIComponent(src)}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };
  return (
    <section className="studio-section" style={{
      minHeight: '80vh',
      padding: '8rem 2rem 4rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem'
    }}>
      <h2 className="glitch" data-text="Stüdyom" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.8rem, 6vw, 2.5rem)' }}>
        Stüdyom
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontStyle: 'italic', textAlign: 'center' }}>
        Ortaya Karışık
      </p>

      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1200px', marginBottom: '2rem' }}>
          {/* Fotoğraf Ekleme Bölümü */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'rgba(10, 10, 15, 0.8)', 
              backdropFilter: 'blur(10px)',
              padding: '2rem', 
              borderRadius: '16px', 
              border: '1px solid var(--accent-pale-gray)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📷</span> Fotoğraf Paylaş
            </h3>
            <div className="studio-admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={newAlt} 
                onChange={e => setNewAlt(e.target.value)} 
                placeholder="Açıklama (Alt Text)"
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', borderRadius: '8px', transition: 'border 0.3s' }}
                onFocus={e => e.target.style.border = '1px solid var(--accent-pale-gray)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
              />
              <select
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <option value="small">Küçük (Kare)</option>
                <option value="medium">Orta (Kare)</option>
                <option value="large">Büyük (Dikey Uzun)</option>
              </select>
            </div>
            
            <div style={{ position: 'relative', marginTop: '1rem' }}>
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                title=" "
                style={{ 
                  position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2
                }}
              />
              <motion.div 
                whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(255,255,255,0.1)', borderColor: 'var(--accent-pale-gray)' }}
                whileTap={{ scale: 0.99 }}
                style={{ 
                  width: '100%', padding: '2rem', background: 'rgba(0,0,0,0.3)', 
                  border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', 
                  textAlign: 'center', color: 'var(--text-muted)', position: 'relative', zIndex: 1,
                  transition: 'border 0.3s'
                }}
              >
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✨</span>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>Bilgisayarından bir fotoğraf seç</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>veya sürükleyip buraya bırak</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        gridAutoRows: '250px'
      }}>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 5) * 0.1 }}
            whileHover={{ y: -10, scale: 1.02, zIndex: 10 }}
            onMouseEnter={(e) => {
              const img = e.currentTarget.querySelector('img');
              const overlay = e.currentTarget.querySelector('.overlay');
              if (img) img.style.filter = 'grayscale(0%) contrast(1.1)';
              if (overlay) (overlay as HTMLElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector('img');
              const overlay = e.currentTarget.querySelector('.overlay');
              if (img) img.style.filter = 'grayscale(80%) contrast(1.2)';
              if (overlay) (overlay as HTMLElement).style.opacity = '0';
            }}
            style={{
              gridRowEnd: item.size === 'large' ? 'span 2' : 'span 1',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(20,20,25,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isAdmin && (
              <button 
                onClick={(e) => deleteItem(item.id, item.src || '', e)}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none',
                  borderRadius: '50%', width: '30px', height: '30px',
                  cursor: 'pointer', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
                title="Sil"
              >
                ✕
              </button>
            )}

            <img 
              src={item.src} 
              alt={item.alt || 'Fotoğraf'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(80%) contrast(1.2)',
                transition: 'all 0.5s ease'
              }}
            />
            <div 
              className="overlay"
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                padding: '2rem 1.5rem 1rem',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                height: '100%'
              }}
            >
              <span style={{ color: '#fff', fontFamily: 'var(--font-title)', fontSize: '1.2rem', letterSpacing: '1px' }}>
                {item.alt}
              </span>
              {item.date && (
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.3rem', fontStyle: 'italic' }}>
                  {item.date}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
