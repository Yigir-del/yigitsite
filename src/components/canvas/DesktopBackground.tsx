import { Canvas } from '@react-three/fiber';
import { useDocumentVisible } from '../../hooks/useDocumentVisible';
import Muryokusho from './domains/Muryokusho';

/** Desktop-only WebGL background — pauses when tab hidden; same look when visible. */
export default function DesktopBackground({ hushed = false }: { hushed?: boolean }) {
  const visible = useDocumentVisible();

  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Muryokusho hushed={hushed} />
      </Canvas>
    </div>
  );
}
