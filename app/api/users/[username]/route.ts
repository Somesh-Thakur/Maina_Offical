import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/users/[username]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const sb = getSupabaseAdmin();
  
  // Fetch user details and their public playlists
  const { data: user, error: userError } = await sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('username', username)
    .single();

  if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { data: playlists } = await sb
    .from('playlists')
    .select('id, name, description, cover_url')
    .eq('owner_id', user.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  return NextResponse.json({ user, playlists: playlists ?? [] });
}
