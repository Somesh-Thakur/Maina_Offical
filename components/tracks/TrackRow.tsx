'use client';
import React from 'react';
import { Track } from '@/lib/db';
import { Play, Plus, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { TrackContextMenu } from '@/components/ui/TrackContextMenu';

interface TrackRowProps {
  track: Track;
  index: number;
  playlistId?: string;
}

export function TrackRow({ track, index, playlistId }: TrackRowProps) {
  const play = usePlayerStore(state => state.play);
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const toggleLike = useLibraryStore(state => state.toggleLike);
  const isLiked = useLibraryStore(state => state.isLiked(track.id));

  const isCurrentTrack = currentTrack?.id === track.id;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`group flex items-center gap-4 p-2 rounded-md transition-colors relative border-l-2
        ${isCurrentTrack ? 'bg-white/5 border-[var(--accent)]' : 'bg-transparent hover:bg-white/5 border-transparent'}
      `}
      onDoubleClick={() => play(track)}
    >
      {/* Number / Play Icon */}
      <div className="w-6 text-center shrink-0">
        <span className={`text-sm ${isCurrentTrack ? 'text-[var(--accent)]' : 'text-[#a3a3a3]'} group-hover:hidden`}>
          {isCurrentTrack && isPlaying ? (
             <div className="flex items-end justify-center gap-[2px] h-3">
               <div className="w-1 bg-[var(--accent)] h-full animate-pulse" />
               <div className="w-1 bg-[var(--accent)] h-2/3 animate-pulse" style={{ animationDelay: '100ms' }} />
               <div className="w-1 bg-[var(--accent)] h-full animate-pulse" style={{ animationDelay: '200ms' }} />
             </div>
          ) : (
            index + 1
          )}
        </span>
        <button 
          onClick={() => play(track)}
          className="hidden group-hover:flex w-full items-center justify-center text-white"
        >
          <Play size={16} className="fill-current" />
        </button>
      </div>

      {/* Thumbnail & Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className={`font-medium text-sm truncate ${isCurrentTrack ? 'text-[var(--accent)]' : 'text-white'}`}>
            {track.title}
          </span>
          <span className="text-xs text-[#a3a3a3] truncate">{track.artist}</span>
        </div>
      </div>

      {/* Duration & Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <button 
          onClick={() => toggleLike(track)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity ${isLiked ? 'opacity-100' : ''}`}
        >
          <Heart size={16} className={isLiked ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[#a3a3a3] hover:text-white'} />
        </button>
        <span className="text-sm font-mono text-[#a3a3a3] w-12 text-right">
          {formatTime(track.duration)}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <TrackContextMenu track={track} playlistId={playlistId} />
        </div>
      </div>
    </div>
  );
}
