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
      const milliseconds = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegExp, '').trim();
      
      if (text) {
        result.push({ time: timeInSeconds, text });
      }
    }
  });
  
  return result;
}

function cleanString(str: string): string {
  return str
    .replace(/\(.*?\)/g, '') // remove anything in parentheses
    .replace(/\[.*?\]/g, '') // remove anything in brackets
    .replace(/ - Topic/gi, '') // remove - Topic
    .replace(/official( video| audio| music video)?/gi, '')
    .replace(/ft\.|feat\.|featuring/gi, '')
    .trim();
}

export async function fetchLyrics(artist: string, title: string, duration?: number): Promise<LyricsResponse | null> {
  const cleanArtist = cleanString(artist);
  const cleanTitle = cleanString(title);

  try {
    // 1. Try exact match first
    const getUrl = new URL('https://lrclib.net/api/get');
    getUrl.searchParams.append('artist_name', cleanArtist);
    getUrl.searchParams.append('track_name', cleanTitle);
    if (duration) {
      getUrl.searchParams.append('duration', duration.toString());
    }
    
    let response = await fetch(getUrl.toString());
    let data;

    // 2. If exact match fails, try fuzzy search
    if (!response.ok || response.status === 404) {
      const searchUrl = new URL('https://lrclib.net/api/search');
      searchUrl.searchParams.append('q', `${cleanTitle} ${cleanArtist}`);
      response = await fetch(searchUrl.toString());
      
      if (!response.ok) return null;
      
      const searchData = await response.json();
      if (!searchData || searchData.length === 0) return null;
      
      // Use the first result from fuzzy search
      data = searchData[0];
    } else {
      data = await response.json();
    }
    
    if (data.syncedLyrics) {
      return {
        synced: true,
        lines: parseLrc(data.syncedLyrics),
        plainText: data.plainLyrics || ''
      };
    } else if (data.plainLyrics) {
      return {
        synced: false,
        lines: [],
        plainText: data.plainLyrics
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
}
