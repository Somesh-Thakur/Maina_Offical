'use client';
import { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic, Mic2, Maximize2, Heart } from 'lucide-react';
import { usePlayer } from '@/hooks/usePlayer';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { IconButton } from '@/components/ui/IconButton';
import { VolumeControl } from './VolumeControl';
import { Slider } from '@/components/ui/Slider';
import { PlaylistSelectionModal } from '@/components/ui/PlaylistSelectionModal';
import { useModalStore } from '@/store/modalStore';
import gsap from 'gsap';
import { PlusCircle } from 'lucide-react';

export default function PlayerBar() {
  const { seekTo } = usePlayer() || {};
  useTheme();
  useKeyboardShortcuts();

  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const togglePlayPause = usePlayerStore(state => state.togglePlayPause);
  const next = usePlayerStore(state => state.next);
  const previous = usePlayerStore(state => state.previous);
  const shuffle = usePlayerStore(state => state.shuffle);
  const toggleShuffle = usePlayerStore(state => state.toggleShuffle);
  const repeat = usePlayerStore(state => state.repeat);
  const cycleRepeat = usePlayerStore(state => state.cycleRepeat);
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);
  const seek = usePlayerStore(state => state.seek);
  const toggleFullscreen = usePlayerStore(state => state.toggleFullscreen);
  const toggleQueue = usePlayerStore(state => state.toggleQueue);
  const toggleLyrics = usePlayerStore(state => state.toggleLyrics);
  const showQueue = usePlayerStore(state => state.showQueue);
  const showLyrics = usePlayerStore(state => state.showLyrics);

  const toggleLike = useLibraryStore(state => state.toggleLike);
  const isLiked = useLibraryStore(state => currentTrack ? state.isLiked(currentTrack.id) : false);

  const showPlaylistModal = useModalStore(state => state.showPlaylistModal);

  const playBtnRef = useRef<HTMLButtonElement>(null);

  // Magnetic button effect for play/pause
  useEffect(() => {
    const btn = playBtnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(x*x + y*y);

      if (dist < 60) {
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
    };

    window.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (btn) btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Swipe-up on mobile to open fullscreen ────────────────────
  const touchStartY = useRef<number>(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 40) toggleFullscreen(); // swipe up ≥ 40px
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[80px] bg-black/60 backdrop-blur-2xl border-t border-white/[0.06] z-[60] flex items-center justify-between px-4 md:px-6 md:pl-[240px]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress bar — visible on mobile as thin accent line */}
      <div className="absolute top-0 left-0 right-0 md:hidden h-[2px] bg-white/10">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-200"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* ── MOBILE LAYOUT ─────────────────────────────────────── */}
      {/* Left: tap track area to open fullscreen */}
      <div
        className="flex md:hidden flex-1 items-center gap-3 overflow-hidden active:opacity-70 transition-opacity cursor-pointer"
        onClick={toggleFullscreen}
      >
        {currentTrack ? (
          <>
            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : ''}`}
              />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-medium text-sm truncate">{currentTrack.title}</span>
              <span className="text-xs text-[#a3a3a3] truncate">{currentTrack.artist}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 opacity-40">
            <div className="w-11 h-11 bg-white/5 rounded-lg" />
            <div className="flex flex-col gap-2">
              <div className="w-24 h-3 bg-white/10 rounded" />
              <div className="w-16 h-2 bg-white/10 rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile right: play + skip (stop propagation so taps don't open fullscreen) */}
      <div
        className="flex md:hidden items-center gap-2 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={togglePlayPause}
          disabled={!currentTrack}
          className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full active:scale-90 transition-transform disabled:opacity-40"
        >
          {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
        </button>
        <button
          onClick={next}
          disabled={!currentTrack}
          className="w-10 h-10 flex items-center justify-center text-white/70 active:scale-90 transition-transform disabled:opacity-40"
        >
          <SkipForward size={22} />
        </button>
      </div>

      {/* ── DESKTOP LAYOUT ────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 items-center gap-3 overflow-hidden">
        {currentTrack ? (
          <>
            <div
              className="relative w-12 h-12 rounded overflow-hidden shrink-0 cursor-pointer group"
              onClick={toggleFullscreen}
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 size={16} />
              </div>
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-display font-medium text-sm truncate">{currentTrack.title}</span>
              <span className="text-xs text-[#a3a3a3] truncate">{currentTrack.artist}</span>
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <IconButton icon={Heart} size="sm" onClick={() => toggleLike(currentTrack)} isActive={isLiked} />
              <IconButton icon={PlusCircle} size="sm" onClick={() => currentTrack && showPlaylistModal(currentTrack)} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-12 h-12 bg-white/5 rounded" />
            <div className="flex flex-col gap-2">
              <div className="w-24 h-3 bg-white/10 rounded" />
              <div className="w-16 h-2 bg-white/10 rounded" />
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-1 max-w-xl flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-4 md:gap-6">
          <IconButton icon={Shuffle} size="sm" isActive={shuffle} onClick={toggleShuffle} />
          <IconButton icon={SkipBack} size="md" onClick={previous} disabled={!currentTrack} />
          <button
            ref={playBtnRef}
            onClick={togglePlayPause}
            disabled={!currentTrack}
            className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
          </button>
          <IconButton icon={SkipForward} size="md" onClick={next} disabled={!currentTrack} />
          <IconButton icon={repeat === 'one' ? Repeat1 : Repeat} size="sm" isActive={repeat !== 'off'} onClick={cycleRepeat} />
        </div>
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] font-mono text-[#a3a3a3] w-8 text-right">{formatTime(progress * duration)}</span>
          <Slider
            value={progress * 100}
            onChange={(val) => {
              const targetSeconds = (val / 100) * duration;
              seek(targetSeconds);
              if (seekTo) seekTo(targetSeconds);
            }}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-[#a3a3a3] w-8">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-end gap-2 md:gap-4">
        <IconButton icon={Mic2} size="sm" isActive={showLyrics} onClick={toggleLyrics} />
        <IconButton icon={ListMusic} size="sm" isActive={showQueue} onClick={toggleQueue} />
        <div className="hidden lg:block"><VolumeControl /></div>
        <IconButton icon={Maximize2} size="sm" onClick={toggleFullscreen} className="ml-2" />
      </div>
    </div>
  );
}
