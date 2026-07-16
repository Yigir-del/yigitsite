import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function CrystalFloor() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y = -2 + Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={mesh} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 32, 32]} />
      <meshStandardMaterial 
        color="#ffffff"
        roughness={0}
        metalness={0.1}
        transparent
        opacity={0.8}
        envMapIntensity={2}
      />
    </mesh>
  );
}

function Crystals() {
  const count = 50;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const crystals = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const y = -2 + Math.random() * 5;
      const scale = 0.5 + Math.random() * 1.5;
      const rotationX = Math.random() * Math.PI;
      const rotationY = Math.random() * Math.PI;
      const floatSpeed = 0.2 + Math.random() * 0.5;
      temp.push({ x, y, z, scale, rotationX, rotationY, floatSpeed });
    }
    return temp;
  }, []);

  useFrame(({ clock }) => {
    if (mesh.current) {
      const time = clock.getElapsedTime();
      crystals.forEach((c, i) => {
        dummy.position.set(c.x, c.y + Math.sin(time * c.floatSpeed) * 0.5, c.z);
        dummy.rotation.x = c.rotationX + time * 0.1;
        dummy.rotation.y = c.rotationY + time * 0.1;
        dummy.scale.set(c.scale, c.scale * 2, c.scale);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial 
        color="#b3d9ff"
        transmission={0.9}
        opacity={1}
        metalness={0}
        roughness={0}
        ior={1.5}
        thickness={2}
        specularIntensity={1}
      />
    </instancedMesh>
  );
}

function LightDust() {
  const count = 1000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = -2 + Math.random() * 20;
      const z = (Math.random() - 0.5) * 40;
      const speedY = 0.005 + Math.random() * 0.01;
      const speedX = (Math.random() - 0.5) * 0.01;
      temp.push({ x, y, z, speedY, speedX });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (mesh.current) {
      particles.forEach((particle, i) => {
        particle.y -= particle.speedY; // Falling like snow
        particle.x += particle.speedX;
        
        if (particle.y < -2) {
          particle.y = 15;
          particle.x = (Math.random() - 0.5) * 40;
        }
        
        dummy.position.set(particle.x, particle.y, particle.z);
        const scale = 0.02 + Math.random() * 0.05;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
}

export default function ShinganSoai() {
  return (
    <>
      <color attach="background" args={['#e0eaf5']} />
      <ambientLight intensity={1} color="#ffffff" />
      <directionalLight position={[5, 10, -5]} intensity={2} color="#ccffff" />
      <fog attach="fog" args={['#d0e0f0', 5, 25]} />
      
      <CrystalFloor />
      <Crystals />
      <LightDust />
    </>
  );
}
