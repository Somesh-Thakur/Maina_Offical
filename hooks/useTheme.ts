'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePlayerStore } from '@/store/playerStore';
import { extractPalette } from '@/lib/colorExtract';

export function useTheme() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!currentTrack?.thumbnail) return;

    let isMounted = true;
    
    async function updateTheme() {
      if (isTransitioning.current) return;
      
      const palette = await extractPalette(currentTrack!.thumbnail);
      if (!palette || !isMounted) return;

      isTransitioning.current = true;
      
      // Animate CSS variables using GSAP
      gsap.to(document.documentElement, {
        '--accent': palette.primary,
        '--accent-muted': palette.muted,
        '--bg-glow': palette.bgGlow,
        '--text-on-accent': palette.textSafe,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          isTransitioning.current = false;
        }
      });
    }

    updateTheme();

    return () => {
      isMounted = false;
    };
  }, [currentTrack]);
}
