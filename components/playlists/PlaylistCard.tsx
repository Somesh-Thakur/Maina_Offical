'use client';
import React from 'react';
import { PlaylistCoverCollage } from './PlaylistCoverCollage';
import { Play } from 'lucide-react';
import Link from 'next/link';

interface PlaylistCardProps {
  id: string;
  name: string;
  trackCount: number;
  thumbnails: string[];
}

export function PlaylistCard({ id, name, trackCount, thumbnails }: PlaylistCardProps) {
  return (
    <Link 
      href={`/playlist/${id}`}
      className="w-40 md:w-48 group flex flex-col gap-3 p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-full aspect-square">
        <PlaylistCoverCollage thumbnails={thumbnails} />
        
        {/* Play Button Overlay */}
        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[10px] group-hover:translate-y-0">
          <button 
            className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              // In real app, play the playlist
            }}
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
  );
}
