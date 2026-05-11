'use client';
import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

// Singleton state for the shortcuts overlay (avoids prop drilling)
type ShortcutsListener = (open: boolean) => void;
const listeners = new Set<ShortcutsListener>();
let shortcutsOpen = false;

export function subscribeToShortcutsOverlay(fn: ShortcutsListener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function toggleShortcutsOverlay() {
  shortcutsOpen = !shortcutsOpen;
  listeners.forEach(fn => fn(shortcutsOpen));
}

function closeShortcutsOverlay() {
  shortcutsOpen = false;
  listeners.forEach(fn => fn(false));
}

export { closeShortcutsOverlay };

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea/contenteditable
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA'].includes(tag)) return;
      if ((e.target as HTMLElement).isContentEditable) return;

      const store = usePlayerStore.getState();

      switch (e.key.toLowerCase()) {
        // --- Playback ---
        case ' ':
        case 'k':
          e.preventDefault();
          store.togglePlayPause();
          break;
        case 'n':
          e.preventDefault();
          store.next();
          break;
        case 'p':
          e.preventDefault();
          store.previous();
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

        // --- Volume ---
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

        // --- Modes ---
        case 's':
          e.preventDefault();
          store.toggleShuffle();
          break;
        case 'r':
          e.preventDefault();
          store.cycleRepeat();
          break;

        // --- Interface ---
        case 'f':
          e.preventDefault();
          store.toggleFullscreen();
          break;
        case 'q':
          e.preventDefault();
          store.toggleQueue();
          break;
        case 'c':
          e.preventDefault();
          store.toggleLyrics();
          break;
        case 'h':
        case '?':
          e.preventDefault();
          toggleShortcutsOverlay();
          break;
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
        case 'escape':
          e.preventDefault();
          if (shortcutsOpen) { closeShortcutsOverlay(); break; }
          if (store.isFullscreen) store.toggleFullscreen();
          if (store.showQueue) store.toggleQueue();
          if (store.showLyrics) store.toggleLyrics();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
