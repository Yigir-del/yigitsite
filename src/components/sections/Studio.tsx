import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SEOHead from '../../seo/SEOHead';

interface StudioItem {
  id: string;
  type?: 'photo';
  src?: string;
  url?: string;
  alt?: string;
  size: string;
  date?: string;
}

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

export default function Studio() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<StudioItem[]>([]);

  const [newAlt, setNewAlt] = useState('');
  const [newSize, setNewSize] = useState('medium');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lightbox, setLightbox] = useState<StudioItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('yigit_admin') === 'true');

    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        else setItems([]);
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  const clearPending = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const confirmUpload = async () => {
    if (!pendingFile || isUploading) return;

    if (pendingFile.size > MAX_UPLOAD_BYTES) {
      alert('Fotoğraf çok büyük (max 4.5MB). Daha küçük bir görsel seç.');
      return;
    }

    setIsUploading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'content-type': pendingFile.type || 'image/jpeg',
          'x-filename': encodeURIComponent(pendingFile.name),
          'x-size': newSize,
          'x-alt': encodeURIComponent(newAlt.trim() || 'İsimsiz Eser'),
        },
        body: pendingFile,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Yükleme başarısız (${res.status})`);
      }

      const newItem: StudioItem = {
        id: String(data.id || Date.now()),
        type: 'photo',
        src: data.src,
        alt: data.alt || newAlt.trim() || 'İsimsiz Eser',
        size: data.size || newSize,
        date: data.date,
      };

      setItems((prev) => [newItem, ...prev]);
      setNewAlt('');
      clearPending();
    } catch (err) {
      console.error('Upload failed:', err);
      const message =
        err instanceof Error && err.name === 'AbortError'
          ? 'Yükleme zaman aşımına uğradı. Tekrar dene.'
          : err instanceof Error
            ? err.message
            : 'Fotoğraf yüklenemedi.';
      alert(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsUploading(false);
    }
  };

  const deleteItem = async (id: string, blobUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/photos?id=${id}&url=${encodeURIComponent(blobUrl)}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  return (
    <section
      className="studio-section"
      aria-label="Stüdyom"
      style={{
        minHeight: '80vh',
        padding: '8rem 2rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
      }}
    >
      <SEOHead page="studio" />
      <h1 className="glitch" data-text="Stüdyom" style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.8rem, 6vw, 2.5rem)' }}>
        Stüdyom
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontStyle: 'italic', textAlign: 'center' }}>
        Ortaya Karışık
      </p>

      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1200px', marginBottom: '2rem' }}>
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
                onChange={(e) => setNewAlt(e.target.value)}
                placeholder="Açıklama (Alt Text)"
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', borderRadius: '8px', transition: 'border 0.3s' }}
                onFocus={(e) => (e.target.style.border = '1px solid var(--accent-pale-gray)')}
                onBlur={(e) => (e.target.style.border = '1px solid rgba(255,255,255,0.1)')}
              />
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <option value="small">Küçük (Kare)</option>
                <option value="medium">Orta (Kare)</option>
                <option value="large">Büyük (Dikey Uzun)</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif,.heic,.heif"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
                style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
              />

              {!previewUrl ? (
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(255,255,255,0.1)', borderColor: 'var(--accent-pale-gray)' }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%',
                    padding: '2rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'border 0.3s',
                  }}
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✨</span>
                  <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>Cihazından bir fotoğraf seç</span>
                  <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Seçince önce önizleme gelir, onaylarsan siteye yerleşir (max 4.5MB)
                  </span>
                </motion.button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      width: '100%',
                      maxHeight: '360px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(0,0,0,0.4)',
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Önizleme"
                      style={{
                        width: '100%',
                        maxHeight: '360px',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>

                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    {pendingFile?.name}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={confirmUpload}
                      disabled={isUploading}
                      className="btn-domain"
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '0.9rem 1.2rem',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: isUploading ? 'wait' : 'pointer',
                        opacity: isUploading ? 0.7 : 1,
                      }}
                    >
                      {isUploading ? 'Yükleniyor...' : 'Onayla ve Yerleştir'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isUploading) return;
                        clearPending();
                      }}
                      disabled={isUploading}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '0.9rem 1.2rem',
                        borderRadius: '10px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'var(--text-muted)',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '0.9rem 1.2rem',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'var(--text-main)',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Başka Seç
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap: '2rem',
          width: '100%',
          maxWidth: '1200px',
          gridAutoRows: '250px',
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => setLightbox(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightbox(item);
              }
            }}
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
              justifyContent: 'center',
              cursor: 'zoom-in',
            }}
          >
            {isAdmin && (
              <button
                onClick={(e) => deleteItem(item.id, item.url || item.src || '', e)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}
                title="Sil"
              >
                ✕
              </button>
            )}

            <img
              src={item.src}
              alt={item.alt || 'Fotoğraf'}
              loading="lazy"
              decoding="async"
              className="studio-photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(80%) contrast(1.2)',
                transition: 'all 0.5s ease',
              }}
            />
            <div
              className="overlay"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                padding: '2rem 1.5rem 1rem',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                height: '100%',
                pointerEvents: 'none',
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

      {lightbox && (
        <motion.div
          className="studio-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0, 0, 0, 0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            cursor: 'zoom-out',
          }}
        >
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              top: '1.25rem',
              right: '1.25rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(20,20,25,0.7)',
              color: '#fff',
              fontSize: '1.4rem',
              cursor: 'pointer',
              zIndex: 2001,
            }}
          >
            ✕
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(96vw, 1100px)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              cursor: 'default',
            }}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt || 'Fotoğraf'}
              style={{
                maxWidth: '100%',
                maxHeight: '78vh',
                objectFit: 'contain',
                borderRadius: '10px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
                filter: 'grayscale(20%) contrast(1.05)',
              }}
            />
            {(lightbox.alt || lightbox.date) && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
                {lightbox.alt && (
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', letterSpacing: '1px' }}>
                    {lightbox.alt}
                  </div>
                )}
                {lightbox.date && (
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    {lightbox.date}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
