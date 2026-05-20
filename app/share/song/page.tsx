'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';
import { Track } from '@/lib/db';
import { motion } from 'framer-motion';
import { Play, Music2 } from 'lucide-react';

function ShareSongInner() {
  const params    = useSearchParams();
  const router    = useRouter();
  const play  = usePlayerStore(state => state.play);

  const id        = params.get('id') ?? '';
  const title     = params.get('title') ?? 'Unknown Track';
  const artist    = params.get('artist') ?? '';
  const thumbnail = params.get('thumbnail') ?? '';

  const track = {
    id,
    title,
    artist,
    thumbnail,
    duration: 0,
    addedAt: Date.now(),
  } as Track;

  const handlePlay = () => {
    play(track);
    router.push('/');
  };

  // Auto-play if already in the app
  useEffect(() => {
    if (id) handlePlay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative bg-white/[0.04] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl backdrop-blur-xl"
      >
        <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-white/5 mb-6 shadow-2xl">
          {thumbnail
            ? <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Music2 size={48} className="text-white/20" /></div>
          }
        </div>

        <h1 className="text-xl font-bold truncate mb-1">{title}</h1>
        <p className="text-white/50 text-sm mb-8">{artist}</p>

        <button
          onClick={handlePlay}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 active:scale-95 transition-all shadow-xl"
        >
          <Play size={22} fill="currentColor" /> Play on Maina
        </button>

        <p className="text-white/20 text-xs mt-6">Someone shared this song with you via Maina</p>
      </motion.div>
    </div>
  );
}

export default function ShareSongPage() {
  return (
    <Suspense>
      <ShareSongInner />
    </Suspense>
  );
}
