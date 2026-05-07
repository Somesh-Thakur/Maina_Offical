'use client';
import React from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { TrackRow } from '@/components/tracks/TrackRow';
import { Play, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export default function LikedSongsPage() {
  const likedTracks = useLibraryStore(state => state.likedTracks);
  const play = usePlayerStore(state => state.play);
  const setQueue = usePlayerStore(state => state.setQueue);

  const handlePlayAll = () => {
    if (likedTracks.length > 0) {
      play(likedTracks[0]);
      setQueue(likedTracks.slice(1));
    }
  };

  const totalDuration = likedTracks.reduce((acc, t) => acc + t.duration, 0);
  const formatDurationStr = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} hr ${m} min`;
    return `${m} min`;
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-10 pt-24 md:pt-20 bg-gradient-to-b from-blue-900/40 to-transparent">
        <div className="w-48 h-48 md:w-60 md:h-60 shrink-0 shadow-2xl rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Heart size={64} className="text-white fill-white" />
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold tracking-widest uppercase mb-2">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tighter">
            Liked Songs
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
            <span className="font-medium text-white">You</span>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
            <span>•</span>
            <span>{formatDurationStr(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 p-6 md:px-10">
        <button 
          onClick={handlePlayAll}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl disabled:opacity-50 disabled:pointer-events-none"
        >
          <Play size={28} className="fill-current ml-1" />
        </button>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-10">
        <div className="flex flex-col gap-1 max-w-5xl">
          {likedTracks.map((track, idx) => (
            <TrackRow key={track.id + idx} track={track} index={idx} />
          ))}
          {likedTracks.length === 0 && (
            <div className="text-center py-20 text-[#a3a3a3]">
              Songs you like will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
