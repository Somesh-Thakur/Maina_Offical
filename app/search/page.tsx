'use client';
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2, Users, Music, UserPlus, UserCheck } from 'lucide-react';
import { TrackRow } from '@/components/tracks/TrackRow';
import { Track } from '@/lib/db';
import { searchVideos, searchChannels } from '@/lib/youtube';
import { useLibraryStore } from '@/store/libraryStore';
import { useRouter } from 'next/navigation';
import { useSpeedPlayStore } from '@/store/speedPlayStore';
import { Zap } from 'lucide-react';

interface Channel {
  channelId: string;
  name: string;
  thumbnail: string;
  description: string;
}

type Tab = 'songs' | 'artists';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('songs');
  const [songResults, setSongResults] = useState<Track[]>([]);
  const [artistResults, setArtistResults] = useState<Channel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const toggleFollowArtist = useLibraryStore(state => state.toggleFollowArtist);
  const isFollowed = useLibraryStore(state => state.isFollowed);
  const followedArtists = useLibraryStore(state => state.followedArtists);

  const { pinArtist, unpinArtist, isArtistPinned } = useSpeedPlayStore();

  useEffect(() => {
    if (!query.trim()) {
      setSongResults([]);
      setArtistResults([]);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError('');
      try {
        if (tab === 'songs') {
          const tracks = await searchVideos(query);
          setSongResults(tracks);
        } else {
          const data = await searchChannels(query, 12);
          const channels: Channel[] = (data.items || []).map((item: any) => ({
            channelId: item.id.channelId || item.snippet.channelId,
            name: item.snippet.channelTitle || item.snippet.title,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
            description: item.snippet.description || '',
          }));
          setArtistResults(channels);
        }
      } catch (err: any) {
        setError(err.message || 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, tab]);

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-[#a3a3a3]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'songs' ? 'Search songs, albums...' : 'Search artists...'}
          className="w-full bg-[#1c1c1c] text-white border border-[rgba(255,255,255,0.1)] rounded-full py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[#252525] transition-colors text-lg font-medium shadow-lg"
          autoFocus
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-[#a3a3a3] animate-spin" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('songs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            tab === 'songs'
              ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Music size={15} />
          Songs
        </button>
        <button
          onClick={() => setTab('artists')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            tab === 'artists'
              ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Users size={15} />
          Artists
        </button>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-2">
        {error ? (
          <div className="text-red-400 p-4 bg-red-400/10 rounded-md">{error}</div>
        ) : tab === 'songs' ? (
          songResults.length > 0 ? (
            songResults.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} />
            ))
          ) : query.trim() && !isSearching ? (
            <div className="text-center py-20 text-[#a3a3a3]">No results found for "{query}"</div>
          ) : null
        ) : (
          // Artist Results
          artistResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {artistResults.map(artist => {
                const followed = isFollowed(artist.channelId);
                const pinned = isArtistPinned(artist.channelId);
                return (
                  <div
                    key={artist.channelId}
                    className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 rounded-2xl p-4 flex flex-col gap-4 transition-all cursor-pointer"
                    onClick={() => router.push(`/artist/${artist.channelId}`)}
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <img
                        src={artist.thumbnail}
                        alt={artist.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white truncate">{artist.name}</span>
                        <span className="text-xs text-white/40">Artist</span>
                      </div>
                    </div>

                    {/* Description */}
                    {artist.description && (
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{artist.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleFollowArtist(artist.channelId, artist.name, artist.thumbnail)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                          followed
                            ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                            : 'bg-white/5 hover:bg-white/10 text-white/70'
                        }`}
                      >
                        {followed ? <UserCheck size={15} /> : <UserPlus size={15} />}
                        {followed ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={() => pinned
                          ? unpinArtist(artist.channelId)
                          : pinArtist({ channelId: artist.channelId, name: artist.name, thumbnail: artist.thumbnail })
                        }
                        className={`w-10 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
                          pinned ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-white/5 hover:bg-white/10 text-white/50'
                        }`}
                        title={pinned ? 'Unpin from Speed Play' : 'Pin to Speed Play'}
                      >
                        <Zap size={15} className={pinned ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : query.trim() && !isSearching ? (
            <div className="text-center py-20 text-[#a3a3a3]">No artists found for "{query}"</div>
          ) : !query.trim() ? (
            <div className="text-center py-20 text-[#a3a3a3]">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-1">Search for Artists</p>
              <p className="text-sm opacity-60">Find your favourite artists, follow them, and pin them to Speed Play</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
