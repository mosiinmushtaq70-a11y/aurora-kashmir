'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
  auroraScore?: number;
  temperature?: number | null;
}

export default function AIAssistantModal({ isOpen, onClose, locationName = 'Unknown Query', auroraScore = 0, temperature }: AIAssistantModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [messages, setMessages] = React.useState<{role: string, content: string}[]>([]);
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    setMounted(true);
  }, []);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `AuroraLens Tactical Co-Pilot online. Target sector: ${locationName}. Aurora Score: ${auroraScore}/100. State your camera hardware (smartphone model or DSLR body + lens) to begin exposure calibration.`
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            location: locationName,
            auroraScore,
            temperature: temperature != null ? `${temperature}°C` : 'Unknown'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Communications array offline.';
        setMessages(prev => [...prev, { role: 'assistant', content: `[ SYSTEM ERROR ]: ${errorMessage}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '[ SYSTEM ERROR ]: Uplink failed. Check connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key closure
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 md:p-6"
          onClick={onClose}
        >
          {/* Responsive Chat Container */}
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[95%] h-[90vh] md:max-w-4xl md:h-[80vh] bg-[#0a0f16] border border-slate-700/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-lg flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* The Header */}
            <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-[#0a0f16]">
              <div className="flex items-center gap-3">
                <span className="text-[#4af626] font-mono tracking-widest text-sm font-bold">
                  {`// TACTICAL AI CO-PILOT`}
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[9px] font-mono tracking-widest text-slate-400 border border-slate-700 bg-slate-800/50">
                  PHOTOGRAPHY DIVISION
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-500 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* The Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`max-w-[85%] md:max-w-[75%] py-3 px-4 ${
                    msg.role === 'user' 
                      ? 'bg-slate-800/50 border border-slate-700 rounded-l-lg rounded-br-lg text-right' 
                      : 'bg-black/40 border border-[#4af626]/20 rounded-r-lg rounded-bl-lg'
                  }`}>
                    <div className={`font-mono text-sm leading-relaxed ${msg.role === 'user' ? 'text-slate-200' : 'text-slate-300'}`}>
                      <span className={`tracking-widest text-[10px] uppercase block mb-2 font-bold ${msg.role === 'user' ? 'text-slate-500' : 'text-[#4af626]'}`}>
                        {msg.role === 'user' ? '[ OPERATOR ]' : '[ SYSTEM ]'}
                      </span>
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <ReactMarkdown
                          components={{
                            p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ ...props }) => <ul className="list-disc list-inside space-y-1 mb-2 ml-2" {...props} />,
                            li: ({ ...props }) => <li className="text-slate-300" {...props} />,
                            strong: ({ ...props }) => <strong className="font-bold text-[#4af626]" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex w-full">
                  <div className="max-w-[85%] bg-black/40 border border-[#4af626]/20 py-3 px-4 rounded-r-lg rounded-bl-lg flex items-center gap-2 text-slate-500 font-mono text-xs">
                    <div className="w-1.5 h-1.5 bg-[#4af626] rounded-full animate-ping" />
                    Computing optimal array...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* The Input Area */}
            <div className="border-t border-slate-800 p-2 md:p-4 bg-[#0a0f16]">
              <div className="flex items-center gap-2 md:gap-3 bg-black/30 border border-slate-800 rounded-lg pr-1 pl-3 md:pl-4 focus-within:border-slate-600 transition-colors">
                <span className="text-[#4af626] font-mono text-lg font-bold">{`>_`}</span>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  disabled={isLoading}
                  placeholder="Input hardware specifications or conditions..."
                  className="flex-1 bg-transparent text-slate-200 focus:outline-none font-mono text-sm py-3 md:py-4 placeholder:text-slate-600 w-full disabled:opacity-50"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="text-[#4af626] hover:bg-[#4af626]/10 p-2 md:px-4 md:py-2 rounded-md transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send size={16} className="md:hidden" />
                  <span className="hidden md:inline-block font-mono text-xs font-bold tracking-widest uppercase">
                    {isLoading ? 'UPLINK...' : 'TRANSMIT'}
                  </span>
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
