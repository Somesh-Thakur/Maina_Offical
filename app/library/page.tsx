'use client';
import React from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { TrackRow } from '@/components/tracks/TrackRow';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';

export default function LibraryPage() {
  const playlists = useLibraryStore(state => state.playlists);
  const likedTracks = useLibraryStore(state => state.likedTracks);

  const trackMap = useLibraryStore(state => state.trackMap);

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-7xl mx-auto flex flex-col gap-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
          Your Library
        </h1>
      </header>

      <section>
        <h2 className="text-2xl font-display font-bold mb-6">Playlists</h2>
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
            <button 
              onClick={async () => {
                const name = await useModalStore.getState().showPrompt("Enter a name for your new playlist:", "New Playlist");
                if (name) useLibraryStore.getState().createPlaylist(name);
              }}
              className="col-span-full text-[#a3a3a3] py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Create a playlist to get started.
            </button>
          )}
        </div>
      </section>

      <section>
        <Link href="/liked" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col justify-end h-64 shadow-xl hover:scale-[1.02] transition-transform block max-w-4xl">
          <div className="absolute top-8 left-8 bg-white/20 p-4 rounded-full backdrop-blur-md">
            <Heart size={32} className="text-white fill-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-display font-bold text-white mb-2">Liked Songs</h2>
            <p className="text-white/80 font-medium">{likedTracks.length} liked songs</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
