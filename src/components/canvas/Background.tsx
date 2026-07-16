import { Canvas } from '@react-three/fiber';
import Muryokusho from './domains/Muryokusho';

export default function Background() {
  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60, near: 0.1, far: 200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Muryokusho />
      </Canvas>
    </div>
  );
}
