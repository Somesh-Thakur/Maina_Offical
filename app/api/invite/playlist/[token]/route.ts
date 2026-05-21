import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/invite/playlist/[token]  → accept an invite (adds user as collaborator)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = await auth();
  
  // Base URL from the incoming request (works well in Vercel)
  const baseUrl = req.nextUrl.origin;

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(`/login?next=/api/invite/playlist/${token}`, baseUrl));
  }

  const sb  = getSupabaseAdmin();
  const uid = session.user.id;

  // Validate token
  const { data: invite } = await sb
    .from('playlist_invites')
    .select('id, playlist_id, uses, max_uses, expires_at')
    .eq('token', token)
    .single();

  if (!invite) {
    return NextResponse.redirect(new URL(`/?error=Invalid invite link`, baseUrl));
  }
  if (invite.uses >= invite.max_uses) {
    return NextResponse.redirect(new URL(`/?error=Invite limit reached`, baseUrl));
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.redirect(new URL(`/?error=Invite expired`, baseUrl));
  }

  // Add as collaborator (upsert to avoid duplicate errors)
  await sb.from('playlist_collaborators').upsert({
    playlist_id: invite.playlist_id,
    user_id:     uid,
    can_edit:    true,
  }, { onConflict: 'playlist_id,user_id' });

  // Increment use count
  await sb.from('playlist_invites').update({ uses: invite.uses + 1 }).eq('id', invite.id);

  // Redirect to the playlist
  return NextResponse.redirect(new URL(`/playlist/${invite.playlist_id}`, baseUrl));
}
