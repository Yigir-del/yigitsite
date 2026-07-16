import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Falling ash — pooled, light count */
function Ash() {
  const count = 280;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const arr = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      arr[i * 4] = (Math.random() - 0.5) * 36;
      arr[i * 4 + 1] = Math.random() * 18;
      arr[i * 4 + 2] = (Math.random() - 0.5) * 36;
      arr[i * 4 + 3] = 0.012 + Math.random() * 0.025;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      data[i * 4 + 1] -= data[i * 4 + 3];
      if (data[i * 4 + 1] < -8) data[i * 4 + 1] = 16;
      dummy.position.set(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      dummy.scale.setScalar(0.04 + (i % 5) * 0.012);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#1a0808" transparent opacity={0.75} side={THREE.DoubleSide} depthWrite={false} />
    </instancedMesh>
  );
}

function Shrine() {
  return (
    <group position={[0, -1.5, -14]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[18, 0.8, 4]} />
        <meshStandardMaterial color="#050000" roughness={0.95} />
      </mesh>
      <mesh position={[-3.5, 2.8, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 5.5, 6]} />
        <meshStandardMaterial color="#0a0000" />
      </mesh>
      <mesh position={[3.5, 2.8, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 5.5, 6]} />
        <meshStandardMaterial color="#0a0000" />
      </mesh>
      <mesh position={[0, 6.2, 0]}>
        <coneGeometry args={[7, 2.8, 4]} />
        <meshStandardMaterial color="#080000" roughness={1} />
      </mesh>
      {/* Cleaving red veins */}
      <pointLight position={[0, 1.5, 3]} color="#ff1100" intensity={4} distance={14} />
      <pointLight position={[-3.5, 3.5, 2]} color="#ff3300" intensity={2.2} distance={9} />
      <pointLight position={[3.5, 3.5, 2]} color="#ff3300" intensity={2.2} distance={9} />
    </group>
  );
}

function BloodPlane() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -2.2 + Math.sin(clock.elapsedTime * 0.7) * 0.08;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#2a0000" metalness={0.7} roughness={0.15} transparent opacity={0.85} />
    </mesh>
  );
}

/** Malevolent Shrine — oppressive red void + shrine silhouette */
export default function FukumaMizushi() {
  return (
    <>
      <color attach="background" args={['#050000']} />
      <ambientLight intensity={0.08} color="#ff0000" />
      <fog attach="fog" args={['#1a0000', 4, 22]} />
      <Shrine />
      <BloodPlane />
      <Ash />
    </>
  );
}
