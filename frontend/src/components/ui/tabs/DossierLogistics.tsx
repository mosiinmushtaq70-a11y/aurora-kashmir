'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Resource {
  title: string;
  desc: string;
  icon: string;
}

interface DossierLogisticsProps {
  locationBlurb: string;
  resources: Resource[];
}

const DossierLogistics: React.FC<DossierLogisticsProps> = ({
  locationBlurb,
  resources,
}) => {
  return (
    <div className="flex flex-col gap-32 py-20">
      <header className="flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-[#00e5ff] opacity-40" />
          <span className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-[0.4em] uppercase opacity-60">
            Expedition Ready
          </span>
        </div>
        <h3 className="font-['Manrope'] font-black text-4xl md:text-7xl text-white tracking-tighter uppercase leading-none">
          Field Logistics
        </h3>
        <p className="font-['Inter'] font-light text-[#bac9cc] text-lg md:text-2xl leading-relaxed opacity-80 border-l-2 border-[#00e5ff]/20 pl-8">
          {locationBlurb}
        </p>
      </header>

      {/* Map Placeholder - "Mega" Lively Design */}
      <section className="relative w-full h-[600px] rounded-[3rem] md:rounded-[4rem] overflow-hidden group border border-white/5">
        <div className="absolute inset-0 bg-[#080B11]/60 backdrop-blur-3xl z-10 flex flex-col items-center justify-center text-center px-6">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full border border-[#00e5ff]/20 flex items-center justify-center relative mb-10 group-hover:border-[#00e5ff]/40 transition-colors">
              <div className="absolute inset-0 bg-[#00e5ff]/5 rounded-full animate-ping opacity-20"></div>
              <span className="material-symbols-outlined text-[#00e5ff] text-5xl opacity-40 group-hover:opacity-100 transition-opacity">map</span>
            </div>
            <h4 className="font-['Manrope'] font-bold text-xl text-white mb-2 uppercase tracking-tight">Active Sector Map</h4>
            <p className="font-['Inter'] text-sm text-[#bac9cc] opacity-40 mb-8 max-w-xs uppercase tracking-widest leading-loose">
              Synthesizing topographic data for high-elevation lens placement
            </p>
            <button className="px-8 py-3 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 rounded-full transition-all duration-500 font-['Manrope'] font-bold text-[10px] tracking-[0.3em] text-[#00e5ff] uppercase">
              DECRYPT SECTOR MAPPING
            </button>
          </motion.div>
        </div>
        
        {/* Subtle background tech pattern */}
        <div className="absolute inset-0 z-0 bg-black opacity-40" />
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150 rotate-12" />
        <div 
          className="absolute inset-0 z-0 opacity-20" 
          style={{ backgroundImage: 'radial-gradient(#00e5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </section>

      {/* Resource Grid - "Expedition Gear" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {resources.map((res, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.8 }}
            viewport={{ once: true }}
            className="stitch-glass-panel p-10 rounded-[2.5rem] border-white/5 group hover:border-[#00e5ff]/40 transition-all duration-700 cursor-pointer relative overflow-hidden"
          >
            {/* Dynamic Card Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col gap-10 h-full relative z-10">
               <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[#bac9cc] group-hover:bg-[#00e5ff]/10 group-hover:text-[#00e5ff] group-hover:border-[#00e5ff]/20 transition-all duration-500">
                  <span className="material-symbols-outlined text-2xl leading-none">{res.icon}</span>
                </div>
                <span className="font-['Manrope'] font-bold text-[8px] border border-white/10 px-3 py-1 rounded-full text-[#bac9cc] opacity-40 group-hover:opacity-100 group-hover:border-[#00e5ff]/40 group-hover:text-[#00e5ff] transition-all">
                  EQUIPMENT_0{idx + 1}
                </span>
              </div>
              
              <div className="space-y-4">
                <h5 className="font-['Manrope'] font-black text-2xl text-white tracking-tight uppercase group-hover:text-[#00e5ff] transition-colors">{res.title}</h5>
                <p className="font-['Inter'] font-light text-[#bac9cc] leading-relaxed text-base opacity-60 group-hover:opacity-100 transition-opacity">
                  {res.desc}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-3 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                <div className="h-px flex-1 bg-white/10" />
                <span className="material-symbols-outlined text-[#00e5ff] text-sm">verified</span>
                <span className="font-['Manrope'] font-bold text-[8px] uppercase tracking-widest text-[#00e5ff]">Tactical Approved</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DossierLogistics;
