import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AshParticles() {
  const count = 2000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 20;
      const z = (Math.random() - 0.5) * 40;
      const speed = 0.01 + Math.random() * 0.02;
      temp.push({ x, y, z, speed });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (mesh.current) {
      particles.forEach((particle, i) => {
        particle.y -= particle.speed;
        if (particle.y < -10) particle.y = 20;
        
        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.rotation.x += particle.speed;
        dummy.rotation.y += particle.speed;
        const scale = 0.05 + Math.random() * 0.05;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#111111" transparent opacity={0.8} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function ShrineSilhouette() {
  return (
    <group position={[0, -2, -15]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[20, 1, 5]} />
        <meshStandardMaterial color="#050000" roughness={0.9} />
      </mesh>
      {/* Pillars */}
      <mesh position={[-4, 3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 6]} />
        <meshStandardMaterial color="#0a0000" />
      </mesh>
      <mesh position={[4, 3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 6]} />
        <meshStandardMaterial color="#0a0000" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 7, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[8, 3, 4]} />
        <meshStandardMaterial color="#050000" roughness={1} />
      </mesh>
      {/* Red Energy cracks (lights) */}
      <pointLight position={[0, 2, 2]} color="#ff0000" intensity={5} distance={15} />
      <pointLight position={[-4, 4, 1]} color="#ff3300" intensity={3} distance={10} />
      <pointLight position={[4, 4, 1]} color="#ff3300" intensity={3} distance={10} />
    </group>
  );
}

function BloodWater() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y = -2 + Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <mesh ref={mesh} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 64, 64]} />
      <meshStandardMaterial 
        color="#330000"
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export default function FukumaMizushi() {
  return (
    <>
      <color attach="background" args={['#050000']} />
      <ambientLight intensity={0.1} color="#ff0000" />
      <fog attach="fog" args={['#2a0000', 5, 25]} />
      
      <ShrineSilhouette />
      <BloodWater />
      <AshParticles />
    </>
  );
}
