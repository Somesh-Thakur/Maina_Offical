'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, User, Zap, ListMusic } from 'lucide-react';
import { useSpeedPlayStore } from '@/store/speedPlayStore';
import { usePlayerStore } from '@/store/playerStore';

export function SpeedPlayBar() {
  const { pinnedTracks, pinnedArtists, pinnedPlaylists, unpinTrack, unpinArtist, unpinPlaylist } = useSpeedPlayStore();
  const play = usePlayerStore(state => state.play);
  const router = useRouter();

  const hasItems = pinnedTracks.length > 0 || pinnedArtists.length > 0 || pinnedPlaylists.length > 0;
  if (!hasItems) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-2"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[var(--accent)]">
          <Zap size={14} className="fill-current" />
          <span className="text-xs font-bold tracking-wider uppercase">Speed Play</span>
        </div>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {/* Pinned Tracks */}
        {pinnedTracks.map(track => (
          <motion.div
            key={`track-${track.id}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group relative flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-xl px-3 py-2 cursor-pointer shrink-0 transition-colors"
            onClick={() => play(track)}
          >
            <div className="relative shrink-0">
              <img src={track.thumbnail} alt={track.title} className="w-9 h-9 rounded-lg object-cover" />
              <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Music size={12} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 max-w-[110px]">
              <span className="text-xs font-semibold truncate text-white">{track.title}</span>
              <span className="text-[11px] text-white/40 truncate">{track.artist}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); unpinTrack(track.id); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1c1c1c] border border-white/10 rounded-full items-center justify-center hidden group-hover:flex text-white/50 hover:text-white transition-colors text-[9px]"
            >
              x
            </button>
          </motion.div>
        ))}

        {/* Pinned Playlists */}
        {pinnedPlaylists.map(playlist => (
          <motion.div
            key={`playlist-${playlist.id}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group relative flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-xl px-3 py-2 cursor-pointer shrink-0 transition-colors"
            onClick={() => router.push(`/playlist/${playlist.id}`)}
          >
            <div className="relative shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
              {playlist.thumbnails[0] ? (
                <img src={playlist.thumbnails[0]} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <ListMusic size={14} className="text-white/40" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ListMusic size={12} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 max-w-[110px]">
              <span className="text-xs font-semibold truncate text-white">{playlist.name}</span>
              <span className="text-[11px] text-white/40">{playlist.trackCount} tracks</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); unpinPlaylist(playlist.id); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1c1c1c] border border-white/10 rounded-full items-center justify-center hidden group-hover:flex text-white/50 hover:text-white transition-colors text-[9px]"
            >
              x
            </button>
          </motion.div>
        ))}

        {/* Pinned Artists */}
        {pinnedArtists.map(artist => (
          <motion.div
            key={`artist-${artist.channelId}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group relative flex items-center gap-2.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-xl px-3 py-2 cursor-pointer shrink-0 transition-colors"
            onClick={() => router.push(`/artist/${artist.channelId}`)}
          >
            <div className="relative shrink-0">
              <img src={artist.thumbnail} alt={artist.name} className="w-9 h-9 rounded-full object-cover" />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <User size={12} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 max-w-[110px]">
              <span className="text-xs font-semibold truncate text-white">{artist.name}</span>
              <span className="text-[11px] text-white/40">Artist</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); unpinArtist(artist.channelId); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1c1c1c] border border-white/10 rounded-full items-center justify-center hidden group-hover:flex text-white/50 hover:text-white transition-colors text-[9px]"
            >
              x
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
