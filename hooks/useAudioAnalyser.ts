'use client';
import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export function useAudioAnalyser() {
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(64));
  const reqRef = useRef<number>(0);
  
  // Since we use the YouTube IFrame API, we cannot grab a real MediaStream securely due to CORS.
  // We will simulate the frequency data based on beat/pulse and time.
  // In a real app with local audio or non-CORS audio, we'd use AudioContext and createMediaElementSource.
  
  useEffect(() => {
    if (!isPlaying) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      // Smooth fade out
      const fade = setInterval(() => {
        setDataArray(prev => {
          const next = new Uint8Array(64);
          let allZero = true;
          for(let i=0; i<64; i++) {
            next[i] = prev[i] * 0.9;
            if (next[i] > 1) allZero = false;
          }
          if (allZero) clearInterval(fade);
          return next;
        });
      }, 50);
      return () => clearInterval(fade);
    }
    
    let time = 0;
    const animate = () => {
      time += 0.05;
      const next = new Uint8Array(64);
      for (let i = 0; i < 64; i++) {
        // Create a fake waveform that looks somewhat reactive
        const noise = Math.random() * 20;
        const base = Math.sin(time + i * 0.1) * 50 + 50;
        const peak = (i % 8 === 0) ? Math.sin(time * 2) * 50 : 0;
        next[i] = Math.max(0, Math.min(255, base + noise + peak));
      }
      setDataArray(next);
      reqRef.current = requestAnimationFrame(animate);
    };
    
    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying]);

  return dataArray;
}
