/**
 * [TacticalGlobe.tsx]
 * 
 * PURPOSE: High-fidelity 3D Earth model using React Three Fiber.
 * DATA SOURCE: NASA Earth at Night textures.
 * DEPENDS ON: three, @react-three/fiber, @react-three/drei.
 * AUTHOR: Mosin Mushtaq — B.Tech AI/ML, SKUAST 2026
 * NOTE: Sections marked "AI-generated" were produced by agentic AI
 *       and verified for correctness against source documentation.
 */

'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars, useTexture } from '@react-three/drei';

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // High-fidelity night texture from stable official CDN
  const texture = useTexture('https://threejs.org/examples/textures/planets/earth_at_night_2048.jpg');

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotation on vertical axis (horizontally seen)
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group rotation={[0.4, 0, 0]}> {/* Slight tilt for better perspective */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshStandardMaterial 
          map={texture} 
          color="#002233"
          emissive={new THREE.Color('#00F5C4')}
          emissiveIntensity={0.8}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Atmospheric Glow Layer */}
      <mesh scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshPhongMaterial
          color="#00F5C4"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// --- Simple Error Boundary for Three.js ───
class GlobeErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-[#00F5C4]/5 border border-[#00F5C4]/20 animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-[#00F5C4]/40 font-black tracking-widest uppercase text-center px-4">Planetary Engine Offline</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TacticalGlobe() {
  return (
    <GlobeErrorBoundary>
      <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] relative">
      <Suspense fallback={<div className="w-full h-full rounded-full bg-white/5 animate-pulse" />}>
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={1.2} />
          <pointLight position={[15, 15, 15]} intensity={3.5} color="#ffffff" />
          <pointLight position={[-15, -15, -15]} intensity={1.5} color="#00F5C4" />
          
          <Globe />
          
          {/* Background depth stars */}
          <Stars 
            radius={80} 
            depth={60} 
            count={5000} 
            factor={4} 
            saturation={0} 
            fade 
            speed={1} 
          />
        </Canvas>
      </Suspense>
      
        <div className="absolute inset-0 bg-radial-at-b from-[#10131a] via-transparent to-transparent pointer-events-none" />
      </div>
    </GlobeErrorBoundary>
  );
}
