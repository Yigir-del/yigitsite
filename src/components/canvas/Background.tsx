import { Canvas } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';
import Muryokusho from './domains/Muryokusho';
import GaikanTecchisen from './domains/GaikanTecchisen';
import ShinganSoai from './domains/ShinganSoai';

export default function Background() {
  const { theme } = useTheme();

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
        {theme === 'Muryokusho' && <Muryokusho />}
        {theme === 'GaikanTecchisen' && <GaikanTecchisen />}
        {theme === 'ShinganSoai' && <ShinganSoai />}
      </Canvas>
    </div>
  );
}
