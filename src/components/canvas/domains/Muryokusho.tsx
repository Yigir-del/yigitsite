import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const COLLAPSE_EVENT = 'universe-404-collapse';
const RESTORE_EVENT  = 'universe-404-restore';

// ── Falling Stars Component ──
function MovingStars({ hushed, collapsed }: { hushed: boolean; collapsed: boolean }) {
  const starsRef      = useRef<THREE.Group>(null);
  const collapseTime  = useRef(0);

  useFrame((state, delta) => {
    if (!starsRef.current) return;

    if (collapsed) {
      collapseTime.current += delta;
      // Accelerate stars downward – they pour off the sky
      const fallSpeed = Math.min(collapseTime.current * 0.6, 4.5);
      starsRef.current.position.y -= delta * fallSpeed;
      // Tumble faster and faster
      starsRef.current.rotation.x -= delta * (0.12 + collapseTime.current * 0.04);
      starsRef.current.rotation.y -= delta * (0.10 + collapseTime.current * 0.03);
      return;
    }

    // Normal behaviour
    collapseTime.current = 0;
    const speed = hushed ? 0.04 : 1;
    starsRef.current.rotation.x -= delta * 0.02 * speed;
    starsRef.current.rotation.y -= delta * 0.025 * speed;

    if (!hushed) {
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
    }
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
        speed={collapsed ? 5 : hushed ? 0.08 : 1}
      />
    </group>
  );
}

// ── Moon that cracks and splits in two ──
function Moon({ hushed, collapsed }: { hushed: boolean; collapsed: boolean }) {
  const [clickCount, setClickCount] = useState(0);

  // Refs for the three meshes: intact sphere, upper half, lower half
  const mainRef  = useRef<THREE.Mesh>(null);
  const upperRef = useRef<THREE.Mesh>(null);
  const lowerRef = useRef<THREE.Mesh>(null);

  // Collapse animation state (mutable – NOT React state, updated each frame)
  const cs = useRef({
    phase:    'intact' as 'intact' | 'shaking' | 'splitting' | 'gone',
    elapsed:  0,
    upperVY:  0,
    lowerVY:  0,
    opacity:  1.0,
  });

  // Cracking flash overlay (a ring plane flash)
  const crackRef  = useRef<THREE.Mesh>(null);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  useEffect(() => {
    if (collapsed) {
      cs.current = { phase: 'shaking', elapsed: 0, upperVY: 0, lowerVY: 0, opacity: 1 };
    } else {
      cs.current.phase   = 'intact';
      cs.current.opacity = 1;
      if (mainRef.current)  mainRef.current.visible  = true;
      if (upperRef.current) upperRef.current.visible = false;
      if (lowerRef.current) lowerRef.current.visible = false;
      if (crackRef.current) crackRef.current.visible = false;
    }
  }, [collapsed]);

  useFrame((_, delta) => {
    const state = cs.current;
    if (state.phase === 'intact') return;

    state.elapsed += delta;

    // ── PHASE 1: Shaking (0 – 1.4 s) ──
    if (state.phase === 'shaking') {
      if (mainRef.current) {
        mainRef.current.position.x = 5 + Math.sin(state.elapsed * 28) * 0.09;
        mainRef.current.position.y = 3 + Math.cos(state.elapsed * 22) * 0.07;
        // Subtle red glow on crack imminent
        const mat = mainRef.current.material as THREE.MeshStandardMaterial;
        const t = Math.min(state.elapsed / 1.4, 1);
        mat.emissive.setRGB(0.25 * t, 0.02 * t, 0.02 * t);
        mat.emissiveIntensity = 0.5 + t * 1.5;
      }
      // Flash crack line
      if (crackRef.current && state.elapsed > 1.0) {
        crackRef.current.visible = true;
        const mat = crackRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.85 * Math.sin((state.elapsed - 1.0) * Math.PI / 0.4);
      }

      // Transition to splitting
      if (state.elapsed > 1.4) {
        state.phase   = 'splitting';
        state.elapsed = 0;

        if (mainRef.current)  mainRef.current.visible  = false;
        if (crackRef.current) crackRef.current.visible = false;

        if (upperRef.current) {
          upperRef.current.visible = true;
          upperRef.current.position.set(5, 3, -10);
          upperRef.current.rotation.set(0, 0, 0);
          const mat = upperRef.current.material as THREE.MeshStandardMaterial;
          mat.opacity = 1;
        }
        if (lowerRef.current) {
          lowerRef.current.visible = true;
          lowerRef.current.position.set(5, 3, -10);
          lowerRef.current.rotation.set(0, 0, 0);
          const mat = lowerRef.current.material as THREE.MeshStandardMaterial;
          mat.opacity = 1;
        }
      }
    }

    // ── PHASE 2: Splitting (0 – ~2.5 s) ──
    if (state.phase === 'splitting') {
      // Accelerate the halves apart
      state.upperVY = Math.min(state.upperVY + delta * 0.5, 2.2);
      state.lowerVY = Math.min(state.lowerVY + delta * 0.5, 2.2);
      state.opacity = Math.max(0, state.opacity - delta * 0.38);

      if (upperRef.current) {
        upperRef.current.position.y += state.upperVY * delta;
        upperRef.current.position.x += delta * 0.4;
        upperRef.current.rotation.z += delta * 0.7;
        (upperRef.current.material as THREE.MeshStandardMaterial).opacity = state.opacity;
      }
      if (lowerRef.current) {
        lowerRef.current.position.y -= state.lowerVY * delta;
        lowerRef.current.position.x -= delta * 0.4;
        lowerRef.current.rotation.z -= delta * 0.5;
        (lowerRef.current.material as THREE.MeshStandardMaterial).opacity = state.opacity;
      }

      if (state.opacity <= 0) {
        state.phase = 'gone';
        if (upperRef.current) upperRef.current.visible = false;
        if (lowerRef.current) lowerRef.current.visible = false;
      }
    }
  });

  const baseColor   = clickCount > 5 ? '#ff4444' : '#ffffff';
  const emissive    = clickCount > 5 ? '#ff0000' : '#444444';
  const emissiveInt = hushed ? 0.35 : 0.5;

  return (
    <>
      {/* Full intact moon */}
      <mesh
        ref={mainRef}
        position={[5, 3, -10]}
        onClick={hushed ? undefined : () => setClickCount((c) => c + 1)}
        onPointerOver={hushed ? undefined : () => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={hushed  ? undefined : () => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissive}
          emissiveIntensity={emissiveInt}
          roughness={0.8}
        />
        {clickCount > 5 && <pointLight color="#ff0000" intensity={2} distance={20} />}
      </mesh>

      {/* Crack flash plane (horizontal ring at equator) */}
      <mesh ref={crackRef} position={[5, 3, -10]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.45, 1.6, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Upper half-sphere  (theta: 0 → π/2) */}
      <mesh ref={upperRef} position={[5, 3, -10]} visible={false}>
        <sphereGeometry args={[1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={baseColor}
          emissive="#330808"
          emissiveIntensity={0.6}
          roughness={0.85}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lower half-sphere  (theta: π/2 → π) */}
      <mesh ref={lowerRef} position={[5, 3, -10]} visible={false}>
        <sphereGeometry args={[1.5, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial
          color={baseColor}
          emissive="#330808"
          emissiveIntensity={0.6}
          roughness={0.85}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

// ── Root Scene ──
export default function Muryokusho({ hushed = false }: { hushed?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onCollapse = () => setCollapsed(true);
    const onRestore  = () => setCollapsed(false);
    window.addEventListener(COLLAPSE_EVENT, onCollapse);
    window.addEventListener(RESTORE_EVENT,  onRestore);
    return () => {
      window.removeEventListener(COLLAPSE_EVENT, onCollapse);
      window.removeEventListener(RESTORE_EVENT,  onRestore);
    };
  }, []);

  return (
    <>
      <color attach="background" args={['#0d131f']} />
      <ambientLight intensity={hushed ? 0.42 : 0.5} />
      <directionalLight position={[-10, 10, 5]} intensity={hushed ? 0.85 : 1} />
      <MovingStars hushed={hushed} collapsed={collapsed} />
      <Moon hushed={hushed} collapsed={collapsed} />
      <fog attach="fog" args={['#0d131f', 5, 15]} />
    </>
  );
}
