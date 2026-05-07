'use client';
import React, { useState, useEffect } from 'react';
import { TrackRow } from '@/components/tracks/TrackRow';
import { ScrollRow } from '@/components/ui/ScrollRow';
import { getChannelDetails, searchVideos } from '@/lib/youtube';
import { Track } from '@/lib/db';

export default function ArtistPage({ params }: { params: Promise<{ channelId: string }> }) {
  const resolvedParams = React.use(params);
  
  const [artistName, setArtistName] = useState('Loading...');
  const [thumbnail, setThumbnail] = useState('');
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArtist() {
      try {
        const details = await getChannelDetails(resolvedParams.channelId);
        setArtistName(details.title);
        setThumbnail(details.thumbnail);
        
        const tracks = await searchVideos(`${details.title} official audio`, 10);
        setTopTracks(tracks);
      } catch (err) {
        console.error(err);
        setArtistName('Artist not found');
      } finally {
        setIsLoading(false);
      }
    }
    fetchArtist();
  }, [resolvedParams.channelId]);

  return (
    <div className="flex flex-col pb-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 flex flex-col justify-end p-6 md:p-10 bg-gradient-to-t from-[#0a0a0a] to-[#1c1c1c]">
        {thumbnail && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
        )}
        <div className="relative z-10 flex items-end gap-6">
          {thumbnail && (
            <img src={thumbnail} alt={artistName} className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-2xl object-cover" />
          )}
          <div className="flex flex-col">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter">
              {artistName}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 flex flex-col gap-12">
        <section>
          <h2 className="text-2xl font-display font-bold mb-6">Popular</h2>
          {isLoading ? (
            <div className="animate-pulse space-y-2 max-w-4xl">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-white/5 rounded-md" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-w-4xl">
              {topTracks.map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} />
              ))}
            </div>
          )}
        </section>

        <section>
          <ScrollRow title="Similar Artists">
            <div className="text-[#a3a3a3] text-sm px-4">
              YouTube Data API does not directly support similar artists anymore.
            </div>
          </ScrollRow>
        </section>
      </div>
    </div>
  );
}
