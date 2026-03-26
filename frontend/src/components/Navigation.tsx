'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Settings, Menu, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Globe },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating hamburger toggle — always visible */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed top-5 left-5 z-50 w-11 h-11 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors duration-200 shadow-lg"
        whileTap={{ scale: 0.92 }}
        aria-label="Toggle navigation"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Click-away backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sliding sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 h-full w-64 z-40 glass-panel border-r border-[#ffffff0a] flex flex-col p-4 shadow-2xl"
          >
            {/* Brand */}
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-cyan-400" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-blue-400">
                  AuroraLens
                </h1>
              </div>

            {/* Nav items */}
            <div className="flex-1 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <item.icon size={20} className={isActive ? 'text-cyan-400' : 'opacity-70'} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-auto pb-4">
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
