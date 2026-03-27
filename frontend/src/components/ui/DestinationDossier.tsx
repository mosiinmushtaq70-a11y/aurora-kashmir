'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import KPLineChart from './dossier/KPLineChart';
import { useState, useEffect } from 'react';

const DestinationDossier: React.FC = () => {
  const { activeDossier, liveData, closeDossier } = useAppStore();
  const [forecastSeries, setForecastSeries] = useState<{ timestamp: string; kp: number; aurora_score: number }[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/weather/forecast/series');
        const data = await res.json();
        // Map backend series (time, probability) to Chart expected format (timestamp, kp, aurora_score)
        const mapped = (data.series || []).map((item: any) => ({
          timestamp: item.time,
          kp: Math.round(item.probability / 11), // heuristic for mock visual
          aurora_score: item.probability
        }));
        setForecastSeries(mapped);
      } catch (err) {
        console.error('Forecast sync failure:', err);
      }
    };
    fetchForecast();
  }, []);

  const displayData = {
    score: liveData?.auroraScore ?? activeDossier?.auroraScore ?? 0,
    cloud: liveData?.cloudCover ?? activeDossier?.cloudCover ?? 0,
    temp: liveData?.temperature ?? activeDossier?.temperature ?? 0,
  };

  return (
    <main className="relative w-full min-h-screen bg-[#0A0E1A] text-white overflow-x-hidden font-['Inter',_sans-serif]">
      
      {/* LAYER 1: THE HERO SECTION (MUST BE ABSOLUTE TOP) */}
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <img 
          src={activeDossier?.heroImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuAdhVAGG6MIWUfVCaC0XxIJQ5vG7uCAwirX4rQWgREm8oUOw11JcHzz-4_2E5_qafmYuXv2SLVLLdZpNlWZJ6E_0dqJoOqwgIC2tHNso1MCgUuY6WuOcfGhAenzxjF4NKMcv0vceYMmCaXp5QOKInxgQ91CQxKEn6DsGZko39UA6VAdqT-gH0s3C4yWXP0yZNuN5YDlcV4vhNfiOjRrcjZrWFerNDSfChnSAHZ0jtIddXx5Z8C961dCwUCyECZAGKuWpPBDRuo2UMs"} 
          alt={activeDossier?.name} 
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-black/40" />
        
        <div className="absolute inset-x-0 bottom-24 max-w-7xl mx-auto px-4 md:px-8">
           <div className="flex flex-col gap-4">
            <nav className="flex items-center gap-2 opacity-60">
              <span className="font-['Manrope'] font-bold text-[10px] tracking-[0.3em] uppercase cursor-pointer hover:text-[#00e5ff]" onClick={closeDossier}>Dossiers</span>
              <span className="text-[10px] opacity-40">/</span>
              <span className="font-['Manrope'] font-bold text-[10px] tracking-[0.3em] uppercase text-[#00e5ff]">{activeDossier?.name}</span>
            </nav>
            <h1 className="font-['Manrope'] font-black text-6xl md:text-9xl leading-none tracking-tighter mix-blend-lighten mega-glow-text uppercase">
              {activeDossier?.name}
            </h1>
          </div>
        </div>

        <button 
          onClick={closeDossier}
          className="absolute top-8 left-8 z-50 p-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 hover:border-[#00e5ff]/40 transition-all active:scale-90 shadow-2xl"
        >
          <span className="material-symbols-outlined text-white text-2xl">arrow_back</span>
        </button>
      </section>

      {/* LAYER 2: THE DATA BAR (PINNED DIRECTLY UNDER HERO) */}
      <section className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 -mt-12 md:-mt-16">
        <div className="stitch-glass-panel rounded-full px-12 py-6 backdrop-blur-3xl overflow-hidden shadow-2xl border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-8 md:gap-12">
            <div className="flex items-center gap-4">
              <span className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-widest uppercase opacity-60">Live Intel</span>
              <span className="text-xl font-black">{displayData.score}/100</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-4">
              <span className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-widest uppercase opacity-60">Cloud</span>
              <span className="text-xl font-black">{displayData.cloud}%</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="flex items-center gap-4">
              <span className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-widest uppercase opacity-60">Thermal</span>
              <span className="text-xl font-black">{displayData.temp}°C</span>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 3: FORECAST & CTAS */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 stitch-glass-panel rounded-4xl p-10 border-white/5 overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-['Manrope'] font-extrabold text-xl uppercase tracking-tight">Tactical Forecast</h3>
            <span className="font-['Manrope'] font-bold text-[9px] text-[#00e5ff] tracking-[0.3em] uppercase">48H Probability Series</span>
          </div>
          <div className="h-[300px] w-full">
            <KPLineChart data={forecastSeries} />
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-center">
           <button className="w-full py-6 bg-white text-[#0A0E1A] font-['Manrope'] font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-[#00e5ff] transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
             INITIATE SATELLITE SYNC
           </button>
           <button className="w-full py-6 border-2 border-white/10 text-white font-['Manrope'] font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-white/5 transition-all transform hover:-translate-y-1 opacity-60">
             ASK AURA
           </button>
        </div>
      </section>

      {/* LAYER 4: NARRATIVE & SITE ADVANTAGES */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-t border-white/5">
        <div className="max-w-4xl mb-20">
          <h2 className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-[0.4em] uppercase mb-6 opacity-60">Intelligence Dossier</h2>
          <p className="font-['Inter'] font-light text-2xl md:text-3xl leading-relaxed text-[#bac9cc]">
            Beyond the basalt columns and the rhythmic crash of the Atlantic lies a landmark forged in fire and sculpted by ice. Kirkjufell stands not merely as a mountain, but as a celestial convergence point where the magnetic pulse of the North reaches its zenith.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="stitch-glass-panel p-10 rounded-3xl border-white/5 group hover:border-[#00e5ff]/30 transition-all">
            <span className="material-symbols-outlined text-[#00e5ff] text-4xl mb-6 opacity-40">hub</span>
            <h4 className="font-['Manrope'] font-black text-2xl mb-4 uppercase tracking-tighter text-white">Magnetic Band Convergence</h4>
            <p className="font-['Inter'] text-[#bac9cc] opacity-60 leading-relaxed">
              High-density magnetic flux detected at the peak apex, accelerating ion collision probability by 14% for deep-field aurora captures.
            </p>
          </div>
          <div className="stitch-glass-panel p-10 rounded-3xl border-white/5 group hover:border-[#00e5ff]/30 transition-all">
            <span className="material-symbols-outlined text-[#00e5ff] text-4xl mb-6 opacity-40">flare</span>
            <h4 className="font-['Manrope'] font-black text-2xl mb-4 uppercase tracking-tighter text-white">Deep-Field Optical Clarity</h4>
            <p className="font-['Inter'] text-[#bac9cc] opacity-60 leading-relaxed">
              Bortle Class 1 rating verified. Minimal atmospheric haze with particulate matter below 0.5 PPM ensures extreme lens isolation.
            </p>
          </div>
        </div>
      </section>

      {/* LAYER 5: THE PURGED OBSERVATION POINTS */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 bg-white/5 rounded-[4rem] mb-20">
        <div className="mb-12">
          <h3 className="font-['Manrope'] font-black text-4xl uppercase tracking-tighter">Icelandic Observation Nodes</h3>
          <p className="text-[#00e5ff] font-['Manrope'] font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Verified Secondary Sites</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Thingvellir National Park", region: "South Iceland", rating: 5, pollution: "Minimal" },
            { name: "Snæfellsnes Peninsula", region: "West Iceland", rating: 4, pollution: "Minimal" },
            { name: "Gatklettur Arch", region: "Arnastapi", rating: 5, pollution: "Minimal" }
          ].map((spot, i) => (
            <div key={i} className="bg-black/40 p-8 rounded-3xl border border-white/5 hover:border-[#00e5ff]/30 transition-all">
              <span className="font-['Manrope'] font-bold text-[8px] text-[#00e5ff] tracking-widest uppercase mb-4 block">{spot.pollution} Pollution</span>
              <h4 className="font-['Manrope'] font-bold text-xl text-white mb-2">{spot.name}</h4>
              <p className="font-['Inter'] text-xs text-[#bac9cc] opacity-40 uppercase tracking-widest">{spot.region}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LAYER 6: FIELD LOGISTICS & MAP UPSELL */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stitch-glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl mb-4 opacity-40">photo_camera</span>
            <span className="font-['Manrope'] font-black text-[10px] uppercase tracking-widest">Wide-Angle Optics</span>
          </div>
          <div className="stitch-glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl mb-4 opacity-40">thermostat</span>
            <span className="font-['Manrope'] font-black text-[10px] uppercase tracking-widest">Grade 4 Thermals</span>
          </div>
          <div className="stitch-glass-panel p-6 rounded-2xl border-white/5 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl mb-4 opacity-40">vertical_align_bottom</span>
            <span className="font-['Manrope'] font-black text-[10px] uppercase tracking-widest">Carbon-Tripod</span>
          </div>
        </div>

        <div className="stitch-glass-panel rounded-3xl p-10 border border-[#00e5ff]/20 bg-[#00e5ff]/5 backdrop-blur-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00e5ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="material-symbols-outlined text-[#00e5ff] text-5xl mb-6 animate-pulse">lock</span>
          <h4 className="font-['Manrope'] font-black text-2xl mb-2 text-white uppercase tracking-tighter">Upgrade to Pro</h4>
          <p className="font-['Inter'] text-sm text-[#bac9cc] opacity-60 uppercase tracking-widest mb-8">Unlock Interactive Sector Mapping</p>
          <button className="px-8 py-3 bg-[#00e5ff] text-[#0A0E1A] font-['Manrope'] font-black text-[10px] tracking-[0.3em] uppercase rounded-full shadow-[0_10px_30px_rgba(0,229,255,0.3)]">
            ACCESS INTEL PACK
          </button>
        </div>
      </section>

      <style jsx global>{`
        .mega-glow-text {
          text-shadow: 0 0 40px rgba(0, 229, 255, 0.4);
        }
        .stitch-glass-panel {
          background: rgba(10, 14, 26, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>

    </main>
  );
};

export default DestinationDossier;
