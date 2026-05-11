'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PlaylistCoverCollage } from './PlaylistCoverCollage';
import { Play, MoreHorizontal, Zap, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSpeedPlayStore } from '@/store/speedPlayStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useModalStore } from '@/store/modalStore';

interface PlaylistCardProps {
  id: string;
  name: string;
  trackCount: number;
  thumbnails: string[];
}

export function PlaylistCard({ id, name, trackCount, thumbnails }: PlaylistCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { pinPlaylist, unpinPlaylist, isPlaylistPinned } = useSpeedPlayStore();
  const deletePlaylist = useLibraryStore(state => state.deletePlaylist);
  const isPinned = isPlaylistPinned(id);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    const confirmed = await useModalStore.getState().showConfirm(`Delete "${name}"?`);
    if (confirmed) deletePlaylist(id);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    if (isPinned) {
      unpinPlaylist(id);
    } else {
      pinPlaylist({ id, name, thumbnails, trackCount });
    }
  };

  return (
    <div className="relative group">
      <Link
        href={`/playlist/${id}`}
        className="w-40 md:w-48 flex flex-col gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer block"
      >
        <div className="relative w-full aspect-square">
          <PlaylistCoverCollage thumbnails={thumbnails} />

          {/* Play Button Overlay */}
          <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[10px] group-hover:translate-y-0">
            <button
              className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
              onClick={(e) => e.preventDefault()}
            >
              <Play size={20} className="fill-current ml-1" />
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-display font-medium text-sm truncate text-white">{name}</span>
          <span className="text-xs text-[#a3a3a3]">{trackCount} tracks</span>
        </div>
      </Link>

      {/* 3-dot menu */}
      <div className="absolute top-2 right-2" ref={menuRef}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v); }}
          className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white"
        >
          <MoreHorizontal size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 w-48 bg-[#1c1c1c] border border-white/10 rounded-lg shadow-2xl py-1 z-[200]">
            <button
              onClick={handlePin}
              className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
            >
              <Zap size={14} className={isPinned ? 'fill-[var(--accent)] text-[var(--accent)]' : ''} />
              <span>{isPinned ? 'Unpin from Speed Play' : 'Pin to Speed Play'}</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2 text-red-400"
            >
              <Trash2 size={14} />
              <span>Delete Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
