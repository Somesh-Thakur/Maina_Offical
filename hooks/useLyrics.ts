'use client';
import { useEffect, useState } from 'react';
import { fetchLyrics, LyricLine } from '@/lib/lrclib';
import { usePlayerStore } from '@/store/playerStore';

export function useLyrics() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);
  
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [plainText, setPlainText] = useState<string>('');
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!currentTrack) {
      setLines([]);
      setPlainText('');
      setIsSynced(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    async function load() {
      const res = await fetchLyrics(currentTrack!.artist, currentTrack!.title, currentTrack!.duration);
      
      if (!isMounted) return;
      setIsLoading(false);
      
      if (res) {
        setIsSynced(res.synced);
        setLines(res.lines);
        setPlainText(res.plainText);
      } else {
        setIsSynced(false);
        setLines([]);
        setPlainText('');
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  // Sync index
  useEffect(() => {
    if (!isSynced || lines.length === 0) return;
    
    const currentTime = progress * duration;
    
    let newIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        newIndex = i;
      } else {
        break;
      }
    }
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [progress, duration, lines, isSynced, currentIndex]);

  return {
    lines,
    plainText,
    isSynced,
    currentIndex,
    isLoading
  };
}
