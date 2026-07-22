import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('lenis') || id.includes('@studio-freight')) return 'lenis';
        },
      },
    },
  },
});
