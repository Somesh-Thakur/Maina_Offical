'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

// Stable positions for particles (computed once to avoid hydration issues)
const PARTICLES = [
  { width: 2.8, height: 2.8, left: 12.3, top: 78.2, duration: 18.2, delay: 3.1 },
  { width: 1.4, height: 1.4, left: 35.7, top: 22.9, duration: 14.6, delay: 0.4 },
  { width: 2.1, height: 2.1, left: 58.1, top: 45.6, duration: 19.8, delay: 7.2 },
  { width: 1.7, height: 1.7, left: 81.4, top: 11.3, duration: 12.3, delay: 2.5 },
  { width: 2.5, height: 2.5, left: 5.9, top: 55.8, duration: 16.7, delay: 5.8 },
  { width: 1.2, height: 1.2, left: 44.2, top: 88.1, duration: 20.4, delay: 1.0 },
  { width: 2.9, height: 2.9, left: 67.8, top: 33.4, duration: 15.1, delay: 8.3 },
  { width: 1.9, height: 1.9, left: 23.6, top: 64.7, duration: 17.6, delay: 4.6 },
  { width: 2.3, height: 2.3, left: 91.2, top: 77.5, duration: 13.9, delay: 6.1 },
  { width: 1.5, height: 1.5, left: 50.0, top: 5.2, duration: 21.0, delay: 9.4 },
  { width: 2.0, height: 2.0, left: 73.4, top: 60.1, duration: 11.8, delay: 0.7 },
  { width: 2.6, height: 2.6, left: 18.9, top: 38.8, duration: 16.2, delay: 3.9 },
  { width: 1.3, height: 1.3, left: 86.5, top: 20.4, duration: 18.9, delay: 7.7 },
  { width: 2.2, height: 2.2, left: 30.1, top: 92.6, duration: 14.0, delay: 5.2 },
  { width: 1.8, height: 1.8, left: 62.3, top: 14.8, duration: 22.1, delay: 2.8 },
  { width: 2.7, height: 2.7, left: 9.7, top: 44.3, duration: 13.5, delay: 8.9 },
  { width: 1.6, height: 1.6, left: 77.0, top: 83.7, duration: 17.3, delay: 6.4 },
  { width: 2.4, height: 2.4, left: 42.8, top: 29.1, duration: 15.7, delay: 1.6 },
  { width: 1.1, height: 1.1, left: 96.3, top: 51.9, duration: 20.8, delay: 4.3 },
  { width: 2.9, height: 2.9, left: 55.6, top: 70.5, duration: 12.6, delay: 9.0 },
];

function useMobile() {
  return false; // Mobile is now fully supported
}

export function WelcomeScreen() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // normalized 0-1
  const isMobile = useMobile();

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDismiss = () => setDismissed(true);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="welcome-screen"
          initial={{ y: 0, opacity: 1 }}
          exit={{
            y: '-100%',
            opacity: 0,
            transition: { type: 'spring', damping: 22, stiffness: 130, mass: 1.1 }
          }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden cursor-default select-none"
          style={{ background: '#030712' }}
          onClick={handleDismiss}
        >
          {/* === BACKGROUND LAYERS === */}

          {/* Aurora gradient that follows mouse */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 60% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(59,130,246,0.18) 0%, transparent 70%),
                           radial-gradient(ellipse 50% 50% at ${(1 - mousePos.x) * 100}% ${(1 - mousePos.y) * 100}%, rgba(99,102,241,0.12) 0%, transparent 65%)`,
              transition: 'background 0.15s ease-out',
            }}
          />

          {/* Second slow-drifting glow */}
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full blur-[140px] bg-blue-700/10 pointer-events-none z-0"
            animate={{ x: mousePos.x * 200 - 100, y: mousePos.y * 200 - 100 }}
            transition={{ type: 'spring', damping: 60, stiffness: 80 }}
          />

          {/* Grid lines */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{ width: p.width, height: p.height, left: `${p.left}%`, top: `${p.top}%` }}
                animate={{ y: [0, -80, 0], opacity: [0, 0.6, 0] }}
                transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
              />
            ))}
          </div>

          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#030712] to-transparent z-0 pointer-events-none" />

          {/* === MAIN CONTENT === */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">

            {/* Letter-by-letter animation */}
            <motion.div
              className="overflow-hidden"
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-end gap-[2px]">
                {'MAINA'.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    className="text-[80px] md:text-[130px] font-black text-white tracking-tighter leading-none"
                    style={{ fontFamily: 'var(--font-display, sans-serif)' }}
                    variants={{
                      hidden: { y: 80, opacity: 0 },
                      visible: {
                        y: 0, opacity: 1,
                        transition: { delay: 0.1 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                      }
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Accent bar */}
            <motion.div
              className="h-[3px] bg-[var(--accent)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="text-base md:text-xl text-white/40 font-medium tracking-widest uppercase"
            >
              Your music. Your world.
            </motion.p>
          </div>

          {/* Click hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-2 text-white/25 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronUp size={22} />
            </motion.div>
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase">Click anywhere to enter</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
