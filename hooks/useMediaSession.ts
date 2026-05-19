'use client';
import { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

/**
 * useMediaSession — Web Media Session API integration
 *
 * Enables:
 * • Background play: music keeps playing when phone is locked
 * • Lock screen controls: play/pause/skip buttons on lock screen
 * • Notification controls: Android media notification
 * • Headphone/Bluetooth button support
 * • OS progress bar synced to current position
 */
export function useMediaSession() {
  const currentTrack   = usePlayerStore(s => s.currentTrack);
  const isPlaying      = usePlayerStore(s => s.isPlaying);
  const progress       = usePlayerStore(s => s.progress);
  const duration       = usePlayerStore(s => s.duration);
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause);
  const next           = usePlayerStore(s => s.next);
  const previous       = usePlayerStore(s => s.previous);
  const seek           = usePlayerStore(s => s.seek);

  // Set metadata (album art, title, artist) on OS lock screen
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  currentTrack.title  ?? 'Unknown Track',
      artist: currentTrack.artist ?? 'Unknown Artist',
      album:  'Maina',
      artwork: currentTrack.thumbnail ? [
        { src: currentTrack.thumbnail, sizes: '96x96',   type: 'image/jpeg' },
        { src: currentTrack.thumbnail, sizes: '256x256', type: 'image/jpeg' },
        { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
      ] : [],
    });
  }, [currentTrack]);

  // Sync playback state (shows play vs pause icon on lock screen)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Register lock screen button handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const setHandler = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try { navigator.mediaSession.setActionHandler(action, fn); } catch { /* unsupported */ }
    };

    setHandler('play',          () => { if (!isPlaying) togglePlayPause(); });
    setHandler('pause',         () => { if (isPlaying)  togglePlayPause(); });
    setHandler('stop',          () => { if (isPlaying)  togglePlayPause(); });
    setHandler('nexttrack',     () => next());
    setHandler('previoustrack', () => previous());
    setHandler('seekto',        (d) => { if (d.seekTime != null) seek(d.seekTime); });
    setHandler('seekforward',   (d) => seek(Math.min((progress * duration) + (d.seekOffset ?? 10), duration)));
    setHandler('seekbackward',  (d) => seek(Math.max((progress * duration) - (d.seekOffset ?? 10), 0)));

    return () => {
      (['play','pause','stop','nexttrack','previoustrack','seekto','seekforward','seekbackward'] as MediaSessionAction[])
        .forEach(a => setHandler(a, null));
    };
  }, [isPlaying, progress, duration, togglePlayPause, next, previous, seek]);

  // Sync OS progress bar
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration || !currentTrack) return;
    try {
      navigator.mediaSession.setPositionState({
        duration:     Math.max(duration, 0),
        playbackRate: 1,
        position:     Math.min(Math.max((progress * duration), 0), duration),
      });
    } catch { /* setPositionState not supported on this browser */ }
  }, [progress, duration, currentTrack]);
}
