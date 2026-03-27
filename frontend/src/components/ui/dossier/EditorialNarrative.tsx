'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Chapter {
  title: string;
  content: string;
  footnote?: string;
}

interface EditorialNarrativeProps {
  quote: string;
  italicWord: string;
  chapters: Chapter[];
}

const EditorialNarrative: React.FC<EditorialNarrativeProps> = ({
  quote,
  italicWord,
  chapters,
}) => {
  return (
    <div className="flex flex-col gap-32 py-20 relative">
      {/* Background Ambience Bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#00e5ff]/5 blur-[120px] rounded-full -z-10" />

      {/* Cinematic Quote Section */}
      <section className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >
          <h3 className="font-['Manrope'] font-extralight text-3xl md:text-6xl lg:text-8xl text-[#bac9cc] leading-[1.05] tracking-tight">
            {quote}{" "}
            <span className="italic font-normal text-white mega-glow-text border-b border-[#00e5ff]/30 pb-2">
              {italicWord}
            </span>
          </h3>
        </motion.div>
      </section>

      {/* Structured Chapters */}
      <div className="grid grid-cols-1 gap-24">
        {chapters.map((chapter, idx) => (
          <section key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-20 items-start group">
            {/* Chapter Header */}
            <div className="md:col-span-4 sticky top-24 pt-2">
               <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-['Manrope'] font-bold text-[10px] text-[#00e5ff] tracking-[0.4em] uppercase opacity-40">
                    Chapter {idx + 1}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <h4 className="font-['Manrope'] font-bold text-2xl md:text-3xl text-white leading-tight tracking-tight uppercase">
                  {chapter.title}
                </h4>
              </motion.div>
            </div>

            {/* Content with Drop-cap */}
            <div className="md:col-span-5 relative">
               <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="font-['Inter'] font-light text-[#bac9cc] text-lg md:text-xl leading-relaxed opacity-80 first-letter:text-6xl first-letter:font-['Manrope'] first-letter:font-extrabold first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                  {chapter.content}
                </p>
              </motion.div>
            </div>

            {/* Sidebar Footnote */}
            {chapter.footnote && (
              <div className="md:col-span-3 pt-4 border-t border-white/5 md:border-t-0 md:border-l md:pl-8">
                 <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 0.6, x: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="flex flex-col gap-3"
                >
                  <span className="material-symbols-outlined text-[#00e5ff] text-xl opacity-80">info</span>
                  <p className="font-['Inter'] text-[11px] leading-relaxed text-[#bac9cc] uppercase tracking-wider font-medium">
                    {chapter.footnote}
                  </p>
                </motion.div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default EditorialNarrative;
