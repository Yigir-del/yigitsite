import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

/**
 * Sacred Geometry 3D Wireframe Pyramid Component.
 * Features:
 * - Dual Tetrahedral Merkaba & Diamond Core Sacred Geometry.
 * - Custom WebGL Energy Line Shader (traveling white light pulse).
 * - Central Glowing Energy Orb (breathing core point).
 * - Rotating Energy Halo Ring backdrop.
 * - Organic precession motion & floating sine wave.
 * - Dynamic theme behaviors (Muryokusho serene, Fukuma Mizushi red jitter, Kango An'eitei purple shadow).
 */
export default function WireframePyramid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.1, 5.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(110, 110);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

    const H = 2.3;
    const yApex = H / 2; // +1.15
    const yBase = -H / 2; // -1.15
    const R_base = 1.15;

    // 1. Primary Outer Pyramid Levels
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

    // 2. Inverted Merkaba Dual Inner Geometry
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

    // 3. Central Core Diamond Struts
    for (let k = 0; k < 3; k++) {
      addEdge(level1[k], centerCore);
      addEdge(level2[k], centerCore);
      addEdge(invLevel1[k], centerCore);
      addEdge(invLevel2[k], centerCore);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(lineProgress, 1));

    // --- Custom Energy Line Shader ---
    const lineShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#d8e6ff') },
        uPulseColor: { value: new THREE.Color('#ffffff') },
        uEnergySpeed: { value: 2.2 },
        uJitter: { value: 0 },
        uOpacity: { value: 0.28 },
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
            float jitterX = sin(uTime * 35.0 + pos.y * 12.0) * uJitter;
            float jitterY = cos(uTime * 35.0 + pos.x * 12.0) * uJitter;
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

        void main() {
          // Traveling light energy pulse along edge lines
          float wave = sin(vProgress * 14.0 - uTime * uEnergySpeed + vPos.y * 3.0);
          float pulse = pow(0.5 + 0.5 * wave, 5.0);

          vec3 finalColor = mix(uColor, uPulseColor, pulse * 0.7);
          float alpha = uOpacity * (1.0 + pulse * 0.5);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    const wireframeMesh = new THREE.LineSegments(geometry, lineShaderMaterial);
    scene.add(wireframeMesh);

    // --- Central Glowing Energy Core Orb ---
    const coreGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const coreOrb = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreOrb);

    // --- Animation Variables ---
    let animId = 0;
    let prevTime = performance.now();
    let yRot = 0;

    // Smooth Parallax
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let curParallaxX = 0;
    let curParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX, e.clientY);
      if (dist < 420) {
        const factor = (1 - dist / 420) * 4.0;
        targetParallaxX = (e.clientX / window.innerWidth - 0.1) * factor;
        targetParallaxY = (e.clientY / window.innerHeight - 0.1) * factor;
      } else {
        targetParallaxX = 0;
        targetParallaxY = 0;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Helper for Theme Config
    const getThemeConfig = (domId: string) => {
      if (domId === 'FukumaMizushi') {
        return {
          stroke: '#ff5555',
          pulse: '#ffe0e0',
          glow: 'rgba(255, 40, 40, 0.45)',
          haloBorder: 'rgba(255, 60, 60, 0.3)',
          speed: 3.5,
          jitter: 0.01,
          opacity: 0.32,
        };
      }
      if (domId === 'KangoAneitei') {
        return {
          stroke: '#b866ff',
          pulse: '#f3e8ff',
          glow: 'rgba(160, 60, 240, 0.45)',
          haloBorder: 'rgba(180, 90, 255, 0.25)',
          speed: 1.5,
          jitter: 0.002,
          opacity: 0.25,
        };
      }
      // Default: Muryokusho
      return {
        stroke: '#d8e6ff',
        pulse: '#ffffff',
        glow: 'rgba(100, 170, 255, 0.4)',
        haloBorder: 'rgba(140, 190, 255, 0.25)',
        speed: 2.2,
        jitter: 0.0,
        opacity: 0.28,
      };
    };

    const targetColor = new THREE.Color();
    const targetPulseColor = new THREE.Color();

    // --- Main Render Loop ---
    const tick = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const timeSec = now / 1000;

      // 1. Organic Precession & Rotation
      const baseSpeed = (2 * Math.PI) / 30; // ~30 sec per revolution
      const organicSpeed = baseSpeed + Math.sin(timeSec * 0.3) * 0.003;
      yRot += organicSpeed * dt;

      wireframeMesh.rotation.y = yRot;
      wireframeMesh.rotation.x = 0.24 + Math.sin(timeSec * 0.4) * 0.07;
      wireframeMesh.rotation.z = Math.sin(timeSec * 0.25) * 0.04;

      // 2. Central Core Orb Pulse
      const corePulse = 1.0 + Math.sin(timeSec * 2.8) * 0.25;
      coreOrb.scale.setScalar(corePulse);
      coreMaterial.opacity = 0.6 + Math.sin(timeSec * 2.8) * 0.2;

      // 3. Update Shader Uniforms & Theme Smooth Interpolation
      const config = getThemeConfig(themeRef.current);
      targetColor.set(config.stroke);
      targetPulseColor.set(config.pulse);

      lineShaderMaterial.uniforms.uTime.value = timeSec;
      lineShaderMaterial.uniforms.uColor.value.lerp(targetColor, 0.05);
      lineShaderMaterial.uniforms.uPulseColor.value.lerp(targetPulseColor, 0.05);
      lineShaderMaterial.uniforms.uEnergySpeed.value = config.speed;
      lineShaderMaterial.uniforms.uJitter.value = config.jitter;
      lineShaderMaterial.uniforms.uOpacity.value = config.opacity;

      coreMaterial.color.copy(lineShaderMaterial.uniforms.uPulseColor.value);

      // 4. Update Halo & Glow Elements
      if (haloRef.current) {
        haloRef.current.style.borderColor = config.haloBorder;
        haloRef.current.style.transform = `rotate(${-yRot * 40}deg) scale(${1.0 + Math.sin(timeSec * 1.2) * 0.04})`;
      }
      if (glowRef.current) {
        glowRef.current.style.boxShadow = `0 0 36px 10px ${config.glow}`;
      }

      // 5. Parallax & Floating Breathing Motion
      curParallaxX += (targetParallaxX - curParallaxX) * 0.05;
      curParallaxY += (targetParallaxY - curParallaxY) * 0.05;
      const floatY = Math.sin(timeSec * 1.5) * 2.0;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${curParallaxX.toFixed(2)}px, ${(floatY + curParallaxY).toFixed(2)}px, 0)`;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      geometry.dispose();
      lineShaderMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="sacred-pyramid-wrapper"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '14px',
        left: '20px',
        width: '110px',
        height: '110px',
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform',
      }}
    >
      {/* Background Energy Glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          opacity: 0.5,
          pointerEvents: 'none',
          transition: 'box-shadow 0.8s ease',
          filter: 'blur(10px)',
        }}
      />

      {/* Rotating Sacred Energy Halo Ring */}
      <div
        ref={haloRef}
        style={{
          position: 'absolute',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          border: '1px dashed rgba(140, 190, 255, 0.25)',
          opacity: 0.4,
          pointerEvents: 'none',
          transition: 'border-color 0.8s ease',
        }}
      />

      {/* 3D WebGL Sacred Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '110px',
          height: '110px',
          display: 'block',
        }}
      />
    </div>
  );
}
