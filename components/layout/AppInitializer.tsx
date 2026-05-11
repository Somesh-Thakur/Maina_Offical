'use client';
import { useEffect } from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { useDiscordRPC } from '@/hooks/useDiscordRPC';

export function AppInitializer() {
  const loadLibrary = useLibraryStore(state => state.loadLibrary);

  useEffect(() => {
    // Initial load of Dexie DB into Zustand
    loadLibrary();
  }, [loadLibrary]);

  // Activate Discord RPC (only does anything inside the Tauri desktop app)
  useDiscordRPC();

  return null;
}
