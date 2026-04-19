'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AboutBuilder from '@/components/ui/landing/AboutBuilder';
import ProjectArchitecture from '@/components/ui/landing/ProjectArchitecture';

const DeveloperPage = () => {
  return (
    <div className="min-h-screen bg-[#080B11] text-[#e0e2eb] font-['Inter',sans-serif] selection:bg-[#44e2cd]/30 overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00F5C4]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#44e2cd]/5 blur-[120px] rounded-full" />
      </div>

      <nav className="fixed top-0 w-full z-50 bg-[#080B11]/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[#00F5C4] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            AuroraLens
          </Link>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Project Developer</div>
        </div>
      </nav>

      <main className="pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="reveal-on-scroll flex flex-col md:flex-row gap-16 items-start">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#00F5C4] font-bold">TECH & SPACE ENTHUSIAST</span>
                <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tighter">The Engineering Behind AuroraLens</h2>
              </div>
              <div className="space-y-6 text-[#bac9cc] leading-relaxed font-light">
                <p>
                  AuroraLens began as a personal challenge — could a student 
                  with an interest in space weather build a genuinely accurate, 
                  location-specific aurora forecast using nothing but open NASA data 
                  and applied machine learning?
                </p>
                <p>
                  The answer required learning FastAPI for the inference backend, 
                  building a dual-stage XGBoost pipeline from scratch on the NASA 
                  OMNI2 dataset, integrating real-time DSCOVR telemetry, and 
                  designing a frontend that made complex geomagnetic data feel 
                  intuitive for non-scientists.
                </p>
                <p>
                  The 81.0% weighted F1-score across 1.2 million hours of test data 
                  is not the end goal — it is a baseline. The model is open source, 
                  documented, and designed to be improved by anyone who wants to 
                  contribute.
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-white font-bold text-lg">Mosin Mushtaq</p>
                <p className="text-[#bac9cc] text-sm font-light">B.Tech AI/ML Engineering</p>
              </div>
              
              <div className="flex gap-4 pt-2">
                <a href="https://github.com/mosiinmushtaq70-a11y/aurora-kashmir" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all">
                  <span className="material-symbols-outlined text-[18px]">code</span>
                </a>
                <a href="https://linkedin.com/in/mosinmushtaq" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all">
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </a>
              </div>
            </div>

            <div className="w-full md:w-1/3 mt-8 md:mt-0">
              <div className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl flex flex-col gap-4 relative overflow-hidden group">
                <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-amber-500/20 to-transparent" />
                <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">NEXT PROJECT</span>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </span>
                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">IN DEVELOPMENT</span>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg leading-snug">Space Weather Intelligence Platform</h3>
                <p className="text-[#bac9cc] text-sm font-light leading-relaxed">
                  A dedicated infrastructure-focused monitoring 
                  system for geomagnetic storm detection, CME tracking, and 
                  real-time risk assessment for power grids, GPS networks, 
                  and satellite operators.
                </p>
              </div>
            </div>
          </div>

          <div className="my-24 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <ProjectArchitecture />

          <section className="mt-24 space-y-16">
            <div className="text-center space-y-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#00F5C4] font-bold">Model Intelligence</span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tighter">Engine Specifications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="stitch-glass-card p-8 rounded-3xl border border-white/5 space-y-4">
                <span className="material-symbols-outlined text-[#00F5C4] text-4xl">Schema</span>
                <h3 className="text-xl font-bold text-white">Dual-Stage XGBoost</h3>
                <p className="text-sm text-[#bac9cc] font-light leading-relaxed">
                  Two-stage Gradient Boosting pipeline. Stage 1 predicts geomagnetic state probability; Stage 2 classifies intensity (KP-index).
                </p>
              </div>

              <div className="stitch-glass-card p-8 rounded-3xl border border-white/5 space-y-4">
                <span className="material-symbols-outlined text-[#44e2cd] text-4xl">database</span>
                <h3 className="text-xl font-bold text-white">Feature Engineering</h3>
                <p className="text-sm text-[#bac9cc] font-light leading-relaxed">
                  Inputs include IMF Bz (GSM), Solar Wind Speed/Density, and local tropospheric cloud density updated every 60s.
                </p>
              </div>

              <div className="stitch-glass-card p-8 rounded-3xl border border-white/5 space-y-4">
                <span className="material-symbols-outlined text-[#c3f5ff] text-4xl">Verified</span>
                <h3 className="text-xl font-bold text-white">81% F1-Score</h3>
                <p className="text-sm text-[#bac9cc] font-light leading-relaxed">
                  Validated against 1.2M hours of NASA OMNI telemetry. Optimized for recall on high-intensity (G1-G5) storm events.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-32 max-w-4xl mx-auto text-center space-y-12">
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
               <a 
                 href="https://github.com/mosiinmushtaq70-a11y/aurora-kashmir" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full md:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
               >
                 <span className="material-symbols-outlined">data_object</span>
                 Source Code
               </a>
               <Link 
                 href="/"
                 className="w-full md:w-auto px-10 py-4 rounded-full bg-[#44e2cd] text-[#003731] text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_40px_rgba(68,226,205,0.2)] flex items-center justify-center gap-3"
               >
                 <span className="material-symbols-outlined text-sm">rocket_launch</span>
                 Back to Live Telemetry
               </Link>
            </div>

            <div className="pt-12 text-[10px] text-white/20 uppercase tracking-[0.3em]">
              &copy; 2026 &bull; AuroraLens Project Artifact
            </div>
          </section>

        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
};

export default DeveloperPage;
