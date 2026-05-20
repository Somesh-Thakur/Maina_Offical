import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getSupabaseAdmin();
  const uid = session.user.id;

  // Get all friendships involving this user
  const { data, error } = await sb
    .from('friendships')
    .select(`
      id, status, created_at,
      from_profile:from_user(id, username, display_name, avatar_url),
      to_profile:to_user(id, username, display_name, avatar_url)
    `)
    .or(`from_user.eq.${uid},to_user.eq.${uid}`)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const friends = (data ?? []).map((f: any) => {
    const isSender = f.from_profile?.id === uid;
    const other    = isSender ? f.to_profile : f.from_profile;
    return { id: f.id, status: f.status, isSender, user: other };
  });

  return NextResponse.json({ friends });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 });

  const sb  = getSupabaseAdmin();
  const uid = session.user.id;

  // Find target user
  const { data: target } = await sb.from('profiles').select('id').eq('username', username).single();
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (target.id === uid) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });

  const { error } = await sb.from('friendships').insert({
    from_user: uid,
    to_user:   target.id,
    status:    'pending',
  });

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Request already exists' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, action } = await req.json(); // action: 'accept' | 'decline' | 'remove'
  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });

  const sb  = getSupabaseAdmin();
  const uid = session.user.id;

  if (action === 'remove') {
    await sb.from('friendships').delete()
      .or(`and(from_user.eq.${uid},to_user.eq.${id}),and(from_user.eq.${id},to_user.eq.${uid})`);
  } else {
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await sb.from('friendships')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('to_user', uid); // only the recipient can accept/decline
  }
  return NextResponse.json({ ok: true });
}
