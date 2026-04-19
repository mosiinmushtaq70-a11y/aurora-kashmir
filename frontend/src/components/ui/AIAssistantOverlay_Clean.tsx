'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore, AICopilotContext, isDossierAvailable, getDossierId, ChatMessage } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

const SUGGESTION_CHIPS = [
  { id: 'science', label: '🌌 What are the Northern Lights?', query: 'Tell me about the science behind the Northern Lights.' },
  { id: 'places', label: '🌍 Best places to see them?', query: 'Where are the best locations in the world to see the aurora right now?' },
  { id: 'kp', label: '📡 What does Kp 6 mean?', query: 'Explain what the Kp Index is and why Kp 6 is significant.' },
  { id: 'season', label: '📅 When is the best season?', query: 'When is the peak season for aurora hunting?' },
  { id: 'how', label: '🔭 How does AuroraLens work?', query: 'How does AuroraLens work? Tell me about the technology behind it.' },
  { id: 'live', label: '🌡 Check live conditions', query: 'What are the current geomagnetic conditions and forecast?' },
] as const;

// ─── Markdown Renderer ────────────────────────────────────────────────────────
// Maps react-markdown node types to Stitch-styled Tailwind classes.
// Zero Destruction: these classes only apply inside assistant message bubbles.

const MarkdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
  p:      ({ children }) => <p className="mb-3 last:mb-0 text-[#e0e2eb] font-light leading-relaxed text-[15px]">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-[#c3f5ff]">{children}</strong>,
  em:     ({ children }) => <em className="italic text-[#bac9cc]">{children}</em>,
  ul:     ({ children }) => <ul className="list-disc list-inside space-y-1.5 mb-3 text-[#bac9cc] text-[15px]">{children}</ul>,
  ol:     ({ children }) => <ol className="list-decimal list-inside space-y-1.5 mb-3 text-[#bac9cc] text-[15px]">{children}</ol>,
  li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
  code:   ({ children }) => (
    <code className="bg-white/5 border border-white/10 text-[#44e2cd] px-1.5 py-0.5 rounded-md text-[13px] font-mono">
      {children}
    </code>
  ),
  pre:    ({ children }) => (
    <pre className="bg-[#0b0e14]/60 border border-white/5 rounded-xl p-4 overflow-x-auto text-[13px] font-mono text-[#c3f5ff] mb-3">
      {children}
    </pre>
  ),
  h1:     ({ children }) => <h1 className="text-xl font-['Manrope'] font-bold text-white mb-2">{children}</h1>,
  h2:     ({ children }) => <h2 className="text-lg font-['Manrope'] font-semibold text-[#c3f5ff] mb-2">{children}</h2>,
  h3:     ({ children }) => <h3 className="text-base font-['Manrope'] font-semibold text-[#bac9cc] mb-1">{children}</h3>,
};

/**
 * Memoized Markdown prevents the entire conversation from re-parsing 
 * every time a new character streams in.
 */
