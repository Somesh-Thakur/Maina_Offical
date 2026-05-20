'use client';
import React from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import Link from 'next/link';
import { Heart, UserCheck, Plus } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';

import { ImportPlaylistModal } from '@/components/playlist/ImportPlaylistModal';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';
import { Download } from 'lucide-react';

export default function LibraryPage() {
  const playlists = useLibraryStore(state => state.playlists);
  const likedTracks = useLibraryStore(state => state.likedTracks);
  const trackMap = useLibraryStore(state => state.trackMap);
  const followedArtists = useLibraryStore(state => state.followedArtists);
  const toggleFollowArtist = useLibraryStore(state => state.toggleFollowArtist);

  const [showCreate, setShowCreate] = React.useState(false);
  const [showImport, setShowImport] = React.useState(false);

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-7xl mx-auto flex flex-col gap-14">
      <header>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
          Your Library
        </h1>
      </header>

      {/* Liked Songs */}
      <section>
        <Link
          href="/liked"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col justify-end h-56 shadow-xl hover:scale-[1.02] transition-transform block max-w-4xl"
        >
          <div className="absolute top-8 left-8 bg-white/20 p-4 rounded-full backdrop-blur-md">
            <Heart size={32} className="text-white fill-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-display font-bold text-white mb-1">Liked Songs</h2>
            <p className="text-white/70 font-medium">{likedTracks.length} songs</p>
          </div>
        </Link>
      </section>

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
        <CreatePlaylistModal 
          onClose={() => setShowCreate(false)} 
          onSuccess={(id) => {
            setShowCreate(false);
            useLibraryStore.getState().loadLibrary();
          }} 
        />
      )}
      {showImport && (
        <ImportPlaylistModal onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
