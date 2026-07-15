import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Drifter {
  id: string;
  type: 'github' | 'linkedin';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  rotation: number;
  tooltip: string;
  link: string;
}

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function SocialDrifters() {
  const [drifters, setDrifters] = useState<Drifter[]>([]);

  useEffect(() => {
    const spawnDrifter = () => {
      const type = Math.random() > 0.5 ? 'github' : 'linkedin';
      const tooltip = type === 'github' ? "GitHub'a uğra." : "LinkedIn tarafı.";
      const link = type === 'github' ? "https://github.com/yigit-del" : "https://www.linkedin.com/in/yigit-efe-altuntas/";
      
      const startX = -100;
      const startY = Math.random() * window.innerHeight;
      const endX = window.innerWidth + 100;
      const endY = Math.random() * window.innerHeight;
      
      const newDrifter: Drifter = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        startX,
        startY,
        endX,
        endY,
        duration: 20 + Math.random() * 20, 
        rotation: Math.random() * 360,
        tooltip,
        link
      };

      setDrifters(prev => [...prev, newDrifter]);

      setTimeout(() => {
        setDrifters(prev => prev.filter(d => d.id !== newDrifter.id));
      }, newDrifter.duration * 1000);
    };

    const timeout = setTimeout(function loop() {
      spawnDrifter();
      setTimeout(loop, 10000 + Math.random() * 15000);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {drifters.map(d => (
        <motion.a
          key={d.id}
          href={d.link}
          target="_blank"
          rel="noopener noreferrer"
          title={d.tooltip}
          drag
          dragMomentum={true}
          whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
          initial={{ x: d.startX, y: d.startY, rotate: 0 }}
          animate={{ x: d.endX, y: d.endY, rotate: d.rotation > 180 ? 360 : -360 }}
          transition={{ duration: d.duration, ease: "linear" }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            color: 'var(--text-muted)',
            pointerEvents: 'auto',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '1rem',
            borderRadius: '50%',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {d.type === 'github' ? <GithubIcon /> : <LinkedinIcon />}
        </motion.a>
      ))}
    </div>
  );
}
