'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Plus, Trash2, ListPlus } from 'lucide-react';
import { Track } from '@/lib/db';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { PlaylistSelectionModal } from './PlaylistSelectionModal';

interface TrackContextMenuProps {
  track: Track;
  playlistId?: string; // If provided, shows "Remove from playlist"
}

export function TrackContextMenu({ track, playlistId }: TrackContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const removeTrackFromPlaylist = useLibraryStore(state => state.removeTrackFromPlaylist);
  const addToQueue = usePlayerStore(state => state.addToQueue);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemove = () => {
    if (playlistId) {
      removeTrackFromPlaylist(playlistId, track.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-[#a3a3a3] hover:text-white transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#1c1c1c] border border-white/10 rounded-lg shadow-2xl py-1 z-[100]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setShowModal(true);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add to Playlist</span>
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              addToQueue(track);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
          >
            <ListPlus size={16} />
            <span>Add to Queue</span>
          </button>
          
          {playlistId && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2 text-red-400"
            >
              <Trash2 size={16} />
              <span>Remove</span>
            </button>
          )}
        </div>
      )}

      {showModal && (
        <PlaylistSelectionModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          track={track} 
        />
      )}
    </div>
  );
}
