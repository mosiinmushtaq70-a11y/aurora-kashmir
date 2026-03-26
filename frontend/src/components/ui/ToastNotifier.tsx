'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { ToastPayload } from '@/store/useAppStore';

/**
 * --- ToastNotifier ---
 * Phase 4: Global toast notification system.
 * ─ Reads `toasts` array from useAppStore
 * ─ Each toast auto-dismisses after 4s (handled in the store)
 * ─ Manual dismiss via ✕ button → dismissToast(id)
 * ─ Icons and accent colors derived from toast.type
 * ─ Mounted once at the root level in page.tsx
 */

const TOAST_ICONS: Record<ToastPayload['type'], string> = {
  info:    'info',
  success: 'check_circle',
  warning: 'warning',
  error:   'error',
};

const TOAST_ACCENT: Record<ToastPayload['type'], string> = {
  info:    'border-[#00e5ff]/30 text-[#00e5ff]',
  success: 'border-[#44e2cd]/30 text-[#44e2cd]',
  warning: 'border-amber-400/30 text-amber-400',
  error:   'border-rose-400/30 text-rose-400',
};

const ToastNotifier: React.FC = () => {
  const { toasts, dismissToast } = useAppStore();

  // Load Material Symbols if not already loaded
  useEffect(() => {
    const existingLink = document.querySelector('link[data-toast-font]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
      link.setAttribute('data-toast-font', 'true');
      document.head.appendChild(link);
    }
  }, []);

  return (
    // Fixed stack — bottom-right corner, above everything else
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: 12,  scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`
              pointer-events-auto
              flex items-start gap-3
              bg-[#080B11]/90 backdrop-blur-2xl
              border ${TOAST_ACCENT[toast.type].split(' ')[0]}
              rounded-2xl px-5 py-4
              shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              max-w-sm min-w-[260px]
            `}
          >
            {/* Icon */}
            <span
              className={`material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5 ${TOAST_ACCENT[toast.type].split(' ')[1]}`}
              style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {TOAST_ICONS[toast.type]}
            </span>

            {/* Message */}
            <p className="flex-1 text-[#e0e2eb] text-[13px] font-['Inter',_sans-serif] font-light leading-relaxed">
              {toast.message}
            </p>

            {/* Dismiss */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#bac9cc]/60 hover:text-[#e0e2eb] transition-colors flex-shrink-0 mt-0.5"
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                close
              </span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastNotifier;
