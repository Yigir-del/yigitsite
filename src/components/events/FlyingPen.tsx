import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { planWanderHop, randomOffscreenStart } from '../../utils/flightPath';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import { ensureGlobalNoteEventListener, submitNote } from '../../utils/notesStore';
import { unlockAchievement } from '../../features/achievements/achievementStore';

const NOTE_TEXT_MAX = 500;
const NOTE_AUTHOR_MAX = 40;

export default function FlyingPen() {
  const isMobilePerf = useIsMobilePerf();
  const [position, setPosition] = useState(() => randomOffscreenStart(['right', 'bottom']));
  const [flightDuration, setFlightDuration] = useState(11);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    ensureGlobalNoteEventListener();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsModalOpen(false);
        setSubmitError(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen, isSubmitting]);

  useEffect(() => {
    if (isMobilePerf || isModalOpen) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const hop = (preferLeave: boolean) => {
      if (cancelled) return;
      const next = planWanderHop({ preferLeave });
      setPosition(next.point);
      setFlightDuration(next.duration);
      timer = setTimeout(() => hop(!preferLeave), next.duration * 1000);
    };

    timer = setTimeout(() => hop(false), 260);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isMobilePerf, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed || trimmed.length > NOTE_TEXT_MAX || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitNote({
      text: trimmed,
      author: authorName.trim() || 'Gizemli Yabancı',
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error || 'İz bırakılamadı. Tekrar dene.');
      return;
    }

    unlockAchievement('first_note');
    setNoteText('');
    setAuthorName('');
    setSubmitError(null);
    setIsModalOpen(false);
  };

  const openModal = () => {
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setSubmitError(null);
    setIsModalOpen(false);
  };

  const penIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );

  return (
    <>
      {isMobilePerf ? (
        <button
          type="button"
          onClick={openModal}
          title="Bırakmak istediğin bir iz var mı?"
          aria-label="Bırakmak istediğin bir iz var mı?"
          className="flying-pen-btn flying-pen-btn--mobile"
        >
          {penIcon}
        </button>
      ) : (
        <motion.button
          type="button"
          onClick={openModal}
          title="Bırakmak istediğin bir iz var mı?"
          aria-label="Bırakmak istediğin bir iz var mı?"
          className="flying-pen-btn flying-pen-btn--desktop"
          drag
          dragMomentum
          whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
          initial={false}
          animate={{ x: position.x, y: position.y }}
          transition={{ duration: flightDuration, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1, boxShadow: 'var(--hover-scale-glow)' }}
        >
          {penIcon}
        </motion.button>
      )}

      {/* Note Input Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-title"
          className="note-modal-backdrop"
          onClick={closeModal}
        >
          <div
            className="fade-in note-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="note-modal-title" className="note-modal__title">
              Bir Not Bırak
            </h2>
            <form onSubmit={handleSubmit} className="note-modal__form">
              <div>
                <label htmlFor="note-text" className="visually-hidden">
                  Not
                </label>
                <textarea
                  id="note-text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value.slice(0, NOTE_TEXT_MAX))}
                  placeholder="Aklından geçenleri dök..."
                  required
                  maxLength={NOTE_TEXT_MAX}
                  autoFocus
                  disabled={isSubmitting}
                  className="note-modal__textarea"
                />
              </div>
              <div>
                <label htmlFor="note-author" className="visually-hidden">
                  İsim (isteğe bağlı)
                </label>
                <input
                  id="note-author"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value.slice(0, NOTE_AUTHOR_MAX))}
                  placeholder="İsmin (İsteğe bağlı)"
                  maxLength={NOTE_AUTHOR_MAX}
                  disabled={isSubmitting}
                  className="note-modal__input"
                />
              </div>

              {submitError && (
                <p className="note-modal__error" role="alert">
                  {submitError}
                </p>
              )}

              <div className="note-modal__actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="note-modal__btn note-modal__btn--cancel"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !noteText.trim()}
                  className="note-modal__btn note-modal__btn--submit"
                >
                  {isSubmitting ? 'Gönderiliyor…' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
