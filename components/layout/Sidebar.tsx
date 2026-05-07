'use client';
import Link from 'next/link';
import { Home, Search, Library, Plus } from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { usePathname } from 'next/navigation';
import { useModalStore } from '@/store/modalStore';

export default function Sidebar() {
  const { playlists, createPlaylist } = useLibrary();
  const pathname = usePathname();

  const handleCreatePlaylist = async () => {
    const name = await useModalStore.getState().showPrompt('Enter a name for your new playlist:', 'New Playlist');
    if (!name) return;
    const id = await createPlaylist(name);
    // Can optionally navigate to the new playlist directly
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: Library },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[240px] bg-white/[0.02] backdrop-blur-xl border-r border-[var(--border)] h-[calc(100vh-80px)] p-6 z-40 fixed left-0 top-0">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-2">
          Maina
        </Link>
      </div>

      <nav className="flex flex-col gap-2 mb-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-4 px-3 py-2 rounded-md transition-colors ${
                isActive ? 'text-white bg-white/10' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between text-[#a3a3a3] px-3 mb-2">
          <span className="text-xs font-semibold tracking-wider uppercase">Playlists</span>
          <button onClick={handleCreatePlaylist} className="hover:text-white transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <Link
                href={`/playlist/${playlist.id}`}
                className={`block px-3 py-2 text-sm truncate rounded-md transition-colors ${
                  pathname === `/playlist/${playlist.id}` 
                    ? 'text-white bg-white/10' 
                    : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
                }`}
              >
                {playlist.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
