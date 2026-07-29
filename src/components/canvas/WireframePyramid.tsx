import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { DOMAIN_MAP } from '../../themes/domains';

/**
 * Ambient 3D Wireframe Pyramid component.
 * Placed in the top-left corner as a quiet, atmospheric decorative element.
 * Features 3-tiered tetrahedral geometry with interior support struts,
 * slow linear rotation (~30s), subtle breathing motion, mouse parallax response,
 * and dynamic theme color transition.
 */
export default function WireframePyramid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.2, 5.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(96, 96);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Create 3-Tiered Tetrahedral Wireframe Geometry ---
    const positions: number[] = [];

    const H = 2.2;
    const yApex = H / 2; // +1.1
    const yBase = -H / 2; // -1.1
    const R_base = 1.15;

    const getLevelVertices = (t: number) => {
      // t ranges from 0 (apex) to 1 (base)
      const y = yApex * (1 - t) + yBase * t;
      const r = R_base * t;
      return [0, 1, 2].map((i) => {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        return new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle));
      });
    };

    const apex = new THREE.Vector3(0, yApex, 0);
    const baseCenter = new THREE.Vector3(0, yBase, 0);

    const level1 = getLevelVertices(1 / 3);
    const level2 = getLevelVertices(2 / 3);
    const level3 = getLevelVertices(1.0);

    const addLine = (v1: THREE.Vector3, v2: THREE.Vector3) => {
      positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
    };

    const addTriangle = (verts: THREE.Vector3[]) => {
      addLine(verts[0], verts[1]);
      addLine(verts[1], verts[2]);
      addLine(verts[2], verts[0]);
    };

    // 1. Sloping corner edges
    for (let k = 0; k < 3; k++) {
      addLine(apex, level1[k]);
      addLine(level1[k], level2[k]);
      addLine(level2[k], level3[k]);
    }

    // 2. Horizontal triangular tier rings
    addTriangle(level1);
    addTriangle(level2);
    addTriangle(level3);

    // 3. Interior structural support struts
    // Central axis spine
    addLine(apex, baseCenter);

    // Diagonal internal cross braces
    const spineL1 = new THREE.Vector3(0, level1[0].y, 0);
    const spineL2 = new THREE.Vector3(0, level2[0].y, 0);

    for (let k = 0; k < 3; k++) {
      // Connect tier 1 corners to spine at tier 2
      addLine(level1[k], spineL2);
      // Connect tier 2 corners to base center
      addLine(level2[k], baseCenter);
      // Inverted internal connectors: base corners to spine at tier 1
      addLine(level3[k], spineL1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    // --- Material & Mesh ---
    const getTargetColor = (domId: string) => {
      const config = DOMAIN_MAP[domId as keyof typeof DOMAIN_MAP];
      const strokeHex = config?.pyramidStroke || '#d8e6ff';
      return new THREE.Color(strokeHex);
    };

    const currentColor = getTargetColor(themeRef.current).clone();

    const material = new THREE.LineBasicMaterial({
      color: currentColor,
      transparent: true,
      opacity: 0.28,
      depthTest: true,
    });

    const wireframe = new THREE.LineSegments(geometry, material);
    scene.add(wireframe);

    // Initial slight tilt
    wireframe.rotation.x = 0.22;
    wireframe.rotation.z = 0.05;

    // --- Animation State ---
    let animId = 0;
    let prevTime = performance.now();
    let totalAngle = 0;

    // Rotation speed: ~30 seconds per full turn (2 * PI / 30 rad/sec)
    const ROTATION_SPEED = (2 * Math.PI) / 30;

    // Smooth Parallax State
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let curParallaxX = 0;
    let curParallaxY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      // Proximity response when mouse is near top-left area (< 450px)
      const dist = Math.hypot(e.clientX, e.clientY);
      if (dist < 450) {
        const factor = (1 - dist / 450) * 4.5;
        targetParallaxX = (e.clientX / window.innerWidth - 0.1) * factor;
        targetParallaxY = (e.clientY / window.innerHeight - 0.1) * factor;
      } else {
        targetParallaxX = 0;
        targetParallaxY = 0;
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // --- Render Loop ---
    const tick = (now: number) => {
      const delta = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      // 1. Continuous Linear Y Rotation
      totalAngle += ROTATION_SPEED * delta;
      wireframe.rotation.y = totalAngle;
      // Slight smooth X-tilt oscillation
      wireframe.rotation.x = 0.22 + Math.sin(now * 0.0005) * 0.04;

      // 2. Dynamic Theme Color Interpolation
      const targetColor = getTargetColor(themeRef.current);
      currentColor.lerp(targetColor, 0.06);
      material.color.copy(currentColor);

      // Update CSS glow aura
      if (glowRef.current) {
        const config = DOMAIN_MAP[themeRef.current as keyof typeof DOMAIN_MAP];
        const glowColor = config?.pyramidGlow || 'rgba(100, 170, 255, 0.4)';
        glowRef.current.style.boxShadow = `0 0 32px 8px ${glowColor}`;
      }

      // 3. Floating / Breathing Motion & Parallax Shift
      curParallaxX += (targetParallaxX - curParallaxX) * 0.05;
      curParallaxY += (targetParallaxY - curParallaxY) * 0.05;

      const floatY = Math.sin(now * 0.0016) * 1.8;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${curParallaxX.toFixed(2)}px, ${(floatY + curParallaxY).toFixed(2)}px, 0)`;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ambient-pyramid-wrapper"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: '18px',
        left: '24px',
        width: '96px',
        height: '96px',
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.5s ease',
        willChange: 'transform',
      }}
    >
      {/* Ambient background glow aura */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          opacity: 0.45,
          pointerEvents: 'none',
          transition: 'box-shadow 0.8s ease',
          filter: 'blur(8px)',
        }}
      />
      {/* 3D Wireframe Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '96px',
          height: '96px',
          display: 'block',
        }}
      />
    </div>
  );
}
