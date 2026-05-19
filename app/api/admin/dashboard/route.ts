import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();

  const [usersRes, reviewsRes, feedbackRes, trendingRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }),
    supabase.from('reviews').select('*, profiles(username, display_name, avatar_url)').order('created_at', { ascending: false }),
    supabase.from('feedback').select('*, profiles(username, display_name, avatar_url)').order('created_at', { ascending: false }),
    supabase.from('trending_tracks').select('*').limit(10),
  ]);

  // Active in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: activeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active', sevenDaysAgo);

  return NextResponse.json({
    stats: {
      totalUsers:    usersRes.count ?? 0,
      activeUsers:   activeCount    ?? 0,
      totalReviews:  reviewsRes.data?.length ?? 0,
      totalFeedback: feedbackRes.data?.length ?? 0,
    },
    users:     usersRes.data    ?? [],
    reviews:   reviewsRes.data  ?? [],
    feedback:  feedbackRes.data ?? [],
    trending:  trendingRes.data ?? [],
  });
}
