<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Manrope:wght@600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface-tint": "#00daf3",
                        "surface-container-lowest": "#0b0e14",
                        "secondary-fixed": "#62fae3",
                        "inverse-primary": "#006875",
                        "on-tertiary-fixed-variant": "#6900b3",
                        "error-container": "#93000a",
                        "on-tertiary-fixed": "#2c0051",
                        "on-tertiary-container": "#7e22cc",
                        "background": "#10131a",
                        "on-secondary-container": "#004d44",
                        "primary": "#c3f5ff",
                        "on-error": "#690005",
                        "inverse-on-surface": "#2d3037",
                        "surface-container-highest": "#32353c",
                        "secondary-container": "#03c6b2",
                        "primary-container": "#00e5ff",
                        "on-primary-container": "#00626e",
                        "on-secondary": "#003731",
                        "error": "#ffb4ab",
                        "outline-variant": "#3b494c",
                        "on-primary-fixed-variant": "#004f58",
                        "tertiary-fixed-dim": "#ddb7ff",
                        "secondary": "#44e2cd",
                        "on-tertiary": "#490080",
                        "on-surface": "#e0e2eb",
                        "on-primary": "#00363d",
                        "on-error-container": "#ffdad6",
                        "on-primary-fixed": "#001f24",
                        "tertiary": "#f7e7ff",
                        "primary-fixed-dim": "#00daf3",
                        "on-surface-variant": "#bac9cc",
                        "secondary-fixed-dim": "#3cddc7",
                        "surface-container-high": "#272a31",
                        "primary-fixed": "#9cf0ff",
                        "on-background": "#e0e2eb",
                        "surface-variant": "#32353c",
                        "surface-container-low": "#191c22",
                        "on-secondary-fixed-variant": "#005047",
                        "surface-container": "#1d2026",
                        "tertiary-fixed": "#f0dbff",
                        "surface-dim": "#10131a",
                        "surface": "#10131a",
                        "surface-bright": "#363940",
                        "outline": "#849396",
                        "tertiary-container": "#e4c4ff",
                        "on-secondary-fixed": "#00201c",
                        "inverse-surface": "#e0e2eb"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"]
                    },
                    borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        body { background-color: #10131a; color: #e0e2eb; }
        .glass-card { background: rgba(8, 11, 17, 0.4); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .aurora-glow { background: radial-gradient(circle at center, rgba(68, 226, 205, 0.15) 0%, transparent 70%); }
        .text-gradient { background: linear-gradient(to right, #c3f5ff, #44e2cd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
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
        .border-glow-card > .edge-light { position: absolute; inset: 0; border-radius: var(--border-radius, 1rem); pointer-events: none; overflow: hidden; }
        .border-glow-card > .edge-light::before { content: ""; position: absolute; inset: -150%; background: conic-gradient(from 0deg, transparent 0deg, transparent calc(180deg - var(--cone-spread, 20) * 1deg), var(--glow-color) 180deg, transparent calc(180deg + var(--cone-spread, 20) * 1deg), transparent 360deg); filter: blur(var(--glow-padding, 20px)); animation: rotate-glow 4s linear infinite; }
        .border-glow-inner { position: relative; border-radius: calc(var(--border-radius, 1rem) - 1px); background: var(--card-bg, #000); height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; }
        @keyframes rotate-glow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</head>
<body class="font-body selection:bg-secondary/30 overflow-x-hidden w-full" data-mode="connect">
<!-- TopNavBar -->
<header class="fixed top-0 w-full z-50 bg-[#080B11]/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
<div class="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-screen-2xl mx-auto">
<div class="text-2xl font-bold tracking-tighter text-white font-headline">AuroraLens</div>
<nav class="hidden md:flex gap-12 items-center">
<a class="font-headline font-semibold tracking-tight text-[#00E5FF] border-b-2 border-[#00E5FF] pb-1" href="#">Forecast Map</a>
<a class="font-headline font-semibold tracking-tight text-white/70 hover:text-[#00E5FF] transition-colors duration-300" href="#">AI Assistant</a>
</nav>
<div class="flex items-center gap-6">
<button class="bg-secondary text-on-secondary px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95">Join Observer</button>
</div>
</div>
</header>
<main class="relative pt-32 overflow-x-hidden w-full">
<!-- Background Orbs -->
<div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] aurora-glow blur-3xl pointer-events-none"></div>
<div class="absolute top-[20%] right-[-10%] w-[40%] h-[60%] aurora-glow opacity-30 blur-3xl pointer-events-none" style="background: radial-gradient(circle, rgba(126, 34, 204, 0.1) 0%, transparent 70%);"></div>
<!-- Hero Section -->
<section class="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between min-h-screen md:min-h-[819px] gap-12 md:gap-20">
<div class="w-full md:w-1/2 space-y-6 md:space-y-8 z-10 text-center md:text-left">
<span class="label-md tracking-widest text-secondary font-medium uppercase text-xs">Celestial Monitoring System</span>
<h1 class="text-4xl sm:text-5xl md:text-7xl lg:text-[8rem] font-headline font-extrabold tracking-tighter leading-tight md:leading-none text-white">
                TRACK THE <span class="text-gradient">AURORA</span> ANYWHERE.
            </h1>
<p class="text-base md:text-xl text-on-surface-variant font-light leading-relaxed max-w-xl mx-auto md:mx-0 px-4 md:px-0">
                Real-time atmospheric telemetry processed by neural networks to predict celestial events with 98.4% precision.
            </p>
<!-- Tactical Omnibar -->
<div class="glass-card rounded-full p-2 flex items-center max-w-lg shadow-2xl mx-auto md:mx-0">
<div class="flex items-center flex-1 px-4 md:px-6 gap-3">
<span class="material-symbols-outlined text-secondary text-lg md:text-2xl">explore</span>
<input class="bg-transparent border-none focus:ring-0 text-white placeholder-white/30 w-full py-3 md:py-4 text-sm md:text-base" placeholder="Enter coordinates or city..." type="text"/>
</div>
<button class="bg-primary-container text-on-primary-container p-3 md:p-4 rounded-full flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all group relative">
<span class="material-symbols-outlined text-sm md:text-base">satellite_alt</span>
<div class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#080B11]/80 backdrop-blur-md border border-white/10 text-white text-xs font-medium rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">Detect My Location</div>
</button>
</div>
</div>
<!-- Orrery Central Visual -->
<div class="w-full md:w-1/2 flex justify-center items-center relative py-10 md:py-20 overflow-hidden md:overflow-visible">
<div class="orrery-container scale-[0.6] sm:scale-75 md:scale-100">
<div class="sun"></div>
<div class="earth-orbit">
<div class="earth-container">
<div class="earth"></div>
<div class="moon-orbit">
<div class="moon"></div>
</div>
</div>
</div>
<div class="absolute w-[500px] h-[500px] border border-white/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
<div class="absolute w-[700px] h-[700px] border border-white/5 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
</div>
</div>
</section>
<!-- Global Hotspots Carousel -->
<section class="py-20 px-6 md:px-12 max-w-screen-2xl mx-auto">
<div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 md:gap-0">
<div>
<h2 class="text-3xl md:text-4xl font-headline font-bold text-white mb-2">Live Activity Nodes</h2>
<p class="text-on-surface-variant font-light">Global observational hotspots with active luminescence.</p>
</div>
<div class="flex gap-4">
<button class="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<button class="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
<div class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 gap-6">
<!-- Card 1 -->
<div class="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all min-w-[85vw] md:min-w-0 snap-center">
<div class="h-56 md:h-64 overflow-hidden relative">
<img alt="Kirkjufell, Iceland" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4_5g1-88tEI-V4qkCOyJm_0OEedwBX29IsAZQ40f2zoZxJ8jZaQK0wuRYTbI5X_0e4Aw2MQS_g5tbBHSJGWXIBoO5t_UkRvon7CkfQUyi0zs_hVH1BYFXVlXAgQHzQcilZ1EZSMcSUOIUlJY_D2gt-jd4YUIM6hu2GeZKCd2er6susfRGoy0K41Xik4uFhhvuKhpgFL_QSFTuQ9t73of9O7Vi74iAfJoCXjQEU2631R3Sr10p3zrg4RyKwQAY25KP3LPqDkchhDw"/>
<div class="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span class="text-xs font-medium uppercase tracking-widest text-white">High KP-6</span>
</div>
</div>
<div class="p-6 md:p-8">
<h3 class="text-xl md:text-2xl font-headline font-bold text-white mb-1">Kirkjufell, Iceland</h3>
<p class="text-on-surface-variant text-xs md:text-sm mb-6">64.9417° N, 23.3114° W</p>
<div class="flex justify-between items-center text-xs md:text-sm font-medium">
<span class="text-secondary">92% Visibility</span>
<span class="text-white/40">Updated 2m ago</span>
</div>
</div>
</div>
<!-- Card 2 -->
<div class="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all min-w-[85vw] md:min-w-0 snap-center">
<div class="h-56 md:h-64 overflow-hidden relative">
<img alt="Tromsø, Norway" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLq_Z0lS6SgE7PILS0ujXhsLbYNP2HB7kVtGztz9U33HrQbpeqV51CKaIT5-HALOH5M50Ob_Kcku9NtjSoEAnMuMNz2b3EJhMO6CSpOwMBARB5B4LnrmQCsexQhVPWg7M9Q_330c_3STDlsyIjj_MO9Kymdn-gZHPqGbf6O5Jkk1P0QMQmEUqr0LCYYfdXLlRcthmbQTOSEmerEMX5COn3aNFNA1BgOQJjY-DPR_7bAF1daEj15PwuTATTUGVWGsPuasuqFfJC2xo"/>
<div class="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
<span class="text-xs font-medium uppercase tracking-widest text-white">Stable KP-4</span>
</div>
</div>
<div class="p-6 md:p-8">
<h3 class="text-xl md:text-2xl font-headline font-bold text-white mb-1">Tromsø, Norway</h3>
<p class="text-on-surface-variant text-xs md:text-sm mb-6">69.6492° N, 18.9553° E</p>
<div class="flex justify-between items-center text-xs md:text-sm font-medium">
<span class="text-secondary">74% Visibility</span>
<span class="text-white/40">Updated 5m ago</span>
</div>
</div>
</div>
<!-- Card 3 -->
<div class="glass-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition-all min-w-[85vw] md:min-w-0 snap-center">
<div class="h-56 md:h-64 overflow-hidden relative">
<img alt="Fairbanks, Alaska" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjBH3b7ZU54K55odGnMFw_QWpbHAZD3b7Gaj5xs-RTgLR-2m5Rds6Q-nGHjLtJ89BE7UFBKj4W6UGHmFeunoa836Qk65ml59U1eoVTi-KJAidQizsN7_CV2A4VG2Wru-JPTDszUEUCIQ5uCcoYhNdGWb5RUct9Gy_yHo5MyLgYzBeo-JUb0p82mxY1jUwsIFovHXyIWMddpvSEAkcsVDX8xcVLKbuDsYlbWgroYSbyXTW-8DiW1efkUbd5iNVUTURWgc4Dw_r8eOs"/>
<div class="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-error animate-pulse"></span>
<span class="text-xs font-medium uppercase tracking-widest text-white">Storm KP-8</span>
</div>
</div>
<div class="p-6 md:p-8">
<h3 class="text-xl md:text-2xl font-headline font-bold text-white mb-1">Fairbanks, Alaska</h3>
<p class="text-on-surface-variant text-xs md:text-sm mb-6">64.8401° N, 147.7200° W</p>
<div class="flex justify-between items-center text-xs md:text-sm font-medium">
<span class="text-secondary">100% Visibility</span>
<span class="text-white/40">Updated 1m ago</span>
</div>
</div>
</div>
</div>
</section>
<!-- Mission Flow Section -->
<section class="w-full py-20 md:py-32 relative overflow-hidden bg-[#080B11]">
<div class="max-w-7xl mx-auto px-6">
<div class="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -z-10"></div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center relative z-10">
<!-- Grid Item 1 -->
<div class="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500">
<div class="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
<div class="absolute inset-0 rounded-full border border-cyan-400/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
<div class="absolute inset-2 rounded-full border border-cyan-400/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
<div class="relative z-10 w-8 h-8 flex items-center justify-center">
<div class="absolute w-full h-[1px] bg-cyan-400/60"></div>
<div class="absolute h-full w-[1px] bg-cyan-400/60"></div>
<div class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
</div>
</div>
<div class="text-xs tracking-[0.3em] font-bold text-cyan-400/50 mb-4 uppercase">01</div>
<h3 class="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">TARGET</h3>
<p class="text-slate-400 font-light text-sm md:text-base leading-relaxed">Search any global vector.</p>
</div>
<!-- Grid Item 2 -->
<div class="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500">
<div class="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
<div class="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_6s_linear_infinite_reverse]"></div>
<div class="absolute inset-2 rounded-full border-[3px] border-t-cyan-400 border-r-transparent border-b-cyan-400/50 border-l-transparent animate-[spin_3s_linear_infinite]"></div>
<div class="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff] animate-pulse"></div>
</div>
<div class="text-xs tracking-[0.3em] font-bold text-cyan-400/50 mb-4 uppercase">02</div>
<h3 class="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">ANALYZE</h3>
<p class="text-slate-400 font-light text-sm md:text-base leading-relaxed">Let the ML model predict visibility and weather.</p>
</div>
<!-- Grid Item 3 -->
<div class="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500">
<div class="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center group">
<div class="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 blur-md opacity-60 bg-[length:200%_200%] animate-[pulse_4s_ease-in-out_infinite] group-hover:bg-[position:100%_50%] transition-all duration-1000"></div>
<div class="absolute inset-1 rounded-full bg-[#080B11]/80 backdrop-blur-sm border border-white/20"></div>
<svg class="relative z-10 w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewbox="0 0 24 24">
<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
</div>
<div class="text-xs tracking-[0.3em] font-bold text-cyan-400/50 mb-4 uppercase">03</div>
<h3 class="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">DEPLOY</h3>
<p class="text-slate-400 font-light text-sm md:text-base leading-relaxed">Get instant alerts when the probability spikes.</p>
</div>
</div>
</div>
</section>
<!-- Bento Box Section -->
<section class="py-20 md:py-32 px-6 md:px-12 max-w-screen-2xl mx-auto" id="engineering-excellence">
<div class="text-center mb-12 md:mb-20 space-y-4 reveal-on-scroll active">
<span class="label-md tracking-widest text-primary-container font-medium uppercase text-xs">Engineering Excellence</span>
<h2 class="text-3xl md:text-5xl font-headline font-extrabold text-white">Scientific Precision. Consumer Elegance.</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[300px]">
<!-- Bento Item 1 -->
<div class="md:col-span-2 glass-card rounded-xl p-6 md:p-10 flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(68,226,205,0.15)] hover:border-secondary/30 active reveal-left" style="transition-delay: 100ms;">
<div class="transition-transform duration-500 group-hover:translate-x-1">
<span class="material-symbols-outlined text-4xl text-secondary mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">analytics</span>
<h3 class="text-2xl md:text-3xl font-headline font-bold text-white mb-4 transition-colors group-hover:text-secondary">60 Years of Telemetry</h3>
<p class="text-on-surface-variant font-light text-sm md:text-base max-w-md">Our models are trained on six decades of solar wind data and geomagnetic records, ensuring historical accuracy in every forecast.</p>
</div>
<div class="flex gap-2 mt-8 md:mt-0">
<div class="h-1 w-12 bg-secondary rounded-full shadow-[0_0_10px_#44e2cd]"></div>
<div class="h-1 w-1 bg-white/10 rounded-full"></div>
<div class="h-1 w-1 bg-white/10 rounded-full"></div>
</div>
</div>
<!-- Bento Item 2 -->
<div class="glass-card rounded-xl p-6 md:p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(195,245,255,0.2)] hover:border-primary/40 active reveal-bottom h-[300px] md:h-auto" style="transition-delay: 200ms;">
<div class="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-125">
<img alt="Data Stream" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMTvX-rMx3n1LVy3MOg2hygtR_LAMbnGLVHf6-WK2Uwo68v0LiKDpeuEFHlCj6-qmcUfohnL4yLKLICXhiVIPrcbJv55_2zRk2LAuUM12w29OH9F8rGCENScIA4BqS0lYv5PeAkZVy6sgxDbyidbigeO4bLDgY9d1HdN91ASdK3kzr55PaOrvjIJYgMX4y_XSm4_3EI3pAUEXMtaRsQ9BEKUzdw2nwn2beGT5jMKucfNsHcOjweJQ4Gh-dqd8vQ80LTaGSm3f850"/>
</div>
<h3 class="text-5xl md:text-6xl font-headline font-extrabold text-primary mb-2 transition-transform duration-500 group-hover:scale-110">24/7</h3>
<p class="label-md tracking-widest text-on-surface-variant text-xs uppercase group-hover:text-primary transition-colors">Live Satellite Uplink</p>
</div>
<!-- Bento Item 3 -->
<div class="glass-card rounded-xl p-6 md:p-10 overflow-hidden relative group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(68,226,205,0.2)] hover:border-secondary/40 active reveal-right h-[300px] md:h-auto" style="transition-delay: 300ms;">
<div class="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
<h3 class="text-xl md:text-2xl font-headline font-bold text-white mb-2 group-hover:text-secondary transition-colors">XGBoost ML Engine</h3>
<p class="text-on-surface-variant text-sm font-light">Proprietary gradient boosting algorithms for local-node prediction.</p>
</div>
<div class="absolute bottom-[-20%] right-[-10%] opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
<span class="material-symbols-outlined text-[100px] md:text-[120px] text-secondary">memory</span>
</div>
</div>
<!-- Bento Item 4 -->
<div class="md:col-span-2 glass-card rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10 group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(68,226,205,0.15)] hover:border-secondary/30 active reveal-bottom" style="transition-delay: 400ms;">
<div class="flex-1 transition-transform duration-500 group-hover:translate-x-1">
<h3 class="text-xl md:text-2xl font-headline font-bold text-white mb-4 group-hover:text-secondary transition-colors">Hyper-Local Atmosphere Density</h3>
<p class="text-on-surface-variant text-sm font-light">We don't just track the sun; we track the clouds between you and the stars.</p>
</div>
<div class="w-full md:w-48 h-32 flex gap-1 items-end">
<div class="bg-secondary/40 h-[40%] w-full rounded-t-lg transition-all duration-500 group-hover:h-[50%]"></div>
<div class="bg-secondary/60 h-[70%] w-full rounded-t-lg transition-all duration-700 group-hover:h-[85%]"></div>
<div class="bg-secondary h-[100%] w-full rounded-t-lg transition-all duration-300 group-hover:scale-y-110 origin-bottom"></div>
<div class="bg-secondary/50 h-[60%] w-full rounded-t-lg transition-all duration-500 group-hover:h-[75%]"></div>
<div class="bg-secondary/80 h-[90%] w-full rounded-t-lg transition-all duration-1000 group-hover:h-[100%]"></div>
</div>
</div>
</div>
</section>
<!-- AI Assistant Teaser -->
<section class="py-20 md:py-32 relative">
<div class="max-w-screen-2xl mx-auto px-6 md:px-12">
<div class="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 flex flex-col md:flex-row items-center gap-12 md:gap-20 overflow-hidden relative">
<div class="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
<div class="w-full md:w-1/2 space-y-6 md:space-y-8 z-10 text-center md:text-left">
<h2 class="text-4xl md:text-6xl font-headline font-extrabold text-white leading-tight">Don't just track it. <br/><span class="text-gradient">Capture it.</span></h2>
<p class="text-base md:text-xl text-on-surface-variant font-light leading-relaxed">
                        Meet Aura, your personal astrophotography assistant. From camera settings to local weather windows, Aura ensures you never miss a shutter opportunity.
                    </p>
<div class="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 justify-center md:justify-start">
<button class="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all">Chat with Aurora</button>
<button class="text-white font-semibold flex items-center justify-center gap-2 px-6 py-4 hover:bg-white/5 rounded-full transition-all">
                            Watch Preview <span class="material-symbols-outlined">play_circle</span>
</button>
</div>
</div>
<div class="w-full md:w-1/2 relative h-[300px] md:h-[400px]">
<div class="absolute top-0 md:top-10 right-0 glass-card p-4 md:p-6 rounded-2xl w-48 md:w-64 shadow-2xl transform rotate-2 z-20">
<p class="text-[10px] md:text-xs text-secondary font-bold uppercase mb-2">Aura AI</p>
<p class="text-xs md:text-sm text-white">Recommended ISO for tonight: 1600. Shutter 15s. f/2.8.</p>
</div>
<div class="absolute bottom-10 left-0 glass-card p-4 md:p-6 rounded-2xl w-48 md:w-64 shadow-2xl transform -rotate-3 z-10 opacity-80">
<p class="text-[10px] md:text-xs text-white/40 font-bold uppercase mb-2">You</p>
<p class="text-xs md:text-sm text-white/70">What's the best spot near Tromsø for tonight?</p>
</div>
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 h-64 md:h-80 bg-secondary/10 rounded-full blur-3xl"></div>
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
<span class="material-symbols-outlined text-[120px] md:text-[180px] text-white/5" data-weight="fill">smart_toy</span>
</div>
</div>
</div>
</div>
</section>
<!-- Pre-Footer CTA Section -->
<section class="w-full py-20 md:py-32 max-w-5xl mx-auto px-6 relative z-10">
<div class="border-glow-card w-full" style="--card-bg: #060010; --edge-sensitivity: 10; --border-radius: 47px; --glow-padding: 80px; --cone-spread: 28; --fill-opacity: 0.5; --glow-color: hsl(40deg 80% 80% / 100%); --glow-color-20: hsl(40deg 80% 80% / 20%);">
<div class="edge-light"></div>
<div class="border-glow-inner p-8 md:p-32 text-center shadow-[0_0_80px_rgba(0,229,255,0.1)]">
<h2 class="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4 relative z-10">The aurora is shifting.</h2>
<p class="text-lg md:text-2xl text-cyan-400 font-light italic mb-10 md:mb-12 relative z-10">Don't miss the next peak.</p>
<button class="w-full md:w-auto text-xs md:text-sm px-6 py-4 md:px-10 md:py-5 break-words whitespace-normal bg-secondary text-on-secondary rounded-full font-bold uppercase tracking-widest hover:opacity-90 transition-all relative z-10">Initiate Tracking Protocol</button>
</div>
</div>
</section>
</main>
<script>
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
</script>
<!-- Footer -->
<footer class="bg-[#10131a] w-full py-16 md:py-20 px-6 md:px-12 mt-auto border-t border-white/5">
<div class="max-w-screen-2xl mx-auto">
<div class="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20">
<div class="space-y-6">
<div class="text-lg font-black text-white">AuroraLens</div>
<p class="font-['Inter'] font-light leading-relaxed text-[#bac9cc] text-sm">
                    Decoding the celestial dance through precision telemetry and ethical AI.
                </p>
</div>
<div class="space-y-4 md:space-y-6">
<h4 class="text-white font-semibold">Observatory</h4>
<nav class="flex flex-col gap-3 md:gap-4">
<a class="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Scientific Data</a>
<a class="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Forecast Engine</a>
<a class="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Satellite Network</a>
</nav>
</div>
<div class="space-y-4 md:space-y-6">
<h4 class="text-white font-semibold">Company</h4>
<nav class="flex flex-col gap-3 md:gap-4">
<a class="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Privacy Policy</a>
<a class="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Terms of Service</a>
<a class="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Contact</a>
</nav>
</div>
<div class="space-y-4 md:space-y-6">
<h4 class="text-white font-semibold">Updates</h4>
<div class="flex gap-2">
<input class="bg-surface-container-lowest border-white/5 rounded-full px-4 py-2 w-full focus:ring-secondary/30 text-sm" placeholder="Email address" type="email"/>
<button class="bg-secondary text-on-secondary px-4 py-2 rounded-full font-bold text-sm">Join</button>
</div>
</div>
</div>
<div class="flex flex-col md:flex-row justify-between items-center w-full pt-10 border-t border-white/5 gap-6 md:gap-0">
<p class="font-['Inter'] font-light leading-relaxed text-[#bac9cc] text-xs md:text-sm text-center">© 2024 AuroraLens. The Celestial Lens.</p>
<div class="flex gap-8">
<span class="material-symbols-outlined text-[#bac9cc]/40 hover:text-white cursor-pointer transition-colors">public</span>
<span class="material-symbols-outlined text-[#bac9cc]/40 hover:text-white cursor-pointer transition-colors">hub</span>
<span class="material-symbols-outlined text-[#bac9cc]/40 hover:text-white cursor-pointer transition-colors">radar</span>
</div>
</div>
</div>
</footer>
</body></html>