'use client';
import React, { useState, useEffect } from 'react';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { TrackCard } from '@/components/tracks/TrackCard';
import { TrackRow } from '@/components/tracks/TrackRow';
import { getTrendingMusic } from '@/lib/youtube';
import { Track } from '@/lib/db';
import { usePlayerStore } from '@/store/playerStore';

export default function Home() {
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = usePlayerStore(state => state.history);

  // Get unique recent tracks from history
  const recentTracks = history.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).reverse().slice(0, 10);

  useEffect(() => {
    async function loadTrending() {
      try {
        const tracks = await getTrendingMusic();
        setTrendingTracks(tracks);
      } catch (err) {
        console.error("Failed to fetch trending music", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrending();
  }, []);

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-7xl mx-auto flex flex-col gap-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
          Welcome
        </h1>
      </header>

      {recentTracks.length > 0 && (
        <section>
          <ScrollRow title="Your Heavy Rotation">
            {recentTracks.map(track => (
              <TrackCard key={`recent-${track.id}`} track={track} />
            ))}
          </ScrollRow>
        </section>
      )}

      <section>
        <ScrollRow title="Trending Now">
          {isLoading ? (
            <div className="flex gap-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-40 md:w-48 aspect-[4/5] bg-white/5 rounded-xl animate-pulse shrink-0" />
              ))}
            </div>
          ) : trendingTracks.length > 0 ? (
            trendingTracks.map(track => (
              <TrackCard key={`trending-${track.id}`} track={track} />
            ))
          ) : (
            <div className="text-[#a3a3a3] text-sm px-4">No trending tracks available.</div>
          )}
        </ScrollRow>
      </section>

      {recentTracks.length > 0 && (
        <section className="max-w-4xl">
          <h2 className="text-2xl font-display font-bold mb-6">Recently Played</h2>
          <div className="flex flex-col gap-1">
            {recentTracks.slice(0, 5).map((track, idx) => (
              <TrackRow key={`list-${track.id}`} track={track} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
