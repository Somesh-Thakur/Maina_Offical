'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { TrackCard } from '@/components/tracks/TrackCard';
import { TrackRow } from '@/components/tracks/TrackRow';
import { SpeedPlayBar } from '@/components/ui/SpeedPlayBar';
import { getTrendingMusic, searchVideos } from '@/lib/youtube';
import { Track } from '@/lib/db';
import { usePlayerStore } from '@/store/playerStore';

const TRENDING_CACHE_KEY = 'maina_trending_cache';
const TRENDING_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedSection {
  data: Track[];
  fetchedAt: number;
}

function useCachedSection(cacheKey: string, fetcher: () => Promise<Track[]>) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      try {
        const cached: CachedSection = JSON.parse(raw);
        if (Date.now() - cached.fetchedAt < TRENDING_CACHE_TTL) {
          setTracks(cached.data);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetcher()
      .then(data => {
        setTracks(data);
        localStorage.setItem(cacheKey, JSON.stringify({ data, fetchedAt: Date.now() }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [visible, cacheKey]);

  return { tracks, loading, ref };
}

function SectionSkeleton() {
  return (
    <div className="flex gap-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="w-40 md:w-48 aspect-[4/5] bg-white/5 rounded-xl animate-pulse shrink-0" />
      ))}
    </div>
  );
}

export default function Home() {
  const history = usePlayerStore(state => state.history);
  const recentTracks = history
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    .reverse()
    .slice(0, 10);

  const trending = useCachedSection(TRENDING_CACHE_KEY, () => getTrendingMusic('IN'));
  const bollywood = useCachedSection('maina_bollywood', () => searchVideos('bollywood hits 2025', 16));
  const hollywood = useCachedSection('maina_hollywood', () => searchVideos('hollywood hits 2025', 16));
  const punjabi = useCachedSection('maina_punjabi', () => searchVideos('punjabi songs 2025', 16));
  const newReleases = useCachedSection('maina_newreleases', () => searchVideos('new music releases 2025', 16));

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-7xl mx-auto flex flex-col gap-12">
      <header className="flex flex-col gap-6">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
          Welcome
        </h1>
        {/* Speed Play — pinned favs */}
        <SpeedPlayBar />
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

      {/* Trending */}
      <section ref={trending.ref}>
        <ScrollRow title="Trending Now">
          {trending.loading ? <SectionSkeleton /> : trending.tracks.map(track => (
            <TrackCard key={`trending-${track.id}`} track={track} />
          ))}
        </ScrollRow>
      </section>

      {/* New Releases */}
      <section ref={newReleases.ref}>
        <ScrollRow title="New Releases">
          {newReleases.loading ? <SectionSkeleton /> : newReleases.tracks.map(track => (
            <TrackCard key={`newrel-${track.id}`} track={track} />
          ))}
        </ScrollRow>
      </section>

      {/* Bollywood */}
      <section ref={bollywood.ref}>
        <ScrollRow title="Bollywood Hits">
          {bollywood.loading ? <SectionSkeleton /> : bollywood.tracks.map(track => (
            <TrackCard key={`bw-${track.id}`} track={track} />
          ))}
        </ScrollRow>
      </section>

      {/* Hollywood */}
      <section ref={hollywood.ref}>
        <ScrollRow title="Hollywood Hits">
          {hollywood.loading ? <SectionSkeleton /> : hollywood.tracks.map(track => (
            <TrackCard key={`hw-${track.id}`} track={track} />
          ))}
        </ScrollRow>
      </section>

      {/* Punjabi Mix */}
      <section ref={punjabi.ref}>
        <ScrollRow title="Punjabi Mix">
          {punjabi.loading ? <SectionSkeleton /> : punjabi.tracks.map(track => (
            <TrackCard key={`pb-${track.id}`} track={track} />
          ))}
        </ScrollRow>
      </section>

      {/* Recently Played List */}
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
