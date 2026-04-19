'use client';

import React from 'react';
import { motion } from 'framer-motion';

const AboutBuilder: React.FC = () => {
  return (
    <section className="w-full py-24 md:py-32 bg-[#080B11] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          
          {/* Visual Side */}
          <div className="relative w-full md:w-1/3 aspect-square max-w-[400px]">
            <div className="absolute inset-0 bg-linear-to-tr from-[#00F5C4]/20 to-[#44e2cd]/10 rounded-[2.5rem] blur-2xl" />
            <div className="relative h-full w-full rounded-[2.5rem] bg-[#0D1117] border border-white/10 p-2 overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-b from-[#00F5C4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-full w-full rounded-[2.2rem] bg-linear-to-br from-[#10141d] to-[#080b11] flex flex-col items-center justify-center text-center p-8">
                {/* Developer Icon/Avatar Placeholder */}
                <div className="w-24 h-24 rounded-full bg-linear-to-r from-[#00F5C4] to-[#44e2cd] p-1 mb-6">
                  <div className="w-full h-full rounded-full bg-[#0D1117] flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-[#00F5C4]">engineering</span>
                  </div>
                </div>
                <h3 className="text-2xl font-['Manrope'] font-bold text-white mb-1">Mosin Mushtaq</h3>
                <p className="text-[10px] uppercase tracking-widest text-[#00F5C4] font-bold mb-2">Tech & Space Enthusiast</p>
                <p className="text-[10px] text-white/50 font-medium mb-6 px-4">B.Tech AI/ML</p>
                
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/mosiinmushtaq70-a11y/aurora-kashmir" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="View GitHub Repository"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#00F5C4]/20 hover:border-[#00F5C4]/40 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">code</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/mosiin-mushtaq" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Connect on LinkedIn"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#00F5C4]/20 hover:border-[#00F5C4]/40 transition-all"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F5C4]/10 border border-[#00F5C4]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5C4] animate-pulse" />
              <span className="text-[10px] font-bold text-[#00F5C4] uppercase tracking-widest">Builder Profile</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-['Manrope'] font-bold text-white tracking-tight">
              Driven by <span className="text-transparent bg-clip-text bg-linear-to-r from-[#00F5C4] to-[#44e2cd]">Space Weather</span> & Applied ML.
            </h2>
            
            <p className="text-lg md:text-xl text-[#9CA3AF] font-light leading-relaxed max-w-2xl">
              I built AuroraLens to explore the intersection of real-time geomagnetic telemetry and predictive machine learning. 
              As an AI/ML enthusiast, I'm passionate about turning open NASA/NOAA datasets into actionable technical insights.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h4 className="text-white font-bold mb-2">Technical Focus</h4>
                <p className="text-sm text-[#9CA3AF]">XGBoost Gradient Boosting, Telemetry Preprocessing, and High-Performance UI Design.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-2">The Mission</h4>
                <p className="text-sm text-[#9CA3AF]">Democratizing auroral forecasts through empirical data and intuitive visualization.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutBuilder;