const MemoizedMarkdown = React.memo(({ content }: { content: string }) => (
  <ReactMarkdown components={MarkdownComponents}>
    {content}
  </ReactMarkdown>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-6">
      <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#03c6b2] to-[#c3f5ff] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(3,198,178,0.3)]">
        <span className="material-symbols-outlined text-[#00363d] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
      </div>
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-t-3xl rounded-br-3xl flex items-center gap-2 shadow-2xl">
        <span className="w-1.5 h-1.5 bg-[#44e2cd] rounded-full pulse-dot shadow-[0_0_8px_#44e2cd]" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-[#44e2cd] rounded-full pulse-dot shadow-[0_0_8px_#44e2cd]" style={{ animationDelay: '200ms' }} />
        <span className="w-1.5 h-1.5 bg-[#44e2cd] rounded-full pulse-dot shadow-[0_0_8px_#44e2cd]" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * AIAssistantOverlay_Clean — PRIMARY AI CO-PILOT CHAT
 *
 * Phase 3: Fully wired to useAppStore + /api/chat.
 * Zero Destruction: All glassmorphic wrappers, layout boundaries,
 * z-index stacking, and Stitch Tailwind classes are preserved exactly.
 * Logic injected only into state bindings, handlers, and message rendering.
 */
const AIAssistantOverlay_Clean: React.FC = () => {
  // ── Store Bindings ──────────────────────────────────────────────────────
  const { 
    isAICopilotOpen, 
    aiCopilotContext, 
    closeAICopilot, 
    pushToast, 
    liveData,
    zoomToLocation,
    openDossier,
    aiChatHistory,
    setAiChatHistory,
    clearAiChatHistory,
    aiChatLastUpdated,
    setReturnToCopilot
  } = useAppStore();

  // ── Local State ─────────────────────────────────────────────────────────
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Context Seeding (The Bridge) ─────────────────────────────────────────
  // When the copilot opens, build the initial greeting from the injected context.
  // If initialBrief is present (from "View Full Brief"), render it as the
  // first assistant message so the user immediately sees the full report.
  useEffect(() => {
    if (!isAICopilotOpen) return;

    // 1. Session Expiration Check
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    if (aiChatLastUpdated > 0 && Date.now() - aiChatLastUpdated > SESSION_TIMEOUT) {
      clearAiChatHistory();
    }

    // 2. Initial Seeding (Freshness Check)
    const ctx: AICopilotContext | null = aiCopilotContext;
    if (ctx && ctx.initialQuery) {
      clearAiChatHistory();
      setTimeout(() => handleSend(ctx.initialQuery), 400);
    } else if (aiChatHistory.length === 0 && ctx && ctx.initialBrief) {
      setAiChatHistory([{ role: 'assistant', content: ctx.initialBrief }]);
    }

    // Focus the input after mount
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [isAICopilotOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally NOT including aiCopilotContext — we only seed on open

  // ── Auto-scroll to latest message ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [aiChatHistory, isLoading]);

  // ── Escape Key Handler ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isAICopilotOpen) closeAICopilot(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAICopilotOpen, closeAICopilot]);

  // ── API Send Handler ──────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...aiChatHistory, userMsg];

    setAiChatHistory(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            mode: aiCopilotContext?.mode || 'AURORA_GUIDE',
            location: aiCopilotContext?.locationName ?? 'Global',
            auroraScore: aiCopilotContext?.auroraScore ?? 0,
            temperature: aiCopilotContext?.temperature != null
              ? `${aiCopilotContext.temperature}°C`
              : 'Unknown',
            kpIndex: liveData?.kp ?? 'N/A',
            solarWindSpeed: liveData?.solarSpeed ?? 'N/A',
            imfBz: liveData?.bz ?? 'N/A',
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Communications array offline. Please try again.';
        setAiChatHistory([...nextMessages, {
          role: 'assistant',
          content: `**[UPLINK ERROR]** — ${errorMessage}`
        }]);
        return;
      }

      // ── Handle Stream ──────────────────────────────────────────────────────
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const decoder = new TextDecoder();
      let assistantContent = '';
      
      // Initialize the assistant message in history
      setAiChatHistory([...nextMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        // Functional update to ensure we don't lose userMsg or other concurrent updates
        setAiChatHistory((prev: ChatMessage[]) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: assistantContent }];
          }
          return prev;
        });
      }

    } catch (err) {
      console.error('Streaming Err:', err);
      setAiChatHistory((prev: ChatMessage[]) => [...prev, {
        role: 'assistant',
        content: '**[CONNECTION LOST]** — Atmospheric interference detected. Check your network connection.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, aiChatHistory, isLoading, aiCopilotContext, setAiChatHistory]);

  // ── Pro-Tier Toast (Unwired "Sync to Camera") ────────────────────────────
  const handleProFeature = useCallback(() => {
    pushToast('Feature unlocking in Pro Tier.', 'info');
  }, [pushToast]);

  // ── Render Guard ──────────────────────────────────────────────────────────
  // ─── Map Navigation Logic ──────────────────────────────────────────────────
  
  const handleLocationClick = useCallback((name: string, lat: number, lng: number) => {
    // 1. Initial Map Zoom
    zoomToLocation({ name, lat, lng });
    
    // 2. Set Smart Back Flag
    setReturnToCopilot(true);

    // 3. Start Overlay Fade Out
    setIsClosing(true);
    
    // 3. Complete Closure after 500ms
    setTimeout(() => {
      closeAICopilot();
      setIsClosing(false); // Reset for next open
    }, 500);
  }, [zoomToLocation, closeAICopilot]);

  const handleDossierClick = useCallback((id: string, name: string, lat: number, lng: number) => {
    // 1. Open the Dossier directly
    openDossier({
      id,
      name,
      lat,
      lng,
      auroraScore: liveData?.auroraScore ?? 0,
      cloudCover: liveData?.cloudCover ?? 0,
      temperature: liveData?.temperature ?? 0,
      region: 'Discovery Zone'
    });

    // 2. Set Smart Back Flag
    setReturnToCopilot(true);

    // 3. Start Overlay Fade Out
    setIsClosing(true);
    
    // 3. Complete Closure after 500ms
    setTimeout(() => {
      closeAICopilot();
      setIsClosing(false); // Reset for next open
    }, 500);
  }, [openDossier, closeAICopilot, liveData]);

  // ─── Location Tag Parser ────────────────────────────────────────────────────

  const renderContentWithTags = (content: string) => {
    // Strip leading colon/spaces and trailing asterisks/spaces (markdown artifacts)
    const cleanedContent = content.replace(/^:\s*/, '').replace(/\s*\*+$/, '');
    
    // Match [[Name|lat,lng]]
    const parts = cleanedContent.split(/(\[\[.*?\|.*?\]\])/g);
    
    return parts.map((part, i) => {
      const match = part.match(/\[\[(.*?)\|(.*?)\]\]/);
      if (match) {
        const name = match[1];
        const coords = match[2].split(',').map(Number);
        const hasDossier = isDossierAvailable(name);
        const dossierId = getDossierId(name);

        return (
          <span key={i} className="inline-flex items-center gap-1.5 mx-0.5 align-middle">
            {/* Primary Map Chip */}
            <button
              onClick={() => handleLocationClick(name, coords[0], coords[1])}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#44e2cd]/10 border border-[#44e2cd]/30 text-[#44e2cd] text-[12px] font-medium hover:bg-[#44e2cd]/20 hover:border-[#44e2cd]/50 transition-all group"
            >
              <span className="material-symbols-outlined text-[14px] font-light">pin_drop</span>
              {name}
            </button>
            
            {/* Conditional Dossier Chip */}
            {hasDossier && dossierId && (
              <button
                onClick={() => handleDossierClick(dossierId, name, coords[0], coords[1])}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#c3f5ff]/10 border border-[#c3f5ff]/30 text-[#c3f5ff] text-[10px] font-bold uppercase tracking-tighter hover:bg-[#c3f5ff]/20 transition-all animate-pulse hover:animate-none"
              >
                <span className="material-symbols-outlined text-[12px]">menu_book</span>
                Dossier
              </button>
            )}
          </span>
        );
      }
      return <ReactMarkdown key={i} components={MarkdownComponents}>{part}</ReactMarkdown>;
    });
  };

  if (!isAICopilotOpen) return null;

  // ─── JSX (Zero Destruction — all original Stitch structure preserved) ────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 font-['Inter',_sans-serif]">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'pulse-dot' and scrollbar hiders are included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .stitch-glass-panel {
          background: rgba(8, 11, 17, 0.7);
          backdrop-filter: blur(64px);
        }

        @keyframes pulse-cyan {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .pulse-dot {
          animation: pulse-cyan 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .stitch-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .stitch-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Backdrop Overlay — click outside to close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1]"
        onClick={closeAICopilot}
      />

      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#44e2cd]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7e22cc]/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Main Overlay Container */}
      <div className={`relative w-full max-w-6xl max-h-[921px] h-full stitch-glass-panel border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
        isClosing ? 'opacity-0 scale-95 blur-xl pointer-events-none' : 'opacity-100 scale-100 blur-0'
      }`}>
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 md:px-10 h-20 md:h-24 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className="absolute inset-0 bg-[#00e5ff] rounded-full pulse-dot"></div>
              <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full shadow-[0_0_10px_#00E5FF]"></div>
            </div>
            <div>
              <p className="text-[10px] font-['Inter',_sans-serif] tracking-widest text-[#bac9cc] uppercase mt-0.5">
                AURA AI
              </p>
            </div>
          </div>
          {/* Close button — wired to store action */}
          <button
            onClick={closeAICopilot}
            aria-label="Close AI Copilot"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center text-[#bac9cc] hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">close</span>
          </button>
        </header>

        {/* Chat Canvas */}
        <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-12 flex flex-col gap-6 md:gap-10 scroll-smooth stitch-hide-scrollbar">

          {aiChatHistory.length === 0 && (
            <div className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex gap-6">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#03c6b2] to-[#c3f5ff] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(3,198,178,0.3)] mt-1">
                  <span className="material-symbols-outlined text-[#00363d] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </div>
                <div className="space-y-8">
                  <div className="text-3xl font-['Manrope'] font-bold text-white leading-tight">
                    Hi, I'm Aurora — your guide to the northern lights. <br />
                    <span className="text-[#44e2cd]">What are you curious about?</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                      <button
                        key={chip.id}
                        onClick={() => handleSend(chip.query)}
                        className={`px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 hover:border-[#44e2cd]/30 transition-all group ${
                          idx >= 3 ? 'hidden md:flex' : 'flex'
                        }`}
                      >
                        <span className="text-[14px] text-[#e0e2eb] group-hover:text-white transition-colors">
                          {chip.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {Array.isArray(aiChatHistory) && aiChatHistory.map((msg: ChatMessage, idx: number) => (
            <div key={idx}>
              {msg.role === 'user' ? (
                /* User Message */
                <div className="flex flex-col items-end max-w-[90%] md:max-w-[80%] self-end ml-auto animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-t-3xl rounded-bl-3xl shadow-2xl">
                    <p className="text-white leading-relaxed text-[14px] md:text-[15px] font-normal italic">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ) : (
                /* Assistant Message */
                <div className="flex flex-col items-start max-w-[95%] md:max-w-[85%] animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#03c6b2] to-[#c3f5ff] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(3,198,178,0.3)] mt-1">
                      <span className="material-symbols-outlined text-[#00363d] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                    </div>
                    {/* Message body with parsed tags */}
                    <div className="space-y-4 max-w-2xl text-[15px] relative">
                      <div className="text-[#e0e2eb] leading-relaxed">
                        {renderContentWithTags(msg.content)}
                        {/* Typewriter Cursor (Only for active streaming) */}
                        {idx === aiChatHistory.length - 1 && isLoading && (
                          <span className="inline-block w-[2px] h-[15px] bg-[#44e2cd] ml-1 align-middle animate-[pulse_0.6s_infinite] shadow-[0_0_8px_#44e2cd]" />
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-['Inter',_sans-serif] uppercase tracking-widest text-[#bac9cc]/60 mt-4 ml-14">
                    AURA AI
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </main>

        {/* Command Line Area */}
        <footer className="px-10 py-10 shrink-0">
          {/* Footer Navigation (only visible when chat active) */}
          {aiChatHistory.length > 0 && (
            <div className="flex flex-wrap md:flex-nowrap gap-3 mb-6 pb-2 animate-in fade-in duration-500">
              {['CAMERA SETTINGS', 'COMPOSITION TIPS', 'LIVE CONDITIONS'].map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleSend(pill)}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-['Inter',_sans-serif] text-[#bac9cc] uppercase tracking-wider whitespace-nowrap hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                >
                  {pill}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#c3f5ff]/5 blur-xl group-focus-within:bg-[#c3f5ff]/10 transition-all rounded-full"></div>
            <div className="relative flex items-center bg-[#0b0e14]/80 border border-white/10 focus-within:border-[#c3f5ff]/30 rounded-full h-16 px-8 transition-all duration-300">
              <input
                ref={inputRef}
                className="bg-transparent border-none focus:ring-0 flex-1 text-[#e0e2eb] placeholder:text-[#bac9cc]/40 text-[15px] font-light outline-none disabled:opacity-50"
                placeholder="Ask Aura anything..."
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                disabled={isLoading}
              />
              <div className="flex items-center gap-4">
                {/* Mic button — Pro Tier */}
                <button
                  onClick={handleProFeature}
                  className="text-[#bac9cc] hover:text-[#c3f5ff] transition-colors"
                  aria-label="Voice input (Pro)"
                >
                  <span className="material-symbols-outlined">mic</span>
                </button>
                {/* Send button */}
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-full bg-linear-to-r from-[#44e2cd] to-[#03c6b2] flex items-center justify-center text-[#003731] shadow-[0_0_15px_rgba(68,226,205,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontWeight: 600 }}>
                    {isLoading ? 'hourglass_empty' : 'arrow_upward'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AIAssistantOverlay_Clean;
