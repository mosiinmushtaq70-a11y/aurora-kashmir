'use client';

import React from 'react';
import { motion } from 'framer-motion';

const WhyThisMatters: React.FC = () => {
  const impacts = [
    {
      title: 'Power Grids',
      desc: 'G3+ storms induce Geomagnetically Induced Currents (GICs) that can saturate and damage high-voltage transformers.',
      stat: '$2.6T GDP at risk',
      source: 'Lloyds of London, 2013',
      icon: 'bolt'
    },
    {
      title: 'GPS & GNSS',
      desc: 'Ionospheric disturbances degrade signal accuracy by 100m+, affecting aviation, maritime, and autonomous systems.',
      stat: 'Critical Accuracy Loss',
      source: 'Federal Aviation Admin',
      icon: 'location_on'
    },
    {
      title: 'Satellites',
      desc: 'Geomagnetic storms increase atmospheric drag on LEO orbits. SpaceX lost 38 Starlinks in a single G1 event (Feb 2022).',
      stat: 'Orbital Decay Risk',
      source: 'SpaceX Mission Logs',
      icon: 'satellite'
    }
  ];

  return (
    <section className="w-full py-24 md:py-36 bg-[#080B11] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24 reveal-on-scroll">
          <span className="font-copy tracking-[0.3em] text-[#00F5C4] font-bold uppercase text-[10px] md:text-xs">Real-World Stakes</span>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tighter text-white mt-4 mb-6">Why Prediction Matters</h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto font-light">
            Beyond the visual spectacle, geomagnetic storms pose significant threats to the critical infrastructure of our modern digital civilization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {impacts.map((impact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="stitch-glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5 hover:border-[#00F5C4]/20 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-[#00F5C4]/30 transition-colors">
                <span className="material-symbols-outlined text-3xl text-[#bac9cc] group-hover:text-[#00F5C4] transition-colors">
                  {impact.icon}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">{impact.title}</h3>
              <p className="text-[#bac9cc] text-sm leading-relaxed mb-8 font-light italic">
                "{impact.desc}"
              </p>
              
              <div className="pt-6 border-t border-white/5">
                <div className="text-[#00F5C4] font-mono text-sm font-bold mb-1">{impact.stat}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest">{impact.source}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyThisMatters;
