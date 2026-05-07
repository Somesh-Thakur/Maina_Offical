'use client';
import Link from 'next/link';
import { Home, Search, Library, ListMusic, Maximize2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';

export default function MobileNav() {
  const pathname = usePathname();
  const toggleFullscreen = usePlayerStore(state => state.toggleFullscreen);
  const toggleQueue = usePlayerStore(state => state.toggleQueue);

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: Library },
  ];

  return (
    <div className="md:hidden fixed bottom-[80px] left-0 right-0 h-16 bg-white/[0.02] backdrop-blur-xl border-t border-[var(--border)] flex items-center justify-around z-40">
      {links.map(link => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <Link key={link.name} href={link.href} className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-[#a3a3a3]'}`}>
            <link.icon size={20} />
            <span className="text-[10px]">{link.name}</span>
          </Link>
        );
      })}
      
      <button onClick={toggleQueue} className="flex flex-col items-center gap-1 text-[#a3a3a3] hover:text-white">
        <ListMusic size={20} />
        <span className="text-[10px]">Queue</span>
      </button>

      <button onClick={toggleFullscreen} className="flex flex-col items-center gap-1 text-[#a3a3a3] hover:text-white">
        <Maximize2 size={20} />
        <span className="text-[10px]">Player</span>
      </button>
    </div>
  );
}
