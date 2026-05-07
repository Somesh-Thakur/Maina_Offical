import { create } from 'zustand';
import db, { Playlist, LikedSong, FollowedArtist, Track } from '@/lib/db';

interface LibraryState {
  playlists: Playlist[];
  likedSongs: LikedSong[];
  followedArtists: FollowedArtist[];
  trackMap: Record<string, Track>;
  likedTracks: Track[];
  
  // Initialize from Dexie
  loadLibrary: () => Promise<void>;
  
  // Likes
  toggleLike: (track: Track) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  
  // Playlists
  createPlaylist: (name: string) => Promise<string>; // returns id
  deletePlaylist: (id: string) => Promise<void>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  
  // Artists
  toggleFollowArtist: (channelId: string, name: string, thumbnail: string) => Promise<void>;
  isFollowed: (channelId: string) => boolean;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  playlists: [],
  likedSongs: [],
  followedArtists: [],
  trackMap: {},
  likedTracks: [],

  loadLibrary: async () => {
    try {
      const [playlists, likedSongs, followedArtists, allTracks] = await Promise.all([
        db.playlists.toArray(),
        db.likedSongs.toArray(),
        db.followedArtists.toArray(),
        db.tracks.toArray()
      ]);
      
      const trackMap: Record<string, Track> = {};
      allTracks.forEach(t => { trackMap[t.id] = t; });
      
      // Sort liked songs by date descending or just map
      const likedTracks = likedSongs
        .sort((a, b) => b.likedAt - a.likedAt)
        .map(s => trackMap[s.trackId])
        .filter(Boolean);

      set({ playlists, likedSongs, followedArtists, trackMap, likedTracks });
    } catch (e) {
      console.error("Failed to load library", e);
    }
  },

  toggleLike: async (track) => {
    const { likedSongs, trackMap, likedTracks } = get();
    const existingLike = likedSongs.find(s => s.trackId === track.id);
    
    if (existingLike) {
      await db.likedSongs.delete(track.id);
      set({ 
        likedSongs: likedSongs.filter(s => s.trackId !== track.id),
        likedTracks: likedTracks.filter(t => t.id !== track.id)
      });
    } else {
      await db.tracks.put(track);
      const newLike: LikedSong = { trackId: track.id, likedAt: Date.now() };
      await db.likedSongs.put(newLike);
      
      set({ 
        likedSongs: [...likedSongs, newLike],
        trackMap: { ...trackMap, [track.id]: track },
        likedTracks: [track, ...likedTracks]
      });
    }
  },

  isLiked: (trackId) => {
    return get().likedSongs.some(s => s.trackId === trackId);
  },

  createPlaylist: async (name) => {
    const id = crypto.randomUUID();
    const newPlaylist: Playlist = {
      id,
      name,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.playlists.put(newPlaylist);
    set(state => ({ playlists: [...state.playlists, newPlaylist] }));
    return id;
  },

  deletePlaylist: async (id) => {
    await db.playlists.delete(id);
    set(state => ({ playlists: state.playlists.filter(p => p.id !== id) }));
  },

  renamePlaylist: async (id, name) => {
    await db.playlists.update(id, { name, updatedAt: Date.now() });
    set(state => ({
      playlists: state.playlists.map(p => p.id === id ? { ...p, name, updatedAt: Date.now() } : p)
    }));
  },

  addTrackToPlaylist: async (playlistId, track) => {
    await db.tracks.put(track);
    
    const playlist = get().playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    if (!playlist.tracks.includes(track.id)) {
      const newTracks = [...playlist.tracks, track.id];
      await db.playlists.update(playlistId, { tracks: newTracks, updatedAt: Date.now() });
      
      set(state => ({
        playlists: state.playlists.map(p => p.id === playlistId ? { ...p, tracks: newTracks, updatedAt: Date.now() } : p)
      }));
    }
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    const playlist = get().playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    const newTracks = playlist.tracks.filter(id => id !== trackId);
    await db.playlists.update(playlistId, { tracks: newTracks, updatedAt: Date.now() });
    
    set(state => ({
      playlists: state.playlists.map(p => p.id === playlistId ? { ...p, tracks: newTracks, updatedAt: Date.now() } : p)
    }));
  },

  toggleFollowArtist: async (channelId, name, thumbnail) => {
    const { followedArtists } = get();
    const existing = followedArtists.find(a => a.channelId === channelId);
    
    if (existing) {
      await db.followedArtists.delete(channelId);
      set({ followedArtists: followedArtists.filter(a => a.channelId !== channelId) });
    } else {
      const newFollow: FollowedArtist = { channelId, name, thumbnail, followedAt: Date.now() };
      await db.followedArtists.put(newFollow);
      set({ followedArtists: [...followedArtists, newFollow] });
    }
  },

  isFollowed: (channelId) => {
    return get().followedArtists.some(a => a.channelId === channelId);
  }
}));
