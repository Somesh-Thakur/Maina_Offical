'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pin, Music, User, Zap } from 'lucide-react';
import { useSpeedPlayStore } from '@/store/speedPlayStore';
import { usePlayerStore } from '@/store/playerStore';

export function SpeedPlayBar() {
  const { pinnedTracks, pinnedArtists, unpinTrack, unpinArtist } = useSpeedPlayStore();
  const play = usePlayerStore(state => state.play);
  const setQueue = usePlayerStore(state => state.setQueue);
  const router = useRouter();

  const hasItems = pinnedTracks.length > 0 || pinnedArtists.length > 0;
  if (!hasItems) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[var(--accent)]">
          <Zap size={16} className="fill-current" />
          <span className="text-sm font-bold tracking-wider uppercase">Speed Play</span>
        </div>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {/* Pinned Tracks */}
        {pinnedTracks.map(track => (
          <motion.div
            key={`track-${track.id}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-3 py-2 cursor-pointer shrink-0 transition-colors min-w-0"
            onClick={() => play(track)}
          >
            <div className="relative shrink-0">
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Music size={14} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 max-w-[120px]">
              <span className="text-sm font-semibold truncate text-white">{track.title}</span>
              <span className="text-xs text-white/50 truncate">{track.artist}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); unpinTrack(track.id); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1c1c1c] border border-white/10 rounded-full items-center justify-center hidden group-hover:flex transition-all"
            >
              <span className="text-[10px] text-white/60 leading-none">x</span>
            </button>
          </motion.div>
        ))}

        {/* Pinned Artists */}
        {pinnedArtists.map(artist => (
          <motion.div
            key={`artist-${artist.channelId}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl px-3 py-2 cursor-pointer shrink-0 transition-colors"
            onClick={() => router.push(`/artist/${artist.channelId}`)}
          >
            <div className="relative shrink-0">
              <img
                src={artist.thumbnail}
                alt={artist.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <User size={14} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 max-w-[120px]">
              <span className="text-sm font-semibold truncate text-white">{artist.name}</span>
              <span className="text-xs text-white/50">Artist</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); unpinArtist(artist.channelId); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1c1c1c] border border-white/10 rounded-full items-center justify-center hidden group-hover:flex transition-all"
            >
              <span className="text-[10px] text-white/60 leading-none">x</span>
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
