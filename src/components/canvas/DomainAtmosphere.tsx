import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { type DomainConfig, type SpawnBias } from '../../themes/domains';

const MAX_PARTICLES = 100;
const MAX_SYMBOLS = 5;

type Pooled = {
  pos: Float32Array;
  vel: Float32Array;
  delay: Float32Array;
  life: Float32Array;
};

function spawnPoint(bias: SpawnBias, i: number, seed: number): [number, number, number] {
  const r = () => Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453 % 1;
  const rx = r();
  const ry = (Math.sin(seed * 4.1 + i * 19.2) * 43758.5) % 1;
  const rz = (Math.sin(seed * 7.7 + i * 3.3) * 43758.5) % 1;
  const n = (v: number) => (v < 0 ? v + 1 : v);

  switch (bias) {
    case 'center':
      return [(n(rx) - 0.5) * 2, (n(ry) - 0.5) * 2, -2 - n(rz) * 4];
    case 'topLeft':
      return [-6 + n(rx) * 3, 2 + n(ry) * 3, -2 - n(rz) * 5];
    case 'bottom':
      return [(n(rx) - 0.5) * 10, -4 + n(ry) * 1.5, -2 - n(rz) * 4];
    case 'edges': {
      const edge = i % 4;
      if (edge === 0) return [-5 - n(rx), (n(ry) - 0.5) * 6, -3];
      if (edge === 1) return [5 + n(rx), (n(ry) - 0.5) * 6, -3];
      if (edge === 2) return [(n(rx) - 0.5) * 8, 4 + n(ry), -3];
      return [(n(rx) - 0.5) * 8, -4 - n(ry), -3];
    }
    case 'rise':
      return [(n(rx) - 0.5) * 8, -5 + n(ry) * 0.5, -2 - n(rz) * 3];
    case 'scatter':
    default:
      return [(n(rx) - 0.5) * 12, (n(ry) - 0.5) * 8, -1 - n(rz) * 8];
  }
}

function buildPool(count: number, bias: SpawnBias, seed: number, speed: number): Pooled {
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const delay = new Float32Array(count);
  const life = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const [x, y, z] = spawnPoint(bias, i, seed);
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    vel[i * 3] = (Math.sin(seed + i) * 0.5) * speed;
    vel[i * 3 + 1] = (bias === 'rise' ? 0.15 : Math.cos(seed + i * 0.7) * 0.4) * speed;
    vel[i * 3 + 2] = Math.sin(seed * 0.3 + i) * 0.2 * speed;
    // Staggered appearance 0.3s – 2.1s
    delay[i] = 0.3 + ((i * 0.37 + seed * 0.11) % 1) * 1.8;
    life[i] = 0;
  }

  return { pos, vel, delay, life };
}

function SymbolGeometry({ shape }: { shape: DomainConfig['symbol']['shape'] }) {
  switch (shape) {
    case 'tetra':
      return <tetrahedronGeometry args={[1, 0]} />;
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'sphere':
      return <sphereGeometry args={[1, 8, 8]} />;
    case 'ring':
      return <torusGeometry args={[0.7, 0.12, 8, 24]} />;
    case 'octa':
    default:
      return <octahedronGeometry args={[1, 0]} />;
  }
}

