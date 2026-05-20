import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .eq('id', session.user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { username, display_name, avatar_url, bio } = body;

  const sb = getSupabaseAdmin();

  // Validate username if it's being updated
  if (username) {
    if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    const { data: existing } = await sb.from('profiles').select('id').eq('username', username).neq('id', session.user.id).single();
    if (existing) return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
  }

  const updates: any = {};
  if (username !== undefined) updates.username = username;
  if (display_name !== undefined) updates.display_name = display_name;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (bio !== undefined) updates.bio = bio;

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

  const { error } = await sb.from('profiles').update(updates).eq('id', session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
