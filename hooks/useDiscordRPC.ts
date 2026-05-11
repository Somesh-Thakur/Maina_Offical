'use client';
import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

// Extend window type for Rust-side polling fallback
declare global {
  interface Window {
    __MAINA_PLAYER__: {
      title: string; artist: string; thumbnail: string;
      isPlaying: boolean; duration: number; progress: number;
    } | null;
  }
}

/**
 * useDiscordRPC — Bridges the Maina player state to the Tauri Rust backend
 * for Discord Rich Presence updates.
 *
 * Uses @tauri-apps/api/core invoke() — the proper IPC package.
 * Falls back to window.__MAINA_PLAYER__ global for Rust-side polling.
 * Completely safe in browser — all calls are guarded by isTauri() check.
 */

/** True only when running inside the Tauri desktop app */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function useDiscordRPC() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying    = usePlayerStore(state => state.isPlaying);
  const progress     = usePlayerStore(state => state.progress);
  const duration     = usePlayerStore(state => state.duration);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Always expose state for Rust-side polling fallback ───────────
    window.__MAINA_PLAYER__ = currentTrack && isPlaying ? {
      title:     currentTrack.title     ?? '',
      artist:    currentTrack.artist    ?? '',
      thumbnail: currentTrack.thumbnail ?? '',
      isPlaying,
      duration:  duration  ?? 0,
      progress:  progress  ?? 0,
    } : null;

    // ── Only run IPC inside the Tauri app ────────────────────────────
    if (!isTauri()) return;

    const elapsedSecs  = Math.floor((progress ?? 0) * (duration ?? 0));
    const durationSecs = Math.floor(duration ?? 0);

    // Dynamically import the Tauri invoke — avoids SSR issues
    import('@tauri-apps/api/core').then(({ invoke }) => {
      if (!currentTrack || !isPlaying) {
        invoke('clear_discord_status').catch(() => {});
      } else {
        invoke('update_discord_status', {
          title:        currentTrack.title     ?? '',
          artist:       currentTrack.artist    ?? '',
          thumbnailUrl: currentTrack.thumbnail ?? '',
          durationSecs,
          elapsedSecs,
        })
          .then(() => console.debug('[Maina] ✓ Discord RPC sent:', currentTrack.title))
          .catch(err => console.debug('[Maina] Discord RPC failed:', err));
      }
    }).catch(err => console.debug('[Maina] Tauri API import failed:', err));

  }, [currentTrack, isPlaying, progress, duration]);
}
