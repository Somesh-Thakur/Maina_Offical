'use client';
import { useEffect } from 'react';
import { useLibraryStore } from '@/store/libraryStore';

export function useLibrary() {
  const store = useLibraryStore();

  useEffect(() => {
    store.loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
