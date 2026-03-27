'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DossierEnvironmentalProps {
  quote: string;
  italicWord: string;
  lore: string[];
}

const DossierEnvironmental: React.FC<DossierEnvironmentalProps> = ({
  quote,
  italicWord,
  lore,
}) => {
  return (
    <div className="flex flex-col gap-24 py-20">
      {/* Cinematic Quote Section */}
      <section className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >
          <h3 className="font-['Manrope'] font-extralight text-3xl md:text-5xl lg:text-7xl text-[#bac9cc] leading-[1.1] tracking-tight">
            {quote}{" "}
            <span className="italic font-normal text-white mega-glow-text border-b border-[#00e5ff]/30 pb-2">
              {italicWord}
            </span>
          </h3>
        </motion.div>
      </section>

      {/* Narrative Lore Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          {lore.map((paragraph, idx) => (
            <p 
              key={idx} 
              className="font-['Inter'] font-light text-[#bac9cc] text-lg md:text-xl leading-relaxed opacity-80"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
        
        {/* Abstract Decorative Element (Mega) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="hidden md:flex justify-center items-center h-full"
        >
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00e5ff]/20 to-transparent blur-3xl rounded-full"></div>
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-10 border border-[#00e5ff]/10 rounded-full animate-reverse-spin"></div>
            <div className="absolute inset-24 bg-[#00e5ff]/40 blur-xl rounded-full"></div>
            <span className="material-symbols-outlined text-[#00e5ff] text-5xl absolute inset-0 flex items-center justify-center opacity-40">
              ac_unit
            </span>
          </div>
        </motion.div>
      </section>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DossierEnvironmental;
