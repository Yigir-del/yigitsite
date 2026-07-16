import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function IceFloor() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -2 + Math.sin(clock.elapsedTime * 0.3) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial color="#e8f2fc" transparent opacity={0.55} />
    </mesh>
  );
}

function Crystals() {
  const count = 12;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const crystals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 24,
        y: -1.5 + Math.random() * 4.5,
        z: (Math.random() - 0.5) * 24,
        s: 0.35 + Math.random() * 1,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        speed: 0.15 + Math.random() * 0.3,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    crystals.forEach((c, i) => {
      dummy.position.set(c.x, c.y + Math.sin(t * c.speed) * 0.35, c.z);
      dummy.rotation.set(c.rx + t * 0.06, c.ry + t * 0.08, 0);
      dummy.scale.set(c.s, c.s * 1.8, c.s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#b3d9ff"
        emissive="#88bbff"
        emissiveIntensity={0.4}
        metalness={0.25}
        roughness={0.2}
        transparent
        opacity={0.75}
      />
    </instancedMesh>
  );
}

function SoftDust() {
  const count = 60;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(() => {
    const arr = new Float32Array(count * 5);
    for (let i = 0; i < count; i++) {
      arr[i * 5] = (Math.random() - 0.5) * 28;
      arr[i * 5 + 1] = -1 + Math.random() * 12;
      arr[i * 5 + 2] = (Math.random() - 0.5) * 28;
      arr[i * 5 + 3] = 0.004 + Math.random() * 0.008;
      arr[i * 5 + 4] = (Math.random() - 0.5) * 0.006;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    for (let i = 0; i < count; i++) {
      data[i * 5 + 1] -= data[i * 5 + 3];
      data[i * 5] += data[i * 5 + 4];
      if (data[i * 5 + 1] < -2) {
        data[i * 5 + 1] = 11;
        data[i * 5] = (Math.random() - 0.5) * 28;
      }
      dummy.position.set(data[i * 5], data[i * 5 + 1], data[i * 5 + 2]);
      dummy.scale.setScalar(0.025 + (i % 3) * 0.01);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} depthWrite={false} />
    </instancedMesh>
  );
}

export default function ShinganSoai() {
  return (
    <>
      <color attach="background" args={['#e0eaf5']} />
      <ambientLight intensity={0.9} color="#ffffff" />
      <directionalLight position={[5, 10, -5]} intensity={1.2} color="#cceeff" />
      <fog attach="fog" args={['#d0e0f0', 6, 22]} />
      <IceFloor />
      <Crystals />
      <SoftDust />
    </>
  );
}
