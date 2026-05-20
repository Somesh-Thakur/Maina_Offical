import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST /api/playlists/[id]/invite  → create an invite link
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb  = getSupabaseAdmin();
  const uid = session.user.id;

  // Only the playlist owner can create invites
  const { data: playlist } = await sb.from('playlists').select('owner_id').eq('id', id).single();
  if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
  if (playlist.owner_id !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Ensure playlist is marked collaborative
  await sb.from('playlists').update({ is_collaborative: true, is_public: true }).eq('id', id);

  // Create the invite token
  const { data: invite, error } = await sb
    .from('playlist_invites')
    .insert({ playlist_id: id, created_by: uid })
    .select('token')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://maina-offical.vercel.app';
  return NextResponse.json({ url: `${baseUrl}/invite/playlist/${invite.token}` });
}
