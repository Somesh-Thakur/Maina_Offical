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
