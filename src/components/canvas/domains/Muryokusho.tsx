import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function MovingStars({ hushed }: { hushed: boolean }) {
  const starsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!starsRef.current) return;

    const speed = hushed ? 0.04 : 1;
    starsRef.current.rotation.x -= delta * 0.02 * speed;
    starsRef.current.rotation.y -= delta * 0.025 * speed;

    if (hushed) return;

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
        speed={hushed ? 0.08 : 1}
      />
    </group>
  );
}

function Moon({ hushed }: { hushed: boolean }) {
  const [clickCount, setClickCount] = useState(0);

  return (
    <mesh
      position={[5, 3, -10]}
      onClick={hushed ? undefined : () => setClickCount((c) => c + 1)}
      onPointerOver={
        hushed
          ? undefined
          : () => {
              document.body.style.cursor = 'pointer';
            }
      }
      onPointerOut={
        hushed
          ? undefined
          : () => {
              document.body.style.cursor = 'auto';
            }
      }
    >
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color={clickCount > 5 ? '#ff4444' : '#ffffff'}
        emissive={clickCount > 5 ? '#ff0000' : '#444444'}
        emissiveIntensity={hushed ? 0.35 : 0.5}
        roughness={0.8}
      />
      {clickCount > 5 && <pointLight color="#ff0000" intensity={2} distance={20} />}
    </mesh>
  );
}

export default function Muryokusho({ hushed = false }: { hushed?: boolean }) {
  return (
    <>
      <color attach="background" args={['#0d131f']} />
      <ambientLight intensity={hushed ? 0.42 : 0.5} />
      <directionalLight position={[-10, 10, 5]} intensity={hushed ? 0.85 : 1} />
      <MovingStars hushed={hushed} />
      <Moon hushed={hushed} />
      <fog attach="fog" args={['#0d131f', 5, 15]} />
    </>
  );
}
