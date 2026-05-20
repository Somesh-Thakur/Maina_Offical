'use client';
import Link from 'next/link';
import { Home, Search, Library, Plus, User as UserIcon, MessageSquare, LogOut, LogIn, Shield, Settings } from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { usePathname } from 'next/navigation';
import { useModalStore } from '@/store/modalStore';
import { useUserStore } from '@/store/userStore';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
  const { playlists, createPlaylist } = useLibrary();
  const pathname = usePathname();
  const { user } = useUserStore();

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
    { name: 'Friends', href: '/friends', icon: UserIcon },
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

      {/* User & Settings Section */}
      <div className="mt-auto pt-4 border-t border-white/8 flex flex-col gap-2">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user.displayName?.[0] ?? user.username?.[0] ?? '?').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user.displayName}</p>
                <p className="text-[10px] text-white/40 truncate">@{user.username}</p>
              </div>
            </div>

            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-yellow-400 hover:bg-yellow-400/10 transition-colors"
              >
                <Shield size={16} /> Admin Panel
              </Link>
            )}

            <Link
              href="/feedback"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors"
            >
              <MessageSquare size={16} /> Report Bug / Feedback
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings size={16} /> Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors text-left"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors justify-center"
          >
            <LogIn size={16} /> Sign In
          </Link>
        )}

        {/* Download app link — shown only in browser, hidden inside Tauri */}
        {typeof window !== 'undefined' && !('__TAURI_INTERNALS__' in window) && (
          <Link
            href="/download"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors group mt-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/maina-logo.png" alt="" className="w-6 h-6 object-contain rounded" />
            <div>
              <div className="text-xs font-semibold text-[var(--accent)]">Get the Desktop App</div>
              <div className="text-[10px] text-[#a3a3a3]">Discord RPC &amp; more</div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
