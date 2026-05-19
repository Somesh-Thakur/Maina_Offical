import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(username, display_name, avatar_url)')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 });
  }

  const { rating, content } = await req.json();
  if (!rating || !content?.trim()) {
    return NextResponse.json({ error: 'Rating and review text required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // One review per user
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (existing) {
    // Update existing review
    await supabase.from('reviews').update({ rating, content }).eq('id', existing.id);
  } else {
    await supabase.from('reviews').insert({
      user_id: session.user.id,
      rating,
      content,
    });
  }

  return NextResponse.json({ ok: true });
}

// Admin: toggle visibility
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, is_visible } = await req.json();
  const supabase = getSupabaseAdmin();
  await supabase.from('reviews').update({ is_visible }).eq('id', id);
  return NextResponse.json({ ok: true });
}
