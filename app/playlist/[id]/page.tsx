'use client';
import React, { useMemo, useState } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { TrackRow } from '@/components/tracks/TrackRow';
import { PlaylistCoverCollage } from '@/components/playlists/PlaylistCoverCollage';
import { Play, MoreHorizontal, Clock, Edit2, Trash2, Users, Link2, Check } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/modalStore';
import { useUserStore } from '@/store/userStore';
import { InviteModal } from '@/components/playlist/InviteModal';

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);

  const playlists = useLibraryStore(state => state.playlists);
  const trackMap  = useLibraryStore(state => state.trackMap);
  const playlist  = useMemo(() => playlists.find(p => p.id === resolvedParams.id), [playlists, resolvedParams.id]);

  const playlistTracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.tracks.map(id => trackMap[id]).filter(Boolean);
  }, [playlist, trackMap]);

  const play     = usePlayerStore(state => state.play);
  const setQueue = usePlayerStore(state => state.setQueue);
  const router   = useRouter();
  const { user } = useUserStore();

  const [showMenu, setShowMenu]     = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const deletePlaylist = useLibraryStore(state => state.deletePlaylist);
  const renamePlaylist = useLibraryStore(state => state.renamePlaylist);

  if (!playlist) {
    return <div className="p-10 text-center text-[#a3a3a3]">Loading playlist...</div>;
  }

  const handleDelete = async () => {
    const confirmed = await useModalStore.getState().showConfirm('Are you sure you want to delete this playlist?');
    if (confirmed) {
      await deletePlaylist(playlist.id);
      router.push('/library');
    }
  };

  const handleRename = async () => {
    const newName = await useModalStore.getState().showPrompt('Enter new playlist name:', playlist.name);
    if (newName && newName.trim()) {
      await renamePlaylist(playlist.id, newName.trim());
      setShowMenu(false);
    }
  };

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) {
      play(playlistTracks[0]);
      setQueue(playlistTracks.slice(1));
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/share/playlist/${playlist.id}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);
  const formatDurationStr = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} hr ${m} min`;
    return `${m} min`;
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-10 pt-24 md:pt-20 bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a]">
        <div className="w-48 h-48 md:w-60 md:h-60 shrink-0 shadow-2xl">
          <PlaylistCoverCollage thumbnails={playlistTracks.map(t => t.thumbnail)} className="rounded-xl" />
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-semibold tracking-widest uppercase mb-2">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tighter">
            {playlist.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
            <span className="font-medium text-white">You</span>
            <span>•</span>
            <span>{playlistTracks.length} songs</span>
            <span>•</span>
            <span>{formatDurationStr(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-4 p-6 md:px-10 flex-wrap">
        <button
          onClick={handlePlayAll}
          disabled={playlistTracks.length === 0}
          className="w-14 h-14 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl disabled:opacity-50 disabled:pointer-events-none"
        >
          <Play size={28} className="fill-current ml-1" />
        </button>

        {/* Share playlist link */}
        <button
          onClick={handleShareLink}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all active:scale-95"
        >
          {shareCopied ? <Check size={15} className="text-green-400" /> : <Link2 size={15} />}
          {shareCopied ? 'Link copied!' : 'Share Playlist'}
        </button>

        {/* Invite collaborators (owner only) */}
        {user && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium transition-all active:scale-95"
          >
            <Users size={15} /> Invite Collaborators
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[#a3a3a3] hover:text-white transition-colors"
          >
            <MoreHorizontal size={32} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute left-0 top-full mt-2 w-48 bg-[#1c1c1c] border border-white/10 rounded-lg shadow-2xl py-1 z-50">
                <button
                  onClick={handleRename}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2 text-red-400"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-10">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-2 text-xs font-semibold tracking-wider text-[#a3a3a3] uppercase border-b border-[rgba(255,255,255,0.06)] mb-2">
          <div className="w-6 text-center">#</div>
          <div>Title</div>
          <div className="w-12 text-right pr-4"><Clock size={16} className="inline" /></div>
        </div>

        <div className="flex flex-col gap-1 max-w-5xl">
          {playlistTracks.map((track, idx) => (
            <TrackRow key={track.id + idx} track={track} index={idx} playlistId={playlist.id} />
          ))}
          {playlistTracks.length === 0 && (
            <div className="text-center py-20 text-[#a3a3a3]">
              This playlist is empty. Let's find some songs for it!
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <InviteModal
          playlistId={playlist.id}
          playlistName={playlist.name}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
