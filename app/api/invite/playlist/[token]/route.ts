import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/invite/playlist/[token]  → accept an invite (adds user as collaborator)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login?next=/invite/playlist/' + token, process.env.NEXTAUTH_URL ?? ''));
  }

  const sb  = getSupabaseAdmin();
  const uid = session.user.id;

  // Validate token
  const { data: invite } = await sb
    .from('playlist_invites')
    .select('id, playlist_id, uses, max_uses, expires_at')
    .eq('token', token)
    .single();

  if (!invite) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
  if (invite.uses >= invite.max_uses) return NextResponse.json({ error: 'Invite limit reached' }, { status: 410 });
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 410 });

  // Add as collaborator (upsert to avoid duplicate errors)
  await sb.from('playlist_collaborators').upsert({
    playlist_id: invite.playlist_id,
    user_id:     uid,
    can_edit:    true,
  }, { onConflict: 'playlist_id,user_id' });

  // Increment use count
  await sb.from('playlist_invites').update({ uses: invite.uses + 1 }).eq('id', invite.id);

  // Redirect to the playlist
  const base = process.env.NEXTAUTH_URL ?? 'https://maina-offical.vercel.app';
  return NextResponse.redirect(new URL(`/playlist/${invite.playlist_id}`, base));
}
