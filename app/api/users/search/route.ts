import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/users/search?q=username
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 });

  const sb = getSupabaseAdmin();
  
  // Exact match or partial match
  const { data, error } = await sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .ilike('username', `%${q}%`)
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ users: data });
}
