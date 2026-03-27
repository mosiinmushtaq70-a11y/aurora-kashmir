'use client';

import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface DossierShellProps {
  heroImage: string;
  subtitle: string;
  children: ReactNode;
}

const DossierShell: React.FC<DossierShellProps> = ({ 
  heroImage, 
  subtitle, 
  children 
}) => {
  const { activeDossier, closeDossier } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-driven Parallax & Header Opacity
  const { scrollY } = useScroll();
  
  // Backround Parallax: Scale and subtle Y movement
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 300]);
  const backgroundScale = useTransform(scrollY, [0, 1000], [1, 1.2]);
  
  // Header Opacity & Blur: Increases as user scrolls down
  const headerBgOpacity = useTransform(scrollY, [0, 200], [0, 0.8]);
  const headerBlur = useTransform(scrollY, [0, 200], [0, 24]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen bg-[#080B11] text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#00e5ff] selection:text-[#00626e] overflow-x-hidden"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .stitch-glass-panel {
          background: rgba(8, 11, 17, 0.4);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mega-glow-text {
          text-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
        }

        /* Smooth scroll experience */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Hero Background (Fixed & Parallax) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.img
          style={{ y: backgroundY, scale: backgroundScale }}
          alt="Cinematic location hero"
          className="w-full h-full object-cover grayscale-[30%] brightness-[0.6]"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-transparent to-[#080B11]/40"></div>
        {/* Deep shadows for content readability as user scrolls */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Persistent Sticky Header */}
      <motion.nav 
        style={{ 
          backgroundColor: useTransform(headerBgOpacity, (o) => `rgba(8, 11, 17, ${o})`),
          backdropFilter: useTransform(headerBlur, (b) => `blur(${b}px)`)
        }}
        className="fixed top-0 w-full z-50 border-b border-white/5"
      >
        <div className="flex justify-between items-center px-6 md:px-12 py-6 max-w-screen-2xl mx-auto">
          <button
            onClick={closeDossier}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-[#00e5ff]/10 rounded-full border border-white/10 hover:border-[#00e5ff]/30 transition-all duration-500 active:scale-95"
          >
            <span className="material-symbols-outlined text-[#00e5ff] text-xl">arrow_back</span>
            <span className="font-['Manrope'] font-bold tracking-[0.2em] uppercase text-[10px] text-[#00e5ff]">CLOSE DOSSIER</span>
          </button>
          
          <div className="text-right flex flex-col items-end">
            <span className="font-['Manrope'] font-bold tracking-[0.3em] uppercase text-[10px] text-[#00e5ff] mb-1">
              SITE INTELLIGENCE
            </span>
            <span className="font-['Inter'] font-light text-[11px] text-[#bac9cc] opacity-60">
              {activeDossier?.region?.toUpperCase()} // {activeDossier?.name?.toUpperCase()}
            </span>
          </div>
        </div>
      </motion.nav>

      {/* Mega Content Flow */}
      <main className="relative z-10 flex flex-col items-center">
        {/* 1. Cinematic Entry (Hero Title) */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <h2 className="font-['Inter'] font-light tracking-[0.6em] uppercase text-[#00e5ff] text-[10px] md:text-sm mb-6 opacity-80">
              {subtitle}
            </h2>
            <h1 className="font-['Manrope'] font-extrabold text-white text-7xl md:text-[12rem] leading-none tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] mega-glow-text mb-8">
              {activeDossier?.name}
            </h1>
            <div className="w-px h-32 bg-gradient-to-b from-[#00e5ff] to-transparent opacity-40"></div>
          </motion.div>
        </section>

        {/* 2. Content Sections (Children) */}
        <div className="w-full max-w-7xl px-6 md:px-12 pb-60 space-y-40">
          {children}
        </div>
      </main>

      {/* Global Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-0.5 bg-[#00e5ff] z-[100] origin-left"
        style={{ scaleX: useScroll().scrollProgress }}
      />
    </div>
  );
};

export default DossierShell;
