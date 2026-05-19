'use client';
import { useEffect } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { useDiscordRPC } from '@/hooks/useDiscordRPC';
import { useMediaSession } from '@/hooks/useMediaSession';

export function AppInitializer() {
  const loadLibrary = useLibraryStore(state => state.loadLibrary);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  useDiscordRPC();      // Discord Rich Presence (desktop app / web)
  useMediaSession();    // Lock screen + background play (mobile)

  return null;
}
