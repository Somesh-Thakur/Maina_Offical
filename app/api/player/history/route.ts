import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await auth();
  const { track } = await req.json();

  if (!track?.id) return NextResponse.json({ error: 'Invalid track' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  
  // Insert play history asynchronously
  // We don't await this if we want to return immediately, but we will await to catch errors if needed
  const { error } = await supabase.from('play_history').insert({
    user_id: session?.user?.id ?? null, // allow anonymous tracking for global trends
    track_id: track.id,
    track_data: track,
  });

  if (error) {
    console.error('Failed to log play history:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
