import { Canvas } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';
import Muryokusho from './domains/Muryokusho';
import FukumaMizushi from './domains/FukumaMizushi';
import KangoAneitei from './domains/KangoAneitei';
import GaikanTecchisen from './domains/GaikanTecchisen';
import ShinganSoai from './domains/ShinganSoai';

export default function Background() {
  const { theme } = useTheme();

  return (
    <div id="canvas-container" style={{ transition: 'background-color 1.5s ease' }}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        {theme === 'Muryokusho' && <Muryokusho />}
        {theme === 'FukumaMizushi' && <FukumaMizushi />}
        {theme === 'KangoAneitei' && <KangoAneitei />}
        {theme === 'GaikanTecchisen' && <GaikanTecchisen />}
        {theme === 'ShinganSoai' && <ShinganSoai />}
      </Canvas>
    </div>
  );
}
