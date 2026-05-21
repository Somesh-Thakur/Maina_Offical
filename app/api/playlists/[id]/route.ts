import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getSupabaseAdmin();
  const uid = session.user.id;

  // Ensure user owns the playlist
  const { data: playlist } = await sb.from('playlists').select('owner_id').eq('id', id).single();
  if (!playlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (playlist.owner_id !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Delete from supabase
  const { error } = await sb.from('playlists').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
