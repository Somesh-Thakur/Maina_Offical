'use client';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

// Extend window type for global player state bridge
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
 * Uses window.__TAURI__.core.invoke() which is injected by Tauri when
 * `withGlobalTauri: true` is set in tauri.conf.json.
 * This works even when loading from an external URL (Vercel) because Tauri
 * injects the global BEFORE the page loads.
 *
 * COMPLETELY SAFE in browser — all calls are no-ops if __TAURI__ isn't present.
 */
export function useDiscordRPC() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying    = usePlayerStore(state => state.isPlaying);
  const progress     = usePlayerStore(state => state.progress);
  const duration     = usePlayerStore(state => state.duration);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ── Path 1: Always expose state globally so Rust polling can read it ──
    window.__MAINA_PLAYER__ = currentTrack && isPlaying ? {
      title:     currentTrack.title   ?? '',
      artist:    currentTrack.artist  ?? '',
      thumbnail: currentTrack.thumbnail ?? '',
      isPlaying,
      duration:  duration  ?? 0,
      progress:  progress  ?? 0,
    } : null;

    // ── Path 2: Direct invoke if window.__TAURI__ is injected ────────────
    const invoke = (window as any).__TAURI__?.core?.invoke as
      | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
      | undefined;

    if (!invoke) return; // Path 1 still works via Rust polling

    const elapsedSecs  = Math.floor((progress ?? 0) * (duration ?? 0));
    const durationSecs = Math.floor(duration ?? 0);

    if (!currentTrack || !isPlaying) {
      invoke('clear_discord_status').catch(() => {});
    } else {
      invoke('update_discord_status', {
        title:        currentTrack.title   ?? '',
        artist:       currentTrack.artist  ?? '',
        thumbnailUrl: currentTrack.thumbnail ?? '',
        durationSecs,
        elapsedSecs,
      }).catch(() => {});
    }
  }, [currentTrack, isPlaying, progress, duration]);
}
