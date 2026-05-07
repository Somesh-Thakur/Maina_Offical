const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_KEY_HERE') {
  console.warn("YouTube API key is missing or invalid. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in .env.local");
}

async function fetchYouTube(endpoint: string, params: Record<string, string | number>) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append('key', YOUTUBE_API_KEY || '');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });

  const response = await fetch(url.toString(), {
    // Next.js caching or revalidation could be added here if needed, 
    // but mostly we want fresh data except for some static queries.
    next: { revalidate: 3600 } 
  });
  
  if (!response.ok) {
    throw new Error(`YouTube API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

import { Track } from '@/lib/db';

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

function mapToTracks(items: any[]): Track[] {
  if (!items) return [];
  return items.map((item: any) => ({
    id: typeof item.id === 'string' ? item.id : item.id.videoId,
    title: item.snippet?.title || 'Unknown Title',
    artist: item.snippet?.channelTitle || 'Unknown Artist',
    thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
    duration: parseDuration(item.contentDetails?.duration || 'PT0S'),
    addedAt: Date.now()
  }));
}

export async function getVideoDetails(videoIds: string[]): Promise<Track[]> {
  if (videoIds.length === 0) return [];
  const idsToQuery = videoIds.slice(0, 50).join(',');
  const data = await fetchYouTube('videos', {
    part: 'snippet,contentDetails',
    id: idsToQuery
  });
  return mapToTracks(data.items);
}

export async function searchVideos(query: string, maxResults: number = 20): Promise<Track[]> {
  const data = await fetchYouTube('search', {
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10', // Music
    maxResults
  });
  
  const videoIds = data.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];
  if (videoIds.length === 0) return [];
  
  // Fetch details to get durations
  return getVideoDetails(videoIds);
}

export async function searchChannels(query: string, maxResults: number = 10) {
  return fetchYouTube('search', {
    part: 'snippet',
    q: query,
    type: 'channel',
    maxResults
  });
}

export async function searchPlaylists(query: string, maxResults: number = 10) {
  return fetchYouTube('search', {
    part: 'snippet',
    q: query,
    type: 'playlist',
    maxResults
  });
}

export async function getTrendingMusic(regionCode: string = 'IN'): Promise<Track[]> {
  const data = await fetchYouTube('videos', {
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10', // Music
    regionCode,
    maxResults: 20
  });
  return mapToTracks(data.items);
}

export async function getChannelDetails(channelId: string) {
  const data = await fetchYouTube('channels', {
    part: 'snippet,statistics',
    id: channelId
  });
  const item = data.items?.[0];
  if (!item) throw new Error("Channel not found");
  return {
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url || ''
  };
}

export async function getChannelVideos(channelId: string, maxResults: number = 20): Promise<Track[]> {
  const data = await fetchYouTube('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults
  });
  
  const videoIds = data.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];
  return getVideoDetails(videoIds);
}

export async function getRelatedArtists(query: string) {
  return fetchYouTube('search', {
    part: 'snippet',
    q: query,
    type: 'channel',
    maxResults: 10
  });
}
