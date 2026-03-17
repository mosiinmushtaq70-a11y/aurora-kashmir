'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';


// ─── Inner scene component (rendered inside the Canvas context) ──────────────

function EarthMesh({ kp }: { kp: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Load textures — useTexture is Suspense-based, so it waits until all are decoded
  const [colorMap, bumpMap, roughMap] = useTexture([
    '/earth.jpg',        // albedo / color map
    '/earth-bump.jpg',   // bump / height map for topology
    '/earth-bump.jpg',   // used as roughness map (lighter = water = reflective)
  ]);

  // Hardware-accelerated rotation via requestAnimationFrame — no setInterval, no CSS
  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.20;
    }
  });

  // Aurora overlay color based on live Kp index
  const kpFraction = Math.min(kp / 9.0, 1.0);
  const auroraIntensity = Math.max(kpFraction, 0.15) * 1.2;

  return (
    <group>
      {/* Earth — Scaled to 130% of previous size (0.7 * 1.3 = 0.91) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.91, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.008}
          roughnessMap={roughMap}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Aurora overlay — adjusted for 0.91 radius */}
      <mesh>
        <sphereGeometry args={[0.93, 64, 64]} />
        <shaderMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          uniforms={{ uI: { value: auroraIntensity } }}
          vertexShader={`
            varying vec3 vPos;
            void main() {
              vPos = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uI;
            varying vec3 vPos;
            void main() {
              float np = distance(normalize(vPos), vec3(0.0, 1.0, 0.0));
              float sp = distance(normalize(vPos), vec3(0.0, -1.0, 0.0));
              float b = (smoothstep(0.7, 0.3, np) * smoothstep(0.0, 0.25, np))
                      + (smoothstep(0.7, 0.3, sp) * smoothstep(0.0, 0.25, sp));
              gl_FragColor = vec4(0.0, 1.0, 0.5, b * uI);
            }
          `}
        />
      </mesh>
    </group>
  );
}



// ─── Parallax Background: Stars that move subtly with rotation ──────────────
// ParallaxStars component removed


// ─── Exported component — owns the Canvas ────────────────────────────────────

interface TexturedGlobeProps {
  kp?: number;
}

// ─── Interaction Scene: Handles the actual rotation logic inside the Canvas ──

function GlobeScene({ 
  rotationY, 
  velocity, 
  isDragging, 
  kp 
}: { 
  rotationY: React.MutableRefObject<number>, 
  velocity: React.MutableRefObject<number>, 
  isDragging: React.MutableRefObject<boolean>,
  kp: number
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const starsRef = useRef<THREE.Group>(null!);

  useFrame((_state, delta) => {
    if (!isDragging.current) {
      // Apply momentum/inertia when the user releases
      // eslint-disable-next-line react-hooks/immutability
      rotationY.current += velocity.current;
      // Exponential decay for friction (adjusted for ~60fps)
      // eslint-disable-next-line react-hooks/immutability
      velocity.current *= Math.pow(0.92, delta * 60);
      
      // Stop completely if velocity is negligible
      if (Math.abs(velocity.current) < 0.0001) velocity.current = 0;
    }

    // Apply rotation to Earth and background stars (parallax)
    if (groupRef.current) groupRef.current.rotation.y = rotationY.current;
    if (starsRef.current) starsRef.current.rotation.y = rotationY.current * 0.3;
  });

  return (
    <>
      {/* Background star field with subtle parallax linked to interaction */}
      <group ref={starsRef}>
        <Stars radius={100} depth={50} count={4000} factor={4} fade speed={0.5} />
      </group>

      {/* Interactive Earth Group — ONLY this rotates */}
      <Suspense fallback={null}>
        <group ref={groupRef} position={[-1.4, -0.1, 0]}>
          <EarthMesh kp={kp} />
        </group>
      </Suspense>
    </>
  );
}

// ─── Exported component — owns the Canvas & Input Handlers ──────────────────

export default function TexturedGlobe({ kp = 0 }: TexturedGlobeProps) {
  const rotationY = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0; 
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastX.current;
    const move = deltaX * 0.005 * 0.5;
    rotationY.current += move;
    velocity.current = move; 
    lastX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden outline-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        {/* Fixed cinematic light: Angled more from the right for requested shadow inversion */}
        <directionalLight 
          position={[20, 8, 5]} 
          intensity={12.0} 
          shadow-mapSize={[1024, 1024]}
        />

        <GlobeScene 
          rotationY={rotationY} 
          velocity={velocity} 
          isDragging={isDragging} 
          kp={kp} 
        />
      </Canvas>

      {/* HUD buttons removed for global focus */}

      {/* Kp badge */}
      <div className="absolute top-8 right-8 z-10 glass-panel px-4 py-2 rounded-full text-sm font-bold text-aurora-green border border-aurora-green/40 bg-black/60 backdrop-blur-md">
        Cosmic Tier: Kp {kp.toFixed(1)}
      </div>
    </div>
  );
}
