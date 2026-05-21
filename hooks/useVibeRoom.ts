import { useEffect, useRef } from 'react';
import { useVibeStore } from '@/store/vibeStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUserStore } from '@/store/userStore';
import { getSupabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useVibeRoom() {
  const { roomId, hostId, status, setStatus, setParticipants, addParticipant, removeParticipant, transferHost, reset } = useVibeStore();
  const { user } = useUserStore();
  const { currentTrack, isPlaying, play, pause, seek } = usePlayerStore();
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const syncInterval = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);

  // Connection logic
  useEffect(() => {
    if (!roomId || !user) return;
    const supabase = getSupabase();
    
    setStatus('connecting');
    
    const channel = supabase.channel(`vibe-${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
        broadcast: { ack: false }
      }
    });

    // PRESENCE
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const participants = Object.keys(state).map(key => {
          const p = state[key][0] as any;
          return {
            id: key,
            name: p.name || 'Anonymous',
            avatarUrl: p.avatarUrl,
            isHost: key === hostId
          };
        });
        setParticipants(participants);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const p = newPresences[0];
        addParticipant({ id: key, name: p.name, avatarUrl: p.avatarUrl, isHost: key === hostId });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        removeParticipant(key);
        // If host left, auto transfer to next person or close
        if (key === hostId) {
          const state = channel.presenceState();
          const remainingIds = Object.keys(state).filter(k => k !== key);
          if (remainingIds.length > 0) {
            transferHost(remainingIds[0]);
          } else {
            reset(); // Room empty
          }
        }
      });

    // BROADCAST LISTENERS
    channel
      .on('broadcast', { event: 'sync_playback' }, ({ payload }) => {
        if (user.id === hostId) return; // Host ignores syncs
        
        const { track, isPlaying: hostPlaying, time } = payload;
        
        // Track change
        const currentPlayerTrack = usePlayerStore.getState().currentTrack;
        if (!currentPlayerTrack || currentPlayerTrack.id !== track.id) {
          usePlayerStore.getState().play(track);
        }
        
        // Play/Pause state
        const pState = usePlayerStore.getState();
        if (hostPlaying && !pState.isPlaying) pState.play(track); // Use play() to resume
        if (!hostPlaying && pState.isPlaying) pState.pause();
        
        // Time sync (only seek if > 2 seconds off)
        const pDuration = usePlayerStore.getState().duration;
        const myTime = (usePlayerStore.getState().progress || 0) * (pDuration || 0);
        if (Math.abs(myTime - time) > 2) {
          pState.seek(time);
        }
      })
      .on('broadcast', { event: 'transfer_host' }, ({ payload }) => {
        transferHost(payload.newHostId);
      })
      .on('broadcast', { event: 'close_room' }, () => {
        reset();
      });

    // START CHANNEL
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setStatus('connected');
        await channel.track({
          name: user.displayName || user.username,
          avatarUrl: user.avatarUrl
        });
      } else if (status === 'CLOSED') {
        setStatus('disconnected');
      } else if (status === 'CHANNEL_ERROR') {
        setStatus('error', 'Channel error');
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, user?.id]); // Note: DO NOT add hostId to dep array, or it reconnects on transfer

  // Host Sync Loop & Inactivity
  useEffect(() => {
    if (status !== 'connected' || user?.id !== hostId) {
      if (syncInterval.current) clearInterval(syncInterval.current);
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      return;
    }

    // Inactivity Auto-Close (15 mins)
    const handleInactivity = () => {
      const state = usePlayerStore.getState();
      if (!state.isPlaying) {
        if (!inactivityTimeout.current) {
          inactivityTimeout.current = setTimeout(() => {
            broadcastCloseRoom();
          }, 15 * 60 * 1000);
        }
      } else {
        if (inactivityTimeout.current) {
          clearTimeout(inactivityTimeout.current);
          inactivityTimeout.current = null;
        }
      }
    };

    syncInterval.current = setInterval(() => {
      handleInactivity();
      
      const state = usePlayerStore.getState();
      if (!state.currentTrack) return;
      
      channelRef.current?.send({
        type: 'broadcast',
        event: 'sync_playback',
        payload: {
          track: state.currentTrack,
          isPlaying: state.isPlaying,
          time: (state.progress || 0) * (state.duration || 0)
        }
      });
    }, 2000);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
    };
  }, [status, hostId, user?.id]);
  
  const broadcastTransferHost = (newHostId: string) => {
    if (user?.id !== hostId) return;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'transfer_host',
      payload: { newHostId }
    });
    transferHost(newHostId);
  };
  
  const broadcastCloseRoom = () => {
    if (user?.id !== hostId) return;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'close_room'
    });
    reset();
  };

  return { broadcastTransferHost, broadcastCloseRoom };
}
