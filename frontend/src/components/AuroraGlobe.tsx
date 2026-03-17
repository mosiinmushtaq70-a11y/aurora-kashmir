'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

export default function AuroraGlobe({ kp = 5, onZoomComplete }: { kp?: number; onZoomComplete?: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'global' | 'kashmir'>('global');

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;
    const w = currentMount.clientWidth;
    const h = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const ctrl = new OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping = true;
    ctrl.enableZoom = false;
    ctrl.enablePan = false;
    ctrl.autoRotate = true;
    ctrl.autoRotateSpeed = 2.0;

    // Earth — load texture via Promise; add mesh to scene only after texture is decoded
    const textureLoader = new THREE.TextureLoader();
    let earth: THREE.Mesh | null = null;
    textureLoader.loadAsync('/earth.jpg').then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: texture });
      earth = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), mat);
      scene.add(earth);
    });

    // Aurora
    const kpFraction = Math.min(kp / 9.0, 1.0);
    const aurMat = new THREE.ShaderMaterial({
      uniforms: { uI: { value: kpFraction } },
      vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform float uI; varying vec3 vP;
        void main(){
          float np=distance(normalize(vP),vec3(0,1,0));
          float sp=distance(normalize(vP),vec3(0,-1,0));
          float b=(smoothstep(0.7,0.3,np)*smoothstep(0.0,0.25,np))+(smoothstep(0.7,0.3,sp)*smoothstep(0.0,0.25,sp));
          gl_FragColor=vec4(0.0,1.0,0.5,b*max(uI,0.15)*0.6);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    const auroraOverlay = new THREE.Mesh(new THREE.SphereGeometry(5.12, 64, 64), aurMat);
    scene.add(auroraOverlay);

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 5, 5);
    scene.add(sun);

    const latLonTo3D = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    };

    const KASHMIR_CAM = latLonTo3D(34, 75, 7.0);
    const GLOBAL_CAM = new THREE.Vector3(10, 5, 15);

    camera.position.copy(GLOBAL_CAM);
    camera.lookAt(0, 0, 0);

    const kS = [
      {n:'Gulmarg',lat:34.05,lon:74.38},
      {n:'Sonamarg',lat:34.31,lon:75.29},
      {n:'Pangong Lake',lat:33.78,lon:78.65},
      {n:'Leh',lat:34.15,lon:77.57}
    ];

    const gS = [
      {n:'Tromsø',lat:69.65,lon:18.96},{n:'Reykjavík',lat:64.13,lon:-21.82},
      {n:'Fairbanks',lat:64.84,lon:-147.72},{n:'Yellowknife',lat:62.45,lon:-114.37}
    ];

    const dotGroup = new THREE.Group();
    scene.add(dotGroup);

    const renderGlobal = () => {
      dotGroup.clear();
      gS.forEach(h => {
        const v = latLonTo3D(h.lat, h.lon, 5.05);
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00d4ff }));
        m.position.copy(v);
        dotGroup.add(m);
      });
      auroraOverlay.visible = true;
    };

    const renderKashmir = () => {
      dotGroup.clear();
      kS.forEach(h => {
        const v = latLonTo3D(h.lat, h.lon, 5.05);
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
        m.position.copy(v);
        dotGroup.add(m);
      });
      auroraOverlay.visible = false;
    };

    renderGlobal();

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctrl.update();
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const nw = currentMount.clientWidth;
      const nh = currentMount.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Provide imperative ref for mode switching
    (currentMount as HTMLDivElement & { switchMode: (m: 'global' | 'kashmir') => void }).switchMode = (newMode: 'global' | 'kashmir') => {
      if (newMode === 'global') {
        ctrl.enabled = false;
        renderGlobal();
        gsap.to(camera.position, {
          x: GLOBAL_CAM.x, y: GLOBAL_CAM.y, z: GLOBAL_CAM.z,
          duration: 2.4, ease: 'expo.inOut',
          onUpdate: () => camera.lookAt(0, 0, 0),
          onComplete: () => { ctrl.enabled = true; ctrl.autoRotate = true; }
        });
      } else {
        ctrl.enabled = false;
        renderGlobal(); // Use global dots while flying, switch to local dots immediately later if desired
        gsap.to(camera.position, {
          x: KASHMIR_CAM.x, y: KASHMIR_CAM.y, z: KASHMIR_CAM.z,
          duration: 2.4, ease: 'expo.inOut',
          onUpdate: () => camera.lookAt(0, 0, 0),
          onComplete: () => { 
            ctrl.enabled = true; 
            ctrl.autoRotate = false; 
            renderKashmir(); 
            if (onZoomComplete) onZoomComplete();
          }
        });
      }
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kp]);

  return (
    <div className="relative w-full h-[500px] glass-panel rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <button 
          onClick={() => { setMode('global'); (mountRef.current as HTMLDivElement & { switchMode: (m: string) => void })?.switchMode('global'); }}
          className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 ${mode === 'global' ? 'bg-aurora-green text-black' : 'bg-black/60 text-aurora-green border-2 border-aurora-green hover:bg-aurora-green/20'}`}
        >
          GLOBAL VIEW
        </button>
        <button 
          onClick={() => { setMode('kashmir'); (mountRef.current as HTMLDivElement & { switchMode: (m: string) => void })?.switchMode('kashmir'); }}
          className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 ${mode === 'kashmir' ? 'bg-aurora-green text-black' : 'bg-black/60 text-aurora-green border-2 border-aurora-green hover:bg-aurora-green/20'}`}
        >
          KASHMIR FOCUS
        </button>
      </div>
    </div>
  );
}
