import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from '../../seo/SEOHead';
import { useAdminSession } from '../../hooks/useAdminSession';

export interface StudioItem {
  id: string;
  type?: 'photo';
  src?: string;
  url?: string;
  alt?: string;
  size: string;
  date?: string;
}

const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);
const ACCEPT_ATTR = 'image/jpeg,image/png,image/gif,image/webp,image/avif';

export default function Studio() {
  const isAdmin = useAdminSession();
  const [items, setItems] = useState<StudioItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [newAlt, setNewAlt] = useState('');
  const [newSize, setNewSize] = useState('medium');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<StudioItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/photos', { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        else setItems([]);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setItems([]);
      });
    return () => ctrl.abort();
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
    setActionError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionError(null);

    if (file.type && !ACCEPTED_MIME_TYPES.has(file.type)) {
      setActionError('Desteklenmeyen dosya türü. Lütfen JPEG, PNG, GIF, WebP veya AVIF seç.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setActionError('Fotoğraf çok büyük (maksimum 4.5MB). Daha küçük bir görsel seç.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const confirmUpload = async () => {
    if (!pendingFile || isUploading) return;

    if (pendingFile.size > MAX_UPLOAD_BYTES) {
      setActionError('Fotoğraf çok büyük (maksimum 4.5MB). Daha küçük bir görsel seç.');
      return;
    }

    setIsUploading(true);
    setActionError(null);
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
        credentials: 'include',
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => ({}))) as Partial<StudioItem> & {
        error?: string;
      };
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
      setActionError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsUploading(false);
    }
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingIds.has(id)) return;

    const previous = itemsRef.current;
    setActionError(null);
    setDeletingIds((prev) => new Set(prev).add(id));
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (lightbox?.id === id) setLightbox(null);

    try {
      const res = await fetch(`/api/photos?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Silme başarısız (${res.status})`);
      }
    } catch (err) {
      console.error('Failed to delete photo', err);
      setItems(previous);
      setActionError('Fotoğraf silinemedi. Lütfen tekrar dene.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <section className="studio-section" aria-label="Stüdyom">
      <SEOHead page="studio" />
      <h1 className="glitch studio-section__title" data-text="Stüdyom">
        Stüdyom
      </h1>
      <p className="studio-section__subtitle">Ortaya Karışık</p>

      {actionError && (
        <div className="studio-error-banner" role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="studio-error-banner__close"
            aria-label="Uyarıyı kapat"
          >
            ✕
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="studio-admin-wrap">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="studio-admin-card"
          >
            <h3 className="studio-admin-card__heading">
              <span aria-hidden="true">📷</span> Fotoğraf Paylaş
            </h3>

            <div className="studio-admin-grid">
              <input
                type="text"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value.slice(0, 120))}
                placeholder="Açıklama (Alt Text)"
                aria-label="Fotoğraf açıklaması"
                className="studio-admin-input"
              />
              <select
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                aria-label="Fotoğraf boyutu"
                className="studio-admin-select"
              >
                <option value="small">Küçük (Kare)</option>
                <option value="medium">Orta (Kare)</option>
                <option value="large">Büyük (Dikey Uzun)</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <input
                type="file"
                accept={ACCEPT_ATTR}
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
                  whileHover={{
                    scale: 1.01,
                    boxShadow: '0 0 20px rgba(255,255,255,0.1)',
                    borderColor: 'var(--accent-pale-gray)',
                  }}
                  whileTap={{ scale: 0.99 }}
                  className="studio-dropzone-btn"
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✨</span>
                  <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-main)' }}>
                    Cihazından bir fotoğraf seç
                  </span>
                  <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Seçince önce önizleme gelir, onaylarsan siteye yerleşir (max 4.5MB · JPEG, PNG, GIF, WebP, AVIF)
                  </span>
                </motion.button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="studio-preview-frame">
                    <img
                      src={previewUrl}
                      alt="Önizleme"
                      className="studio-preview-img"
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
                      className="btn-domain studio-action-btn"
                      style={{
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
                      className="studio-cancel-btn"
                      style={{
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="studio-reselect-btn"
                      style={{
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

      <div className="studio-grid">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`${item.alt || 'Fotoğraf'} — büyütmek için tıkla`}
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
            className="studio-card"
            style={{
              gridRowEnd: item.size === 'large' ? 'span 2' : 'span 1',
            }}
          >
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => void deleteItem(item.id, e)}
                disabled={deletingIds.has(item.id)}
                className="studio-card__delete"
                title="Sil"
                aria-label="Fotoğrafı sil"
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
            />
            <div className="overlay studio-card__overlay">
              <span className="studio-card__caption">{item.alt || 'İsimsiz Eser'}</span>
              {item.date && <span className="studio-card__date">{item.date}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.alt || 'Fotoğraf önizleme'}
            className="studio-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              aria-label="Kapat"
              onClick={() => setLightbox(null)}
              className="studio-lightbox__close"
            >
              ✕
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="studio-lightbox__content"
            >
              <img
                src={lightbox.src}
                alt={lightbox.alt || 'Fotoğraf'}
                className="studio-lightbox__img"
              />
              {(lightbox.alt || lightbox.date) && (
                <div className="studio-lightbox__meta">
                  {lightbox.alt && <div className="studio-lightbox__title">{lightbox.alt}</div>}
                  {lightbox.date && <div className="studio-lightbox__date">{lightbox.date}</div>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
