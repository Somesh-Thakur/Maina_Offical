'use client';
import { usePlayerStore } from '@/store/playerStore';

export function useQueue() {
  const queue = usePlayerStore(state => state.queue);
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const removeFromQueue = usePlayerStore(state => state.removeFromQueue);
  const clearQueue = usePlayerStore(state => state.clearQueue);
  const reorderQueue = usePlayerStore(state => state.reorderQueue);

  return {
    queue,
    currentTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue
  };
}
