import { Canvas } from '@react-three/fiber';
import Muryokusho from './domains/Muryokusho';

export default function Background() {
  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={1}
        performance={{ min: 0.5 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
      >
        <Muryokusho />
      </Canvas>
    </div>
  );
}
