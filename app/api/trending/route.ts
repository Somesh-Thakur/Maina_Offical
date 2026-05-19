import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'tracks'; // 'tracks' or 'artists'
  
  const supabase = getSupabaseAdmin();
  
  if (type === 'artists') {
    const { data, error } = await supabase.from('trending_artists').select('*').limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ trending: data });
  }

  const { data, error } = await supabase.from('trending_tracks').select('*').limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Format to match Track interface expected by frontend
  const tracks = data.map((t: any) => ({
    id: t.track_id,
    title: t.title,
    artist: t.artist,
    thumbnail: t.thumbnail,
    // Provide defaults for missing track data in the view
    duration: 0,
    url: '',
  }));
  
  return NextResponse.json({ trending: tracks });
}
