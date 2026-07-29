import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

/**
 * Sacred Geometry 3D Wireframe Pyramid Component.
 * Apple-grade micro-subtlety ambient design.
 * Designed to reward user discovery without attracting unwanted attention.
 */
export default function WireframePyramid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    // 2.5s gentle atmospheric emergence
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.0);
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

    const H = 2.2;
    const yApex = H / 2; // +1.1
    const yBase = -H / 2; // -1.1
    const R_base = 1.1;

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

    // --- Whisper-Soft Custom Line Shader ---
    const lineShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#d8e6ff') },
        uPulseColor: { value: new THREE.Color('#ffffff') },
        uEnergySpeed: { value: 1.6 },
        uJitter: { value: 0 },
        uOpacity: { value: 0.18 },
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
            float jitterX = sin(uTime * 25.0 + pos.y * 10.0) * uJitter;
            float jitterY = cos(uTime * 25.0 + pos.x * 10.0) * uJitter;
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
          // Extremely subtle, silky traveling starlight shimmer along wireframe edges
          float wave = sin(vProgress * 10.0 - uTime * uEnergySpeed + vPos.y * 2.5);
          float pulse = pow(0.5 + 0.5 * wave, 4.0);

          vec3 finalColor = mix(uColor, uPulseColor, pulse * 0.25);
          float alpha = uOpacity * (0.85 + pulse * 0.3);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    });

    const wireframeMesh = new THREE.LineSegments(geometry, lineShaderMaterial);
    scene.add(wireframeMesh);

    // --- Central Core Point (Whisper Orb) ---
    const coreGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const coreOrb = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreOrb);

    // --- Animation State ---
    let animId = 0;
    let prevTime = performance.now();
    let yRot = 0;

    // Smooth Parallax State (Damped)
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let curParallaxX = 0;
    let curParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const distToTopRight = Math.hypot(window.innerWidth - e.clientX, e.clientY);
      if (distToTopRight < 380) {
        const factor = (1 - distToTopRight / 380) * 2.5;
        targetParallaxX = ((e.clientX - (window.innerWidth - 60)) / 400) * factor;
        targetParallaxY = (e.clientY / window.innerHeight - 0.08) * factor;
      } else {
        targetParallaxX = 0;
        targetParallaxY = 0;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Domain Theme Configurations (Apple-level subtlety)
    const getThemeConfig = (domId: string) => {
      if (domId === 'FukumaMizushi') {
        return {
          stroke: '#ff5555',
          pulse: '#ffcccc',
          glow: 'rgba(255, 40, 40, 0.25)',
          haloBorder: 'rgba(255, 60, 60, 0.15)',
          speed: 2.2,
          jitter: 0.006,
          opacity: 0.22,
        };
      }
      if (domId === 'KangoAneitei') {
        return {
          stroke: '#b866ff',
          pulse: '#e9d5ff',
          glow: 'rgba(160, 60, 240, 0.25)',
          haloBorder: 'rgba(180, 90, 255, 0.14)',
          speed: 1.2,
          jitter: 0.001,
          opacity: 0.16,
        };
      }
      // Muryokusho
      return {
        stroke: '#d8e6ff',
        pulse: '#ffffff',
        glow: 'rgba(100, 170, 255, 0.25)',
        haloBorder: 'rgba(140, 190, 255, 0.15)',
        speed: 1.6,
        jitter: 0.0,
        opacity: 0.18,
      };
    };

    const targetColor = new THREE.Color();
    const targetPulseColor = new THREE.Color();

    // --- Main Frame Loop ---
    const tick = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;
      const timeSec = now / 1000;

      // 1. Organic Precession: ~36s slow revolution with harmonic wave
      const baseSpeed = (2 * Math.PI) / 36;
      const organicSpeed = baseSpeed + Math.sin(timeSec * 0.2) * 0.0015;
      yRot += organicSpeed * dt;

      wireframeMesh.rotation.y = yRot;
      wireframeMesh.rotation.x = 0.22 + Math.sin(timeSec * 0.3) * 0.04;
      wireframeMesh.rotation.z = Math.sin(timeSec * 0.18) * 0.025;

      // 2. Slow 8.5s Natural Resting Breath Rhythm
      const breathPhase = Math.sin(timeSec * 0.74);
      const corePulse = 1.0 + breathPhase * 0.18;
      coreOrb.scale.setScalar(corePulse);
      coreMaterial.opacity = 0.35 + breathPhase * 0.15;

      // 3. Theme Uniform Interpolation
      const config = getThemeConfig(themeRef.current);
      targetColor.set(config.stroke);
      targetPulseColor.set(config.pulse);

      lineShaderMaterial.uniforms.uTime.value = timeSec;
      lineShaderMaterial.uniforms.uColor.value.lerp(targetColor, 0.04);
      lineShaderMaterial.uniforms.uPulseColor.value.lerp(targetPulseColor, 0.04);
      lineShaderMaterial.uniforms.uEnergySpeed.value = config.speed;
      lineShaderMaterial.uniforms.uJitter.value = config.jitter;
      lineShaderMaterial.uniforms.uOpacity.value = config.opacity;

      coreMaterial.color.copy(lineShaderMaterial.uniforms.uPulseColor.value);

      // 4. Ultra-Faint Halo & Glow
      if (haloRef.current) {
        haloRef.current.style.borderColor = config.haloBorder;
        haloRef.current.style.transform = `rotate(${-yRot * 25}deg) scale(${1.0 + breathPhase * 0.02})`;
      }
      if (glowRef.current) {
        glowRef.current.style.boxShadow = `0 0 28px 6px ${config.glow}`;
      }

      // 5. Soft Damped Parallax & 1.5px Floating Motion
      curParallaxX += (targetParallaxX - curParallaxX) * 0.03;
      curParallaxY += (targetParallaxY - curParallaxY) * 0.03;
      const floatY = Math.sin(timeSec * 1.1) * 1.5;

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
        right: '20px',
        width: '110px',
        height: '110px',
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 2.5s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Soft Ambient Background Glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          opacity: 0.35,
          pointerEvents: 'none',
          transition: 'box-shadow 1s ease',
          filter: 'blur(12px)',
        }}
      />

      {/* Rotating Ambient Halo Ring */}
      <div
        ref={haloRef}
        style={{
          position: 'absolute',
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          border: '1px dashed rgba(140, 190, 255, 0.15)',
          opacity: 0.25,
          pointerEvents: 'none',
          transition: 'border-color 1s ease',
        }}
      />

      {/* 3D WebGL Canvas */}
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
