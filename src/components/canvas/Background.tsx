import { Canvas } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';
import Muryokusho from './domains/Muryokusho';
import FukumaMizushi from './domains/FukumaMizushi';
import KangoAneitei from './domains/KangoAneitei';

export default function Background() {
  const { theme } = useTheme();

  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
      >
        {theme === 'Muryokusho' && <Muryokusho />}
        {theme === 'FukumaMizushi' && <FukumaMizushi />}
        {theme === 'KangoAneitei' && <KangoAneitei />}
      </Canvas>
    </div>
  );
}
