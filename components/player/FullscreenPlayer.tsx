'use client';
import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share, PlusCircle, Heart } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { WaveformScrubber } from './WaveformScrubber';
import { AudioVisualizer } from './AudioVisualizer';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic, Mic2, Infinity as InfinityIcon } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { PlaylistSelectionModal } from '@/components/ui/PlaylistSelectionModal';

export function FullscreenPlayer() {
  const isFullscreen = usePlayerStore(state => state.isFullscreen);
  const toggleFullscreen = usePlayerStore(state => state.toggleFullscreen);
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  
  // Controls
  const togglePlayPause = usePlayerStore(state => state.togglePlayPause);
  const next = usePlayerStore(state => state.next);
  const previous = usePlayerStore(state => state.previous);
  const shuffle = usePlayerStore(state => state.shuffle);
  const toggleShuffle = usePlayerStore(state => state.toggleShuffle);
  const repeat = usePlayerStore(state => state.repeat);
  const cycleRepeat = usePlayerStore(state => state.cycleRepeat);
  const showQueue = usePlayerStore(state => state.showQueue);
  const toggleQueue = usePlayerStore(state => state.toggleQueue);
  const showLyrics = usePlayerStore(state => state.showLyrics);
  const toggleLyrics = usePlayerStore(state => state.toggleLyrics);
  const autoplay = usePlayerStore(state => state.autoplay);
  const toggleAutoplay = usePlayerStore(state => state.toggleAutoplay);

  const toggleLike = useLibraryStore(state => state.toggleLike);
  const isLiked = useLibraryStore(state => currentTrack ? state.isLiked(currentTrack.id) : false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          key="fullscreen-player"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[80] bg-black flex flex-col h-[100dvh] overflow-hidden"
        >
          {/* Blurred Background */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60 blur-[80px] transform scale-125 saturate-150"
              style={{ backgroundImage: `url(${currentTrack.thumbnail})` }}
            />
            {/* Dark gradient overlay for extreme contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
          </div>

          <AudioVisualizer />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between p-6">
            <IconButton icon={ChevronDown} onClick={toggleFullscreen} size="lg" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#a3a3a3]">Now Playing</span>
            </div>
            <div className="w-12" /> {/* spacer for center alignment */}
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-[500px] mx-auto gap-6 md:gap-8 min-h-0">
            
            {/* Album Art (Floating) */}
            <motion.div 
              className="w-full aspect-square rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative shrink mx-auto border border-white/5"
              animate={{ y: isPlaying ? [0, -10, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Track Info */}
            <div className="w-full text-left mt-2 flex items-center justify-between">
              <div className="flex flex-col min-w-0 pr-4">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white truncate drop-shadow-md">
                  {currentTrack.title}
                </h1>
                <h2 className="text-base md:text-lg text-white/70 truncate">
                  {currentTrack.artist}
                </h2>
              </div>
              <IconButton 
                icon={Heart} 
                size="md" 
                onClick={() => toggleLike(currentTrack)} 
                isActive={isLiked} 
                className="shrink-0 drop-shadow-md"
              />
            </div>

            {/* Scrubber */}
            <div className="w-full mt-4">
              <WaveformScrubber />
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 md:gap-8 w-full mt-2 shrink-0">
              <IconButton 
                icon={Shuffle} 
                size="md" 
                isActive={shuffle} 
                onClick={toggleShuffle} 
              />
              <IconButton icon={SkipBack} size="lg" onClick={previous} />
              
              <button 
                onClick={togglePlayPause}
                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-1" />}
              </button>
              
              <IconButton icon={SkipForward} size="lg" onClick={next} />
              <IconButton 
                icon={repeat === 'one' ? Repeat1 : Repeat} 
                size="md" 
                isActive={repeat !== 'off'} 
                onClick={cycleRepeat} 
              />
            </div>

            {/* Secondary Controls Row */}
            <div className="flex items-center justify-between w-full max-w-sm mt-4 px-4 pb-8 md:pb-0 shrink-0">
              <IconButton icon={PlusCircle} size="md" onClick={() => setModalOpen(true)} />
              <IconButton icon={Mic2} size="md" isActive={showLyrics} onClick={toggleLyrics} />
              <IconButton icon={ListMusic} size="md" isActive={showQueue} onClick={toggleQueue} />
              <IconButton icon={InfinityIcon} size="md" isActive={autoplay} onClick={toggleAutoplay} />
            </div>
          </div>
        </motion.div>
      )}

      {currentTrack && (
        <PlaylistSelectionModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          track={currentTrack}
        />
      )}
    </AnimatePresence>
  );
}
