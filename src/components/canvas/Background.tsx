import { Canvas } from '@react-three/fiber';
import Muryokusho from './domains/Muryokusho';

export default function Background() {
  return (
    <div id="canvas-container">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Muryokusho />
      </Canvas>
    </div>
  );
}
