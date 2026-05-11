'use client';
import React, { useState, useEffect } from 'react';
import { TrackRow } from '@/components/tracks/TrackRow';
import { getChannelDetails, searchVideos } from '@/lib/youtube';
import { Track } from '@/lib/db';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useSpeedPlayStore } from '@/store/speedPlayStore';
import { Play, Shuffle, UserPlus, UserCheck, Zap } from 'lucide-react';

export default function ArtistPage({ params }: { params: Promise<{ channelId: string }> }) {
  const resolvedParams = React.use(params);

  const [artistName, setArtistName] = useState('Loading...');
  const [thumbnail, setThumbnail] = useState('');
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const play = usePlayerStore(state => state.play);
  const setQueue = usePlayerStore(state => state.setQueue);
  const toggleShuffle = usePlayerStore(state => state.toggleShuffle);

  const toggleFollowArtist = useLibraryStore(state => state.toggleFollowArtist);
  const isFollowed = useLibraryStore(state => state.isFollowed);

  const { pinArtist, unpinArtist, isArtistPinned } = useSpeedPlayStore();

  const followed = isFollowed(resolvedParams.channelId);
  const pinned = isArtistPinned(resolvedParams.channelId);

  useEffect(() => {
    async function fetchArtist() {
      try {
        const details = await getChannelDetails(resolvedParams.channelId);
        setArtistName(details.title);
        setThumbnail(details.thumbnail);
        const tracks = await searchVideos(`${details.title} official audio`, 20);
        setTopTracks(tracks);
      } catch (err) {
        console.error(err);
        setArtistName('Artist not found');
      } finally {
        setIsLoading(false);
      }
    }
    fetchArtist();
  }, [resolvedParams.channelId]);

  const handlePlayAll = () => {
    if (topTracks.length === 0) return;
    play(topTracks[0]);
    setQueue(topTracks.slice(1));
  };

  const handleShuffleAll = () => {
    if (topTracks.length === 0) return;
    const shuffled = [...topTracks].sort(() => Math.random() - 0.5);
    play(shuffled[0]);
    setQueue(shuffled.slice(1));
  };

  const handleTogglePin = () => {
    if (pinned) {
      unpinArtist(resolvedParams.channelId);
    } else {
      pinArtist({ channelId: resolvedParams.channelId, name: artistName, thumbnail });
    }
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Hero */}
      <div className="relative h-72 md:h-96 flex flex-col justify-end p-6 md:p-10 overflow-hidden">
        {thumbnail && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
              style={{ backgroundImage: `url(${thumbnail})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent" />
          </>
        )}
        <div className="relative z-10 flex items-end gap-6">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={artistName}
              className="w-28 h-28 md:w-44 md:h-44 rounded-full shadow-2xl object-cover ring-4 ring-white/10 shrink-0"
            />
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Artist</span>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter truncate">
              {artistName}
            </h1>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 md:px-10 py-5 flex flex-wrap items-center gap-3 border-b border-white/5">
        <button
          onClick={handlePlayAll}
          disabled={topTracks.length === 0}
          className="flex items-center gap-2 bg-[var(--accent)] hover:brightness-110 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-40 shadow-lg shadow-[var(--accent)]/25"
        >
          <Play size={16} className="fill-current" />
          Play All
        </button>
        <button
          onClick={handleShuffleAll}
          disabled={topTracks.length === 0}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-40"
        >
          <Shuffle size={16} />
          Shuffle
        </button>
        <button
          onClick={() => toggleFollowArtist(resolvedParams.channelId, artistName, thumbnail)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
            followed
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
              : 'border-white/20 text-white/70 hover:bg-white/5'
          }`}
        >
          {followed ? <UserCheck size={16} /> : <UserPlus size={16} />}
          {followed ? 'Following' : 'Follow'}
        </button>
        <button
          onClick={handleTogglePin}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
            pinned
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
              : 'border-white/20 text-white/50 hover:bg-white/5'
          }`}
          title={pinned ? 'Unpin from Speed Play' : 'Pin to Speed Play'}
        >
          <Zap size={16} className={pinned ? 'fill-current' : ''} />
          {pinned ? 'Pinned' : 'Speed Play'}
        </button>
      </div>

      {/* Track List */}
      <div className="p-6 md:p-10 flex flex-col gap-12">
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Popular</h2>
          {isLoading ? (
            <div className="animate-pulse space-y-2 max-w-4xl">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-white/5 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-w-4xl">
              {topTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
