'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ArchiveImage {
  src: string;
  alt: string;
  title: string;
  author: string;
  span?: 'small' | 'medium' | 'large';
}

interface DossierArchivesProps {
  images: ArchiveImage[];
}

const DossierArchives: React.FC<DossierArchivesProps> = ({ images }) => {
  return (
    <div className="flex flex-col gap-24 py-20">
      <header className="flex flex-col gap-4 max-w-2xl">
        <h3 className="font-['Manrope'] font-black text-4xl md:text-6xl text-white tracking-tighter uppercase tracking-widest">
          FIELD ARCHIVES
        </h3>
        <p className="font-['Inter'] font-light text-[#bac9cc] text-lg opacity-60">
          Curated visual intelligence captured during peak atmospheric stability.
        </p>
      </header>

      {/* Bento Grid Gallery - Mega Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[300px] md:auto-rows-[400px] gap-8">
        {images.map((img, idx) => {
          const isLarge = img.span === 'large';
          const isMed   = img.span === 'medium';
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden group cursor-pointer rounded-[2rem] border border-white/5 ${
                isLarge ? 'md:col-span-3 md:row-span-2' : 
                isMed   ? 'md:col-span-2' : 
                'md:col-span-1'
              }`}
            >
              <motion.img
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="w-full h-full object-cover transition-all"
                src={img.src}
                alt={img.alt}
              />
              
              {/* Overlay - "Lively" on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B11]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="text-[10px] tracking-[0.3em] font-bold text-[#00e5ff] uppercase mb-2">ARCHIVE REF: {idx + 1024}</p>
                <h4 className="font-['Manrope'] font-bold text-2xl text-white mb-1 uppercase tracking-wider">{img.title}</h4>
                <p className="text-xs text-[#bac9cc] font-light italic">Captured by {img.author}</p>
              </div>

              {/* Decorative Corner Glow */}
              <div className="absolute top-6 left-6 w-3 h-3 bg-[#00e5ff] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DossierArchives;
