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
      
      // Sort liked songs by date descending
      const likedTracks = likedSongs
        .sort((a, b) => b.likedAt - a.likedAt)
        .map(s => trackMap[s.trackId])
        .filter(Boolean);

      set({ playlists, likedSongs, followedArtists, trackMap, likedTracks });

      // Background Cloud Sync (Likes only for now)
      fetch('/api/library/likes').then(r => r.json()).then(async data => {
        if (!data.tracks) return;
        
        let shouldUpdate = false;
        const currentLikes = await db.likedSongs.toArray();
        const serverLikes = new Set(data.likes?.map((l: any) => l.track_id) || []);
        
        // Add new likes
        for (const track of data.tracks) {
          if (!currentLikes.find(l => l.trackId === track.id)) {
            await db.tracks.put(track);
            await db.likedSongs.put({ trackId: track.id, likedAt: Date.now() });
            shouldUpdate = true;
          }
        }
        if (shouldUpdate) get().loadLibrary();
      }).catch(console.error);

      // Background Cloud Sync (Playlists)
      fetch('/api/playlists').then(r => r.json()).then(async data => {
        if (!data.playlists) return;
        
        let shouldUpdate = false;
        
        // Put tracks first
        if (data.tracks && data.tracks.length > 0) {
          for (const track of data.tracks) {
            await db.tracks.put(track);
          }
        }
        
        // Put playlists
        for (const cloudPlaylist of data.playlists) {
          const existing = await db.playlists.get(cloudPlaylist.id);
          if (!existing || existing.updatedAt < cloudPlaylist.updatedAt) {
            await db.playlists.put(cloudPlaylist);
            shouldUpdate = true;
          }
        }
        
        if (shouldUpdate) get().loadLibrary();
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  },

  toggleLike: async (track: Track) => {
    const isLiked = get().isLiked(track.id);
    try {
      if (isLiked) {
        await db.likedSongs.delete(track.id);
        // Cloud Sync
        fetch('/api/library/likes', { method: 'DELETE', body: JSON.stringify({ trackId: track.id }) }).catch(console.error);
      } else {
        await db.tracks.put(track);
        await db.likedSongs.put({ trackId: track.id, likedAt: Date.now() });
        // Cloud Sync
        fetch('/api/library/likes', { method: 'POST', body: JSON.stringify({ track }) }).catch(console.error);
      }
      await get().loadLibrary(); // Reload to update state
    } catch (e) {
      console.error("Failed to toggle like", e);
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
    // Cloud sync
    fetch(`/api/playlists/${id}`, { method: 'DELETE' }).catch(console.error);
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
