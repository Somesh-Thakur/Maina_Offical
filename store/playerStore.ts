import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@/lib/db';
import { useVibeStore } from './vibeStore';
import { useUserStore } from './userStore';
import toast from 'react-hot-toast';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  history: Track[]; // In-session history (for quick previous track)
  volume: number; // 0-1
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playbackRate: number;
  progress: number; // 0-1
  duration: number; // seconds
  isFullscreen: boolean;
  showQueue: boolean;
  showLyrics: boolean;
  autoplay: boolean;
  
  // Actions
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  seek: (seconds: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track, next?: boolean) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  toggleAutoplay: () => void;
  fetchAutoplayTrack: (track: Track) => Promise<void>;
}

const checkVibeAuth = (): boolean => {
  const vibe = useVibeStore.getState();
  const user = useUserStore.getState().user;
  
  if (vibe.status === 'connected' && vibe.hostId && vibe.hostId !== user?.id) {
    toast('Only the host can control playback', { icon: '🔒', id: 'vibe-lock' });
    return false;
  }
  return true;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      history: [],
      volume: 1,
      isMuted: false,
      shuffle: false,
      repeat: 'off',
      playbackRate: 1,
      progress: 0,
      duration: 0,
      isFullscreen: false,
      showQueue: false,
      showLyrics: false,
      autoplay: true,

      play: (track) => {
        if (!checkVibeAuth()) return;
        const { currentTrack, history } = get();
        const newHistory = currentTrack ? [...history, currentTrack].slice(-500) : history;
        set({ currentTrack: track, isPlaying: true, history: newHistory, progress: 0, duration: track.duration });
        
        // Log to cloud trending history
        fetch('/api/player/history', { method: 'POST', body: JSON.stringify({ track }) }).catch(console.error);
      },
      pause: () => {
        if (!checkVibeAuth()) return;
        set({ isPlaying: false });
      },
      resume: () => {
        if (!checkVibeAuth()) return;
        set({ isPlaying: !!get().currentTrack });
      },
      togglePlayPause: () => {
        if (!checkVibeAuth()) return;
        set((state) => {
          if (!state.currentTrack) return state;
          return { isPlaying: !state.isPlaying };
        });
      },
      next: () => {
        if (!checkVibeAuth()) return;
        const { queue, currentTrack, history, repeat, shuffle } = get();
        
        if (repeat === 'one' && currentTrack) {
          // Just replay current track. Handled by seeking to 0 and playing.
          set({ progress: 0, isPlaying: true });
          return;
        }

        if (queue.length === 0) {
          if (repeat === 'all' && currentTrack) {
            set({ progress: 0, isPlaying: true });
          } else if (get().autoplay && currentTrack) {
            get().fetchAutoplayTrack(currentTrack);
          } else {
            set({ isPlaying: false, progress: 0 });
          }
          return;
        }

        const nextTrack = shuffle ? queue[Math.floor(Math.random() * queue.length)] : queue[0];
        const newQueue = shuffle ? queue.filter(t => t.id !== nextTrack.id) : queue.slice(1);
        
        const newHistory = currentTrack ? [...history, currentTrack].slice(-500) : history;
        set({ currentTrack: nextTrack, queue: newQueue, history: newHistory, isPlaying: true, progress: 0 });
      },
      previous: () => {
        if (!checkVibeAuth()) return;
        const { history, currentTrack, queue } = get();
        if (history.length === 0) {
          set({ progress: 0 }); // Just restart track
          return;
        }
        
        const prevTrack = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        const newQueue = currentTrack ? [currentTrack, ...queue] : queue;
        
        set({ currentTrack: prevTrack, history: newHistory, queue: newQueue, isPlaying: true, progress: 0 });
      },
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      cycleRepeat: () => set((state) => {
        const nextMode = { off: 'all', all: 'one', one: 'off' } as const;
        return { repeat: nextMode[state.repeat] };
      }),
      seek: (seconds) => {
        if (!checkVibeAuth()) return;
        const { duration } = get();
        if (duration > 0) {
          set({ progress: seconds / duration });
        }
      },
      setProgress: (progress) => {
        if (!checkVibeAuth()) return;
        set({ progress });
      },
      setDuration: (duration) => set({ duration }),
      setQueue: (tracks) => set({ queue: tracks }),
      addToQueue: (track, next = false) => set((state) => {
        const newQueue = [...state.queue];
        if (next) {
          newQueue.unshift(track);
        } else {
          newQueue.push(track);
        }
        return { queue: newQueue };
      }),
      removeFromQueue: (index) => set((state) => {
        const newQueue = [...state.queue];
        newQueue.splice(index, 1);
        return { queue: newQueue };
      }),
      clearQueue: () => set({ queue: [] }),
      reorderQueue: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.queue);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { queue: result };
      }),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      toggleQueue: () => set((state) => ({ showQueue: !state.showQueue, showLyrics: false })),
      toggleLyrics: () => set((state) => ({ showLyrics: !state.showLyrics, showQueue: false })),
      toggleAutoplay: () => set((state) => ({ autoplay: !state.autoplay })),
      fetchAutoplayTrack: async (track) => {
        try {
          // Dynamic import to avoid circular dependencies if any
          const { searchVideos } = await import('@/lib/youtube');
          // Fetch similar artist mix
          const results = await searchVideos(`${track.artist} audio mix`, 5);
          const nextTrack = results.find(t => t.id !== track.id);
          
          if (nextTrack) {
            const { history } = get();
            const newHistory = [...history, track].slice(-500);
            set({ currentTrack: nextTrack, isPlaying: true, progress: 0, duration: nextTrack.duration, history: newHistory });
          } else {
            set({ isPlaying: false, progress: 0 });
          }
        } catch (e) {
          set({ isPlaying: false, progress: 0 });
        }
      },
    }),
    {
      name: 'maina-player-storage',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        queue: state.queue,
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        autoplay: state.autoplay,
      }),
    }
  )
);
