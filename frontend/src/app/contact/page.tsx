import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Linkedin, Github } from 'lucide-react';

export default function ContactPage() {
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

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight font-heading">Let's Talk Space Weather.</h1>
        <p className="text-[#bac9cc] text-lg font-light leading-relaxed mb-16">
          Questions about the project, the ML model, or collaboration? Reach out.
        </p>

        <div className="grid grid-cols-1 gap-4 mb-16">
          <a href="mailto:mosiinmushtaq70@gmail.com" className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#00F5C4] group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-1">EMAIL</div>
              <div className="text-white font-medium">mosiinmushtaq70@gmail.com</div>
            </div>
          </a>

          <a href="https://linkedin.com/in/mosinmushtaq" target="_blank" rel="noopener noreferrer" className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#00F5C4] group-hover:scale-110 transition-transform">
              <Linkedin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-1">LINKEDIN</div>
              <div className="text-white font-medium">Mosin Mushtaq</div>
            </div>
          </a>

          <a href="https://github.com/mosiinmushtaq70-a11y/aurora-kashmir" target="_blank" rel="noopener noreferrer" className="bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 p-6 rounded-2xl flex items-center gap-6 hover:bg-white/5 transition-all group">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#00F5C4] group-hover:scale-110 transition-transform">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5C4] font-bold mb-1">SOURCE CODE</div>
              <div className="text-white font-medium">github.com/mosiinmushtaq70-a11y/aurora-kashmir</div>
            </div>
          </a>
        </div>

        <div className="pt-8 border-t border-white/10">
          <p className="text-xs text-white/30 font-light uppercase tracking-widest leading-relaxed">
            AuroraLens is a B.Tech AI/ML project by Mosin Mushtaq.<br />
            Open source under MIT License.
          </p>
        </div>
      </div>
    </div>
  );
}
