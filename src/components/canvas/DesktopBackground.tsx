import { Canvas } from '@react-three/fiber';
import Muryokusho from './domains/Muryokusho';

/** Desktop-only WebGL background — lazy-loaded so mobile never parses Three.js. */
export default function DesktopBackground({ hushed = false }: { hushed?: boolean }) {
  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60, near: 0.1, far: 200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Muryokusho hushed={hushed} />
      </Canvas>
    </div>
  );
}
