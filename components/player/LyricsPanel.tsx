'use client';
import React, { useEffect, useRef } from 'react';
import { useLyrics } from '@/hooks/useLyrics';
import { usePlayerStore } from '@/store/playerStore';
import { X, Mic2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { motion, AnimatePresence } from 'framer-motion';

export function LyricsPanel() {
  const showLyrics = usePlayerStore(state => state.showLyrics);
  const toggleLyrics = usePlayerStore(state => state.toggleLyrics);
  const { lines, plainText, isSynced, currentIndex, isLoading } = useLyrics();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentIndex, showLyrics]);

  return (
    <AnimatePresence>
      {showLyrics && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-[400px] lg:w-[500px] h-[calc(100vh-80px)] md:h-[100vh] lg:h-[100vh] xl:h-[100vh] bg-[#141414] border-l border-[rgba(255,255,255,0.06)] z-[90] flex flex-col shadow-2xl"
          style={{ height: 'calc(100vh - 80px)' }} // override for small screens
        >
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)] shrink-0">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Mic2 size={24} className="text-[var(--accent)]" />
              Lyrics
            </h2>
            <IconButton icon={X} onClick={toggleLyrics} />
          </div>
          
          <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto no-scrollbar p-6 relative"
          >
            {isLoading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-6 bg-white/5 rounded-md w-3/4" style={{ width: `${60 + Math.random() * 40}%` }} />
                ))}
              </div>
            ) : isSynced && lines.length > 0 ? (
              <div className="flex flex-col gap-6 pb-40 pt-20">
                {lines.map((line, idx) => {
                  const isActive = idx === currentIndex;
                  const isPast = idx < currentIndex;
                  
                  return (
                    <p
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      className={`text-2xl font-display font-bold leading-tight transition-all duration-300
                        ${isActive ? 'text-white scale-105 transform origin-left' : isPast ? 'text-white/30' : 'text-white/50 hover:text-white/80'}`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            ) : plainText ? (
              <div className="whitespace-pre-wrap text-lg font-medium text-white/70 leading-relaxed pb-10">
                {plainText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#a3a3a3] gap-4">
                <Mic2 size={48} className="opacity-20" />
                <p>No lyrics found for this track.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
