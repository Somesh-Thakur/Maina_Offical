'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export function WelcomeScreen() {
  const [show, setShow] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-screen"
        initial={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] cursor-default"
        onClick={handleDismiss}
      >
        {/* Interactive Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-600/20"
            animate={{
              x: mousePos.x - 300,
              y: mousePos.y - 300,
            }}
            transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
          
          {/* Animated floating particles or lines */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 10
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
             <h1 className="text-7xl md:text-9xl font-display font-black text-white tracking-tighter">
              MAINA
            </h1>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mt-2" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-white/50 font-medium tracking-wide max-w-md"
          >
            Your music, your world.
            <br />
            Personal. Premium. Pure.
          </motion.p>
        </div>

        {/* Swipe up hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-white/30"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronUp size={24} />
          </motion.div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Click to Enter</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
