import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/share/playlist/[id]  → public playlist data for the share page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { data: playlist } = await sb
    .from('playlists')
    .select(`
      id, name, description, cover_url, is_public, is_collaborative,
      owner:owner_id(id, username, display_name, avatar_url),
      playlist_collaborators(user_id, profiles:user_id(username, display_name, avatar_url)),
      playlist_tracks(track_id, track_data, position)
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!playlist) return NextResponse.json({ error: 'Not found or private' }, { status: 404 });

  const tracks = (playlist.playlist_tracks ?? [])
    .sort((a: any, b: any) => a.position - b.position)
    .map((t: any) => ({ id: t.track_id, ...t.track_data }));

  const collaborators = (playlist.playlist_collaborators ?? [])
    .map((c: any) => c.profiles)
    .filter(Boolean);

  return NextResponse.json({
    playlist: {
      id:            playlist.id,
      name:          playlist.name,
      description:   playlist.description,
      cover_url:     playlist.cover_url,
      owner:         playlist.owner,
      collaborators,
      tracks,
    },
  });
}
