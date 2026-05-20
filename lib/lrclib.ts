export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsResponse {
  synced: boolean;
  lines: LyricLine[];
  plainText: string;
}

function parseLrc(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const result: LyricLine[] = [];
  const timeRegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegExp.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
      const timeInSeconds = minutes * 60 + seconds + ms / 1000;
      const text = line.replace(timeRegExp, '').trim();
      if (text) result.push({ time: timeInSeconds, text });
    }
  });

  return result;
}

function cleanString(str: string): string {
  return str
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/ - Topic/gi, '')
    .replace(/official( video| audio| music video)?/gi, '')
    .replace(/ft\.|feat\.|featuring/gi, '')
    .trim();
}

/**
 * Resolve the base URL for the lyrics proxy.
 * - Server-side (SSR): use environment var or localhost
 * - Client-side: use relative path (same origin)
 */
function lyricsBase(): string {
  if (typeof window !== 'undefined') return ''; // relative, same origin
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function fetchLyrics(
  artist: string,
  title: string,
  duration?: number
): Promise<LyricsResponse | null> {
  const cleanArtist = cleanString(artist);
  const cleanTitle  = cleanString(title);
  const base = lyricsBase();

  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    // 1. Exact match via our server-side proxy (avoids CORS / WebView2 fetch issues)
    const exactUrl = new URL(`${baseUrl}/api/lyrics`);
    exactUrl.searchParams.set('artist_name', cleanArtist);
    exactUrl.searchParams.set('track_name', cleanTitle);
    if (duration) exactUrl.searchParams.set('duration', String(duration));

    let response = await fetch(exactUrl.toString());
    let data;

    // 2. Fuzzy fallback
    if (!response.ok || response.status === 404) {
      const fuzzyUrl = new URL(`${baseUrl}/api/lyrics`);
      fuzzyUrl.searchParams.set('q', `${cleanTitle} ${cleanArtist}`);
      response = await fetch(fuzzyUrl.toString());

      if (!response.ok) return null;

      const searchData = await response.json();
      if (!searchData || searchData.length === 0) return null;
      data = searchData[0];
    } else {
      data = await response.json();
    }

    if (!data) return null;

    if (data.syncedLyrics) {
      return { synced: true, lines: parseLrc(data.syncedLyrics), plainText: data.plainLyrics ?? '' };
    } else if (data.plainLyrics) {
      return { synced: false, lines: [], plainText: data.plainLyrics };
    }

    return null;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
}
