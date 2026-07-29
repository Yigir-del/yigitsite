import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

type InspectState = 'IDLE' | 'ENTERING' | 'INSPECTING' | 'EXITING';

/**
 * Smooth 4x Inspect Glide — 3D Sacred Geometry Wireframe Pyramid Component.
 *
 * Ambient Mode:
 * - Keeps current small top-right pyramid (96px, top: 14px, right: 20px, whisper opacity ~18%).
 * - Rotates slowly in 36s cycle with 8.5s resting breath.
 *
 * Click / Inspect Mode:
 * - Glides smoothly from top-right to screen center over 1.4s while expanding to ~4x scale.
 * - Backdrop blur (10px) & vignette overlay fade in smoothly.
 * - Interactive left-click drag rotation with smooth momentum.
 * - Clicking backdrop or pressing ESC glides pyramid smoothly back to top-right ambient state.
 */
export default function WireframePyramid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  const [mounted, setMounted] = useState(false);
  const [inspectState, setInspectState] = useState<InspectState>('IDLE');
  const inspectStateRef = useRef<InspectState>('IDLE');

  useEffect(() => {
    inspectStateRef.current = inspectState;
  }, [inspectState]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const startInspect = useCallback(() => {
    if (inspectStateRef.current !== 'IDLE') return;
    setInspectState('ENTERING');
  }, []);

  const closeInspect = useCallback(() => {
    if (inspectStateRef.current !== 'INSPECTING' && inspectStateRef.current !== 'ENTERING') return;
    setInspectState('EXITING');
  }, []);

  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeInspect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeInspect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Sacred Geometry Construction ---
    const positions: number[] = [];
    const lineProgress: number[] = [];

    const addEdge = (v1: THREE.Vector3, v2: THREE.Vector3) => {
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      lineProgress.push(0, 1);
    };

    const addPolygon = (verts: THREE.Vector3[]) => {
      for (let i = 0; i < verts.length; i++) {
        addEdge(verts[i], verts[(i + 1) % verts.length]);
      }
    };

    const H = 1.6;
    const yApex = H / 2;
    const yBase = -H / 2;
    const R_base = 0.8;

    const getLevelVerts = (t: number, rotOffset = 0) => {
      const y = yApex * (1 - t) + yBase * t;
      const r = R_base * t;
      return [0, 1, 2].map((i) => {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2 + rotOffset;
        return new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle));
      });
    };

    const apexTop = new THREE.Vector3(0, yApex, 0);
    const apexBottom = new THREE.Vector3(0, yBase, 0);
    const centerCore = new THREE.Vector3(0, 0, 0);

    const level1 = getLevelVerts(0.33);
    const level2 = getLevelVerts(0.66);
    const level3 = getLevelVerts(1.0);

    // Primary Outer Tetrahedron & Rings
    for (let k = 0; k < 3; k++) {
      addEdge(apexTop, level1[k]);
      addEdge(level1[k], level2[k]);
      addEdge(level2[k], level3[k]);
    }
    addPolygon(level1);
    addPolygon(level2);
    addPolygon(level3);

    // Inverted Merkaba Dual Inner Geometry
    const invLevel1 = getLevelVerts(0.66, Math.PI / 3);
    const invLevel2 = getLevelVerts(0.33, Math.PI / 3);
    invLevel1.forEach((v) => (v.y = -v.y));
    invLevel2.forEach((v) => (v.y = -v.y));

    for (let k = 0; k < 3; k++) {
      addEdge(apexBottom, invLevel1[k]);
      addEdge(invLevel1[k], invLevel2[k]);
      addEdge(invLevel2[k], apexTop);
    }
    addPolygon(invLevel1);
    addPolygon(invLevel2);

    // Central Core Diamond Struts
    for (let k = 0; k < 3; k++) {
      addEdge(level1[k], centerCore);
      addEdge(level2[k], centerCore);
      addEdge(invLevel1[k], centerCore);
      addEdge(invLevel2[k], centerCore);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(lineProgress, 1));

    // --- Custom Line Energy Shader ---
    const lineShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#d8e6ff') },
        uPulseColor: { value: new THREE.Color('#ffffff') },
        uEnergySpeed: { value: 1.6 },
        uJitter: { value: 0 },
        uOpacity: { value: 0.18 },
        uPulseIntensity: { value: 0.25 },
      },
      vertexShader: `
        attribute float aProgress;
        varying float vProgress;
        varying vec3 vPos;
        uniform float uTime;
        uniform float uJitter;

        void main() {
          vProgress = aProgress;
          vec3 pos = position;
          if (uJitter > 0.0) {
            float jitterX = sin(uTime * 28.0 + pos.y * 10.0) * uJitter;
            float jitterY = cos(uTime * 28.0 + pos.x * 10.0) * uJitter;
            pos.x += jitterX;
            pos.y += jitterY;
          }
          vPos = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying float vProgress;
        varying vec3 vPos;
        uniform vec3 uColor;
        uniform vec3 uPulseColor;
        uniform float uTime;
        uniform float uEnergySpeed;
        uniform float uOpacity;
        uniform float uPulseIntensity;

        void main() {
          float wave = sin(vProgress * 11.0 - uTime * uEnergySpeed + vPos.y * 2.5);
          float pulse = pow(0.5 + 0.5 * wave, 4.0);

          vec3 finalColor = mix(uColor, uPulseColor, pulse * uPulseIntensity);
          float alpha = uOpacity * (0.85 + pulse * 0.35);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    const pyramidGroup = new THREE.Group();
    const wireframeMesh = new THREE.LineSegments(geometry, lineShaderMaterial);
    pyramidGroup.add(wireframeMesh);

    // Central Core Orb
    const coreGeometry = new THREE.SphereGeometry(0.065, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const coreOrb = new THREE.Mesh(coreGeometry, coreMaterial);
    pyramidGroup.add(coreOrb);

    scene.add(pyramidGroup);

    // --- Helper: World Coordinates for Top-Right Corner ---
    const getTopRightWorldPos = () => {
      const vec = new THREE.Vector3();
      const screenX = window.innerWidth - 65;
      const screenY = 65;

      vec.set(
        (screenX / window.innerWidth) * 2 - 1,
        -(screenY / window.innerHeight) * 2 + 1,
        0.5
      );
      vec.unproject(camera);

      const dir = vec.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    };

    // --- State Variables ---
    let animId = 0;
    let prevTime = performance.now();

    const BASE_AMBIENT_SCALE = 0.65;
    const TARGET_INSPECT_SCALE = 2.60; // Exactly 4x scale (0.65 * 4 = 2.60)

    const curPos = getTopRightWorldPos();
    let targetPos = curPos.clone();
    let curScale = BASE_AMBIENT_SCALE;
    let targetScale = BASE_AMBIENT_SCALE;

    let rotX = 0.22;
    let rotY = 0;
    let rotZ = 0;
    let velX = 0;
    let velY = 0;

    let targetCamZ = 6.2;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    let transitionProgress = 0;

    // Drag Pointer Events
    const onPointerDown = (e: PointerEvent) => {
      if (inspectStateRef.current !== 'INSPECTING') return;
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || inspectStateRef.current !== 'INSPECTING') return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      velY += dx * 0.0035;
      velX += dy * 0.0035;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (inspectStateRef.current !== 'INSPECTING') return;
      targetCamZ = Math.min(8.5, Math.max(4.2, targetCamZ + e.deltaY * 0.0035));
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: true });

    // Ambient Mouse Parallax
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let curParallaxX = 0;
    let curParallaxY = 0;

    const handleAmbientMouseMove = (e: MouseEvent) => {
      if (inspectStateRef.current !== 'IDLE') return;
      const distToTopRight = Math.hypot(window.innerWidth - e.clientX, e.clientY);
      if (distToTopRight < 360) {
        const factor = (1 - distToTopRight / 360) * 0.12;
        targetParallaxX = ((e.clientX - (window.innerWidth - 65)) / 400) * factor;
        targetParallaxY = (e.clientY / window.innerHeight - 0.08) * factor;
      } else {
        targetParallaxX = 0;
        targetParallaxY = 0;
      }
    };

    window.addEventListener('mousemove', handleAmbientMouseMove, { passive: true });

    // Theme Config Helper
    const getThemeConfig = (domId: string, isInspect: boolean) => {
      if (domId === 'FukumaMizushi') {
        return {
          stroke: '#ff5555',
          pulse: '#ffcccc',
          glow: isInspect ? 'rgba(255, 40, 40, 0.55)' : 'rgba(255, 40, 40, 0.22)',
          haloBorder: isInspect ? 'rgba(255, 60, 60, 0.35)' : 'rgba(255, 60, 60, 0.14)',
          speed: isInspect ? 3.6 : 2.2,
          jitter: isInspect ? 0.012 : 0.006,
          opacity: isInspect ? 0.55 : 0.22,
          pulseIntensity: isInspect ? 0.5 : 0.25,
        };
      }
      if (domId === 'KangoAneitei') {
        return {
          stroke: '#b866ff',
          pulse: '#e9d5ff',
          glow: isInspect ? 'rgba(160, 60, 240, 0.55)' : 'rgba(160, 60, 240, 0.22)',
          haloBorder: isInspect ? 'rgba(180, 90, 255, 0.32)' : 'rgba(180, 90, 255, 0.12)',
          speed: isInspect ? 1.8 : 1.2,
          jitter: isInspect ? 0.002 : 0.001,
          opacity: isInspect ? 0.48 : 0.16,
          pulseIntensity: isInspect ? 0.45 : 0.25,
        };
      }
      // Muryokusho
      return {
        stroke: '#d8e6ff',
        pulse: '#ffffff',
        glow: isInspect ? 'rgba(100, 170, 255, 0.55)' : 'rgba(100, 170, 255, 0.22)',
        haloBorder: isInspect ? 'rgba(140, 190, 255, 0.32)' : 'rgba(140, 190, 255, 0.14)',
        speed: isInspect ? 2.4 : 1.6,
        jitter: 0.0,
        opacity: isInspect ? 0.52 : 0.18,
        pulseIntensity: isInspect ? 0.5 : 0.25,
      };
    };

    const targetColor = new THREE.Color();
    const targetPulseColor = new THREE.Color();

    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    // --- Main Render Loop ---
    const tick = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const timeSec = now / 1000;

      const state = inspectStateRef.current;

      // --- Progress Interpolation ---
      if (state === 'ENTERING') {
        transitionProgress += dt / 1.4; // 1.4s entrance glide
        if (transitionProgress >= 1.0) {
          transitionProgress = 1.0;
          setInspectState('INSPECTING');
        }
      } else if (state === 'EXITING') {
        transitionProgress -= dt / 1.3; // 1.3s exit glide
        if (transitionProgress <= 0.0) {
          transitionProgress = 0.0;
          setInspectState('IDLE');
          targetCamZ = 6.2;
        }
      } else if (state === 'INSPECTING') {
        transitionProgress = 1.0;
      } else {
        transitionProgress = 0.0;
      }

      const p = easeInOutCubic(transitionProgress);

      // --- 3D Position & 4x Scale Lerp ---
      const trPos = getTopRightWorldPos();
      const inspectPos = new THREE.Vector3(0, 0, 0);

      targetPos.copy(trPos).lerp(inspectPos, p);
      curPos.lerp(targetPos, 0.12);
      pyramidGroup.position.copy(curPos);

      // Smooth Scale lerp from BASE_AMBIENT_SCALE (0.65) to TARGET_INSPECT_SCALE (2.60 = 4x)
      targetScale = THREE.MathUtils.lerp(BASE_AMBIENT_SCALE, TARGET_INSPECT_SCALE, p);
      curScale += (targetScale - curScale) * 0.12;
      pyramidGroup.scale.setScalar(curScale);

      camera.position.z += (targetCamZ - camera.position.z) * 0.1;

      // --- Rotation & Drag Momentum ---
      if (state === 'INSPECTING' || state === 'ENTERING') {
        rotY += velY;
        rotX += velX;
        velY *= 0.92;
        velX *= 0.92;

        if (!isDragging && Math.abs(velY) < 0.001) {
          rotY += 0.0025;
        }
      } else {
        const baseSpeed = (2 * Math.PI) / 36;
        rotY += (baseSpeed + Math.sin(timeSec * 0.2) * 0.0015) * dt;
        rotX = THREE.MathUtils.lerp(rotX, 0.22 + Math.sin(timeSec * 0.3) * 0.04, 0.05);
        rotZ = Math.sin(timeSec * 0.18) * 0.025;
        velX *= 0.85;
        velY *= 0.85;
      }

      // Parallax shift
      curParallaxX += (targetParallaxX - curParallaxX) * 0.05;
      curParallaxY += (targetParallaxY - curParallaxY) * 0.05;
      const floatY = Math.sin(timeSec * 1.1) * (1 - p) * 0.12;

      pyramidGroup.position.x += curParallaxX;
      pyramidGroup.position.y += floatY + curParallaxY;

      pyramidGroup.rotation.x = rotX;
      pyramidGroup.rotation.y = rotY;
      pyramidGroup.rotation.z = rotZ;

      // --- Core Orb & Breathing ---
      const breathPhase = Math.sin(timeSec * (0.74 + p * 0.4));
      const coreScaleFactor = 1.0 + breathPhase * (0.16 + p * 0.1);
      coreOrb.scale.setScalar(coreScaleFactor);
      coreMaterial.opacity = (0.35 + breathPhase * 0.12) * (1 + p * 0.4);

      // --- Uniform Interpolation ---
      const config = getThemeConfig(themeRef.current, p > 0.3);
      targetColor.set(config.stroke);
      targetPulseColor.set(config.pulse);

      lineShaderMaterial.uniforms.uTime.value = timeSec;
      lineShaderMaterial.uniforms.uColor.value.lerp(targetColor, 0.06);
      lineShaderMaterial.uniforms.uPulseColor.value.lerp(targetPulseColor, 0.06);
      lineShaderMaterial.uniforms.uEnergySpeed.value = THREE.MathUtils.lerp(
        lineShaderMaterial.uniforms.uEnergySpeed.value,
        config.speed,
        0.08
      );
      lineShaderMaterial.uniforms.uJitter.value = THREE.MathUtils.lerp(
        lineShaderMaterial.uniforms.uJitter.value,
        config.jitter,
        0.08
      );
      lineShaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        lineShaderMaterial.uniforms.uOpacity.value,
        config.opacity,
        0.08
      );
      lineShaderMaterial.uniforms.uPulseIntensity.value = THREE.MathUtils.lerp(
        lineShaderMaterial.uniforms.uPulseIntensity.value,
        config.pulseIntensity,
        0.08
      );

      coreMaterial.color.copy(lineShaderMaterial.uniforms.uPulseColor.value);

      // --- Halo DOM Sync ---
      if (haloRef.current) {
        haloRef.current.style.borderColor = config.haloBorder;
        haloRef.current.style.opacity = `${(0.22 + p * 0.30).toFixed(2)}`;
        haloRef.current.style.transform = `rotate(${-rotY * 25}deg) scale(${(1.0 + breathPhase * 0.03 + p * 0.5).toFixed(2)})`;
      }
      if (glowRef.current) {
        const glowBlur = 24 + p * 36;
        const glowSpread = 4 + p * 14;
        glowRef.current.style.boxShadow = `0 0 ${glowBlur}px ${glowSpread}px ${config.glow}`;
        glowRef.current.style.opacity = `${(0.30 + p * 0.30).toFixed(2)}`;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', handleAmbientMouseMove);
      geometry.dispose();
      lineShaderMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  const isInspectActive = inspectState !== 'IDLE';

  return (
    <>
      {/* Backdrop overlay for Inspection Mode (Click anywhere outside to close) */}
      <div
        className={`artifact-inspect-backdrop${isInspectActive ? ' is-active' : ''}`}
        onClick={closeInspect}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 130,
          pointerEvents: isInspectActive ? 'auto' : 'none',
          opacity: isInspectActive ? 1 : 0,
          backdropFilter: 'blur(10px) brightness(0.70) contrast(0.96)',
          WebkitBackdropFilter: 'blur(10px) brightness(0.70) contrast(0.96)',
          background:
            'radial-gradient(circle at center, rgba(10, 14, 24, 0.40) 0%, rgba(5, 7, 14, 0.80) 100%)',
          transition:
            'opacity 1.3s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }}
      />

      {/* Top-Right Mini Hit Target Button (Click small pyramid to inspect) */}
      <button
        type="button"
        onClick={startInspect}
        className="artifact-ambient-target"
        aria-label="Inspect 3D Artifact — Ryōiki Tenkai Artifact"
        title="Click to inspect 3D Artifact"
        style={{
          position: 'fixed',
          top: '10px',
          right: '15px',
          width: '90px',
          height: '90px',
          zIndex: 145,
          cursor: inspectState === 'IDLE' ? 'pointer' : 'default',
          border: 'none',
          background: 'transparent',
          padding: 0,
          outline: 'none',
          pointerEvents: inspectState === 'IDLE' ? 'auto' : 'none',
          userSelect: 'none',
        }}
      />

      {/* Full-Screen WebGL Canvas Wrapper */}
      <div
        ref={containerRef}
        className="sacred-pyramid-container"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 140,
          pointerEvents: inspectState === 'INSPECTING' ? 'auto' : 'none',
          userSelect: 'none',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 2.5s ease-out',
          willChange: 'transform, opacity',
        }}
      >
        {/* Ambient Glow Backdrop */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            top: inspectState === 'IDLE' ? '50px' : '50%',
            right: inspectState === 'IDLE' ? '55px' : 'auto',
            left: inspectState === 'IDLE' ? 'auto' : '50%',
            transform: inspectState === 'IDLE' ? 'none' : 'translate(-50%, -50%)',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            opacity: 0.30,
            pointerEvents: 'none',
            transition: 'top 1.3s ease, right 1.3s ease, left 1.3s ease, box-shadow 1s ease',
            filter: 'blur(12px)',
          }}
        />

        {/* Rotating Halo Ring */}
        <div
          ref={haloRef}
          style={{
            position: 'absolute',
            top: inspectState === 'IDLE' ? '50px' : '50%',
            right: inspectState === 'IDLE' ? '55px' : 'auto',
            left: inspectState === 'IDLE' ? 'auto' : '50%',
            marginTop: inspectState === 'IDLE' ? '-34px' : '-75px',
            marginRight: inspectState === 'IDLE' ? '-34px' : 'auto',
            marginLeft: inspectState === 'IDLE' ? 'auto' : '-75px',
            width: inspectState === 'IDLE' ? '68px' : '150px',
            height: inspectState === 'IDLE' ? '68px' : '150px',
            borderRadius: '50%',
            border: '1px dashed rgba(140, 190, 255, 0.14)',
            opacity: 0.22,
            pointerEvents: 'none',
            transition: 'all 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Full-Screen WebGL Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100vw',
            height: '100vh',
            display: 'block',
            cursor: inspectState === 'INSPECTING' ? 'grab' : 'default',
          }}
        />
      </div>
    </>
  );
}
