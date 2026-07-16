import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function LavaCracks() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -3 + Math.sin(clock.elapsedTime * 0.25) * 0.08;
    }
  });
  return (
    <mesh ref={ref} position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50, 16, 16]} />
      <meshStandardMaterial
        color="#ff2200"
        emissive="#ff4400"
        emissiveIntensity={0.55}
        roughness={0.9}
        wireframe
      />
    </mesh>
  );
}

function Rocks() {
  const count = 14;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const rocks = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 28,
        y: -3 + Math.random() * 1.6,
        z: (Math.random() - 0.5) * 28,
        s: 0.4 + Math.random() * 1.6,
        ry: Math.random() * Math.PI,
      })),
    []
  );

  // Static — set once
  useEffect(() => {
    if (!mesh.current) return;
    rocks.forEach((r, i) => {
      dummy.position.set(r.x, r.y, r.z);
      dummy.rotation.y = r.ry;
      dummy.scale.setScalar(r.s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [rocks, dummy]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#1a0500" roughness={1} />
    </instancedMesh>
  );
}

function Embers() {
  const count = 70;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const arr = new Float32Array(count * 5);
    for (let i = 0; i < count; i++) {
      arr[i * 5] = (Math.random() - 0.5) * 24;
      arr[i * 5 + 1] = -3 + Math.random() * 10;
      arr[i * 5 + 2] = (Math.random() - 0.5) * 24;
      arr[i * 5 + 3] = 0.035 + Math.random() * 0.04;
      arr[i * 5 + 4] = (Math.random() - 0.5) * 0.015;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      data[i * 5 + 1] += data[i * 5 + 3];
      data[i * 5] += data[i * 5 + 4];
      if (data[i * 5 + 1] > 8) {
        data[i * 5 + 1] = -3;
        data[i * 5] = (Math.random() - 0.5) * 24;
      }
      dummy.position.set(data[i * 5], data[i * 5 + 1], data[i * 5 + 2]);
      dummy.scale.setScalar(0.045 + (i % 3) * 0.025);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} depthWrite={false} />
    </instancedMesh>
  );
}

export default function GaikanTecchisen() {
  return (
    <>
      <color attach="background" args={['#2a0a00']} />
      <ambientLight intensity={0.45} color="#ff5500" />
      <pointLight position={[0, -2, 0]} color="#ffaa00" intensity={6} distance={16} />
      <fog attach="fog" args={['#2a0a00', 5, 18]} />
      <LavaCracks />
      <Rocks />
      <Embers />
    </>
  );
}
