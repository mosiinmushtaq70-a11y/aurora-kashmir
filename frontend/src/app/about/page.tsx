import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080B11] text-gray-300 font-sans selection:bg-[#00F5C4]/30 selection:text-[#00F5C4]">
      <div className="max-w-3xl mx-auto px-6 py-20 pb-32">
        <Link 
          href="/" 
          className="inline-flex items-center text-[#00F5C4] hover:text-[#00F5C4]/80 mb-12 transition-colors group text-sm font-semibold tracking-widest uppercase"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-16 tracking-tight font-heading">About AuroraLens</h1>

        <div className="space-y-16">
          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-3">THE ORIGIN</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Built to Answer One Question.</h2>
            <div className="space-y-4 text-[#bac9cc] leading-relaxed font-light">
              <p>
                Aurora forecasting apps have existed for years. Most of them 
                show you a global KP number and call it a forecast. I wanted something 
                different — a tool that could tell me specifically, for where I am 
                standing right now, whether the sky would light up tonight.
              </p>
              <p>That question became AuroraLens.</p>
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-3">THE SCIENCE</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Open Data. Real ML.</h2>
            <div className="space-y-4 text-[#bac9cc] leading-relaxed font-light">
              <p>
                AuroraLens is built entirely on publicly available NASA and NOAA 
                datasets. The DSCOVR satellite at the L1 Lagrange point — 1.5 million 
                kilometers from Earth — continuously streams solar wind data. We 
                process that telemetry through a dual-stage XGBoost model trained on 
                40 years of geomagnetic records from the NASA OMNI dataset, combining 
                it with your local cloud cover to generate a 0–100 personal visibility 
                score.
              </p>
              <p>
                No proprietary black boxes. No fabricated accuracy claims. 
                Just open science, engineered carefully.
              </p>
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-3">THE BUILDER</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Mosin Mushtaq</h2>
            <div className="space-y-4 text-[#bac9cc] leading-relaxed font-light mb-6">
              <p>
                B.Tech Artificial Intelligence & Machine Learning.<br />
                Tech enthusiast passionate about space weather, exploration, and missions.<br />
                AuroraLens is my exploration of what happens when applied ML meets 
                real-time geophysical data.
              </p>
              <p>
                A dedicated space weather monitoring platform focused on 
                infrastructure risk and solar event detection is currently in 
                development.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com/mosiinmushtaq70-a11y" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all">
                <span className="material-symbols-outlined text-[18px]">code</span>
              </a>
              <a href="https://linkedin.com/in/mosinmushtaq" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-all">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-6">DATA SOURCES</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                <h3 className="text-white font-bold text-lg">NASA DSCOVR</h3>
                <p className="text-[#bac9cc] text-sm font-light leading-relaxed">Real-time solar wind telemetry from the L1 point. Updated every 60 seconds.</p>
              </div>
              <div className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                <h3 className="text-white font-bold text-lg">NASA OMNI2</h3>
                <p className="text-[#bac9cc] text-sm font-light leading-relaxed">40 years of hourly geomagnetic records used to train the prediction model.</p>
              </div>
              <div className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex flex-col gap-2">
                <h3 className="text-white font-bold text-lg">Open-Meteo</h3>
                <p className="text-[#bac9cc] text-sm font-light leading-relaxed">Hyper-local cloud cover data by coordinate for visibility scoring.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
