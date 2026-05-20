import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { searchVideos, getPlaylistItems, getChannelDetails } from '@/lib/youtube';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

  const uid = session.user.id;
  const sb = getSupabaseAdmin();

  try {
    let title = 'Imported Playlist';
    let cover_url = '';
    let trackItems: any[] = [];

    // --- SPOTIFY ---
    if (url.includes('spotify.com/playlist/') || url.includes('spotify.com/album/')) {
      const spotifyUrlInfo = await import('spotify-url-info');
      // @ts-ignore
      const getData = (spotifyUrlInfo.default || spotifyUrlInfo)(fetch).getData;
      
      const data = await getData(url);
      
      title = data.name || 'Spotify Import';
      cover_url = data.coverArt?.sources?.[0]?.url || data.images?.[0]?.url || '';
      
      const tracks = data.trackList || data.tracks?.items || [];
      
      // Limit to 30 tracks to avoid extreme API quota usage in a single request
      const tracksToProcess = tracks.slice(0, 30);
      
      for (const track of tracksToProcess) {
        let trackName = track.title || track.track?.name;
        let artistName = track.subtitle || track.track?.artists?.[0]?.name;
        
        if (!trackName) continue;
        
        const searchQuery = `${trackName} ${artistName || ''}`;
        
        // Search YouTube Data API (Max 1 result to save quota, though 'search' costs 100 units regardless)
        const searchResults = await searchVideos(searchQuery, 1);
        if (searchResults && searchResults.length > 0) {
          trackItems.push(searchResults[0]);
        }
      }
    } 
    // --- YOUTUBE MUSIC ---
    else if (url.includes('music.youtube.com/playlist') || url.includes('youtube.com/playlist')) {
      const urlObj = new URL(url);
      const playlistId = urlObj.searchParams.get('list');
      if (!playlistId) return NextResponse.json({ error: 'Invalid YouTube Playlist URL' }, { status: 400 });
      
      // We don't have an endpoint to fetch Playlist Title easily without another API call,
      // but let's just fetch the items.
      const playlistTracks = await getPlaylistItems(playlistId);
      
      title = 'YouTube Import';
      cover_url = playlistTracks[0]?.thumbnail || '';
      
      trackItems = playlistTracks;
    } else {
      return NextResponse.json({ error: 'Unsupported URL format. Use Spotify or YouTube Music playlist URLs.' }, { status: 400 });
    }

    if (trackItems.length === 0) {
      return NextResponse.json({ error: 'No playable tracks could be imported.' }, { status: 400 });
    }

    // Save Playlist
    const { data: newPlaylist, error: playlistError } = await sb
      .from('playlists')
      .insert({
        owner_id: uid,
        name: title,
        cover_url,
        description: 'Imported by Maina',
        is_public: false
      })
      .select('id')
      .single();

    if (playlistError) throw playlistError;

    // Save Tracks to DB
    const trackInserts = trackItems.map((t, index) => ({
      playlist_id: newPlaylist.id,
      track_id: t.id,
      track_data: t,
      added_by: uid,
      position: index,
    }));

    // Insert tracks in chunks
    for (let i = 0; i < trackInserts.length; i += 50) {
      const chunk = trackInserts.slice(i, i + 50);
      const { error: tracksError } = await sb.from('playlist_tracks').insert(chunk);
      if (tracksError) console.error('Failed to insert tracks chunk:', tracksError);
    }

    return NextResponse.json({ 
      ok: true, 
      playlist: { id: newPlaylist.id, name: title, cover_url },
      tracks: trackItems
    });

  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: err.message || 'Failed to import playlist' }, { status: 500 });
  }
}
