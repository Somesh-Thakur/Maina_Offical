'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, ListMusic, UserPlus, Link2, Check, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { Track } from '@/lib/db';

interface SharedPlaylist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  owner: { username: string; display_name: string; avatar_url?: string };
  collaborators: { username: string; display_name: string; avatar_url?: string }[];
  tracks: Track[];
}

export default function SharePlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<SharedPlaylist | null>(null);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const { play, setQueue } = usePlayerStore();

  useEffect(() => {
    fetch(`/api/share/playlist/${id}`)
      .then(r => r.json())
      .then(d => setPlaylist(d.playlist ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const playAll = () => {
    if (!playlist?.tracks.length) return;
    play(playlist.tracks[0]);
    setQueue(playlist.tracks.slice(1));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!playlist) return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4 text-white/60">
      <Music2 size={48} className="opacity-30" />
      <p className="text-lg font-medium">Playlist not found or is private</p>
      <button onClick={() => router.push('/')} className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white text-sm">
        Go to Maina
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/20 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="w-40 h-40 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
            {playlist.cover_url
              ? <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
              : <ListMusic size={56} className="text-white/30" />
            }
          </div>
          <h1 className="text-3xl font-black tracking-tight">{playlist.name}</h1>
          {playlist.description && <p className="text-white/50 max-w-sm">{playlist.description}</p>}

          {/* Owner + Collaborators */}
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span>by <span className="text-white font-medium">{playlist.owner.display_name || playlist.owner.username}</span></span>
            {playlist.collaborators.length > 0 && (
              <>
                <span>·</span>
                <div className="flex -space-x-2">
                  {playlist.collaborators.slice(0, 5).map(c => (
                    <div key={c.username} title={c.display_name} className="w-6 h-6 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                      {c.avatar_url
                        ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-[9px] font-bold">{c.display_name?.[0]}</span>
                      }
                    </div>
                  ))}
                </div>
                <span>{playlist.collaborators.length} collaborator{playlist.collaborators.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={playAll}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" /> Play All
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-medium transition-all"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Link2 size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-medium transition-all"
            >
              <UserPlus size={18} /> Open in Maina
            </button>
          </div>
        </motion.div>

        {/* Track list */}
        <div className="flex flex-col gap-2">
          {playlist.tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
              onClick={() => { play(track); setQueue(playlist.tracks.slice(i).slice(1)); }}
            >
              <span className="w-6 text-center text-sm text-white/30 group-hover:hidden">{i + 1}</span>
              <Play size={14} className="hidden group-hover:block text-white/60 shrink-0" fill="currentColor" />
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5">
                {track.thumbnail && <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{track.title}</p>
                <p className="text-white/40 text-xs truncate">{track.artist}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
