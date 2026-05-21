'use client';
import React from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import Link from 'next/link';
import { Heart, UserCheck, Plus } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';

import { ImportPlaylistModal } from '@/components/playlist/ImportPlaylistModal';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import { Download, Radio } from 'lucide-react';
import { useVibeStore } from '@/store/vibeStore';
import { useUserStore } from '@/store/userStore';

export default function LibraryPage() {
  const playlists = useLibraryStore(state => state.playlists);
  const likedTracks = useLibraryStore(state => state.likedTracks);
  const trackMap = useLibraryStore(state => state.trackMap);
  const followedArtists = useLibraryStore(state => state.followedArtists);
  const toggleFollowArtist = useLibraryStore(state => state.toggleFollowArtist);

  const [showCreate, setShowCreate] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);
  const [showVibe, setShowVibe] = React.useState(false);

  // Auto-open vibe lobby if join link used
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vibeCode = urlParams.get('vibe');
    if (vibeCode) {
      if (!useVibeStore.getState().roomId) {
        useVibeStore.getState().setRoom(vibeCode, ''); // Guest mode until host syncs
      }
      setShowVibe(true);
      // Clean URL
      window.history.replaceState({}, '', '/library');
    }
  }, []);

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-7xl mx-auto flex flex-col gap-14">
      <header>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
          Your Library
        </h1>
      </header>

      {/* Library Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Link
          href="/liked"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col justify-end h-56 shadow-xl hover:scale-[1.02] transition-transform"
        >
          <div className="absolute top-8 left-8 bg-white/20 p-4 rounded-full backdrop-blur-md">
            <Heart size={32} className="text-white fill-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-white mb-1">Liked Songs</h2>
            <p className="text-white/70 font-medium">{likedTracks.length} songs</p>
          </div>
        </Link>
        
        <button
          onClick={() => setShowVibe(true)}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 flex flex-col justify-end h-56 shadow-xl hover:scale-[1.02] transition-transform text-left"
        >
          <div className="absolute top-8 left-8 bg-white/20 p-4 rounded-full backdrop-blur-md">
            <Radio size={32} className="text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-white mb-1 flex items-center gap-2">
              Vibe Together
            </h2>
            <p className="text-white/70 font-medium">Listen with friends in real-time</p>
          </div>
        </button>
      </section>

      {/* Host or Join Modal */}
      {showVibe && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 p-6 rounded-2xl max-w-md w-full flex flex-col gap-6 relative">
            <button onClick={() => setShowVibe(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <Plus size={20} className="rotate-45" />
            </button>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                <Radio size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Vibe Together</h2>
              <p className="text-sm text-white/60">Listen to music in sync with your friends.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowVibe(false);
                  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                  useVibeStore.getState().setRoom(code, useUserStore.getState().user?.id || 'guest');
                  const { usePlayerStore } = require('@/store/playerStore');
                  usePlayerStore.getState().toggleVibePanel();
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
              >
                Start a New Session
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-white/40 text-sm">or join existing</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                let code = fd.get('code') as string;
                if (!code) return;
                
                // Parse URL if pasted
                if (code.includes('?vibe=')) {
                  code = new URL(code).searchParams.get('vibe') || code;
                }
                
                setShowVibe(false);
                useVibeStore.getState().setRoom(code.toUpperCase(), '');
                const { usePlayerStore } = require('@/store/playerStore');
                usePlayerStore.getState().toggleVibePanel();
              }} className="flex gap-2">
                <input 
                  type="text" 
                  name="code" 
                  placeholder="Enter Code or Link" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors uppercase"
                  required
                />
                <button type="submit" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Playlists */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Playlists</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-2 text-sm font-semibold text-black bg-white hover:bg-white/90 px-4 py-2 rounded-full transition-colors"
            >
              <Download size={15} />
              Import Playlist
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors"
            >
              <Plus size={15} />
              New Playlist
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              id={playlist.id}
              name={playlist.name}
              trackCount={playlist.tracks.length}
              thumbnails={playlist.tracks.map(id => trackMap[id]?.thumbnail).filter(Boolean)}
            />
          ))}
          {playlists.length === 0 && (
            <div className="col-span-full text-center py-12 text-white/30 text-sm">
              No playlists yet. Create one above!
            </div>
          )}
        </div>
      </section>

      {/* Followed Artists */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-6">Following</h2>
        {followedArtists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/30 gap-3">
            <UserCheck size={40} className="opacity-20" />
            <p className="text-sm">You're not following any artists yet.</p>
            <p className="text-xs opacity-70">Search for artists and hit Follow.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {followedArtists.map(artist => (
              <div key={artist.channelId} className="group flex flex-col gap-3 items-center relative">
                <Link
                  href={`/artist/${artist.channelId}`}
                  className="flex flex-col gap-3 items-center w-full"
                >
                  <div className="relative w-full aspect-square">
                    <img
                      src={artist.thumbnail}
                      alt={artist.name}
                      className="w-full h-full rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[var(--accent)] transition-all"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <UserCheck size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="text-center w-full px-1">
                    <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
                    <p className="text-xs text-white/40">Artist</p>
                  </div>
                </Link>
                {/* Unfollow button */}
                <button
                  onClick={() => toggleFollowArtist(artist.channelId, artist.name, artist.thumbnail)}
                  className="text-[11px] font-semibold text-white/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showCreate && (
        <CreatePlaylistModal onClose={() => setShowCreate(false)} onSuccess={() => setShowCreate(false)} />
      )}
      {showImport && (
        <ImportPlaylistModal onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
