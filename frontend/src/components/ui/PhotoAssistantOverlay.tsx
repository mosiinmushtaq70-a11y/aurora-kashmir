'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore, ChatMessage } from '@/store/useAppStore';
import { motion } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const MarkdownComponents: any = {
  p: ({ children, zoomToLocation, handleClose }: any) => {
    // Intercept standard text and replace [[Name|Coords]] with buttons
    const processText = (node: any): any => {
      if (typeof node !== 'string') return node;
      
      const parts = node.split(/(\[\[[\s\S]*?\|[\s\S]*?\]\])/);
      return parts.map((part, i) => {
        const match = part.match(/\[\[([\s\S]*?)\|([\s\S]*?)\]\]/);
        if (match) {
          const [, name, coordsRaw] = match;
          const coords = coordsRaw.replace(/\s/g, '').split(',');
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);
          
          return (
            <button 
              key={i}
              onClick={() => {
                if (!isNaN(lat) && !isNaN(lng)) {
                  zoomToLocation({ lat, lng, name: name.trim() });
                  handleClose();
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-full bg-[#44e2cd]/20 border border-[#44e2cd]/40 text-[#44e2cd] text-[11px] font-bold hover:bg-[#44e2cd]/30 hover:scale-105 transition-all shadow-sm align-middle"
            >
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {name.trim()}
            </button>
          );
        }
        return part;
      });
    };

    const processedChildren = React.Children.map(children, processText);
    return <p className="mb-3 last:mb-0 text-[#e0e2eb] font-light leading-relaxed text-[15px]">{processedChildren}</p>;
  },
  strong: ({ children }: any) => <strong className="font-semibold text-[#44e2cd]">{children}</strong>,
  em:     ({ children }: any) => <em className="italic text-[#bac9cc]">{children}</em>,
  code:   ({ node, inline, children, ...props }: any) => {
    return (
      <code className="bg-white/5 border border-white/10 text-[#44e2cd] px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
        {children}
      </code>
    );
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

const PhotoAssistantOverlay: React.FC = () => {
  const {
    isPhotoAssistantOpen,
    photoAssistantContext,
    closePhotoAssistant,
    photoChatHistory,
    setPhotoChatHistory,
    clearPhotoChatHistory,
    photoAssistantSetup,
    setPhotoAssistantSetup,
    pushToast,
    zoomToLocation
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [photoChatHistory, isLoading]);

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...photoChatHistory, userMsg];

    setPhotoChatHistory(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            mode: 'PHOTO_ASSISTANT',
            location: photoAssistantContext?.locationName ?? 'Current Location',
            auroraScore: photoAssistantContext?.auroraScore ?? 0,
            temperature: photoAssistantContext?.temperature ?? 0,
            setupType: photoAssistantSetup,
          },
        }),
      });

      if (!res.ok) throw new Error('Signal lost');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const decoder = new TextDecoder();
      let assistantContent = '';
      
      setPhotoChatHistory([...nextMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setPhotoChatHistory((prev: ChatMessage[]) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: assistantContent }];
          }
          return prev;
        });
      }

    } catch (err) {
      console.error('Streaming Err:', err);
      setPhotoChatHistory((prev: ChatMessage[]) => [...prev, {
        role: 'assistant',
        content: '**[SYSTEM ERROR]** Signal interference detected. Recalibrate uplink and try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, photoChatHistory, isLoading, photoAssistantContext, photoAssistantSetup, setPhotoChatHistory]);

  const handleSetupChoice = (type: 'general' | 'pro') => {
    setPhotoAssistantSetup(type);
    pushToast(`Calibrating optics.`, 'info');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closePhotoAssistant();
      setIsClosing(false);
    }, 500);
  };

  if (!isPhotoAssistantOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: isClosing ? 0 : 1, scale: isClosing ? 0.95 : 1, y: isClosing ? 20 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl h-[85vh] bg-[#0b0e14]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      >
        <header className="px-8 h-20 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-['Manrope'] font-bold text-white uppercase tracking-wider">AI Photographic Assistant</span>
          </div>
          <div className="flex items-center gap-3">
            {photoAssistantSetup && (
              <button
                onClick={() => clearPhotoChatHistory()}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 text-[#bac9cc] hover:text-[#44e2cd] hover:border-[#44e2cd]/30 transition-all text-[8px] font-mono uppercase tracking-tighter"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#bac9cc] hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-10 stitch-hide-scrollbar flex flex-col gap-8">
          {!photoAssistantSetup && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center gap-10">
              <div className="space-y-4">
                <h2 className="text-3xl font-['Manrope'] font-bold text-white">Identify Photographic Profile</h2>
                <p className="text-[#bac9cc] text-[15px] font-light">
                  Choose your profile below to begin calibration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => handleSetupChoice('general')}
                  className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#44e2cd]/50 hover:bg-[#44e2cd]/5 transition-all text-left flex flex-col gap-4"
                >
                  <span className="material-symbols-outlined text-3xl text-[#bac9cc] group-hover:text-[#44e2cd] transition-colors">smartphone</span>
                  <div className="space-y-1">
                    <div className="text-white font-bold">General Explorer</div>
                    <div className="text-[12px] text-[#bac9cc]">Smartphone or Point-and-shoot.</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSetupChoice('pro')}
                  className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#44e2cd]/50 hover:bg-[#44e2cd]/5 transition-all text-left flex flex-col gap-4"
                >
                  <span className="material-symbols-outlined text-3xl text-[#bac9cc] group-hover:text-[#44e2cd] transition-colors">camera</span>
                  <div className="space-y-1">
                    <div className="text-white font-bold">Professional Photographer</div>
                    <div className="text-[12px] text-[#bac9cc]">Mirrorless, DSLR, or Medium Format hardware.</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {photoAssistantSetup && photoChatHistory.length === 0 && (
            <div className="flex-1 flex flex-col items-start max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full border border-[#44e2cd]/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#44e2cd] text-xl">settings_input_component</span>
                </div>
                <div className="space-y-6">
                  <div className="text-2xl font-['Manrope'] font-bold text-white leading-tight">
                    Calibrated for <span className="text-[#44e2cd]">{photoAssistantSetup === 'pro' ? 'Pro' : 'General'}</span> optics. <br />
                    <span className="text-[#bac9cc] text-lg font-light">What is your current hardware setup?</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {Array.isArray(photoChatHistory) && photoChatHistory.map((msg: ChatMessage, idx: number) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-6 items-start`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[#bac9cc] text-sm">photo_camera</span>
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#44e2cd]/10 border border-[#44e2cd]/20' : 'bg-white/5 border border-white/10'} p-6 rounded-2xl shadow-xl`}>
                <ReactMarkdown 
                  components={{
                    ...MarkdownComponents,
                    p: (props) => (
                      <MarkdownComponents.p 
                        {...props} 
                        zoomToLocation={zoomToLocation} 
                        handleClose={handleClose} 
                      />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-6 items-center animate-pulse">
              <span className="text-[10px] font-mono text-[#44e2cd] uppercase tracking-widest">Processing Data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <footer className="px-8 pb-10 mt-auto shrink-0">
          <div className="relative group">
            <div className="relative flex items-center bg-black/40 border border-white/10 focus-within:border-[#44e2cd]/50 rounded-xl h-14 px-6 transition-all">
              <span className="material-symbols-outlined text-[#bac9cc] mr-4 text-xl">shutter_speed</span>
              <input
                ref={inputRef}
                disabled={!photoAssistantSetup || isLoading}
                className="bg-transparent border-none focus:ring-0 flex-1 text-white placeholder:text-[#bac9cc]/30 text-[14px] outline-none font-mono"
                placeholder={!photoAssistantSetup ? "Choose profile first..." : "Enter setup hardware or ask for advice..."}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="ml-4 text-[#44e2cd] hover:text-[#c3f5ff] transition-colors disabled:opacity-20"
              >
                <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
              </button>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default PhotoAssistantOverlay;
