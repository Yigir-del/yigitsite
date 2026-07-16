import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function LavaFloor() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      const time = clock.getElapsedTime();
      mesh.current.position.y = -3 + Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={mesh} position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 64, 64]} />
      <meshStandardMaterial 
        color="#ff2200"
        emissive="#ff4400"
        emissiveIntensity={0.5}
        roughness={0.8}
        wireframe={true} // Creates a lava crack effect on a low-res plane
      />
    </mesh>
  );
}

function VolcanicRocks() {
  const count = 30;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const rocks = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      const y = -3 + Math.random() * 2;
      const scale = 0.5 + Math.random() * 2;
      const rotationY = Math.random() * Math.PI;
      temp.push({ x, y, z, scale, rotationY });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (mesh.current) {
      rocks.forEach((rock, i) => {
        dummy.position.set(rock.x, rock.y, rock.z);
        dummy.rotation.y = rock.rotationY;
        dummy.scale.set(rock.scale, rock.scale, rock.scale);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#1a0500" roughness={1} />
    </instancedMesh>
  );
}

function FireParticles() {
  const count = 500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = -3 + Math.random() * 15;
      const z = (Math.random() - 0.5) * 30;
      const speedY = 0.05 + Math.random() * 0.05;
      const speedX = (Math.random() - 0.5) * 0.02;
      temp.push({ x, y, z, speedY, speedX });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (mesh.current) {
      particles.forEach((particle, i) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX + Math.sin(particle.y) * 0.01; // Heat distortion wave
        
        if (particle.y > 10) {
          particle.y = -3;
          particle.x = (Math.random() - 0.5) * 30;
        }
        
        dummy.position.set(particle.x, particle.y, particle.z);
        const scale = 0.05 + Math.random() * 0.1;
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
      <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
    </instancedMesh>
  );
}

export default function GaikanTecchisen() {
  return (
    <>
      <color attach="background" args={['#2a0a00']} />
      <ambientLight intensity={0.5} color="#ff5500" />
      <pointLight position={[0, -2, 0]} color="#ffaa00" intensity={10} distance={20} />
      <fog attach="fog" args={['#2a0a00', 5, 20]} />
      
      <LavaFloor />
      <VolcanicRocks />
      <FireParticles />
    </>
  );
}
