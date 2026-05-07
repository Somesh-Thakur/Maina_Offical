'use client';
import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const store = usePlayerStore.getState();

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          store.togglePlayPause();
          break;
        case 'j':
          e.preventDefault();
          store.seek(Math.max(0, store.progress * store.duration - 10));
          break;
        case 'l':
          e.preventDefault();
          store.seek(Math.min(store.duration, store.progress * store.duration + 10));
          break;
        case 'arrowleft':
          e.preventDefault();
          store.previous();
          break;
        case 'arrowright':
          e.preventDefault();
          store.next();
          break;
        case 'arrowup':
          e.preventDefault();
          store.setVolume(Math.min(1, store.volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          store.setVolume(Math.max(0, store.volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          store.toggleMute();
          break;
        case 's':
          e.preventDefault();
          store.toggleShuffle();
          break;
        case 'r':
          e.preventDefault();
          store.cycleRepeat();
          break;
        case 'f':
          e.preventDefault();
          store.toggleFullscreen();
          break;
        case 'escape':
          e.preventDefault();
          if (store.isFullscreen) store.toggleFullscreen();
          if (store.showQueue) store.toggleQueue();
          if (store.showLyrics) store.toggleLyrics();
          break;
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
