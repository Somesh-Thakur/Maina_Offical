import { create } from 'zustand';

export interface VibeParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
}

interface VibeState {
  roomId: string | null;
  hostId: string | null;
  participants: VibeParticipant[];
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;

  // Actions
  setRoom: (roomId: string, hostId: string) => void;
  setStatus: (status: VibeState['status'], error?: string) => void;
  setParticipants: (participants: VibeParticipant[]) => void;
  addParticipant: (participant: VibeParticipant) => void;
  removeParticipant: (id: string) => void;
  transferHost: (newHostId: string) => void;
  reset: () => void;
}

export const useVibeStore = create<VibeState>((set) => ({
  roomId: null,
  hostId: null,
  participants: [],
  status: 'disconnected',
  error: null,

  setRoom: (roomId, hostId) => set({ roomId, hostId }),
  
  setStatus: (status, error = null) => set({ status, error }),
  
  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set((state) => {
    if (state.participants.some(p => p.id === participant.id)) return state;
    return { participants: [...state.participants, participant] };
  }),
  
  removeParticipant: (id) => set((state) => ({
    participants: state.participants.filter(p => p.id !== id)
  })),
  
  transferHost: (newHostId) => set((state) => ({
    hostId: newHostId,
    participants: state.participants.map(p => ({ ...p, isHost: p.id === newHostId }))
  })),
  
  reset: () => set({
    roomId: null,
    hostId: null,
    participants: [],
    status: 'disconnected',
    error: null
  })
}));
