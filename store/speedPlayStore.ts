import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '@/lib/db';

interface PinnedArtist {
  channelId: string;
  name: string;
  thumbnail: string;
}

interface SpeedPlayState {
  pinnedTracks: Track[];
  pinnedArtists: PinnedArtist[];

  pinTrack: (track: Track) => void;
  unpinTrack: (id: string) => void;
  isTrackPinned: (id: string) => boolean;

  pinArtist: (artist: PinnedArtist) => void;
  unpinArtist: (channelId: string) => void;
  isArtistPinned: (channelId: string) => boolean;
}

export const useSpeedPlayStore = create<SpeedPlayState>()(
  persist(
    (set, get) => ({
      pinnedTracks: [],
      pinnedArtists: [],

      pinTrack: (track) => {
        if (!get().isTrackPinned(track.id)) {
          set(state => ({ pinnedTracks: [...state.pinnedTracks, track] }));
        }
      },
      unpinTrack: (id) => {
        set(state => ({ pinnedTracks: state.pinnedTracks.filter(t => t.id !== id) }));
      },
      isTrackPinned: (id) => get().pinnedTracks.some(t => t.id === id),

      pinArtist: (artist) => {
        if (!get().isArtistPinned(artist.channelId)) {
          set(state => ({ pinnedArtists: [...state.pinnedArtists, artist] }));
        }
      },
      unpinArtist: (channelId) => {
        set(state => ({ pinnedArtists: state.pinnedArtists.filter(a => a.channelId !== channelId) }));
      },
      isArtistPinned: (channelId) => get().pinnedArtists.some(a => a.channelId === channelId),
    }),
    { name: 'maina-speedplay' }
  )
);
