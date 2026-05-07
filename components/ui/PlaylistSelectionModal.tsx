'use client';
import React from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { Track } from '@/lib/db';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalStore } from '@/store/modalStore';

interface PlaylistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

export function PlaylistSelectionModal({ isOpen, onClose, track }: PlaylistSelectionModalProps) {
  const playlists = useLibraryStore(state => state.playlists);
  const addTrackToPlaylist = useLibraryStore(state => state.addTrackToPlaylist);
  const createPlaylist = useLibraryStore(state => state.createPlaylist);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const name = await useModalStore.getState().showPrompt("Enter a name for your new playlist:", "New Playlist");
    if (name) {
      const newId = await createPlaylist(name);
      await addTrackToPlaylist(newId, track);
      onClose();
    }
  };

  const handleAdd = async (playlistId: string) => {
    await addTrackToPlaylist(playlistId, track);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-display font-bold">Add to Playlist</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-2 flex-1 overflow-y-auto no-scrollbar">
            <button 
              onClick={handleCreate}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors text-left"
            >
              <div className="w-12 h-12 bg-white/10 rounded-md flex items-center justify-center shrink-0">
                <Plus size={24} />
              </div>
              <span className="font-medium flex-1">New Playlist</span>
            </button>
            
            {playlists.map(playlist => {
              const inPlaylist = playlist.tracks.includes(track.id);
              return (
                <button 
                  key={playlist.id}
                  onClick={() => !inPlaylist && handleAdd(playlist.id)}
                  disabled={inPlaylist}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-xl transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-md shrink-0 flex items-center justify-center">
                    {/* Simplified cover */}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium truncate">{playlist.name}</span>
                    <span className="text-xs text-[#a3a3a3]">{playlist.tracks.length} tracks</span>
                  </div>
                  {inPlaylist && <span className="text-xs text-[var(--accent)] font-medium">Added</span>}
                </button>
              );
            })}
            {playlists.length === 0 && (
              <div className="p-8 text-center text-[#a3a3a3] text-sm">
                You don't have any playlists yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
