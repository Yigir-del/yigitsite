import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../../context/ThemeContext';
import { DOMAIN_MAP, type DomainId } from '../../../themes/domains';
import { APP_EVENTS } from '../../../utils/events';
import {
  getNoteTraces,
  hashOwnedStarPos,
  hashStarPos,
  NOTE_TRACES_EVENT,
  type NoteTrace,
} from '../../../utils/noteTraces';
import { samsunSkyBand } from '../../../utils/samsunTime';
import {
  setProjectedMoon,
  triggerLunarClick,
  useLunarSecret,
} from '../../../features/lunarSecret/lunarSecretStore';
import {
  setProjectedOwnedStars,
  useNoteStars,
  type ProjectedStarPoint,
} from '../../../features/noteStars/noteStarsStore';

const COLLAPSE_EVENT = APP_EVENTS.UNIVERSE_COLLAPSE;
const RESTORE_EVENT = APP_EVENTS.UNIVERSE_RESTORE;

// ── Falling Stars Component ──
function MovingStars({ hushed, collapsed }: { hushed: boolean; collapsed: boolean }) {
  const starsRef = useRef<THREE.Group>(null);
  const collapseTime = useRef(0);

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

// ── Moon that cracks and splits in two + reveals its hidden side on hold (§6) ──
function Moon({ hushed, collapsed }: { hushed: boolean; collapsed: boolean }) {
  const lunar = useLunarSecret();
  const clickCount = lunar.clickCount;

  // Refs for the three meshes: intact sphere, upper half, lower half
  const mainRef = useRef<THREE.Mesh>(null);
  const upperRef = useRef<THREE.Mesh>(null);
  const lowerRef = useRef<THREE.Mesh>(null);
  const projCenterRef = useRef(new THREE.Vector3());
  const projEdgeRef = useRef(new THREE.Vector3());

  // Collapse animation state (mutable – NOT React state, updated each frame)
  const cs = useRef({
    phase: 'intact' as 'intact' | 'shaking' | 'splitting' | 'gone',
    elapsed: 0,
    upperVY: 0,
    lowerVY: 0,
    opacity: 1.0,
  });

  // Cracking flash overlay (a ring plane flash)
  const crackRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  useEffect(() => {
    if (collapsed) {
      cs.current = { phase: 'shaking', elapsed: 0, upperVY: 0, lowerVY: 0, opacity: 1 };
    } else {
      cs.current.phase = 'intact';
      cs.current.opacity = 1;
      if (mainRef.current) {
        mainRef.current.visible = true;
        mainRef.current.position.set(5, 3, -10);
      }
      if (upperRef.current) upperRef.current.visible = false;
      if (lowerRef.current) lowerRef.current.visible = false;
      if (crackRef.current) crackRef.current.visible = false;
    }
  }, [collapsed]);

  useFrame((r3fState, delta) => {
    const state = cs.current;

    // Project 3D Moon coordinates to viewport so LunarSecretOverlay aligns 1:1 (§6.6)
    if (state.phase === 'intact' && mainRef.current && !hushed) {
      const center = projCenterRef.current.copy(mainRef.current.position);
      const edge = projEdgeRef.current.copy(mainRef.current.position).add(new THREE.Vector3(1.5, 0, 0));
      center.project(r3fState.camera);
      edge.project(r3fState.camera);

      const width = r3fState.size.width;
      const height = r3fState.size.height;
      if (width > 0 && height > 0 && center.z < 1) {
        const screenX = (center.x * 0.5 + 0.5) * width;
        const screenY = (-center.y * 0.5 + 0.5) * height;
        const edgeX = (edge.x * 0.5 + 0.5) * width;
        const radiusPx = Math.max(28, Math.abs(edgeX - screenX));
        setProjectedMoon({
          x: screenX,
          y: screenY,
          radiusPx,
          visible: true,
        });
      }

      // Smoothly rotate the Moon when held or when its hidden side is revealed (§6.3)
      const targetRotY = lunar.secretRevealed
        ? Math.PI
        : lunar.holding
          ? lunar.holdProgress * Math.PI * 0.65
          : 0;
      mainRef.current.rotation.y = THREE.MathUtils.lerp(
        mainRef.current.rotation.y,
        targetRotY,
        Math.min(1, delta * 5.5),
      );
    } else if (state.phase !== 'intact') {
      setProjectedMoon({ x: 0, y: 0, radiusPx: 42, visible: false });
    }

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
        mat.opacity = 0.85 * Math.sin(((state.elapsed - 1.0) * Math.PI) / 0.4);
      }

      // Transition to splitting
      if (state.elapsed > 1.4) {
        state.phase = 'splitting';
        state.elapsed = 0;

        if (mainRef.current) mainRef.current.visible = false;
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

  const baseColor =
    clickCount > 5
      ? '#ff4444'
      : lunar.secretRevealed
        ? '#dbeafe'
        : '#ffffff';
  const emissive =
    clickCount > 5
      ? '#ff0000'
      : lunar.secretRevealed
        ? '#3b82f6'
        : lunar.holding
          ? '#64748b'
          : '#444444';
  const emissiveInt = hushed ? 0.35 : lunar.secretRevealed ? 0.68 : 0.5;

  return (
    <>
      {/* Full intact moon */}
      <mesh
        ref={mainRef}
        position={[5, 3, -10]}
        onClick={hushed ? undefined : () => triggerLunarClick()}
        onPointerOver={
          hushed
            ? undefined
            : () => {
                document.body.style.cursor = 'pointer';
              }
        }
        onPointerOut={
          hushed
            ? undefined
            : () => {
                document.body.style.cursor = 'auto';
              }
        }
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

function TraceConstellation({
  hushed,
  particleColor,
}: {
  hushed: boolean;
  particleColor: string;
}) {
  const [traces, setTraces] = useState<NoteTrace[]>(() => getNoteTraces());
  const { ownedNoteIds, selectedStarNoteId } = useNoteStars();
  const projVecRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const onTraces = (e: Event) => {
      const detail = (e as CustomEvent<NoteTrace[]>).detail;
      if (!Array.isArray(detail)) return;
      setTraces(detail.filter((row) => row.id && row.t > 0).slice(0, 48));
    };
    window.addEventListener(NOTE_TRACES_EVENT, onTraces);
    return () => window.removeEventListener(NOTE_TRACES_EVENT, onTraces);
  }, []);

  const ownedSet = useMemo(() => new Set(ownedNoteIds), [ownedNoteIds]);

  // Ambient public stars exclude visitor-owned IDs so there are zero duplicate stars (§8.9)
  const ambientStars = useMemo(
    () =>
      traces
        .filter((row) => !ownedSet.has(row.id))
        .map((row) => ({ id: row.id, pos: hashStarPos(row.id) })),
    [traces, ownedSet],
  );

  // Visitor-owned stars sit at deterministic forward-camera coordinates (§8.8)
  const ownedStars = useMemo(
    () =>
      ownedNoteIds.map((id) => ({
        id,
        pos: hashOwnedStarPos(id),
      })),
    [ownedNoteIds],
  );

  useFrame((r3fState) => {
    if (ownedStars.length === 0 || hushed) return;
    const width = r3fState.size.width;
    const height = r3fState.size.height;
    if (width <= 0 || height <= 0) return;

    const nextProjected: Record<string, ProjectedStarPoint> = {};
    for (const star of ownedStars) {
      const vec = projVecRef.current.set(star.pos[0], star.pos[1], star.pos[2]);
      vec.project(r3fState.camera);
      const visible =
        vec.z < 1 && vec.x >= -0.95 && vec.x <= 0.95 && vec.y >= -0.92 && vec.y <= 0.92;
      nextProjected[star.id] = {
        x: (vec.x * 0.5 + 0.5) * width,
        y: (-vec.y * 0.5 + 0.5) * height,
        visible,
      };
    }
    setProjectedOwnedStars(nextProjected);
  });

  if (ambientStars.length === 0 && ownedStars.length === 0) return null;

  return (
    <group>
      {ambientStars.map((star) => (
        <mesh key={star.id} position={star.pos}>
          <sphereGeometry args={[0.09, 6, 6]} />
          <meshBasicMaterial
            color={particleColor}
            transparent
            opacity={hushed ? 0.35 : 0.85}
            depthWrite={false}
          />
        </mesh>
      ))}
      {ownedStars.map((star) => {
        const isSelected = selectedStarNoteId === star.id;
        return (
          <mesh key={`owned-${star.id}`} position={star.pos}>
            <sphereGeometry args={[isSelected ? 0.17 : 0.13, 10, 10]} />
            <meshBasicMaterial
              color={isSelected ? '#fde68a' : '#fef3c7'}
              transparent
              opacity={hushed ? 0.45 : 0.96}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// oxlint-disable-next-line react/only-export-components
export function resolveSceneAtmosphere(theme: DomainId, hushed: boolean) {
  const domain = DOMAIN_MAP[theme] ?? DOMAIN_MAP.Muryokusho;
  const sky = !hushed && theme === 'Muryokusho' ? samsunSkyBand() : 'night';
  const ambient = hushed ? 0.42 : sky === 'day' ? 0.58 : sky === 'dusk' ? 0.53 : 0.5;
  const dir = hushed ? 0.85 : sky === 'day' ? 1.08 : 1;
  const fogFar = sky === 'day' ? 18 : sky === 'dusk' ? 16 : 15;

  const isDefaultDomain = theme === 'Muryokusho';
  const fogColor = isDefaultDomain
    ? sky === 'day'
      ? '#141c2a'
      : domain.fogHint
    : domain.fogHint;
  const bgColor = isDefaultDomain
    ? sky === 'day'
      ? '#101820'
      : domain.fogHint
    : domain.fogHint;

  return {
    ambient,
    dir,
    fogFar,
    fogColor,
    bgColor,
    particleColor: domain.particleHint,
  };
}

// ── Root Scene ──
export default function Muryokusho({ hushed = false }: { hushed?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const { ambient, dir, fogFar, fogColor, bgColor, particleColor } = resolveSceneAtmosphere(
    theme,
    hushed,
  );

  useEffect(() => {
    const onCollapse = () => setCollapsed(true);
    const onRestore = () => setCollapsed(false);
    window.addEventListener(COLLAPSE_EVENT, onCollapse);
    window.addEventListener(RESTORE_EVENT, onRestore);
    return () => {
      window.removeEventListener(COLLAPSE_EVENT, onCollapse);
      window.removeEventListener(RESTORE_EVENT, onRestore);
    };
  }, []);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <ambientLight intensity={ambient} />
      <directionalLight position={[-10, 10, 5]} intensity={dir} color={particleColor} />
      <MovingStars hushed={hushed} collapsed={collapsed} />
      <Moon hushed={hushed} collapsed={collapsed} />
      {!collapsed && <TraceConstellation hushed={hushed} particleColor={particleColor} />}
      <fog attach="fog" args={[fogColor, 5, fogFar]} />
    </>
  );
}
