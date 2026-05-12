'use client';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

/**
 * useDiscordRPC
 *
 * Sends player state to the Maina desktop app's local HTTP server
 * running on http://127.0.0.1:7463/rpc
 *
 * This approach works from BOTH:
 *   • The Tauri WebView (desktop app loading Vercel)
 *   • A regular web browser — if the desktop app is open,
 *     Discord RPC will update automatically!
 *
 * If the desktop app is not running, the fetch fails silently.
 * Zero Tauri IPC needed — no injection, no CSP issues.
 */

const RPC_URL = 'http://127.0.0.1:7463/rpc';

async function postRpc(payload: object): Promise<void> {
  try {
    await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Short timeout so it doesn't hang if the app isn't running
      signal: AbortSignal.timeout(1500),
    });
  } catch {
    // Desktop app not running or port not available — silent no-op
  }
}

export function useDiscordRPC() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying    = usePlayerStore(state => state.isPlaying);
  const progress     = usePlayerStore(state => state.progress);
  const duration     = usePlayerStore(state => state.duration);

  // Debounce: only send updates every 5 seconds max to avoid spamming
  const lastSentRef  = useRef<number>(0);
  const lastTrackRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const now          = Date.now();
    const trackChanged = currentTrack?.id !== lastTrackRef.current;
    const throttled    = now - lastSentRef.current < 5000 && !trackChanged;

    if (throttled) return;

    lastSentRef.current  = now;
    lastTrackRef.current = currentTrack?.id ?? null;

    if (!currentTrack || !isPlaying) {
      postRpc({ clear: true });
      return;
    }

    postRpc({
      title:        currentTrack.title     ?? '',
      artist:       currentTrack.artist    ?? '',
      thumbnailUrl: currentTrack.thumbnail ?? '',
      durationSecs: Math.floor(duration  ?? 0),
      elapsedSecs:  Math.floor((progress ?? 0) * (duration ?? 0)),
    });
  }, [currentTrack, isPlaying, progress, duration]);
}
