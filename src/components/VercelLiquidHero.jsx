import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme, THEMES } from '../context/ThemeContext';
import { Volume2, Sparkles, Activity } from 'lucide-react';

/**
 * VercelLiquidHero (Skiper12-inspired Liquid Fluid Simulation)
 * Replaces the center Vercel triangle logo with an animated Music Equalizer Lines symbol!
 * Adapts seamlessly to Ivory, Gold, and Deep Atlas Navy themes.
 */
export default function VercelLiquidHero({ onEnterConnectingZone, isAudioActive = false }) {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color definitions per theme for liquid shader
    const themeColors = {
      [THEMES.IVORY]: {
        colorA: new THREE.Color('#FAF7F2'),
        colorB: new THREE.Color('#BFA15F'),
        colorC: new THREE.Color('#F0E6D2'),
        specular: new THREE.Color('#FFFFFF')
      },
      [THEMES.GOLD]: {
        colorA: new THREE.Color('#0F0D09'),
        colorB: new THREE.Color('#D4AF37'),
        colorC: new THREE.Color('#F3C766'),
        specular: new THREE.Color('#FFEBAA')
      },
      [THEMES.NAVY]: {
        colorA: new THREE.Color('#070F1E'),
        colorB: new THREE.Color('#1B3B6F'),
        colorC: new THREE.Color('#D4AF37'),
        specular: new THREE.Color('#48CAE4')
      }
    };

    const currentColors = themeColors[theme] || themeColors[THEMES.NAVY];

    // Custom Liquid Simulation Shader
    const liquidVertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uHover;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;

        // Fluid wave deformation
        float wave1 = sin(pos.x * 2.5 + uTime * 1.2) * cos(pos.y * 2.5 + uTime * 0.9);
        float wave2 = sin(pos.y * 3.5 - uTime * 1.5) * 0.4;
        
        // Mouse displacement
        float dist = distance(uv, uMouse);
        float mouseWave = sin(dist * 18.0 - uTime * 4.0) * exp(-dist * 4.0) * (0.35 + uHover * 0.3);

        pos.z += (wave1 + wave2) * 0.35 + mouseWave;
        vPosition = pos;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const liquidFragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      uniform vec3 uSpecular;
      uniform float uAudioPulse;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // Fresnel and iridescence
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

        // Fluid morph pattern
        float noise = sin(vUv.x * 12.0 + uTime * 0.8) * cos(vUv.y * 12.0 + uTime * 0.8);
        float gradient = (vPosition.z + 0.5) * 0.7 + noise * 0.15;

        vec3 col = mix(uColorA, uColorB, smoothstep(-0.2, 0.4, gradient));
        col = mix(col, uColorC, smoothstep(0.3, 0.8, gradient));
        col += fresnel * uSpecular * 0.65;
        col += uAudioPulse * uColorC * 0.25;

        // Soft vignette circle
        float distFromCenter = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.85, 0.2, distFromCenter);

        gl_FragColor = vec4(col, alpha * 0.85);
      }
    `;

    // Geometry & Material
    const geometry = new THREE.PlaneGeometry(6, 4, 128, 128);
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uAudioPulse: { value: isAudioActive ? 1.0 : 0.0 },
      uColorA: { value: currentColors.colorA },
      uColorB: { value: currentColors.colorB },
      uColorC: { value: currentColors.colorC },
      uSpecular: { value: currentColors.specular },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: liquidVertexShader,
      fragmentShader: liquidFragmentShader,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Floating liquid orbs in the background
    const orbGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: currentColors.colorC,
      transparent: true,
      opacity: 0.4,
    });
    const orbs = [];
    for (let i = 0; i < 24; i++) {
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2
      );
      orb.userData = {
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
      };
      scene.add(orb);
      orbs.push(orb);
    }

    // Mouse Tracking
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(x, y);
    };

    const handleMouseEnter = () => {
      uniforms.uHover.value = 1.0;
    };

    const handleMouseLeave = () => {
      uniforms.uHover.value = 0.0;
      uniforms.uMouse.value.set(0.5, 0.5);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Animate background orbs
      orbs.forEach((orb) => {
        orb.position.y += Math.sin(elapsedTime * orb.userData.speed + orb.userData.offset) * 0.005;
        orb.position.x += Math.cos(elapsedTime * 0.5 + orb.userData.offset) * 0.003;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [theme, isAudioActive]);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-theme-border/60 bg-theme-surface/60 backdrop-blur-xl group transition-all duration-500 hover:border-theme-accent/60">
      {/* Three.js Liquid Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[400px] sm:h-[460px] md:h-[500px] cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Decorative Radial Backdrop Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-theme-bg via-transparent to-transparent opacity-80" />

      {/* CENTER REPLACEMENT: The user requested to remove the Vercel triangle in the middle and replace with an animated MUSIC LINES / EQUALIZER symbol */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <div className="relative flex items-center justify-center pointer-events-auto">
          {/* Subtle Outer Glowing Ring */}
          <div className="absolute -inset-6 rounded-full bg-theme-accent/20 blur-xl animate-pulse-slow" />
          
          {/* Center Glass Capsule with Music Lines */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-theme-accent/80 bg-theme-surface/90 backdrop-blur-2xl shadow-[0_0_40px_var(--color-glow)] flex flex-col items-center justify-center transition-transform duration-300 hover:scale-110 group-hover:border-theme-accent">
            {/* Animated Equalizer Music Lines (Replacing the Vercel Triangle!) */}
            <div className="flex items-center justify-center gap-1.5 h-12 w-16 px-1">
              <span className="w-1.5 bg-theme-accent rounded-full h-8 music-bar-1 transition-all" />
              <span className="w-1.5 bg-theme-accent rounded-full h-10 music-bar-2 transition-all" />
              <span className="w-1.5 bg-theme-accent rounded-full h-5 music-bar-3 transition-all" />
              <span className="w-1.5 bg-theme-accent rounded-full h-11 music-bar-4 transition-all" />
              <span className="w-1.5 bg-theme-accent rounded-full h-7 music-bar-5 transition-all" />
              <span className="w-1.5 bg-theme-accent rounded-full h-9 music-bar-6 transition-all" />
              <span className="w-1.5 bg-theme-accent rounded-full h-6 music-bar-7 transition-all" />
            </div>

            {/* Micro Badge */}
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-theme-accent mt-1">
              SOUND SYNC
            </span>
          </div>
        </div>

        {/* Hero Interactive Text & Tag */}
        <div className="mt-6 text-center px-4 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium border border-theme-accent/40 bg-theme-surface/80 text-theme-accent shadow-sm mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive Fluid Soundwave • 48kHz Stereo</span>
          </div>
          <p className="text-sm md:text-base text-theme-muted max-w-lg mx-auto font-medium">
            Touch or move your cursor across the liquid surface to ripple audio harmonics.
          </p>
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center z-20 px-4">
        <button
          onClick={onEnterConnectingZone}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold text-sm md:text-base text-theme-bg bg-theme-accent hover:bg-theme-accentHover shadow-[0_0_25px_var(--color-glow)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Activity className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span>Enter Connecting Zone</span>
          <span className="text-xs opacity-75 font-normal">(with your surroundings)</span>
        </button>
      </div>
    </div>
  );
}
