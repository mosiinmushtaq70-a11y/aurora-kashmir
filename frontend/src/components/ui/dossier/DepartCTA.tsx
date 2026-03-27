'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const DepartCTA: React.FC = () => {
  const { closeDossier } = useAppStore();

  return (
    <section className="relative w-full py-40 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#00e5ff]/5 to-[#080B11] -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[#00e5ff]/10 blur-[150px] rounded-full -z-10 opacity-50" />

      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: 'easeOut' }}
           viewport={{ once: true }}
           className="flex flex-col items-center gap-12"
        >
          <div className="flex flex-col gap-4">
            <span className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-[0.5em] uppercase opacity-60">
              Final Directive
            </span>
            <h2 className="font-['Manrope'] font-black text-5xl md:text-8xl text-white tracking-tighter leading-none uppercase">
              Ready to <br /> <span className="mega-glow-text text-white">Depart?</span>
            </h2>
          </div>

          <p className="font-['Inter'] font-light text-[#bac9cc] text-lg md:text-xl max-w-2xl leading-relaxed opacity-60 italic">
            "The lens only captures what the eye is brave enough to seek. Your tactical dossier is synced. The sector awaits."
          </p>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-8">
            <button 
              onClick={closeDossier}
              className="group relative px-12 py-5 bg-white text-[#080B11] font-['Manrope'] font-black text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:shadow-[0_0_60px_rgba(0,229,255,0.5)]"
            >
              <div className="absolute inset-0 bg-[#00e5ff] translate-y-full group-hover:translate-y-0 transition-transform duration-500 -z-10" />
              <span>Initiate Departure</span>
            </button>

            <button className="px-8 py-5 border border-white/10 text-[#bac9cc] font-['Manrope'] font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white/5 transition-all">
              Save Intelligence Offline
            </button>
          </div>

          <div className="mt-20 flex items-center gap-8 opacity-20">
            <div className="h-px w-24 bg-white/20" />
             <div className="flex gap-4">
               <span className="material-symbols-outlined text-sm">terminal</span>
               <span className="material-symbols-outlined text-sm">security</span>
               <span className="material-symbols-outlined text-sm">wifi_tethering</span>
             </div>
            <div className="h-px w-24 bg-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DepartCTA;
