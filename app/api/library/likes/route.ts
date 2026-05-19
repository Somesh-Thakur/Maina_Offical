import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('liked_songs')
    .select('track_data')
    .eq('user_id', session.user.id)
    .order('liked_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tracks: data.map(d => d.track_data) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { track } = await req.json();
  if (!track?.id) return NextResponse.json({ error: 'Invalid track' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('liked_songs').upsert({
    user_id:    session.user.id,
    track_id:   track.id,
    track_data: track,
  }, { onConflict: 'user_id, track_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { trackId } = await req.json();
  if (!trackId) return NextResponse.json({ error: 'Missing trackId' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .match({ user_id: session.user.id, track_id: trackId });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
