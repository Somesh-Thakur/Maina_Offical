'use client';
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { TrackRow } from '@/components/tracks/TrackRow';
import { Track } from '@/lib/db';
import { searchVideos } from '@/lib/youtube';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError('');
      try {
        const tracks = await searchVideos(query);
        setResults(tracks);
      } catch (err: any) {
        setError(err.message || 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-5xl mx-auto flex flex-col gap-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-[#a3a3a3]" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-[#1c1c1c] text-white border border-[rgba(255,255,255,0.1)] rounded-full py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)] focus:bg-[#252525] transition-colors text-lg font-medium shadow-lg"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-[#a3a3a3] animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {error ? (
          <div className="text-red-400 p-4 bg-red-400/10 rounded-md">{error}</div>
        ) : results.length > 0 ? (
          results.map((track, idx) => (
            <TrackRow key={track.id} track={track} index={idx} />
          ))
        ) : query.trim() && !isSearching ? (
          <div className="text-center py-20 text-[#a3a3a3]">
            No results found for "{query}"
          </div>
        ) : null}
      </div>
    </div>
  );
}
