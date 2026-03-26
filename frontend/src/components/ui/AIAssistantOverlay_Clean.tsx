'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore, AICopilotContext } from '@/store/useAppStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Suggestion Pills ─────────────────────────────────────────────────────────

const SUGGESTION_PILLS = [
  'Camera Settings',
  'Composition Tips',
  'Atmospheric Analysis',
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

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-6">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#03c6b2] to-[#c3f5ff] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(3,198,178,0.3)]">
        <span className="material-symbols-outlined text-[#00363d] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
      </div>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-t-3xl rounded-br-3xl flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#44e2cd] rounded-full pulse-dot" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-[#44e2cd] rounded-full pulse-dot" style={{ animationDelay: '200ms' }} />
        <span className="w-1.5 h-1.5 bg-[#44e2cd] rounded-full pulse-dot" style={{ animationDelay: '400ms' }} />
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
  const { isAICopilotOpen, aiCopilotContext, closeAICopilot, pushToast } = useAppStore();

  // ── Local State ─────────────────────────────────────────────────────────
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Context Seeding (The Bridge) ─────────────────────────────────────────
  // When the copilot opens, build the initial greeting from the injected context.
  // If initialBrief is present (from "View Full Brief"), render it as the
  // first assistant message so the user immediately sees the full report.
  useEffect(() => {
    if (!isAICopilotOpen) return;

    const ctx: AICopilotContext | null = aiCopilotContext;

    // Reset the chat for each fresh open
    if (ctx) {
      const greetingParts: string[] = [];

      if (ctx.initialBrief) {
        // "View Full Brief" flow — lead with the full tactical brief markdown
        greetingParts.push(ctx.initialBrief);
        greetingParts.push(
          `\n\n---\n*Sector locked: **${ctx.locationName}** · Aurora Score **${ctx.auroraScore}/100**` +
          (ctx.temperature !== null ? ` · Ambient **${ctx.temperature}°C**` : '') +
          '.* State your camera hardware to begin exposure calibration.'
        );
      } else {
        // Standard open — concise operational greeting
        greetingParts.push(
          `AuroraLens Co-Pilot online. Target sector: **${ctx.locationName}**.` +
          ` Aurora Score **${ctx.auroraScore}/100**` +
          (ctx.temperature !== null ? ` · Ambient **${ctx.temperature}°C**` : '') +
          '.\n\nState your camera hardware (smartphone or DSLR body + lens) to begin exposure calibration.'
        );
      }

      setMessages([{ role: 'assistant', content: greetingParts.join('') }]);
    } else {
      // No context (opened without a target location)
      setMessages([{
        role: 'assistant',
        content: 'AuroraLens Co-Pilot online. No target sector locked. Search a location on the map first, or ask me anything about aurora photography.'
      }]);
    }

    // Focus the input after mount
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [isAICopilotOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally NOT including aiCopilotContext — we only seed on open

  // ── Auto-scroll to latest message ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          // Context injected silently — LLM reads this but the user doesn't see it
          context: {
            location: aiCopilotContext?.locationName ?? 'Unknown',
            auroraScore: aiCopilotContext?.auroraScore ?? 0,
            temperature: aiCopilotContext?.temperature != null
              ? `${aiCopilotContext.temperature}°C`
              : 'Unknown',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '**[UPLINK ERROR]** — Communications array offline. Please try again.'
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '**[CONNECTION LOST]** — Atmospheric interference detected. Check your network connection.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading, aiCopilotContext]);

  // ── Pro-Tier Toast (Unwired "Sync to Camera") ────────────────────────────
  const handleProFeature = useCallback(() => {
    pushToast('Feature unlocking in Pro Tier.', 'info');
  }, [pushToast]);

  // ── Render Guard ──────────────────────────────────────────────────────────
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
      <div className="relative w-full max-w-6xl max-h-[921px] h-full stitch-glass-panel border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="flex items-center justify-between px-10 h-24 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className="absolute inset-0 bg-[#00e5ff] rounded-full pulse-dot"></div>
              <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full shadow-[0_0_10px_#00E5FF]"></div>
            </div>
            <div>
              <p className="text-[10px] font-['Inter',_sans-serif] tracking-widest text-[#bac9cc] uppercase mt-0.5">
                {aiCopilotContext?.locationName
                  ? `Synchronized — ${aiCopilotContext.locationName}`
                  : 'Live Atmospherics Synchronized'}
              </p>
            </div>
          </div>
          {/* Close button — wired to store action */}
          <button
            onClick={closeAICopilot}
            aria-label="Close AI Copilot"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#bac9cc] hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </header>

        {/* Chat Canvas */}
        <main className="flex-1 overflow-y-auto px-10 py-12 flex flex-col gap-10 scroll-smooth stitch-hide-scrollbar">

          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === 'user' ? (
                /* User Message */
                <div className="flex flex-col items-end max-w-[80%] self-end ml-auto">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-t-3xl rounded-bl-3xl shadow-xl">
                    <p className="text-[#e0e2eb] leading-relaxed text-[15px] font-light italic">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ) : (
                /* Assistant Message */
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="flex gap-6">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#03c6b2] to-[#c3f5ff] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(3,198,178,0.3)] mt-1">
                      <span className="material-symbols-outlined text-[#00363d] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                    </div>
                    {/* Message body with Markdown renderer */}
                    <div className="space-y-4 max-w-2xl">
                      <div className="text-[#e0e2eb]">
                        <ReactMarkdown components={MarkdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Inject the static AI Data Card after the LAST assistant message only.
                          This preserves the premium Stitch design as a persistent reference panel. */}
                      {idx === messages.length - 1 && msg.role === 'assistant' && messages.length > 1 && (
                        <div className="bg-[#0b0e14]/40 backdrop-blur-xl border border-white/5 rounded-xl p-8 max-w-lg shadow-2xl">
                          <div className="flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-[#44e2cd] text-sm">tune</span>
                            <span className="text-[10px] font-['Inter',_sans-serif] tracking-[0.2em] text-[#bac9cc] uppercase">
                              Optimized Parameters
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <p className="text-[10px] font-['Inter',_sans-serif] text-[#bac9cc] uppercase tracking-wider">ISO</p>
                              <p className="text-2xl font-['Manrope',_sans-serif] font-bold text-[#c3f5ff]">
                                {aiCopilotContext && aiCopilotContext.auroraScore > 70 ? '3200' : aiCopilotContext && aiCopilotContext.auroraScore > 40 ? '1600' : '800'}
                              </p>
                            </div>
                            <div className="space-y-1 border-x border-white/10 px-6">
                              <p className="text-[10px] font-['Inter',_sans-serif] text-[#bac9cc] uppercase tracking-wider">Aperture</p>
                              <p className="text-2xl font-['Manrope',_sans-serif] font-bold text-[#c3f5ff]">f/2.8</p>
                            </div>
                            <div className="space-y-1 pl-4">
                              <p className="text-[10px] font-['Inter',_sans-serif] text-[#bac9cc] uppercase tracking-wider">Shutter</p>
                              <p className="text-2xl font-['Manrope',_sans-serif] font-bold text-[#44e2cd]">
                                {aiCopilotContext && aiCopilotContext.auroraScore > 70 ? '2s' : '15s'}
                                <span className="text-sm font-light text-[#bac9cc]"> to </span>
                                {aiCopilotContext && aiCopilotContext.auroraScore > 70 ? '4s' : '25s'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-[#bac9cc]/80 italic">
                                Recommended for {aiCopilotContext?.temperature != null ? `${aiCopilotContext.temperature}°C` : 'current conditions'}
                              </span>
                              {/* Pro-tier unwired feature → Toast */}
                              <button
                                onClick={handleProFeature}
                                className="flex items-center gap-2 text-[#c3f5ff] text-[10px] font-['Inter',_sans-serif] uppercase tracking-widest hover:text-white transition-colors"
                              >
                                Sync to Camera <span className="material-symbols-outlined text-xs">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-['Inter',_sans-serif] uppercase tracking-widest text-[#bac9cc]/60 mt-4 ml-14">
                    Aetheris Intelligence
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
          {/* Suggestion Pills — clicking auto-sends the suggestion */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 stitch-hide-scrollbar">
            {SUGGESTION_PILLS.map((pill) => (
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

          {/* Input Bar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#c3f5ff]/5 blur-xl group-focus-within:bg-[#c3f5ff]/10 transition-all rounded-full"></div>
            <div className="relative flex items-center bg-[#0b0e14]/80 border border-white/10 focus-within:border-[#c3f5ff]/30 rounded-full h-16 px-8 transition-all duration-300">
              <span className="material-symbols-outlined text-[#bac9cc] mr-4">shutter_speed</span>
              <input
                ref={inputRef}
                className="bg-transparent border-none focus:ring-0 flex-1 text-[#e0e2eb] placeholder:text-[#bac9cc]/40 text-[15px] font-light outline-none disabled:opacity-50"
                placeholder="Ask for camera settings, composition tips, or atmospheric analysis..."
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
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#44e2cd] to-[#03c6b2] flex items-center justify-center text-[#003731] shadow-[0_0_15px_rgba(68,226,205,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
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
