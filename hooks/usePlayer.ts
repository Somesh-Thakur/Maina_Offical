'use client';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useYouTube } from './useYouTube';

export function usePlayer() {
  const { playerReady, play, pause, resume, setVolume, setPlaybackRate, getActivePlayer, seekTo, cueNext } = useYouTube();
  const playerState = usePlayerStore();
  const intervalRef = useRef<NodeJS.Timeout>(null);
  
  // Handle play/pause/track changes from store
  const lastTrackId = useRef<string | null>(null);

  useEffect(() => {
    if (!playerReady) return;

    if (playerState.currentTrack?.id !== lastTrackId.current) {
      // Track changed
      if (playerState.currentTrack) {
        // Crossfade duration can be fetched from settings later
        play(playerState.currentTrack.id, 0); 
        lastTrackId.current = playerState.currentTrack.id;
      }
    } else {
      // Same track, just play/pause toggle
      if (playerState.isPlaying) {
        resume();
      } else {
        pause();
      }
    }
  }, [playerState.currentTrack, playerState.isPlaying, playerReady]);

  useEffect(() => {
    if (playerReady) {
      setVolume(playerState.isMuted ? 0 : playerState.volume * 100);
    }
  }, [playerState.volume, playerState.isMuted, playerReady]);

  useEffect(() => {
    if (playerReady) {
      setPlaybackRate(playerState.playbackRate);
    }
  }, [playerState.playbackRate, playerReady]);

  // Sync progress
  useEffect(() => {
    if (playerState.isPlaying && playerReady) {
      intervalRef.current = setInterval(() => {
        const activePlayer = getActivePlayer();
        if (activePlayer && typeof activePlayer.getPlayerState === 'function') {
          const state = activePlayer.getPlayerState();
          
          if (state === 1) { // Playing
            const currentTime = activePlayer.getCurrentTime();
            const duration = activePlayer.getDuration();
            
            if (duration > 0) {
              playerState.setProgress(currentTime / duration);
              
              // We rely on initial duration metadata, but if YouTube provides a more accurate one:
              playerState.setDuration(duration); 
            }
            
            // Auto advance
            if (duration > 0 && duration - currentTime < 1) {
              playerState.next();
            }
          } else if (state === 0) { // Ended (backup to auto advance)
             playerState.next();
          }
        }
      }, 500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playerState.isPlaying, playerReady, playerState.currentTrack]);

  // MediaSession API for Lockscreen/Background Play
  useEffect(() => {
    if ('mediaSession' in navigator && playerState.currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: playerState.currentTrack.title,
        artist: playerState.currentTrack.artist,
        artwork: [
          { src: playerState.currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => playerState.togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => playerState.togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playerState.previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => playerState.next());
    }
  }, [playerState.currentTrack]);

  // Pre-load next track
  useEffect(() => {
    if (playerReady && playerState.queue.length > 0) {
      const nextTrack = playerState.queue[0];
      cueNext(nextTrack.id);
    }
  }, [playerReady, playerState.queue, playerState.currentTrack, cueNext]);

  return { seekTo };
}
