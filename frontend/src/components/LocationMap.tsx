'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap } from 'lucide-react';

interface LocationMapProps {
  isVisible: boolean;
  targetLocation: { lat: number; lng: number } | null;
  auroraScore: number | null;
  onClose: () => void;
}

export default function LocationMap({ isVisible, targetLocation, auroraScore, onClose }: LocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID'; // Demo ID or actual config

  return (
    <AnimatePresence>
      {isVisible && targetLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-30 pointer-events-auto"
        >
          {/* Close Map Button */}
          <button 
            onClick={onClose}
            className="absolute top-24 right-8 z-40 bg-black/50 backdrop-blur-md text-white border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/10 hover:border-white/30 transition-all font-mono text-xs tracking-widest uppercase flex items-center gap-2 group shadow-2xl"
          >
            ← Back to Global View
          </button>

          {/* Map Container */}
          <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={targetLocation}
                  defaultZoom={14}
                  defaultHeading={0}
                  defaultTilt={65}
                  mapId={mapId}
                  disableDefaultUI={true}
                  gestureHandling="greedy"
                >
                  {/* Future: Custom WebGL Overlays for aurora probability mapping */}
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-space-black flex-col gap-4 border border-red-500/20">
                <Zap className="text-red-500 animate-pulse" size={48} />
                <p className="text-red-400 font-mono text-sm tracking-widest text-center max-w-md">
                  GOOGLE MAPS API KEY REQUIRED<br/>
                  <span className="text-white/50 text-xs normal-case mt-2 block">
                    Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file to enable the 3D map transition.
                  </span>
                </p>
              </div>
            )}
            
            {/* Center target UI overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative">
                <Target size={40} className="text-aurora-green opacity-70 absolute -top-5 -left-5 drop-shadow-[0_0_15px_rgba(0,220,130,0.8)]" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-aurora-green/30 text-white text-xs px-4 py-2 rounded-full whitespace-nowrap shadow-xl flex items-center gap-3">
                  <span className="opacity-70 font-mono">TARGET LOCK:</span>
                  <span className="font-mono">{targetLocation.lat.toFixed(4)}°, {targetLocation.lng.toFixed(4)}°</span>
                  {auroraScore !== null && (
                    <>
                      <div className="w-px h-3 bg-white/20" />
                      <span className="text-aurora-green font-bold flex items-center gap-1">
                        <Zap size={10} /> SCORE: {auroraScore}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Edge fades for blending into the dashboard */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(3,11,26,1)]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
