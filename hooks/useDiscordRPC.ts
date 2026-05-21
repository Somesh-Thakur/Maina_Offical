'use client';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useVibeStore } from '@/store/vibeStore';
import { DiscordLocalRPC } from '@/lib/discordRPC';

/**
 * useDiscordRPC
 *
 * Two-path Discord Rich Presence:
 *
 * PATH A — Local HTTP (port 7463):
 *   POSTs to the Maina desktop app's built-in HTTP server.
 *   Works when the desktop app is installed and running.
 *
 * PATH B — Discord WebSocket (port 6463):
 *   Connects directly to Discord's local WebSocket server.
 *   Works from ANY browser — no Maina app needed!
 *   Requires Discord desktop to be open + one-time OAuth2 authorization.
 *
 * If neither Discord nor the Maina app is running → silent no-op.
 */

const HTTP_RPC_URL = 'http://127.0.0.1:7463/rpc';

let webRpcInstance: DiscordLocalRPC | null = null;
let webRpcInitialized = false;

async function postHttpRpc(payload: object) {
  try {
    await fetch(HTTP_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(1500),
    });
  } catch { /* Desktop app not running */ }
}

async function initWebRpc(): Promise<DiscordLocalRPC | null> {
  if (webRpcInitialized) return webRpcInstance;
  webRpcInitialized = true;

  const rpc = new DiscordLocalRPC();
  const connected = await rpc.connect();
  if (!connected) return null;

  const authed = await rpc.authenticate();
  if (!authed) return null;

  webRpcInstance = rpc;
  console.log('[Maina] ✓ Discord WebSocket RPC ready (web mode)');
  return rpc;
}

export function useDiscordRPC() {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying    = usePlayerStore(state => state.isPlaying);
  const progress     = usePlayerStore(state => state.progress);
  const duration     = usePlayerStore(state => state.duration);
  const vibeStatus   = useVibeStore(state => state.status);
  const vibeParticipants = useVibeStore(state => state.participants.length);
  const vibeRoomId   = useVibeStore(state => state.roomId);

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
      // Clear both paths
      postHttpRpc({ clear: true });
      webRpcInstance?.clearActivity();
      return;
    }

    const elapsed  = Math.floor((progress ?? 0) * (duration ?? 0));
    const dur      = Math.floor(duration ?? 0);

    const vibeInfo = {
      active: vibeStatus === 'connected',
      participants: vibeParticipants,
      roomId: vibeRoomId
    };

    // PATH A: HTTP server (desktop app)
    postHttpRpc({
      title:        currentTrack.title     ?? '',
      artist:       currentTrack.artist    ?? '',
      thumbnailUrl: currentTrack.thumbnail ?? '',
      durationSecs: dur,
      elapsedSecs:  elapsed,
      vibeInfo
    });

    // PATH B: Discord WebSocket (web)
    initWebRpc().then(rpc => {
      if (!rpc) return;
      rpc.setActivity(
        currentTrack.title     ?? '',
        currentTrack.artist    ?? '',
        currentTrack.thumbnail ?? '',
        dur,
        elapsed,
        vibeInfo
      );
    });

  }, [currentTrack, isPlaying, progress, duration]);
}
