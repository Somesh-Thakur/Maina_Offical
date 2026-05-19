'use client';
import Link from 'next/link';
import { Home, Search, Library, ListMusic } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();
  const toggleFullscreen  = usePlayerStore(s => s.toggleFullscreen);
  const currentTrack      = usePlayerStore(s => s.currentTrack);
  const isPlaying         = usePlayerStore(s => s.isPlaying);
  const togglePlayPause   = usePlayerStore(s => s.togglePlayPause);
  const next              = usePlayerStore(s => s.next);

  const links = [
    { name: 'Home',    href: '/',        icon: Home    },
    { name: 'Search',  href: '/search',  icon: Search  },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Queue',   href: '#queue',   icon: ListMusic, action: () => usePlayerStore.getState().toggleQueue() },
  ];

  return (
    /* Sits above the PlayerBar (bottom-[80px]) */
    <div className="md:hidden fixed bottom-[80px] left-0 right-0 z-40">
      {/* Mini now-playing strip — tap to open fullscreen */}
      <AnimatePresence>
        {currentTrack && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={toggleFullscreen}
            className="w-full flex items-center gap-3 px-3 py-2 bg-[var(--accent)]/10 border-t border-[var(--accent)]/20 active:bg-[var(--accent)]/20 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-8 h-8 rounded overflow-hidden shrink-0">
              <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
              {/* Pulsing ring when playing */}
              {isPlaying && (
                <span className="absolute inset-0 rounded animate-ping bg-[var(--accent)]/30" />
              )}
            </div>
            {/* Title */}
            <span className="flex-1 text-xs font-medium truncate text-left">
              {currentTrack.title}
            </span>
            {/* Quick controls */}
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <button
                onClick={togglePlayPause}
                className="w-8 h-8 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                {isPlaying
                  ? <Pause size={16} className="fill-current" />
                  : <Play  size={16} className="fill-current ml-0.5" />
                }
              </button>
              <button
                onClick={() => next()}
                className="w-8 h-8 flex items-center justify-center text-white/70 active:scale-90 transition-transform"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
                </svg>
              </button>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main nav tabs */}
      <nav className="flex items-center justify-around bg-black/60 backdrop-blur-2xl border-t border-white/[0.06] h-16 px-2">
        {links.map(link => {
          const isActive = link.href !== '#queue' &&
            (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));

          if (link.action) {
            return (
              <button
                key={link.name}
                onClick={link.action}
                className="flex flex-col items-center gap-1 py-2 px-3 text-[#666] transition-colors"
              >
                <link.icon size={22} />
                <span className="text-[10px] font-medium">{link.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors relative ${
                isActive ? 'text-white' : 'text-[#666]'
              }`}
            >
              <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{link.name}</span>
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
