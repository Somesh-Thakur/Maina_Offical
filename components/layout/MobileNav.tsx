'use client';
import Link from 'next/link';
import { Home, Search, Library, ListMusic } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePlayerStore } from '@/store/playerStore';

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: 'Home',    href: '/',        icon: Home    },
    { name: 'Search',  href: '/search',  icon: Search  },
    { name: 'Library', href: '/library', icon: Library },
    {
      name: 'Queue',
      href: '#',
      icon: ListMusic,
      action: () => usePlayerStore.getState().toggleQueue(),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-[80px] left-0 right-0 z-40 flex items-center justify-around bg-black/70 backdrop-blur-2xl border-t border-white/[0.06] h-16 px-2">
      {links.map(link => {
        const isActive =
          !link.action &&
          (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)));

        if (link.action) {
          return (
            <button
              key={link.name}
              onClick={link.action}
              className="flex flex-col items-center gap-1 py-2 px-4 text-[#666] active:text-white transition-colors"
            >
              <link.icon size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors relative ${
              isActive ? 'text-white' : 'text-[#666]'
            }`}
          >
            <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{link.name}</span>
            {isActive && (
              <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
