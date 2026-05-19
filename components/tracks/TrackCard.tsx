'use client';
import React, { useRef, useState } from 'react';
import { Track } from '@/lib/db';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useContextMenu } from '@/components/ui/GlobalContextMenu';
import { TrackContextMenu } from '@/components/ui/TrackContextMenu';

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const play        = usePlayerStore(state => state.play);
  const toggleLike  = useLibraryStore(state => state.toggleLike);
  const isLiked     = useLibraryStore(state => state.isLiked(track.id));
  const { openMenu } = useContextMenu();

  // ── Long-press for context menu on mobile ─────────────────────
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const didLongPress   = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      const touch = e.touches[0];
      openMenu(
        { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} } as unknown as React.MouseEvent,
        track,
      );
    }, 500);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className="w-40 md:w-48 group relative flex flex-col gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 select-none"
      onContextMenu={(e) => openMenu(e, track)}
      onTouchStart={onTouchStart}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-square w-full rounded-md overflow-hidden shadow-md"
        onClick={() => { if (!didLongPress.current) play(track); }}
      >
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Desktop hover overlay with play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); play(track); }}
            className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
          >
            <Play size={20} className="fill-current ml-1" />
          </button>
        </div>

        {/* Mobile: always-visible play button (bottom right) */}
        <button
          className="sm:hidden absolute bottom-2 right-2 w-9 h-9 bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          onClick={(e) => { e.stopPropagation(); play(track); }}
        >
          <Play size={16} className="fill-current ml-0.5" />
        </button>
      </div>

      {/* Title + Artist */}
      <div className="flex flex-col min-w-0">
        <span className="font-display font-medium text-sm truncate text-white" title={track.title}>
          {track.title}
        </span>
        <span className="text-xs text-[#a3a3a3] truncate" title={track.artist}>
          {track.artist}
        </span>
      </div>

      {/* Action row — always visible on mobile, hover-animated on desktop */}
      <div className="flex items-center justify-between">
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
          className={`p-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${isLiked ? '!opacity-100' : ''}`}
        >
          <Heart
            size={15}
            className={isLiked ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[#a3a3a3]'}
          />
        </button>

        {/* 3-dot always visible on mobile */}
        <div
          className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <TrackContextMenu track={track} />
        </div>
      </div>
    </div>
  );
}
