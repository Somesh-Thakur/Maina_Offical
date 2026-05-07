'use client';
import React from 'react';
import { Track } from '@/lib/db';
import { Play, Plus, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { PlaylistSelectionModal } from '@/components/ui/PlaylistSelectionModal';
import { useState } from 'react';

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const play = usePlayerStore(state => state.play);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const toggleLike = useLibraryStore(state => state.toggleLike);
  const isLiked = useLibraryStore(state => state.isLiked(track.id));
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="w-40 md:w-48 group relative flex flex-col gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300">
      <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-md">
        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button 
            onClick={() => play(track)}
            className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
          >
            <Play size={20} className="fill-current ml-1" />
          </button>
        </div>
        
        {/* Quick Add Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
          <button 
            onClick={() => toggleLike(track)}
            className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <Heart size={14} className={isLiked ? 'fill-[var(--accent)] text-[var(--accent)]' : ''} />
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="font-display font-medium text-sm truncate text-white" title={track.title}>{track.title}</span>
        <span className="text-xs text-[#a3a3a3] truncate" title={track.artist}>{track.artist}</span>
      </div>
      </div>
      <PlaylistSelectionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} track={track} />
    </>
  );
}
