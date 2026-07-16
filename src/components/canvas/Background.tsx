import { Canvas } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';
import { DOMAIN_MAP } from '../../themes/domains';
import DomainAtmosphere from './DomainAtmosphere';

export default function Background() {
  const { theme } = useTheme();
  const config = DOMAIN_MAP[theme];

  return (
    <div
      id="canvas-container"
      style={{
        transition: 'filter 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        frameloop="always"
      >
        {/* key forces dispose of previous domain pools */}
        <DomainAtmosphere key={theme} config={config} />
      </Canvas>
    </div>
  );
}