function PooledParticles({
  config,
  seed,
}: {
  config: DomainConfig;
  seed: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = Math.min(config.particle.count, MAX_PARTICLES);
  const pool = useMemo(
    () => buildPool(count, config.spawn, seed, config.particle.speed),
    [count, config.spawn, seed, config.particle.speed]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);

  useEffect(() => {
    return () => {
      // R3F disposes geometry/material on unmount; clear matrices
      if (meshRef.current) {
        meshRef.current.count = 0;
      }
    };
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    elapsed.current += delta;
    const t = elapsed.current;

    for (let i = 0; i < count; i++) {
      const appear = Math.max(0, Math.min(1, (t - pool.delay[i]) / 1.2));
      if (appear <= 0) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      pool.pos[i * 3] += pool.vel[i * 3] * delta;
      pool.pos[i * 3 + 1] += pool.vel[i * 3 + 1] * delta;
      pool.pos[i * 3 + 2] += pool.vel[i * 3 + 2] * delta;

      // Soft wrap to keep field breathing without reset flash
      if (pool.pos[i * 3 + 1] > 5) pool.pos[i * 3 + 1] = -5;
      if (pool.pos[i * 3 + 1] < -5.5) pool.pos[i * 3 + 1] = 5;

      const s = config.particle.size * appear * (0.7 + 0.3 * Math.sin(t + i));
      dummy.position.set(pool.pos[i * 3], pool.pos[i * 3 + 1], pool.pos[i * 3 + 2]);
      dummy.scale.setScalar(s);
      dummy.rotation.set(t * 0.2 + i, t * 0.15, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color={config.particle.color} transparent opacity={0.55} depthWrite={false} />
    </instancedMesh>
  );
}

function PooledSymbols({
  config,
  seed,
}: {
  config: DomainConfig;
  seed: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = Math.min(config.symbol.count, MAX_SYMBOLS);
  const pool = useMemo(
    () => buildPool(count, config.spawn, seed + 99, config.particle.speed * 0.4),
    [count, config.spawn, seed, config.particle.speed]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    elapsed.current += delta;
    const t = elapsed.current;

    for (let i = 0; i < count; i++) {
      // Distinct staggered delays ~0.3–2.1s
      const delay = pool.delay[i];
      const appear = Math.max(0, Math.min(1, (t - delay) / 1.4));
      if (appear <= 0) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      pool.pos[i * 3] += pool.vel[i * 3] * delta * 0.5;
      pool.pos[i * 3 + 1] += pool.vel[i * 3 + 1] * delta * 0.5;
      pool.pos[i * 3 + 2] += pool.vel[i * 3 + 2] * delta * 0.3;

      const breathe = 1 + Math.sin(t * 0.6 + i) * 0.08;
      const s = config.symbol.scale * appear * breathe;
      dummy.position.set(pool.pos[i * 3], pool.pos[i * 3 + 1], pool.pos[i * 3 + 2]);
      dummy.scale.setScalar(s);
      dummy.rotation.set(t * 0.15 + i, t * 0.1, t * 0.05);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <SymbolGeometry shape={config.symbol.shape} />
      <meshStandardMaterial
        color={config.symbol.color}
        emissive={config.symbol.color}
        emissiveIntensity={0.35}
        transparent
        opacity={0.7}
        roughness={0.6}
        metalness={0.2}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function CameraBreath({ breath, parallax }: { breath: number; parallax: number }) {
  const { camera } = useThree();
  const base = useRef({ x: 0, y: 0, z: 1 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const tx = Math.sin(t * 0.35) * breath + state.pointer.x * parallax;
    const ty = Math.cos(t * 0.28) * breath * 0.7 + state.pointer.y * parallax * 0.6;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, base.current.x + tx, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, base.current.y + ty, 0.04);
    camera.lookAt(0, 0, -4);
  });

  return null;
}

export default function DomainAtmosphere({ config }: { config: DomainConfig }) {
  // Remount seed when theme changes — clean pool rebuild
  const seed = useMemo(() => Date.now() % 10000, [config.id]);

  return (
    <>
      <color attach="background" args={[config.webglBg]} />
      <fog attach="fog" args={[config.fog.color, config.fog.near, config.fog.far]} />
      <ambientLight color={config.ambient.color} intensity={config.ambient.intensity} />
      {config.lights.map((l, i) => (
        <pointLight key={i} color={l.color} intensity={l.intensity} position={l.position} distance={18} />
      ))}
      <CameraBreath breath={config.camera.breath} parallax={config.camera.parallax} />
      <PooledParticles config={config} seed={seed} />
      <PooledSymbols config={config} seed={seed} />
    </>
  );
}
