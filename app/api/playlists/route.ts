import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, cover_url, description } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const sb = getSupabaseAdmin();

  // Ensure user profile exists (helps if they had an old OAuth session before we fixed UUIDs)
  const { data: profile } = await sb.from('profiles').select('id').eq('id', session.user.id).single();
  if (!profile) {
    return NextResponse.json({ 
      error: 'Your profile data is missing. Please Sign Out and Sign In again to fix your account sync.' 
    }, { status: 400 });
  }

  const { data, error } = await sb
    .from('playlists')
    .insert({
      owner_id: session.user.id,
      name,
      cover_url: cover_url || '',
      description: description || '',
      is_public: false
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23503') { // Foreign Key Violation
      return NextResponse.json({ 
        error: 'Database sync error. Please Sign Out and Sign In again to fix your account.' 
      }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, playlist: data });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getSupabaseAdmin();
  const uid = session.user.id;

  // Fetch owned playlists and collaborated playlists
  const { data: ownedPlaylists } = await sb
    .from('playlists')
    .select('id, name, cover_url, description, created_at')
    .eq('owner_id', uid);

  const { data: collabLinks } = await sb
    .from('playlist_collaborators')
    .select('playlist_id')
    .eq('user_id', uid);

  let collabPlaylists: any[] = [];
  if (collabLinks && collabLinks.length > 0) {
    const playlistIds = collabLinks.map(c => c.playlist_id);
    const { data: collabs } = await sb
      .from('playlists')
      .select('id, name, cover_url, description, created_at')
      .in('id', playlistIds);
    if (collabs) collabPlaylists = collabs;
  }

  // Combine and deduplicate
  const allMap = new Map();
  ownedPlaylists?.forEach(p => allMap.set(p.id, p));
  collabPlaylists.forEach(p => allMap.set(p.id, p));
  const combined = Array.from(allMap.values());

  // Also fetch tracks for these playlists
  const playlistIds = combined.map(p => p.id);
  let allTracks: any[] = [];
  let playlistTracksMap: Record<string, any[]> = {};
  
  if (playlistIds.length > 0) {
    const { data: tracksData } = await sb
      .from('playlist_tracks')
      .select('playlist_id, track_data, track_id')
      .in('playlist_id', playlistIds);
      
    if (tracksData) {
      tracksData.forEach(pt => {
        if (!playlistTracksMap[pt.playlist_id]) playlistTracksMap[pt.playlist_id] = [];
        playlistTracksMap[pt.playlist_id].push(pt.track_id);
        allTracks.push(pt.track_data);
      });
    }
  }

  const finalPlaylists = combined.map(p => ({
    id: p.id,
    name: p.name,
    coverUrl: p.cover_url || '',
    description: p.description || '',
    tracks: playlistTracksMap[p.id] || [],
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.created_at).getTime()
  }));

  return NextResponse.json({ playlists: finalPlaylists, tracks: allTracks });
}
