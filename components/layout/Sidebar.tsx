'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Search, Library, Plus, User as UserIcon, MessageSquare, LogOut, LogIn, Shield, Settings } from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { usePathname } from 'next/navigation';
import { useModalStore } from '@/store/modalStore';
import { useUserStore } from '@/store/userStore';
import { signOut } from 'next-auth/react';
import { CreatePlaylistModal } from '@/components/playlist/CreatePlaylistModal';

export default function Sidebar() {
  const { playlists, createPlaylist } = useLibrary();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Friends', href: '/friends', icon: UserIcon },
  ];

  return (
    <>
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
          <button onClick={() => setShowCreateModal(true)} className="hover:text-white transition-colors">
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

      {/* User Section */}
      <div className="mt-auto pt-4 border-t border-white/8">
        {user ? (
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.displayName?.[0] ?? user.username?.[0] ?? '?').toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white group-hover:text-[var(--accent)] transition-colors">{user.displayName}</p>
              <p className="text-[10px] text-white/40 truncate">@{user.username}</p>
            </div>
            <Settings size={16} className="text-white/40 group-hover:text-white transition-colors" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors justify-center"
          >
            <LogIn size={16} /> Sign In
          </Link>
        )}
      </div>
    </aside>
    {showCreateModal && (
      <CreatePlaylistModal 
        onClose={() => setShowCreateModal(false)}
        onSuccess={(id) => {
          setShowCreateModal(false);
          // Optional: redirect to playlist
        }}
      />
    )}
    </>
  );
}
