## Session: 2026-03-24 01:25 IST

### Objective
Resolve frontend visual blocking issues with the Viewing Viability map and implement the 'Active Hotspots' interactive gallery.

### Accomplished
- **Debugged Cache Trap**: Identified that the FastAPI instance was aggressively hoarding a failed Open-Meteo dictionary fetch, trapping the heatmap in a zero-cloud rendering state.
- **Removed Cloud Dependency**: Fully stripped the real-time cloud tracking from `main.py` and front-end rendering layers to maximize stability.
- **Hotspots Implementation**: Built a 3-card grid highlighting Kirkjufell, Tromsø, and Denali.
    - Wired directly to `useAppStore.zoomToLocation()` for hyper-fast 3D globe transitions.
    - Bypassed Next.js `<Image>` remote CDN blocking by localizing the 3 placeholder images to `public/hotspots/`.
    - Solved WebKit absolute positioning quirks by refactoring standard `<button>` tags into ARIA `<div role="button">` enclosures.

### Verification
- [x] Aurora XGBoost map overlay stable.
- [x] Hotspots UI matches design requirements.
- [x] Hotpoint interactive transition tested and functioning.

### Paused Because
Session goals achieved and user requested `/pause` context dump.

### Handoff Notes
- The "Viewing Viability Map" is now 100% stable since we dropped the Open-Meteo unreliability. The heatmap strictly plots XGBoost Aurora data and static Light Pollution. 
- The Hotspots gallery uses strictly verified Local Static Assets.
- **Resume Command**: `/resume`

