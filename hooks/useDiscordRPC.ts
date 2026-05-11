'use client';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

/**
 * useDiscordRPC — Bridges the Maina player state to the Tauri Rust backend
 * for Discord Rich Presence updates.
 *
 * Works ONLY inside the Tauri desktop app.
 * In a normal browser (Vercel), all calls are no-ops — fully safe.
 */
export function useDiscordRPC() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);

  // Track the moment the current song started playing (for elapsed calculation)
  const playStartRef = useRef<number>(Date.now());
  const lastTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    // ── Guard: Only run inside Tauri desktop app ──────────────────
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (!isTauri) return;

    // Dynamically import Tauri invoke to avoid breaking the web build
    async function syncDiscord() {
      try {
        const { invoke } = await import('@tauri-apps/api/core');

        // No track or paused → clear Discord status
        if (!currentTrack || !isPlaying) {
          await invoke('clear_discord_status').catch(() => {});
          return;
        }

        // Track changed → reset elapsed reference
        if (currentTrack.id !== lastTrackIdRef.current) {
          playStartRef.current = Date.now();
          lastTrackIdRef.current = currentTrack.id;
        }

        const elapsedSecs = Math.floor(progress * (duration || 0));
        const durationSecs = Math.floor(duration || 0);

        await invoke('update_discord_status', {
          title: currentTrack.title,
          artist: currentTrack.artist,
          thumbnailUrl: currentTrack.thumbnail ?? '',
          durationSecs,
          elapsedSecs,
        });
      } catch (err) {
        // Silently fail — Discord might not be running
        console.debug('[Maina] Discord RPC update skipped:', err);
      }
    }

    syncDiscord();
  }, [currentTrack, isPlaying, progress, duration]);
}
