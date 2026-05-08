'use client';
import { useEffect } from 'react';
import { useLibraryStore } from '@/store/libraryStore';

export function AppInitializer() {
  const loadLibrary = useLibraryStore(state => state.loadLibrary);

  useEffect(() => {
    // Initial load of Dexie DB into Zustand
    loadLibrary();
  }, [loadLibrary]);

  return null;
}
