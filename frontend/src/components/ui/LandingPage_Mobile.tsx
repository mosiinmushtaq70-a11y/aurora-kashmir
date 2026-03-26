'use client';

import React, { useEffect } from 'react';

/**
 * --- LandingPage_Mobile Component ---
 * Extracted from Stitch: auroralens_landing_page_mobile_optimized
 * Phase: UI Extraction Only (Zero-Logic)
 * Protocol: Zero Destruction (Preserving all Tailwind classes)
 * Features: Solar Orrery simulation, Tactical Omnibar, Bento Grid, AI Teaser.
 */
const LandingPage_Mobile: React.FC = () => {
  // Logic-free scroll revelation (Purely visual/UI-driven)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-bottom').forEach(el => revealObserver.observe(el));
    
    return () => revealObserver.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#10131a] text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#44e2cd]/30 overflow-x-hidden w-full">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'glass-card', 'orrery-container', 'border-glow-card' included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .stitch-glass-card {
          background: rgba(8, 11, 17, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .aurora-glow {
          background: radial-gradient(circle at center, rgba(68, 226, 205, 0.15) 0%, transparent 70%);
        }

        .text-gradient {
          background: linear-gradient(to right, #c3f5ff, #44e2cd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        /* Orrery Simulation */
        .orrery-container { position: relative; width: 400px; height: 400px; }
        .sun { width: 60px; height: 60px; background: radial-gradient(circle, #fff700, #ff8c00); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 60px rgba(255, 140, 0, 0.6); z-index: 10; }
        .earth-orbit { position: absolute; top: 50%; left: 50%; width: 300px; height: 300px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 50%; transform: translate(-50%, -50%); animation: orbit-rotate 20s linear infinite; }
        .earth-container { position: absolute; top: 0; left: 50%; width: 24px; height: 24px; transform: translate(-50%, -50%); }
        .earth { width: 24px; height: 24px; background: #00e5ff; border-radius: 50%; box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); position: relative; }
        .moon-orbit { position: absolute; width: 56px; height: 56px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: orbit-rotate 4s linear infinite; }
        .moon { width: 8px; height: 8px; background: #bac9cc; border-radius: 50%; position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }

        @keyframes orbit-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .reveal-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-on-scroll.active { opacity: 1; transform: translateY(0); }
        .reveal-left { opacity: 0; transform: translateX(-50px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-right { opacity: 0; transform: translateX(50px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-bottom { opacity: 0; transform: translateY(50px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-left.active, .reveal-right.active, .reveal-bottom.active { opacity: 1; transform: translate(0, 0); }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .border-glow-card { position: relative; padding: 1px; border-radius: var(--border-radius, 1rem); background: transparent; overflow: hidden; isolation: isolate; }
        .border-glow-card::before { content: ""; position: absolute; inset: 0; padding: 1px; border-radius: var(--border-radius, 1rem); background: var(--glow-color-20); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .border-glow-card::after { content: ""; position: absolute; inset: -50%; background: conic-gradient(from 0deg, transparent 0deg, transparent calc(180deg - var(--cone-spread, 20) * 1deg), var(--glow-color) 180deg, transparent calc(180deg + var(--cone-spread, 20) * 1deg), transparent 360deg); animation: rotate-glow 4s linear infinite; pointer-events: none; z-index: -1; }
        .border-glow-inner { position: relative; border-radius: calc(var(--border-radius, 1rem) - 1px); background: var(--card-bg, #000); height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; }
        @keyframes rotate-glow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#080B11]/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-white font-['Manrope']">AuroraLens</div>
          <nav className="hidden md:flex gap-12 items-center">
            <a className="font-['Manrope'] font-semibold tracking-tight text-[#00E5FF] border-b-2 border-[#00E5FF] pb-1" href="#">Forecast Map</a>
            <a className="font-['Manrope'] font-semibold tracking-tight text-white/70 hover:text-[#00E5FF] transition-colors duration-300" href="#">AI Assistant</a>
          </nav>
          <div className="flex items-center gap-6">
            <button className="bg-[#44e2cd] text-[#003731] px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95">Join Observer</button>
          </div>
        </div>
      </header>

      <main className="relative pt-32 overflow-x-hidden w-full">
        {/* Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] aurora-glow blur-3xl pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] aurora-glow opacity-30 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(126, 34, 204, 0.1) 0%, transparent 70%)' }}></div>

        {/* Hero Section */}
        <section className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between min-h-screen md:min-h-[819px] gap-12 md:gap-20">
          <div className="w-full md:w-1/2 space-y-6 md:space-y-8 z-10 text-center md:text-left">
            <span className="tracking-widest text-[#44e2cd] font-medium uppercase text-xs">Celestial Monitoring System</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[8rem] font-['Manrope'] font-extrabold tracking-tighter leading-tight md:leading-none text-white">
              TRACK THE <span className="text-gradient">AURORA</span> ANYWHERE.
            </h1>
            <p className="text-base md:text-xl text-[#bac9cc] font-light leading-relaxed max-w-xl mx-auto md:mx-0 px-4 md:px-0">
              Real-time atmospheric telemetry processed by neural networks to predict celestial events with 98.4% precision.
            </p>
            {/* Tactical Omnibar */}
            <div className="stitch-glass-card rounded-full p-2 flex items-center max-w-lg shadow-2xl mx-auto md:mx-0">
              <div className="flex items-center flex-1 px-4 md:px-6 gap-3">
                <span className="material-symbols-outlined text-[#44e2cd] text-lg md:text-2xl">explore</span>
                <input className="bg-transparent border-none focus:ring-0 text-white placeholder-white/30 w-full py-3 md:py-4 text-sm md:text-base" placeholder="Enter coordinates or city..." type="text"/>
              </div>
              <button className="bg-[#00e5ff] text-[#00626e] p-3 md:p-4 rounded-full flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all group relative">
                <span className="material-symbols-outlined text-sm md:text-base">satellite_alt</span>
              </button>
            </div>
          </div>

          {/* Orrery Visual */}
          <div className="w-full md:w-1/2 flex justify-center items-center relative py-10 md:py-20 overflow-hidden md:overflow-visible">
            <div className="orrery-container scale-[0.6] sm:scale-75 md:scale-100">
              <div className="sun"></div>
              <div className="earth-orbit">
                <div className="earth-container">
                  <div className="earth"></div>
                  <div className="moon-orbit">
                    <div className="moon"></div>
                  </div>
                </div>
              </div>
              <div className="absolute w-[500px] h-[500px] border border-white/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-[700px] h-[700px] border border-white/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </section>

        {/* Live Nodes Carousel */}
        <section className="py-20 px-6 md:px-12 max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 md:gap-0">
            <div>
              <h2 className="text-3xl md:text-4xl font-['Manrope'] font-bold text-white mb-2">Live Activity Nodes</h2>
              <p className="text-[#bac9cc] font-light">Global observational hotspots with active luminescence.</p>
            </div>
            <div className="flex gap-4">
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-white">chevron_left</span>
              </button>
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-white">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 gap-6">
            {[
              { name: 'Kirkjufell, Iceland', coords: '64.9417° N, 23.3114° W', vis: '92%', update: '2m ago', state: 'High KP-6', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4_5g1-88tEI-V4qkCOyJm_0OEedwBX29IsAZQ40f2zoZxJ8jZaQK0wuRYTbI5X_0e4Aw2MQS_g5tbBHSJGWXIBoO5t_UkRvon7CkfQUyi0zs_hVH1BYFXVlXAgQHzQcilZ1EZSMcSUOIUlJY_D2gt-jd4YUIM6hu2GeZKCd2er6susfRGoy0K41Xik4uFhhvuKhpgFL_QSFTuQ9t73of9O7Vi74iAfJoCXjQEU2631R3Sr10p3zrg4RyKwQAY25KP3LPqDkchhDw' },
              { name: 'Tromsø, Norway', coords: '69.6492° N, 18.9553° E', vis: '74%', update: '5m ago', state: 'Stable KP-4', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLq_Z0lS6SgE7PILS0ujXhsLbYNP2HB7kVtGztz9U33HrQbpeqV51CKaIT5-HALOH5M50Ob_Kcku9NtjSoEAnMuMNz2b3EJhMO6CSpOwMBARB5B4LnrmQCsexQhVPWg7M9Q_330c_3STDlsyIjj_MO9Kymdn-gZHPqGbf6O5Jkk1P0QMQmEUqr0LCYYfdXLlRcthmbQTOSEmerEMX5COn3aNFNA1BgOQJjY-DPR_7bAF1daEj15PwuTATTUGVWGsPuasuqFfJC2xo' },
              { name: 'Fairbanks, Alaska', coords: '64.8401° N, 147.7200° W', vis: '100%', update: '1m ago', state: 'Storm KP-8', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBH3b7ZU54K55odGnMFw_QWpbHAZD3b7Gaj5xs-RTgLR-2m5Rds6Q-nGHjLtJ89BE7UFBKj4W6UGHmFeunoa836Qk65ml59U1eoVTi-KJAidQizsN7_CV2A4VG2Wru-JPTDszUEUCIQ5uCcoYhNdGWb5RUct9Gy_yHo5MyLgYzBeo-JUb0p82mxY1jUwsIFovHXyIWMddpvSEAkcsVDX8xcVLKbuDsYlbWgroYSbyXTW-8DiW1efkUbd5iNVUTURWgc4Dw_r8eOs' }
            ].map((node, i) => (
              <div key={i} className="stitch-glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all min-w-[85vw] md:min-w-0 snap-center">
                <div className="h-56 md:h-64 overflow-hidden relative">
                  <img alt={node.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={node.img} />
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${node.state.includes('Storm') ? 'bg-red-500' : 'bg-[#44e2cd]'} animate-pulse`}></span>
                    <span className="text-xs font-medium uppercase tracking-widest text-white">{node.state}</span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-['Manrope'] font-bold text-white mb-1">{node.name}</h3>
                  <p className="text-[#bac9cc] text-xs md:text-sm mb-6">{node.coords}</p>
                  <div className="flex justify-between items-center text-xs md:text-sm font-medium">
                    <span className="text-[#44e2cd]">{node.vis} Visibility</span>
                    <span className="text-white/40">Updated {node.update}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Flow */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden bg-[#080B11]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center relative z-10">
              {[
                { step: '01', title: 'TARGET', desc: 'Search any global vector.', icon: 'crosshair' },
                { step: '02', title: 'ANALYZE', desc: 'Let the ML model predict visibility.', icon: 'radar' },
                { step: '03', title: 'DEPLOY', desc: 'Get instant alerts when probability spikes.', icon: 'bell' }
              ].map((item, i) => (
                <div key={i} className="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500">
                  <div className="text-xs tracking-[0.3em] font-bold text-cyan-400/50 mb-4 uppercase">{item.step}</div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">{item.title}</h3>
                  <p className="text-slate-400 font-light text-sm md:text-base leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Box */}
        <section className="py-20 md:py-32 px-6 md:px-12 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto">
            <div className="md:col-span-2 stitch-glass-card rounded-xl p-6 md:p-10 reveal-left">
              <h3 className="text-2xl md:text-3xl font-['Manrope'] font-bold text-white mb-4">60 Years of Telemetry</h3>
              <p className="text-[#bac9cc] font-light max-w-md">Our models are trained on six decades of solar wind data.</p>
            </div>
            <div className="stitch-glass-card rounded-xl p-6 md:p-10 flex flex-col items-center justify-center text-center reveal-bottom h-[300px]">
              <h3 className="text-5xl md:text-6xl font-['Manrope'] font-extrabold text-[#c3f5ff] mb-2">24/7</h3>
              <p className="tracking-widest text-[#bac9cc] text-xs uppercase">Live Satellite Uplink</p>
            </div>
          </div>
        </section>

        {/* AI Assistant Teaser */}
        <section className="py-20 md:py-32 relative">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="stitch-glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[#c3f5ff]/10 to-transparent pointer-events-none"></div>
              <div className="w-full md:w-1/2 space-y-6 md:space-y-8 z-10 text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-['Manrope'] font-extrabold text-white leading-tight">Don't just track it. <br/><span className="text-gradient">Capture it.</span></h2>
                <p className="text-base md:text-xl text-[#bac9cc] font-light leading-relaxed">Meet Aura, your personal astrophotography assistant.</p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                  <button className="bg-[#00e5ff] text-[#00626e] px-8 py-4 rounded-full font-bold hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all">Chat with Aurora</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Footer CTA */}
        <section className="w-full py-20 px-6 max-w-5xl mx-auto">
          <div className="border-glow-card w-full" style={{ '--card-bg': '#060010', '--border-radius': '47px', '--glow-color': '#c3f5ff', '--glow-color-20': 'rgba(195,245,255,0.2)' } as any}>
            <div className="border-glow-inner p-8 md:p-32 text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4">The aurora is shifting.</h2>
              <p className="text-lg md:text-2xl text-[#c3f5ff] font-light italic mb-10">Don't miss the next peak.</p>
              <button className="bg-[#44e2cd] text-[#003731] px-10 py-5 rounded-full font-bold uppercase tracking-widest">Initiate Tracking Protocol</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#10131a] w-full py-16 px-6 border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto text-center opacity-40">
          <div className="text-lg font-black text-white mb-4">AuroraLens</div>
          <p className="text-[#bac9cc] text-sm italic">© 2024 AuroraLens. The Celestial Lens.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage_Mobile;
