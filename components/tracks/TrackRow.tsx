'use client';
import React, { useRef } from 'react';
import { Track } from '@/lib/db';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useContextMenu } from '@/components/ui/GlobalContextMenu';
import { TrackContextMenu } from '@/components/ui/TrackContextMenu';

interface TrackRowProps {
  track: Track;
  index: number;
  playlistId?: string;
}

export function TrackRow({ track, index, playlistId }: TrackRowProps) {
  const play           = usePlayerStore(state => state.play);
  const currentTrack   = usePlayerStore(state => state.currentTrack);
  const isPlaying      = usePlayerStore(state => state.isPlaying);
  const toggleLike     = useLibraryStore(state => state.toggleLike);
  const isLiked        = useLibraryStore(state => state.isLiked(track.id));
  const { openMenu }   = useContextMenu();

  const isCurrentTrack = currentTrack?.id === track.id;

  // ── Long-press to open context menu on mobile ─────────────────
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const didLongPress   = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      // Synthesize a fake MouseEvent so openMenu gets coordinates
      const touch = e.touches[0];
      openMenu(
        { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} } as unknown as React.MouseEvent,
        track,
        playlistId,
      );
    }, 500);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative select-none
        ${isCurrentTrack
          ? 'bg-[var(--accent)]/10 border-l-2 border-[var(--accent)]'
          : 'bg-transparent hover:bg-white/5 border-l-2 border-transparent'
        }
      `}
      /* Desktop: double-click to play; Mobile: single-tap (via onClick on info area) */
      onDoubleClick={() => play(track)}
      onContextMenu={(e) => openMenu(e, track, playlistId)}
      /* Long press for mobile context menu */
      onTouchStart={onTouchStart}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
    >
      {/* Number / Playing indicator */}
      <div className="w-6 text-center shrink-0 hidden sm:block">
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
          onClick={(e) => { e.stopPropagation(); play(track); }}
          className="hidden group-hover:flex w-full items-center justify-center text-white"
        >
          <Play size={16} className="fill-current" />
        </button>
      </div>

      {/* Thumbnail + Info — tap on mobile to play */}
      <button
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={() => { if (!didLongPress.current) play(track); }}
        onTouchEnd={(e) => {
          clearLongPress();
          // If we did a long press, don't play
          if (didLongPress.current) e.preventDefault();
        }}
      >
        <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded object-cover shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className={`font-medium text-sm truncate ${isCurrentTrack ? 'text-[var(--accent)]' : 'text-white'}`}>
            {track.title}
          </span>
          <span className="text-xs text-[#a3a3a3] truncate">{track.artist}</span>
        </div>
      </button>

      {/* Actions — always visible on mobile, hover-only on desktop */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Like button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
          className={`
            p-1.5 transition-opacity
            sm:opacity-0 sm:group-hover:opacity-100
            ${isLiked ? '!opacity-100' : ''}
          `}
        >
          <Heart
            size={15}
            className={isLiked ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[#a3a3a3]'}
          />
        </button>

        {/* Duration — desktop only */}
        <span className="text-sm font-mono text-[#a3a3a3] w-10 text-right hidden sm:block">
          {formatTime(track.duration)}
        </span>

        {/* 3-dot — always visible on mobile, hover-only on desktop */}
        <div
          className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <TrackContextMenu track={track} playlistId={playlistId} />
        </div>
      </div>
    </div>
  );
}
