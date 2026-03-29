'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface Spot {
  id: number;
  name: string;
  lat: number;
  lng: number;
  region: string;
  pollution: string;
  rating: number;
}

const ViewingSpotsPanel: React.FC = () => {
  const { activeDossier } = useAppStore();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeDossier) return;

    async function fetchSpots() {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const url = `${baseUrl}/api/sightseeing/spots?lat=${activeDossier?.lat}&lon=${activeDossier?.lng}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSpots(data);
        }
      } catch (err) {
        console.error('Failed to fetch spots:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSpots();
  }, [activeDossier]);

  if (loading && spots.length === 0) {
    return (
      <div className="w-full h-48 bg-white/5 animate-pulse rounded-3xl" />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="flex flex-col">
          <span className="font-['Manrope'] font-bold tracking-[0.3em] uppercase text-[#00e5ff] text-[10px] mb-3 opacity-80">
            Observation Points
          </span>
          <h3 className="font-['Manrope'] font-extrabold text-white text-3xl md:text-5xl leading-[1.1] tracking-tight">
            Best Viewing Spots
          </h3>
        </div>
        <p className="font-['Inter'] text-[13px] text-[#bac9cc] opacity-60 max-w-sm">
          Top-rated coordinates within range for optimal lens isolation and minimal light bleed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {spots.map((spot, idx) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="stitch-glass-panel rounded-3xl p-8 group hover:border-[#00e5ff]/30 transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-white text-6xl">location_on</span>
              </div>

              <div className="flex flex-col h-full gap-8 relative z-10">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${spot.pollution === 'Minimal' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400'}`} />
                    <span className="font-['Manrope'] font-bold text-[9px] text-white/40 uppercase tracking-widest">
                       {spot.pollution} Pollution
                    </span>
                  </div>
                  <h4 className="font-['Manrope'] font-bold text-xl text-white group-hover:text-[#00e5ff] transition-colors leading-tight">
                    {spot.name}
                  </h4>
                  <p className="font-['Inter'] text-[11px] text-[#bac9cc] opacity-40 uppercase tracking-[0.2em] font-medium">
                    {spot.lat.toFixed(2)}°N / {spot.lng.toFixed(2)}°E
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`material-symbols-outlined text-[14px] ${i < spot.rating ? 'text-amber-400 fill-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.2)]' : 'text-white/10'}`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                   <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#00e5ff] group-hover:border-[#00e5ff] transition-all duration-500">
                    <span className="material-symbols-outlined text-xs text-[#00e5ff] group-hover:text-[#080B11] leading-none">open_in_new</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewingSpotsPanel;
