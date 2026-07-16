import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Rising ink shards — monochrome, sparse */
function InkShards() {
  const count = 140;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const arr = new Float32Array(count * 5);
    for (let i = 0; i < count; i++) {
      arr[i * 5] = (Math.random() - 0.5) * 28;
      arr[i * 5 + 1] = -2 + Math.random() * 12;
      arr[i * 5 + 2] = (Math.random() - 0.5) * 28;
      arr[i * 5 + 3] = 0.01 + Math.random() * 0.03;
      arr[i * 5 + 4] = (Math.random() - 0.5) * 0.012;
    }
    return arr;
  }, []);

  useFrame(({ pointer }) => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      data[i * 5 + 1] += data[i * 5 + 3];
      data[i * 5] += data[i * 5 + 4] + pointer.x * 0.015;
      if (data[i * 5 + 1] > 12) {
        data[i * 5 + 1] = -2;
        data[i * 5] = (Math.random() - 0.5) * 28;
      }
      dummy.position.set(data[i * 5], data[i * 5 + 1], data[i * 5 + 2]);
      dummy.rotation.set(i * 0.2, i * 0.3, 0);
      const s = 0.08 + (i % 4) * 0.04;
      dummy.scale.set(s, s * 1.4, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#111111" transparent opacity={0.7} depthWrite={false} />
    </instancedMesh>
  );
}

function ShadowSea() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = -2 + Math.sin(t * 0.45) * 0.15;
    ref.current.rotation.x = -Math.PI / 2 + pointer.y * 0.04;
    ref.current.rotation.z = pointer.x * 0.03;
  });

  return (
    <mesh ref={ref} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[70, 70, 24, 24]} />
      <meshStandardMaterial color="#020202" metalness={0.85} roughness={0.25} />
    </mesh>
  );
}

/** Chimera Shadow Garden — ink void, liquid black */
export default function KangoAneitei() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.15} color="#ffffff" />
      <directionalLight position={[0, 8, 2]} intensity={0.4} color="#555555" />
      <fog attach="fog" args={['#010101', 2, 16]} />
      <ShadowSea />
      <InkShards />
    </>
  );
}
