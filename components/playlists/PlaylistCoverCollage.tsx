'use client';
import React from 'react';
import { Music } from 'lucide-react';

interface PlaylistCoverCollageProps {
  thumbnails: string[];
  className?: string;
}

export function PlaylistCoverCollage({ thumbnails, className = '' }: PlaylistCoverCollageProps) {
  // We need exactly 4 images for a 2x2 grid, or just 1 if we have less than 4
  const validThumbnails = thumbnails.slice(0, 4);

  return (
    <div className={`aspect-square w-full rounded-md overflow-hidden bg-[#1c1c1c] shadow-md flex items-center justify-center ${className}`}>
      {validThumbnails.length >= 4 ? (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2">
          {validThumbnails.map((src, i) => (
            <img key={i} src={src} alt="Cover" className="w-full h-full object-cover" />
          ))}
        </div>
      ) : validThumbnails.length > 0 ? (
        <img src={validThumbnails[0]} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-[#0a0a0a] flex items-center justify-center">
          <Music size={32} className="text-white/30" />
        </div>
      )}
    </div>
  );
}
