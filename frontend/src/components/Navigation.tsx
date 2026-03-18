'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Settings, Menu, X, Zap, LogIn, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Globe },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      {/* Floating hamburger toggle — always visible */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed top-5 left-5 z-50 w-11 h-11 rounded-xl glass-panel border border-white/10 flex items-center justify-center text-slate-300 hover:text-aurora-green hover:border-aurora-green/40 transition-colors duration-200 shadow-lg"
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
                <Zap size={18} className="text-aurora-green" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-aurora-green to-blue-400">
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
                          ? 'bg-aurora-green/10 text-aurora-green border border-aurora-green/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-indicator"
                          className="absolute left-0 w-1 h-8 bg-aurora-green rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <item.icon size={20} className={isActive ? 'text-aurora-green' : 'opacity-70'} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Footer / Auth */}
            <div className="mt-auto space-y-2 pb-4">
              <AnimatePresence mode="wait">
                {status === 'authenticated' ? (
                  <motion.div
                    key="auth-user"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-aurora-green/20 flex items-center justify-center border border-aurora-green/30 overflow-hidden">
                        {session?.user?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={session?.user?.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={16} className="text-aurora-green" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Logged In'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{session?.user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition group"
                    >
                      <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="auth-signin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => signIn()}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-aurora-green bg-aurora-green/5 hover:bg-aurora-green/10 border border-aurora-green/20 transition group"
                  >
                    <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Sign In</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition cursor-pointer">
                <Settings size={20} />
                <span className="text-sm font-medium">Settings</span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
