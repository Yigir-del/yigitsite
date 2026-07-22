import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function MovingStars({ frozen }: { frozen: boolean }) {
  const starsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (frozen || !starsRef.current) return;

    starsRef.current.rotation.x -= delta * 0.02;
    starsRef.current.rotation.y -= delta * 0.025;

    starsRef.current.position.x = THREE.MathUtils.lerp(
      starsRef.current.position.x,
      state.pointer.x * 2,
      0.05,
    );
    starsRef.current.position.y = THREE.MathUtils.lerp(
      starsRef.current.position.y,
      state.pointer.y * 2,
      0.05,
    );
  });

  return (
    <group ref={starsRef}>
      <Stars
        radius={50}
        depth={50}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={frozen ? 0 : 1}
      />
    </group>
  );
}

function Moon({ frozen }: { frozen: boolean }) {
  const [clickCount, setClickCount] = useState(0);

  return (
    <mesh
      position={[5, 3, -10]}
      onClick={frozen ? undefined : () => setClickCount((c) => c + 1)}
      onPointerOver={
        frozen ? undefined : () => {
          document.body.style.cursor = 'pointer';
        }
      }
      onPointerOut={
        frozen ? undefined : () => {
          document.body.style.cursor = 'auto';
        }
      }
    >
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color={clickCount > 5 ? '#ff4444' : '#ffffff'}
        emissive={clickCount > 5 ? '#ff0000' : '#444444'}
        emissiveIntensity={0.5}
        roughness={0.8}
      />
      {clickCount > 5 && <pointLight color="#ff0000" intensity={2} distance={20} />}
    </mesh>
  );
}

export default function Muryokusho({ frozen = false }: { frozen?: boolean }) {
  return (
    <>
      <color attach="background" args={[frozen ? '#050505' : '#0d131f']} />
      <ambientLight intensity={frozen ? 0.25 : 0.5} />
      <directionalLight position={[-10, 10, 5]} intensity={frozen ? 0.4 : 1} />
      <MovingStars frozen={frozen} />
      <Moon frozen={frozen} />
      <fog attach="fog" args={[frozen ? '#050505' : '#0d131f', 5, 15]} />
    </>
  );
}
