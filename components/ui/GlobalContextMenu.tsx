'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Track } from '@/lib/db';
import { Plus, ListPlus, Zap, Trash2, Heart, Play } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { useSpeedPlayStore } from '@/store/speedPlayStore';
import { PlaylistSelectionModal } from './PlaylistSelectionModal';

// ─── Context ───────────────────────────────────────────────

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  track: Track | null;
  playlistId?: string;
}

interface ContextMenuContextType {
  openMenu: (e: React.MouseEvent, track: Track, playlistId?: string) => void;
}

const ContextMenuContext = createContext<ContextMenuContextType>({
  openMenu: () => {},
});

export function useContextMenu() {
  return useContext(ContextMenuContext);
}

// ─── Provider ──────────────────────────────────────────────

export function GlobalContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, track: null });
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const removeTrackFromPlaylist = useLibraryStore(state => state.removeTrackFromPlaylist);
  const toggleLike = useLibraryStore(state => state.toggleLike);
  const isLiked = useLibraryStore(state => menu.track ? state.isLiked(menu.track.id) : false);
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const play = usePlayerStore(state => state.play);
  const { pinTrack, unpinTrack, isTrackPinned } = useSpeedPlayStore();
  const isPinned = menu.track ? isTrackPinned(menu.track.id) : false;

  const openMenu = useCallback((e: React.MouseEvent, track: Track, playlistId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Smart position — keep menu inside viewport
    const menuW = 200;
    const menuH = 220;
    let x = e.clientX;
    let y = e.clientY;
    if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8;
    if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8;

    setMenu({ visible: true, x, y, track, playlistId });
  }, []);

  const closeMenu = useCallback(() => {
    setMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // Close on click outside, Escape, or scroll
  useEffect(() => {
    if (!menu.visible) return;
    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof MouseEvent && menuRef.current?.contains(e.target as Node)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', handleClose);
    document.addEventListener('keydown', handleClose);
    document.addEventListener('scroll', closeMenu, true);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('keydown', handleClose);
      document.removeEventListener('scroll', closeMenu, true);
    };
  }, [menu.visible, closeMenu]);

  return (
    <ContextMenuContext.Provider value={{ openMenu }}>
      {children}

      {/* ── Global Context Menu ── */}
      {menu.visible && menu.track && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menu.y,
            left: menu.x,
            zIndex: 999999,
            minWidth: '200px',
          }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden"
          onContextMenu={e => e.preventDefault()}
        >
          {/* Track info header */}
          <div className="px-3 py-2 border-b border-white/8 flex items-center gap-2">
            <img
              src={menu.track.thumbnail}
              alt={menu.track.title}
              className="w-8 h-8 rounded object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{menu.track.title}</div>
              <div className="text-[10px] text-[#a3a3a3] truncate">{menu.track.artist}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <MenuItem
              icon={<Play size={14} />}
              label="Play Now"
              onClick={() => { play(menu.track!); closeMenu(); }}
            />
            <MenuItem
              icon={<Heart size={14} className={isLiked ? 'fill-[var(--accent)] text-[var(--accent)]' : ''} />}
              label={isLiked ? 'Remove from Liked' : 'Add to Liked'}
              onClick={() => { toggleLike(menu.track!); closeMenu(); }}
            />
            <MenuItem
              icon={<Plus size={14} />}
              label="Add to Playlist…"
              onClick={() => { setShowModal(true); closeMenu(); }}
            />
            <MenuItem
              icon={<ListPlus size={14} />}
              label="Add to Queue"
              onClick={() => { addToQueue(menu.track!); closeMenu(); }}
            />
            <MenuItem
              icon={<Zap size={14} className={isPinned ? 'fill-[var(--accent)] text-[var(--accent)]' : ''} />}
              label={isPinned ? 'Unpin from Speed Play' : 'Pin to Speed Play'}
              onClick={() => { isPinned ? unpinTrack(menu.track!.id) : pinTrack(menu.track!); closeMenu(); }}
            />
            {menu.playlistId && (
              <>
                <div className="h-px bg-white/8 my-1" />
                <MenuItem
                  icon={<Trash2 size={14} />}
                  label="Remove from Playlist"
                  onClick={() => { removeTrackFromPlaylist(menu.playlistId!, menu.track!.id); closeMenu(); }}
                  danger
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Playlist selection modal */}
      {showModal && menu.track && (
        <PlaylistSelectionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          track={menu.track}
        />
      )}
    </ContextMenuContext.Provider>
  );
}

// ─── Reusable menu item ─────────────────────────────────────

function MenuItem({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors
        ${danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-white/80 hover:bg-white/8 hover:text-white'
        }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
