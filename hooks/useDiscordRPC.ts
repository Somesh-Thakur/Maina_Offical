'use client';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

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
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);
  const lastTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    // ── Guard: Only run inside Tauri desktop app ──────────────────
    if (typeof window === 'undefined') return;

    // Tauri injects window.__TAURI__.core.invoke when withGlobalTauri: true
    // We use this global directly — no npm package needed on the Vercel bundle
    const invoke = (window as any).__TAURI__?.core?.invoke as
      | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
      | undefined;

    if (!invoke) return; // Not in Tauri — silent no-op

    async function syncDiscord() {
      try {
        if (!currentTrack || !isPlaying) {
          // Paused or no track → clear Discord status
          await invoke!('clear_discord_status');
          return;
        }

        // Track changed → update reference
        if (currentTrack.id !== lastTrackIdRef.current) {
          lastTrackIdRef.current = currentTrack.id;
        }

        const elapsedSecs = Math.floor(progress * (duration || 0));
        const durationSecs = Math.floor(duration || 0);

        await invoke!('update_discord_status', {
          title: currentTrack.title,
          artist: currentTrack.artist,
          thumbnailUrl: currentTrack.thumbnail ?? '',
          durationSecs,
          elapsedSecs,
        });

        console.debug('[Maina] Discord RPC updated:', currentTrack.title);
      } catch (err) {
        // Discord may not be running — log quietly and carry on
        console.debug('[Maina] Discord RPC update skipped:', err);
      }
    }

    syncDiscord();
  }, [currentTrack, isPlaying, progress, duration]);
}
