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
    <div className="flex flex-col gap-24 py-20">
      <header className="flex flex-col gap-4 max-w-4xl">
        <h3 className="font-['Manrope'] font-black text-4xl md:text-6xl text-white tracking-tighter uppercase tracking-widest">
          FIELD LOGISTICS
        </h3>
        <p className="font-['Inter'] font-light text-[#bac9cc] text-lg md:text-2xl leading-relaxed opacity-80">
          {locationBlurb}
        </p>
      </header>

      {/* Map Placeholder - "Mega" Lively Design */}
      <section className="relative w-full h-[500px] rounded-[3rem] overflow-hidden group">
        <div className="absolute inset-0 bg-[#080B11]/40 backdrop-blur-3xl border border-white/5 flex flex-col items-center justify-center">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-24 h-24 rounded-full border border-[#00e5ff]/30 flex items-center justify-center relative cursor-cell"
          >
            <div className="absolute inset-0 bg-[#00e5ff]/5 rounded-full animate-ping opacity-30"></div>
            <span className="material-symbols-outlined text-[#00e5ff] text-4xl">ads_click</span>
          </motion.div>
          <p className="text-[#00e5ff] font-['Manrope'] font-bold text-[10px] tracking-[0.4em] uppercase mt-8 opacity-60">
            LOAD INTERACTIVE SECTOR MAP (PRO)
          </p>
        </div>
        
        {/* Subtle background pattern */}
        <div 
          className="absolute inset-0 z-[-1] opacity-5 overflow-hidden" 
          style={{ backgroundImage: 'radial-gradient(#00e5ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        ></div>
      </section>

      {/* Resource Grid - "Subtle & Informative" */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {resources.map((res, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="stitch-glass-panel p-10 rounded-[2rem] border-white/5 group hover:border-[#00e5ff]/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#bac9cc] group-hover:bg-[#00e5ff]/10 group-hover:text-[#00e5ff] transition-all">
                <span className="material-symbols-outlined text-xl">{res.icon}</span>
              </div>
              <h5 className="font-['Manrope'] font-bold text-lg text-white tracking-wide uppercase">{res.title}</h5>
            </div>
            <p className="font-['Inter'] font-light text-[#bac9cc] leading-relaxed text-sm opacity-60 group-hover:opacity-100 transition-opacity">
              {res.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DossierLogistics;
