import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../../data/projects';
import { ExternalLink, Calendar, Code, User, ArrowRight } from 'lucide-react';
import { getIsMobilePerf } from '../../hooks/useIsMobilePerf';
import SEOHead from '../../seo/SEOHead';

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getIsMobilePerf()) return;
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const cards = root.querySelectorAll('.project-section');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 150, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="projects-section" aria-label="Projeler" style={{ padding: '6rem 2rem', minHeight: '100vh', maxWidth: '1000px', margin: '0 auto' }}>
      <SEOHead page="projects" />
      <h1 className="glitch" data-text="İnşa Ettiklerim" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: 'clamp(2rem, 7vw, 3rem)' }}>İnşa Ettiklerim</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '5rem', fontSize: 'clamp(1rem, 3.5vw, 1.2rem)' }}>
        Zamanımı harcadığım karanlık köşeler.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 8vw, 8rem)' }}>
        {projects.map((p) => (
          <div key={p.id} className="project-section" style={{ position: 'relative' }}>
            {/* Cinematic Line */}
            <div className="project-section__line" style={{ position: 'absolute', left: '-2rem', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom, transparent, var(--timeline), transparent)' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {p.title}
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${p.title} projesini aç`}
                    style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
                  >
                    <ExternalLink size={24} aria-hidden="true" />
                  </a>
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} aria-hidden="true"/> {p.role}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} aria-hidden="true"/> {p.timeline}</span>
                </div>

                <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {p.description}
                </p>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--accent-pale-gray)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code size={18} aria-hidden="true"/> Teknolojiler</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {p.technologies.map(tech => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--accent-pale-gray)', marginBottom: '1rem' }}>Öğrenilen Dersler</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '2px solid var(--accent-muted-blue)', paddingLeft: '1rem' }}>
                    "{p.lessonsLearned}"
                  </p>
                </div>
              </div>

              {/* Cinematic Image/Video */}
              <div className="card-surface" style={{ flex: '1 1 300px', minHeight: '300px', borderRadius: '12px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent 40%, var(--glow) 50%, transparent 60%)', backgroundSize: '200% 200%', animation: 'shimmer 3s infinite linear', opacity: 0.35 }}></div>
                
                {p.images && p.images.length > 0 ? (
                  <div style={{ width: '100%', height: '100%', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={p.images[0]} alt={p.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1, borderRadius: '50%', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <ArrowRight size={32} style={{ opacity: 0.5 }} aria-hidden="true" />
                    <span>Görsel Yükleniyor...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}
