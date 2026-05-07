import Dexie, { type EntityTable } from 'dexie';

export interface Track {
  id: string; // YouTube video ID
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // seconds
  addedAt: number; // timestamp
}

export interface Playlist {
  id: string; // uuid
  name: string;
  tracks: string[]; // array of Track IDs
  createdAt: number;
  updatedAt: number;
  coverOverride?: string;
}

export interface LikedSong {
  trackId: string;
  likedAt: number;
}

export interface HistoryEntry {
  id?: number; // auto-increment primary key
  trackId: string;
  playedAt: number;
}

export interface FollowedArtist {
  channelId: string;
  name: string;
  thumbnail: string;
  followedAt: number;
}

const db = new Dexie('MainaDatabase') as Dexie & {
  tracks: EntityTable<Track, 'id'>;
  playlists: EntityTable<Playlist, 'id'>;
  likedSongs: EntityTable<LikedSong, 'trackId'>;
  history: EntityTable<HistoryEntry, 'id'>;
  followedArtists: EntityTable<FollowedArtist, 'channelId'>;
};

// Schema declaration
db.version(1).stores({
  tracks: 'id, title, artist, addedAt',
  playlists: 'id, name, createdAt, updatedAt',
  likedSongs: 'trackId, likedAt',
  history: '++id, trackId, playedAt',
  followedArtists: 'channelId, name, followedAt'
});

export default db;
