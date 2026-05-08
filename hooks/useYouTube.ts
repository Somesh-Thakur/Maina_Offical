'use client';
import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTube() {
  const [playerReady, setPlayerReady] = useState(false);
  const playerARef = useRef<any>(null);
  const playerBRef = useRef<any>(null);
  const activePlayerRef = useRef<'A' | 'B'>('A');

  useEffect(() => {
    // If already loaded
    if (window.YT && window.YT.Player) {
      initPlayers();
      return;
    }

    // Wait for the API script to load
    const prevFn = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevFn) prevFn();
      initPlayers();
    };

    function initPlayers() {
      // Create DOM elements if they don't exist
      ['youtube-player-a', 'youtube-player-b'].forEach(id => {
        if (!document.getElementById(id)) {
          const div = document.createElement('div');
          div.id = id;
          div.style.width = '0px';
          div.style.height = '0px';
          div.style.position = 'absolute';
          div.style.opacity = '0';
          div.style.pointerEvents = 'none';
          document.body.appendChild(div);
        }
      });

      playerARef.current = new window.YT.Player('youtube-player-a', {
        height: '0',
        width: '0',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => checkReady()
        }
      });

      playerBRef.current = new window.YT.Player('youtube-player-b', {
        height: '0',
        width: '0',
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => checkReady()
        }
      });
    }

    let readyCount = 0;
    function checkReady() {
      readyCount++;
      if (readyCount === 2) {
        setPlayerReady(true);
      }
    }
  }, []);

  const getActivePlayer = () => activePlayerRef.current === 'A' ? playerARef.current : playerBRef.current;
  const getInactivePlayer = () => activePlayerRef.current === 'A' ? playerBRef.current : playerARef.current;

  // Basic API
  const play = (videoId: string, crossfadeDuration = 0) => {
    if (!playerReady) return;
    
    // Switch active player
    const nextPlayerKey = activePlayerRef.current === 'A' ? 'B' : 'A';
    const nextPlayer = nextPlayerKey === 'A' ? playerARef.current : playerBRef.current;
    const prevPlayer = nextPlayerKey === 'A' ? playerBRef.current : playerARef.current;
    
    activePlayerRef.current = nextPlayerKey;

    nextPlayer.loadVideoById(videoId);
    nextPlayer.setVolume(100); 
    nextPlayer.playVideo();

    // Crossfade logic (simple)
    if (crossfadeDuration > 0 && prevPlayer && typeof prevPlayer.getPlayerState === 'function' && prevPlayer.getPlayerState() === 1) { 
      let vol = 100;
      const step = 100 / (crossfadeDuration * 10); // 10 ticks per second
      const fadeInterval = setInterval(() => {
        vol -= step;
        if (vol <= 0) {
          prevPlayer.pauseVideo();
          clearInterval(fadeInterval);
        } else {
          prevPlayer.setVolume(vol);
        }
      }, 100);
    } else {
      if (prevPlayer && typeof prevPlayer.pauseVideo === 'function') prevPlayer.pauseVideo();
    }
  };

  const cueNext = (videoId: string) => {
    if (!playerReady) return;
    const inactivePlayer = getInactivePlayer();
    if (inactivePlayer && typeof inactivePlayer.cueVideoById === 'function') {
      inactivePlayer.cueVideoById(videoId);
    }
  };

  const pause = () => {
    if (!playerReady) return;
    getActivePlayer()?.pauseVideo();
  };

  const resume = () => {
    if (!playerReady) return;
    getActivePlayer()?.playVideo();
  };

  const seekTo = (seconds: number) => {
    if (!playerReady) return;
    getActivePlayer()?.seekTo(seconds, true);
  };

  const setVolume = (vol: number) => {
    if (!playerReady) return;
    getActivePlayer()?.setVolume(vol);
  };

  const setPlaybackRate = (rate: number) => {
    if (!playerReady) return;
    getActivePlayer()?.setPlaybackRate(rate);
  };

  const getCurrentTime = () => {
    if (!playerReady) return 0;
    return getActivePlayer()?.getCurrentTime() || 0;
  };

  const getDuration = () => {
    if (!playerReady) return 0;
    return getActivePlayer()?.getDuration() || 0;
  };

  return {
    playerReady,
    play,
    pause,
    resume,
    seekTo,
    cueNext,
    setVolume,
    setPlaybackRate,
    getCurrentTime,
    getDuration,
    getActivePlayer
  };
}
