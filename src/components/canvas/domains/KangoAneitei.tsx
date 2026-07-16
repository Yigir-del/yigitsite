import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ShadowLiquid() {
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  useFrame(({ clock, pointer }) => {
    if (mesh.current && materialRef.current) {
      const time = clock.getElapsedTime();
      // Wave effect
      mesh.current.position.y = -2 + Math.sin(time * 0.5) * 0.2;
      
      // Follow mouse slightly
      mesh.current.rotation.x = -Math.PI / 2 + (pointer.y * 0.05);
      mesh.current.rotation.y = (pointer.x * 0.05);
    }
  });

  return (
    <mesh ref={mesh} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#020202"
        roughness={0.2}
        metalness={0.9}
        wireframe={false}
      />
    </mesh>
  );
}

function InkParticles() {
  const count = 1000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = -2 + Math.random() * 15;
      const z = (Math.random() - 0.5) * 30;
      const speedY = 0.01 + Math.random() * 0.03;
      const speedX = (Math.random() - 0.5) * 0.01;
      temp.push({ x, y, z, speedY, speedX });
    }
    return temp;
  }, []);

  useFrame(({ pointer }) => {
    if (mesh.current) {
      particles.forEach((particle, i) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX + (pointer.x * 0.02);
        
        if (particle.y > 15) {
          particle.y = -2;
          particle.x = (Math.random() - 0.5) * 30;
        }
        
        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.rotation.x += 0.02;
        dummy.rotation.y += 0.02;
        const scale = 0.1 + Math.random() * 0.1;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.6} />
    </instancedMesh>
  );
}

export default function KangoAneitei() {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.2} color="#ffffff" />
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="#444444" />
      <fog attach="fog" args={['#030303', 2, 20]} />
      
      <ShadowLiquid />
      <InkParticles />
    </>
  );
}
